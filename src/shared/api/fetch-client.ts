import { storage } from '@/shared/utils/storage'

interface ApiRequestOptions extends RequestInit {
  timeout?: number
  url?: string
}

export class ApiError extends Error {
  status?: number
  code?: string
  details?: any

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

class ApiClient {
  private readonly baseURL: string
  private readonly defaultTimeout: number
  private isRefreshing = false
  private failedQueue: Array<{
    resolve: (token: string) => void
    reject: (error: any) => void
  }> = []

  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
    this.defaultTimeout = 10000
  }

  /**
   * Create a fetch request with timeout
   */
  private async fetchWithTimeout(
    url: string,
    options: ApiRequestOptions = {}
  ): Promise<Response> {
    const { timeout = this.defaultTimeout, ...fetchOptions } = options

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  }

  /**
   * Handle unauthorized errors consistently
   */
  private handleUnauthorized(): void {
    // Clear authentication data
    storage.clearAuth()

    // Use TanStack Router's navigation if available, otherwise fallback
    if (typeof globalThis !== 'undefined') {
      const isRouterAvailable = (globalThis as any).__TANSTACK_ROUTER__?.router
      if (isRouterAvailable) {
        (globalThis as any).__TANSTACK_ROUTER__.router.navigate({
          to: '/login',
          replace: true
        })
      } else {
        globalThis.location.href = '/login'
      }
    }

    // Reject all queued requests
    for (const { reject } of this.failedQueue) {
      reject(new Error('Authentication required'))
    }
    this.failedQueue = []
  }

  /**
   * Add auth token to request headers
   */
  private addAuthHeader(options: ApiRequestOptions = {}): ApiRequestOptions {
    // In development mode, use dev token if available
    let token = storage.getAuthToken()

    if (!token && import.meta.env.VITE_DEV_JWT_TOKEN) {
      token = import.meta.env.VITE_DEV_JWT_TOKEN
      console.warn('Using development JWT token')
    }

    const headers = new Headers(options.headers)

    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }

    // Set default content-type if not specified
    if (!headers.has('Content-Type') && options.body) {
      headers.set('Content-Type', 'application/json')
    }

    return {
      ...options,
      headers,
    }
  }

  /**
   * Handle response errors and token refresh
   */
  private async handleResponse<T>(response: Response, originalOptions: ApiRequestOptions): Promise<T> {
    if (response.ok) {
      // Handle empty responses (e.g., 204 No Content)
      const contentLength = response.headers.get('content-length')
      if (contentLength === '0' || !response.body) {
        return undefined as T
      }

      // Try to parse as JSON first, fallback to text
      try {
        return await response.json()
      } catch {
        return (await response.text()) as T
      }
    }

    // Handle 401 Unauthorized
    if (response.status === 401) {
      this.handleUnauthorized()
      throw new ApiError('Authentication required', response.status)
    }

    // Handle 403 Forbidden - attempt token refresh
    if (response.status === 403 && !this.isRefreshing) {
      this.isRefreshing = true

      try {
        const newToken = storage.getItem('REFRESH_TOKEN', null)
        if (newToken) {
          // This would call your refresh endpoint
          // For now, we'll just clear auth
          this.handleUnauthorized()
        }
      } catch (refreshError) {
        this.handleUnauthorized()
        throw refreshError
      } finally {
        this.isRefreshing = false
      }

      // Retry the original request with new token
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject })
      }).then(async (token) => {
        const retryOptions = this.addAuthHeader({
          ...originalOptions,
          headers: {
            ...originalOptions.headers,
            Authorization: `Bearer ${token}`,
          },
        })

        const retryResponse = await this.request<T>(originalOptions.url || '', {
          ...retryOptions,
          method: originalOptions.method || 'GET',
        })
        return retryResponse
      })
    }

    // Handle other errors
    let errorMessage = 'Request failed'
    try {
      const errorData = await response.json()
      errorMessage = errorData.message || errorData.title || errorMessage
    } catch {
      // If JSON parsing fails, use status text
      errorMessage = response.statusText || errorMessage
    }

    throw new ApiError(errorMessage, response.status)
  }

  /**
   * Core request method
   */
  private async request<T>(url: string, options: ApiRequestOptions = {}): Promise<T> {
    const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`
    const optionsWithAuth = this.addAuthHeader(options)

    const response = await this.fetchWithTimeout(fullUrl, optionsWithAuth)
    return this.handleResponse<T>(response, { ...options, url })
  }

  // HTTP methods
  async get<T>(url: string, options: ApiRequestOptions = {}): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'GET',
    })
  }

  async post<T>(url: string, data?: unknown, options: ApiRequestOptions = {}): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(url: string, data?: unknown, options: ApiRequestOptions = {}): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(url: string, options: ApiRequestOptions = {}): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'DELETE',
    })
  }
}

export const apiClient = new ApiClient()
export const isApiError = (error: unknown): error is ApiError => {
  return error instanceof ApiError
}
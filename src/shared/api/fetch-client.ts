import { storage } from '@/shared/utils/storage'

interface ApiRequestOptions extends RequestInit {
  timeout?: number
  url?: string
}

export class ApiError extends Error {
  status?: number
  code?: string
  details?: unknown

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
    reject: (error: unknown) => void
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
    storage.clearAuth()

    if (typeof globalThis !== 'undefined') {
      const router = (globalThis as { __TANSTACK_ROUTER__?: { router: { navigate: (opts: { to: string; replace: boolean }) => void } } }).__TANSTACK_ROUTER__?.router
      if (router) {
        router.navigate({
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
    let token = storage.getAuthToken()

    if (!token && import.meta.env.VITE_DEV_JWT_TOKEN) {
      token = import.meta.env.VITE_DEV_JWT_TOKEN
    }

    const headers = new Headers(options.headers)

    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }

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
      const contentLength = response.headers.get('content-length')
      if (contentLength === '0' || !response.body) {
        return undefined as T
      }

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
          this.handleUnauthorized()
        }
      } catch (refreshError) {
        this.handleUnauthorized()
        throw refreshError
      } finally {
        this.isRefreshing = false
      }

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

    let errorMessage = 'Request failed'
    try {
      const errorData = await response.json()
      errorMessage = errorData.message || errorData.title || errorMessage
    } catch {
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
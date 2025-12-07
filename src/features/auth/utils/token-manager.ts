import { storage } from '@/shared/utils/storage'
import { apiClient } from '@/shared/api/fetch-client'

interface TokenInfo {
  accessToken: string
  refreshToken?: string
  expiresAt?: number
}

/**
 * Token manager for handling secure token operations
 */
export class TokenManager {
  private static REFRESH_BUFFER = 5 * 60 * 1000 // 5 minutes before expiry

  /**
   * Decode JWT payload safely
   */
  private static decodeJWTPayload(token: string): any {
    try {
      const parts = token.split('.')
      if (parts.length !== 3) return null

      const payload = parts[1]
      // Add padding if needed
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
      const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=')

      return JSON.parse(atob(padded))
    } catch (error) {
      console.error('Error decoding JWT:', error)
      return null
    }
  }

  /**
   * Check if token is expired or will expire soon
   */
  private static isTokenExpired(token: string): boolean {
    const payload = this.decodeJWTPayload(token)
    if (!payload || !payload.exp) return true

    const now = Date.now() / 1000
    const expiresAt = payload.exp * 1000

    return expiresAt - Date.now() < this.REFRESH_BUFFER
  }

  /**
   * Get current access token
   */
  static getAccessToken(): string | null {
    return storage.getAuthToken()
  }

  /**
   * Store access token
   */
  static setAccessToken(token: string): void {
    if (!token || typeof token !== 'string') {
      throw new Error('Invalid access token')
    }

    // Validate token format
    const parts = token.split('.')
    if (parts.length !== 3) {
      throw new Error('Invalid token format')
    }

    storage.setAuthToken(token)
  }

  /**
   * Get refresh token
   */
  static getRefreshToken(): string | null {
    return storage.getItem('REFRESH_TOKEN', null)
  }

  /**
   * Store refresh token
   */
  static setRefreshToken(token: string): void {
    if (!token || typeof token !== 'string') {
      throw new Error('Invalid refresh token')
    }

    storage.setItem('REFRESH_TOKEN', token)
  }

  /**
   * Check if current token is valid
   */
  static isTokenValid(): boolean {
    const token = this.getAccessToken()
    if (!token) return false

    return !this.isTokenExpired(token)
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshToken(): Promise<boolean> {
    const refreshToken = this.getRefreshToken()
    if (!refreshToken) {
      console.error('No refresh token available')
      return false
    }

    try {
      // Call API to refresh token
      const response = await apiClient.post<{accessToken: string; refreshToken?: string}>('/auth/refresh', {
        refreshToken,
      })

      if (response.accessToken) {
        this.setAccessToken(response.accessToken)

        if (response.refreshToken) {
          this.setRefreshToken(response.refreshToken)
        }

        return true
      }

      return false
    } catch (error) {
      console.error('Error refreshing token:', error)
      return false
    }
  }

  /**
   * Get valid token, refreshing if necessary
   */
  static async getValidToken(): Promise<string | null> {
    const token = this.getAccessToken()

    if (!token) return null

    if (!this.isTokenValid()) {
      const refreshSuccess = await this.refreshToken()
      if (!refreshSuccess) {
        return null
      }
    }

    return this.getAccessToken()
  }

  /**
   * Clear all tokens
   */
  static clearTokens(): void {
    storage.removeItem('AUTH_TOKEN')
    storage.removeItem('REFRESH_TOKEN')
  }

  /**
   * Extract token expiration from JWT
   */
  static getTokenExpiration(token: string): number | null {
    const payload = this.decodeJWTPayload(token)
    return payload?.exp ? payload.exp * 1000 : null
  }

  /**
   * Check if token will expire within specified milliseconds
   */
  static willTokenExpireWithin(ms: number): boolean {
    const token = this.getAccessToken()
    if (!token) return true

    const payload = this.decodeJWTPayload(token)
    if (!payload || !payload.exp) return true

    const expiresAt = payload.exp * 1000
    return expiresAt - Date.now() < ms
  }
}

export default TokenManager
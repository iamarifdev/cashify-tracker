import { GoogleUser, Business } from '@/types'

interface StorageKeys {
  AUTH_TOKEN: 'cashify_token'
  REFRESH_TOKEN: 'cashify_refresh_token'
  USER: 'cashify_user'
  GOOGLE_ID_TOKEN: 'cashify_google_id_token'
  SELECTED_BUSINESS: 'cashify_selected_business'
  PREFERENCES: 'cashify_preferences'
}

const STORAGE_KEYS: StorageKeys = {
  AUTH_TOKEN: 'cashify_token',
  REFRESH_TOKEN: 'cashify_refresh_token',
  USER: 'cashify_user',
  GOOGLE_ID_TOKEN: 'cashify_google_id_token',
  SELECTED_BUSINESS: 'cashify_selected_business',
  PREFERENCES: 'cashify_preferences'
}

/**
 * Safe storage utilities with type guards and error handling
 */
export class SecureStorage {
  private static isClient = typeof window !== 'undefined'

  /**
   * Safely parse JSON with error handling
   */
  private static safeParseJSON<T>(value: string | null, defaultValue: T): T {
    if (!value) return defaultValue

    try {
      const parsed = JSON.parse(value)
      return parsed
    } catch (error) {
      console.error('Error parsing stored value:', error)
      return defaultValue
    }
  }

  /**
   * Get item from localStorage with type safety
   */
  static getItem<T>(key: keyof StorageKeys, defaultValue: T): T {
    if (!this.isClient) return defaultValue

    const value = localStorage.getItem(key)
    return this.safeParseJSON(value, defaultValue)
  }

  /**
   * Set item in localStorage with type safety
   */
  static setItem<T>(key: keyof StorageKeys, value: T): void {
    if (!this.isClient) return

    try {
      const serialized = JSON.stringify(value)
      localStorage.setItem(key, serialized)
    } catch (error) {
      console.error('Error storing value:', error)
    }
  }

  /**
   * Remove item from localStorage
   */
  static removeItem(key: keyof StorageKeys): void {
    if (!this.isClient) return

    localStorage.removeItem(key)
  }

  /**
   * Clear all authentication-related items
   */
  static clearAuth(): void {
    if (!this.isClient) return

    this.removeItem('AUTH_TOKEN')
    this.removeItem('REFRESH_TOKEN')
    this.removeItem('USER')
    this.removeItem('GOOGLE_ID_TOKEN')
  }

  /**
   * Authentication token methods
   */
  static getAuthToken(): string | null {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
    return token
  }

  static setAuthToken(token: string): void {
    if (!token || typeof token !== 'string') {
      console.error('Invalid token provided')
      return
    }

    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token)
  }

  /**
   * User methods with type safety
   */
  static getUser(): GoogleUser | null {
    return this.getItem('USER', null)
  }

  static setUser(user: GoogleUser): void {
    if (!user || typeof user !== 'object') {
      console.error('Invalid user object')
      return
    }

    // Validate required fields
    if (!user.id || !user.email) {
      console.error('User object missing required fields')
      return
    }

    this.setItem('USER', user)
  }

  /**
   * Business methods with type safety
   */
  static getSelectedBusiness(): Business | null {
    return this.getItem('SELECTED_BUSINESS', null)
  }

  static setSelectedBusiness(business: Business): void {
    if (!business || typeof business !== 'object') {
      console.error('Invalid business object')
      return
    }

    // Validate required fields
    if (!business.id || !business.name) {
      console.error('Business object missing required fields')
      return
    }

    this.setItem('SELECTED_BUSINESS', business)
  }

  /**
   * Check if user is authenticated with token validation
   */
  static isAuthenticated(): boolean {
    const token = this.getAuthToken()
    const user = this.getUser()

    if (!token || !user) return false

    // Basic token validation (you can add more sophisticated validation)
    try {
      // JWT tokens have 3 parts separated by dots
      const parts = token.split('.')
      if (parts.length !== 3) return false

      // Check token expiration if it's a JWT
      const payload = JSON.parse(atob(parts[1]))
      const now = Date.now() / 1000

      if (payload.exp && payload.exp < now) {
        console.log('Token expired')
        this.clearAuth()
        return false
      }

      return true
    } catch (error) {
      console.error('Error validating token:', error)
      return false
    }
  }

  /**
   * Check if user has completed onboarding
   */
  static hasCompletedOnboarding(): boolean {
    const user = this.getUser()
    return user?.hasCompletedOnboarding ?? false
  }

  /**
   * Set onboarding completion
   */
  static setOnboardingCompleted(): void {
    const user = this.getUser()
    if (user) {
      this.setUser({ ...user, hasCompletedOnboarding: true })
    }
  }
}

// Export singleton instance for convenience
export const storage = SecureStorage

// Export constants for external use
export { STORAGE_KEYS }
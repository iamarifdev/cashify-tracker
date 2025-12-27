import { BusinessSummary, GoogleUser } from '@/types'

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

export class SecureStorage {
  private static readonly isClient = globalThis.window !== undefined

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

  static getItem<T>(key: keyof StorageKeys, defaultValue: T): T {
    if (!this.isClient) return defaultValue

    const value = localStorage.getItem(key)
    return this.safeParseJSON(value, defaultValue)
  }

  static setItem<T>(key: keyof StorageKeys, value: T): void {
    if (!this.isClient) return

    try {
      const serialized = JSON.stringify(value)
      localStorage.setItem(key, serialized)
    } catch (error) {
      console.error('Error storing value:', error)
    }
  }

  static removeItem(key: keyof StorageKeys): void {
    if (!this.isClient) return

    localStorage.removeItem(key)
  }

  static clearAuth(): void {
    if (!this.isClient) return

    this.removeItem('AUTH_TOKEN')
    this.removeItem('REFRESH_TOKEN')
    this.removeItem('USER')
    this.removeItem('GOOGLE_ID_TOKEN')
  }

  static getAuthToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
  }

  static setAuthToken(token: string): void {
    if (!token || typeof token !== 'string') return
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token)
  }

  static getUser(): GoogleUser | null {
    return this.getItem('USER', null)
  }

  static setUser(user: GoogleUser): void {
    if (!user || typeof user !== 'object') {
      console.error('Invalid user object')
      return
    }

    if (!user.id || !user.email) {
      console.error('User object missing required fields')
      return
    }

    this.setItem('USER', user)
  }

  static getSelectedBusiness(): BusinessSummary | null {
    return this.getItem('SELECTED_BUSINESS', null)
  }

  static setSelectedBusiness(business: BusinessSummary): void {
    if (!business || typeof business !== 'object') {
      console.error('Invalid business object')
      return
    }

    if (!business.id || !business.name) {
      console.error('Business object missing required fields')
      return
    }

    this.setItem('SELECTED_BUSINESS', business)
  }

  static isAuthenticated(): boolean {
    const token = this.getAuthToken()
    const user = this.getUser()

    if (!token || !user) return false

    try {
      const parts = token.split('.')
      if (parts.length !== 3) return false

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

  static hasCompletedOnboarding(): boolean {
    const user = this.getUser()
    return user?.hasCompletedOnboarding ?? false
  }

  static setOnboardingCompleted(): void {
    const user = this.getUser()
    if (user) {
      this.setUser({ ...user, hasCompletedOnboarding: true })
    }
  }
}

export const storage = SecureStorage

export { STORAGE_KEYS }

import { storage } from '@/shared/utils/storage'
import { GoogleUser } from '@/types'

/**
 * Authentication utilities for centralized auth logic
 */
export class AuthUtils {
  /**
   * Build Google OAuth URL with proper parameters
   */
  static buildGoogleAuthUrl(nonce: string): string {
    const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
    const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || window.location.origin

    if (!GOOGLE_CLIENT_ID) {
      throw new Error('Google Client ID not configured')
    }

    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: `${FRONTEND_URL}/login`,
      response_type: 'code', // Use authorization code flow
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
      state: nonce,
    })

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  }

  /**
   * Generate a secure nonce for OAuth flow
   */
  static generateNonce(): string {
    const array = new Uint8Array(16)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }

  /**
   * Validate OAuth state to prevent CSRF attacks
   */
  static validateState(storedNonce: string | null, receivedState: string): boolean {
    if (!storedNonce || !receivedState) return false
    return storedNonce === receivedState
  }

  /**
   * Check if user is authenticated using centralized logic
   */
  static isAuthenticated(): boolean {
    return storage.isAuthenticated()
  }

  /**
   * Get current authenticated user
   */
  static getCurrentUser(): GoogleUser | null {
    return storage.getUser()
  }

  /**
   * Get authentication token
   */
  static getAuthToken(): string | null {
    return storage.getAuthToken()
  }

  /**
   * Check if user has completed onboarding
   */
  static hasCompletedOnboarding(): boolean {
    return storage.hasCompletedOnboarding()
  }

  /**
   * Mark onboarding as completed
   */
  static completeOnboarding(): void {
    storage.setOnboardingCompleted()
  }

  /**
   * Login user with validation
   */
  static login(user: GoogleUser, idToken: string): void {
    // Validate user object
    if (!user || typeof user !== 'object') {
      throw new Error('Invalid user object provided')
    }

    if (!user.id || !user.email) {
      throw new Error('User object missing required fields')
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(user.email)) {
      throw new Error('Invalid email format')
    }

    // Store user data
    storage.setUser(user)

    // Store ID token if provided
    if (idToken && typeof idToken === 'string') {
      storage.setItem('GOOGLE_ID_TOKEN', idToken)
    }
  }

  /**
   * Logout user and clear all auth data
   */
  static logout(): void {
    storage.clearAuth()
    storage.removeItem('SELECTED_BUSINESS')
  }

  /**
   * Get safe redirect URL (prevents open redirects)
   */
  static getSafeRedirectUrl(path: string): string {
    const allowedPaths = ['/', '/dashboard', '/onboarding']
    const cleanPath = path.startsWith('/') ? path : `/${path}`

    // Check if path is in allowed list
    if (allowedPaths.includes(cleanPath) || cleanPath.startsWith('/books/')) {
      return cleanPath
    }

    // Default to dashboard
    return '/dashboard'
  }

  /**
   * Extract token from URL fragment
   */
  static extractTokenFromUrl(): string | null {
    if (typeof window === 'undefined') return null

    const hash = window.location.hash.substring(1)
    const params = new URLSearchParams(hash)

    return params.get('access_token')
  }

  /**
   * Check if we're in an OAuth callback
   */
  static isOAuthCallback(): boolean {
    if (typeof globalThis.window === 'undefined') return false

    const urlParams = new URLSearchParams(globalThis.location.search)
    const hashParams = new URLSearchParams(globalThis.location.hash.substring(1))

    return urlParams.has('code') || urlParams.has('state') || hashParams.has('access_token')
  }
}

export default AuthUtils
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/fetch-client'
import { storage } from '@/shared/utils/storage'
import { AuthUtils } from '@/features/auth/utils/auth.utils'
import { GoogleUser } from '@/types'

// Types for API responses
interface LoginResponse {
  user: GoogleUser
  accessToken: string
  refreshToken: string
}

interface RefreshTokenResponse {
  accessToken: string
  refreshToken?: string
}

interface GoogleOAuthUrlResponse {
  authUrl: string
  state: string
}

interface OAuthCallbackRequest {
  code: string
  state: string
}

// Query keys for auth operations
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
  googleUrl: (nonce: string) => [...authKeys.all, 'google-url', nonce] as const,
}

/**
 * Get current authenticated user
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: async (): Promise<GoogleUser | null> => {
      // Check if user is authenticated
      if (!AuthUtils.isAuthenticated()) {
        return null
      }

      // Get user from storage for immediate response
      const storedUser = storage.getUser()
      if (storedUser) {
        return storedUser as GoogleUser
      }

      // Optionally fetch fresh user data from API
      try {
        const user = await apiClient.get<GoogleUser>('/auth/me')
        storage.setUser(user)
        return user
      } catch (error) {
        // If API call fails, clear auth and return null
        AuthUtils.logout()
        return null
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  })
}

/**
 * Get Google OAuth URL
 */
export function useGoogleOAuthUrl() {
  return useMutation({
    mutationFn: async (): Promise<GoogleOAuthUrlResponse> => {
      const nonce = AuthUtils.generateNonce()
      const authUrl = AuthUtils.buildGoogleAuthUrl(nonce)

      return {
        authUrl,
        state: nonce,
      }
    },
  })
}

/**
 * Login with email and password
 */
export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (credentials: {
      email: string
      password: string
    }): Promise<LoginResponse> => {
      const response = await apiClient.post<LoginResponse>('/auth/login', credentials)

      // Store tokens and user data
      storage.setAuthToken(response.accessToken)
      storage.setItem('REFRESH_TOKEN', response.refreshToken)
      storage.setUser(response.user)

      // Mark onboarding as completed if user has completed it
      if (response.user.hasCompletedOnboarding) {
        AuthUtils.completeOnboarding()
      }

      return response
    },
    onSuccess: (data) => {
      // Update the user query cache
      queryClient.setQueryData(authKeys.user(), data.user)
    },
    onError: (error) => {
      console.error('Login failed:', error)
      // Clear any existing auth data on failure
      storage.clearAuth()
    },
  })
}

/**
 * Handle OAuth callback
 */
export function useOAuthCallback() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: OAuthCallbackRequest): Promise<LoginResponse> => {
      const response = await apiClient.post<LoginResponse>('/auth/oauth/callback', params)

      // Store tokens and user data
      storage.setAuthToken(response.accessToken)
      storage.setItem('REFRESH_TOKEN', response.refreshToken)
      storage.setUser(response.user)

      // Mark onboarding as completed if user has completed it
      if (response.user.hasCompletedOnboarding) {
        AuthUtils.completeOnboarding()
      }

      return response
    },
    onSuccess: (data) => {
      // Update the user query cache
      queryClient.setQueryData(authKeys.user(), data.user)
    },
    onError: (error) => {
      console.error('OAuth callback failed:', error)
      // Clear any existing auth data on failure
      storage.clearAuth()
    },
  })
}

/**
 * Logout user
 */
export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (): Promise<void> => {
      try {
        // Call logout endpoint to invalidate token on server
        await apiClient.post('/auth/logout')
      } catch (error) {
        // Even if server logout fails, proceed with local logout
        console.error('Server logout failed:', error)
      } finally {
        // Always clear local auth data
        AuthUtils.logout()

        // Clear all query cache
        queryClient.clear()
      }
    },
  })
}

/**
 * Refresh access token
 */
export function useRefreshToken() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (): Promise<RefreshTokenResponse> => {
      const refreshToken = storage.getItem('REFRESH_TOKEN', null)
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }

      const response = await apiClient.post<RefreshTokenResponse>('/auth/refresh', {
        refreshToken,
      })

      // Update the access token
      storage.setAuthToken(response.accessToken)

      // Update refresh token if provided
      if (response.refreshToken) {
        storage.setItem('REFRESH_TOKEN', response.refreshToken)
      }

      return response
    },
    onSuccess: () => {
      // Refetch user data to ensure we have fresh data
      queryClient.invalidateQueries({ queryKey: authKeys.user() })
    },
    onError: () => {
      // If refresh fails, clear auth and force login
      AuthUtils.logout()
      queryClient.clear()
    },
  })
}

/**
 * Register new user
 */
export function useRegister() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      name: string
      email: string
      password: string
    }): Promise<LoginResponse> => {
      const response = await apiClient.post<LoginResponse>('/auth/register', data)

      // Store tokens and user data
      storage.setAuthToken(response.accessToken)
      storage.setItem('REFRESH_TOKEN', response.refreshToken)
      storage.setUser(response.user)

      return response
    },
    onSuccess: (data) => {
      // Update the user query cache
      queryClient.setQueryData(authKeys.user(), data.user)
    },
    onError: (error) => {
      console.error('Registration failed:', error)
      storage.clearAuth()
    },
  })
}

/**
 * Request password reset
 */
export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: async (email: string): Promise<void> => {
      await apiClient.post('/auth/password/reset-request', { email })
    },
  })
}

/**
 * Reset password with token
 */
export function useResetPassword() {
  return useMutation({
    mutationFn: async (data: {
      token: string
      newPassword: string
    }): Promise<void> => {
      await apiClient.post('/auth/password/reset', data)
    },
  })
}
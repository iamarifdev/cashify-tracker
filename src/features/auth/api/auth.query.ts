import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/fetch-client'
import { storage } from '@/shared/utils/storage'
import { AuthUtils } from '@/features/auth/utils/auth.utils'
import { GoogleUser } from '@/types'

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

export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
  googleUrl: (nonce: string) => [...authKeys.all, 'google-url', nonce] as const,
}

export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: async (): Promise<GoogleUser | null> => {
      if (!AuthUtils.isAuthenticated()) {
        return null
      }

      const storedUser = storage.getUser()
      if (storedUser) {
        return storedUser as GoogleUser
      }

      try {
        const user = await apiClient.get<GoogleUser>('/auth/me')
        storage.setUser(user)
        return user
      } catch (error) {
        AuthUtils.logout()
        return null
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  })
}

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

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (credentials: {
      email: string
      password: string
    }): Promise<LoginResponse> => {
      const response = await apiClient.post<LoginResponse>('/auth/login', credentials)

      storage.setAuthToken(response.accessToken)
      storage.setItem('REFRESH_TOKEN', response.refreshToken)
      storage.setUser(response.user)

      if (response.user.hasCompletedOnboarding) {
        AuthUtils.completeOnboarding()
      }

      return response
    },
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.user(), data.user)
    },
    onError: (error) => {
      console.error('Login failed:', error)
      storage.clearAuth()
    },
  })
}

export function useOAuthCallback() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: OAuthCallbackRequest): Promise<LoginResponse> => {
      const response = await apiClient.post<LoginResponse>('/auth/oauth/callback', params)

      storage.setAuthToken(response.accessToken)
      storage.setItem('REFRESH_TOKEN', response.refreshToken)
      storage.setUser(response.user)

      if (response.user.hasCompletedOnboarding) {
        AuthUtils.completeOnboarding()
      }

      return response
    },
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.user(), data.user)
    },
    onError: (error) => {
      console.error('OAuth callback failed:', error)
      storage.clearAuth()
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (): Promise<void> => {
      try {
        await apiClient.post('/auth/logout')
      } catch (error) {
        console.error('Server logout failed:', error)
      } finally {
        AuthUtils.logout()
        queryClient.clear()
      }
    },
  })
}

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

      storage.setAuthToken(response.accessToken)

      if (response.refreshToken) {
        storage.setItem('REFRESH_TOKEN', response.refreshToken)
      }

      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.user() })
    },
    onError: () => {
      AuthUtils.logout()
      queryClient.clear()
    },
  })
}

export function useRegister() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      name: string
      email: string
      password: string
    }): Promise<LoginResponse> => {
      const response = await apiClient.post<LoginResponse>('/auth/register', data)

      storage.setAuthToken(response.accessToken)
      storage.setItem('REFRESH_TOKEN', response.refreshToken)
      storage.setUser(response.user)

      return response
    },
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.user(), data.user)
    },
    onError: (error) => {
      console.error('Registration failed:', error)
      storage.clearAuth()
    },
  })
}

export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: async (email: string): Promise<void> => {
      await apiClient.post('/auth/password/reset-request', { email })
    },
  })
}

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

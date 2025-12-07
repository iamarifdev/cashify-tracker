import { useCallback, useMemo } from 'react'
import { useCurrentUser, useLogin, useLogout, useOAuthCallback, useGoogleOAuthUrl, useRefreshToken } from '../api/auth.query'
import { GoogleUser } from '@/types'
import { AuthUtils } from '../utils/auth.utils'
import { storage } from '@/shared/utils/storage'

export function useAuthQuery() {
  // Get current user with TanStack Query
  const { data: user, isLoading, error, refetch } = useCurrentUser()

  // Mutations for auth actions
  const loginMutation = useLogin()
  const logoutMutation = useLogout()
  const oAuthCallbackMutation = useOAuthCallback()
  const googleUrlMutation = useGoogleOAuthUrl()
  const refreshTokenMutation = useRefreshToken()

  // Check if we're in an OAuth callback
  const isOAuthCallback = AuthUtils.isOAuthCallback()

  // Computed states
  const isAuthenticated = useMemo(() => {
    return AuthUtils.isAuthenticated() && !!user
  }, [user])

  const hasCompletedOnboarding = useMemo(() => {
    return user?.hasCompletedOnboarding || AuthUtils.hasCompletedOnboarding()
  }, [user])

  const loading = useMemo(() => {
    return isLoading || loginMutation.isPending || logoutMutation.isPending ||
           oAuthCallbackMutation.isPending || refreshTokenMutation.isPending
  }, [isLoading, loginMutation.isPending, logoutMutation.isPending,
      oAuthCallbackMutation.isPending, refreshTokenMutation.isPending])

  // Login with email/password
  const login = useCallback(async (credentials: {
    email: string
    password: string
  }) => {
    return loginMutation.mutateAsync(credentials)
  }, [loginMutation])

  // Login with Google OAuth
  const loginWithGoogle = useCallback(async () => {
    try {
      const { authUrl } = await googleUrlMutation.mutateAsync()
      // Redirect to Google OAuth
      globalThis.location.href = authUrl
    } catch (error) {
      console.error('Failed to initiate Google OAuth:', error)
      throw error
    }
  }, [googleUrlMutation])

  // Handle OAuth callback
  const handleOAuthCallback = useCallback(async (code: string, state: string) => {
    return oAuthCallbackMutation.mutateAsync({ code, state })
  }, [oAuthCallbackMutation])

  // Logout
  const logout = useCallback(async () => {
    return logoutMutation.mutateAsync()
  }, [logoutMutation])

  // Refresh token
  const refreshToken = useCallback(async () => {
    return refreshTokenMutation.mutateAsync()
  }, [refreshTokenMutation])

  // Get redirect path based on auth state
  const getRedirectPath = useCallback(() => {
    if (!isAuthenticated) {
      return '/login'
    }
    if (!hasCompletedOnboarding) {
      return '/onboarding'
    }
    return '/dashboard'
  }, [isAuthenticated, hasCompletedOnboarding])

  // Generate Google OAuth URL (for direct usage)
  const generateGoogleAuthUrl = useCallback(() => {
    const nonce = AuthUtils.generateNonce()
    return AuthUtils.buildGoogleAuthUrl(nonce)
  }, [])

  // Clear errors
  const clearError = useCallback(() => {
    loginMutation.reset()
    logoutMutation.reset()
    oAuthCallbackMutation.reset()
    refreshTokenMutation.reset()
  }, [loginMutation, logoutMutation, oAuthCallbackMutation, refreshTokenMutation])

  return {
    // State
    user: user || null,
    isAuthenticated,
    hasCompletedOnboarding,
    loading,
    initializing: isLoading,
    error: loginMutation.error || logoutMutation.error ||
            oAuthCallbackMutation.error || refreshTokenMutation.error || error,

    // Actions
    login,
    loginWithGoogle,
    handleOAuthCallback,
    logout,
    refreshToken,
    refetch,

    // Utilities
    getRedirectPath,
    generateGoogleAuthUrl,
    clearError,
    isOAuthCallback,
  }
}

export type UseAuthQueryReturn = ReturnType<typeof useAuthQuery>
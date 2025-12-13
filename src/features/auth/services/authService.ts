import { apiClient } from '@/shared/api/fetch-client';
import { User } from '@/types';

// Type definitions for API requests/responses
interface GoogleSignInRequest {
  idToken: string;
  accessToken?: string;
}

interface GoogleSignInResponse {
  user: {
    id: string;
    name: string;
    email: string;
    photoUrl?: string;
    emailVerified: boolean;
    hasCompletedOnboarding: boolean;
  };
  token: string;
  refreshToken?: string;
  expiresIn: number;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  user: {
    id: string;
    name: string;
    email: string;
    photoUrl?: string;
    emailVerified: boolean;
    hasCompletedOnboarding: boolean;
  };
  token: string;
  refreshToken?: string;
  expiresIn: number;
}

interface RefreshTokenRequest {
  refreshToken: string;
}

interface RefreshTokenResponse {
  token: string;
  expiresIn: number;
}

export const authService = {
  /**
   * Login with email and password
   */
  async login(email: string, _password?: string): Promise<{ user: User; token: string; refreshToken?: string }> {
    try {
      const requestData: LoginRequest = {
        email,
        password: _password || ''
      };

      const response = await apiClient.post<LoginResponse>('/auth/login', requestData);

      // Transform API response to our User type
      const user: User = {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        photoUrl: response.user.photoUrl || undefined,
        hasCompletedOnboarding: response.user.hasCompletedOnboarding
      };

      return {
        user,
        token: response.token,
        refreshToken: response.refreshToken
      };
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  /**
   * Login with Google ID token
   */
  async authenticateWithGoogle(idToken: string, accessToken?: string): Promise<{ user: User; token: string; refreshToken?: string }> {
    try {
      const requestData: GoogleSignInRequest = {
        idToken,
        accessToken
      };

      const response = await apiClient.post<GoogleSignInResponse>('/auth/google', requestData);

      // Transform API response to our User type
      const user: User = {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        photoUrl: response.user.photoUrl || undefined,
        hasCompletedOnboarding: response.user.hasCompletedOnboarding
      };

      return {
        user,
        token: response.token,
        refreshToken: response.refreshToken
      };
    } catch (error) {
      console.error('Google authentication failed:', error);
      throw error;
    }
  },

  /**
   * Get the Google OAuth URL
   */
  async getGoogleOAuthUrl(): Promise<{ authUrl: string }> {
    try {
      // This would ideally come from the backend, but we can construct it here
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      const redirectUri = `${window.location.origin}/auth/callback`;
      const scopes = ['openid', 'email', 'profile'];

      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: scopes.join(' '),
        access_type: 'offline',
        prompt: 'consent'
      });

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

      return { authUrl };
    } catch (error) {
      console.error('Failed to generate Google OAuth URL:', error);
      throw error;
    }
  },

  /**
   * Handle OAuth callback (exchange code for tokens)
   */
  async handleOAuthCallback(code: string, state: string): Promise<{ user: User; token: string; refreshToken?: string }> {
    try {
      const response = await apiClient.post<GoogleSignInResponse>('/auth/google/callback', {
        code,
        state
      });

      // Transform API response to our User type
      const user: User = {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        photoUrl: response.user.photoUrl || undefined,
        hasCompletedOnboarding: response.user.hasCompletedOnboarding
      };

      return {
        user,
        token: response.token,
        refreshToken: response.refreshToken
      };
    } catch (error) {
      console.error('OAuth callback failed:', error);
      throw error;
    }
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if API call fails, we should clear local auth state
      throw error;
    }
  },

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<{ token: string; expiresIn: number }> {
    try {
      const requestData: RefreshTokenRequest = {
        refreshToken
      };

      const response = await apiClient.post<RefreshTokenResponse>('/auth/refresh', requestData);

      return {
        token: response.token,
        expiresIn: response.expiresIn
      };
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  },

  /**
   * Validate current token (check if it's still valid)
   */
  async validateToken(token: string): Promise<boolean> {
    try {
      const response = await apiClient.get<{ valid: boolean }>('/auth/validate', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.valid;
    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  },

  /**
   * Complete onboarding
   */
  async completeOnboarding(): Promise<void> {
    try {
      await apiClient.post('/auth/onboarding/complete');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      throw error;
    }
  }
};
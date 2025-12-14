import {User, GoogleUser} from "@/types";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { authService } from "../services/authService";
import { storage } from "@/shared/utils/storage";

// Enhanced User type with Google OAuth properties
interface EnhancedGoogleUser extends GoogleUser {
  tokenExpiresAt?: number;
}

interface AuthContextType {
  user: EnhancedGoogleUser | null;
  login: (user: GoogleUser, idToken?: string, refreshToken?: string) => void;
  logout: () => void;
  loading: boolean;
  initializing: boolean;
  error: string | null;
  isAuthenticated: boolean;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// OAuth is now handled by @react-oauth/google package
// Environment variables are handled by the Google OAuth component

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
                                                                        children,
                                                                      }) => {
  const [user, setUser] = useState<EnhancedGoogleUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  
  // Initialize from secure storage
  useEffect(() => {
    try {
      const storedUser = storage.getUser();
      const storedIdToken = storage.getItem("GOOGLE_ID_TOKEN", "");
      const storedRefreshToken = storage.getItem("REFRESH_TOKEN", "");

      if (storedUser) {
        setUser({
          ...storedUser,
          idToken: storedIdToken,
          refreshToken: storedRefreshToken,
        });

        if (storedIdToken) setIdToken(storedIdToken);
        if (storedRefreshToken) setRefreshToken(storedRefreshToken);
      }
    } catch (error) {
      console.error("Failed to restore auth session:", error);
      // Clear corrupted data
      storage.clearAuth();
    } finally {
      // Always set initializing to false after checking
      setInitializing(false);
    }
  }, []);

  // Store in secure storage when state changes
  useEffect(() => {
    if (user) {
      storage.setItem("USER", user);
      storage.setItem("GOOGLE_ID_TOKEN", idToken || "");
      storage.setItem("REFRESH_TOKEN", refreshToken || "");
    }
  }, [user, idToken, refreshToken]);

  
  // Login with Google ID token (for OAuth callback)
  const loginWithIdToken = useCallback(
    async (
      userData: GoogleUser,
      googleIdToken?: string,
      googleRefreshToken?: string
    ) => {
      setLoading(true);
      setError(null);

      try {
        if (!googleIdToken) {
          throw new Error("Google ID token is required");
        }

        // Call authentication service to get real token
        const authResult = await authService.authenticateWithGoogle(googleIdToken);

        // Create full user object with OAuth data
        const fullUser: EnhancedGoogleUser = {
          ...userData,
          idToken: googleIdToken,
          refreshToken: authResult.refreshToken,
          tokenExpiresAt: authResult.refreshToken
            ? Date.now() + 3600 * 1000
            : undefined, // 1 hour for refresh token
          emailVerified: true,
          hasCompletedOnboarding: authResult.user.hasCompletedOnboarding,
        };

        // Update all state first
        setUser(fullUser);
        if (googleIdToken) setIdToken(googleIdToken);
        if (authResult.refreshToken) setRefreshToken(authResult.refreshToken);

        // Store authentication data using secure storage
        storage.setAuthToken(authResult.token);
        storage.setItem("USER", authResult.user);
        storage.setItem("GOOGLE_ID_TOKEN", googleIdToken);
        if (authResult.refreshToken) {
          storage.setItem("REFRESH_TOKEN", authResult.refreshToken);
        }

        setLoading(false);
        // Redirect is now handled by the caller (GoogleLoginButton) based on onboarding status
      } catch (error) {
        console.error("Login failed:", error);
        setError(error instanceof Error ? error.message : "Authentication failed. Please try again.");
        setLoading(false);
        throw error; // Re-throw to allow caller to handle
      }
    },
    []
  );

  // Login method - stores user data but does NOT redirect
  const login = useCallback(
    (userData: User, idToken?: string, refreshToken?: string) => {
      loginWithIdToken(userData as GoogleUser, idToken, refreshToken);
      // Redirect is now handled by the caller based on onboarding status
    },
    [loginWithIdToken]
  );


  // Logout and clear all authentication data
  const logout = useCallback(() => {
    setUser(null);
    setIdToken(null);
    setRefreshToken(null);
        setError(null);
    setLoading(false);

    // Clear all auth-related storage using secure storage
    storage.clearAuth();
    storage.removeItem("SELECTED_BUSINESS");

    // Clear OAuth state
    localStorage.removeItem("cashify_google_nonce");

    // Clear any in-memory Google state
    const token = storage.getAuthToken();
    if (token && typeof globalThis !== 'undefined' && (globalThis as any).google?.accounts?.oauth2) {
      try {
        (globalThis as any).google.accounts.oauth2.revoke(token);
      } catch (e) {
        // Ignore revoke errors
      }
    }

    // Redirect to login page after logout
    globalThis.location.href = '/login';
  }, []);

  // OAuth flow is now handled by @react-oauth/google package
  // All manual OAuth methods removed for security and simplicity

  const value: AuthContextType = useMemo(() => ({
    user,
    login,
    logout,
    loading,
    initializing,
    error,
    isAuthenticated: !!user,
    clearError: () => setError(null),
  }), [user, login, logout, loading, initializing, error]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

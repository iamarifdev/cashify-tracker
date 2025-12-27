import {User, GoogleUser} from "@/types";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { storage } from "@/shared/utils/storage";

// Enhanced User type with Google OAuth properties
interface EnhancedGoogleUser extends GoogleUser {
  tokenExpiresAt?: number;
}

interface AuthContextType {
  user: EnhancedGoogleUser | null;
  login: (user: GoogleUser, idToken?: string, refreshToken?: string, backendToken?: string) => Promise<void>;
  logout: () => void;
  completeOnboarding: () => void;
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


  // Login method - stores user data and tokens directly
  // Does NOT call backend API (caller should have already authenticated)
  const login = useCallback(
    async (userData: User, idToken?: string, refreshToken?: string, backendToken?: string) => {
      setLoading(true);
      setError(null);

      // DEBUG: Log login parameters
      console.log('=== AUTH PROVIDER LOGIN DEBUG ===');
      console.log('login() called with backendToken:', backendToken);
      console.log('backendToken type:', typeof backendToken);
      console.log('backendToken is truthy:', !!backendToken);
      console.log('==================================');

      try {
        // Create full user object with OAuth data
        const fullUser: EnhancedGoogleUser = {
          ...(userData as GoogleUser),
          idToken,
          refreshToken,
          tokenExpiresAt: refreshToken
            ? Date.now() + 3600 * 1000
            : undefined,
          emailVerified: true,
        };

        // IMPORTANT: Store to localStorage FIRST, before updating state
        // This ensures the token is available immediately for API calls
        if (backendToken) {
          console.log('Calling storage.setAuthToken with:', backendToken);
          storage.setAuthToken(backendToken);
        } else {
          console.error('backendToken is falsy! Not storing auth token.');
        }
        storage.setItem("USER", fullUser);
        storage.setItem("GOOGLE_ID_TOKEN", idToken || "");
        if (refreshToken) {
          storage.setItem("REFRESH_TOKEN", refreshToken);
        }

        // Verify token was stored
        const storedToken = localStorage.getItem('cashify_token');
        console.log('Token stored in localStorage:', storedToken);
        console.log('Token exists in storage:', !!storedToken);

        // Update state AFTER storage is written
        setUser(fullUser);
        if (idToken) setIdToken(idToken);
        if (refreshToken) setRefreshToken(refreshToken);

        setLoading(false);
      } catch (error) {
        console.error("Login failed:", error);
        setError(error instanceof Error ? error.message : "Authentication failed. Please try again.");
        setLoading(false);
        throw error;
      }
    },
    []
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

  // Mark onboarding as completed
  const completeOnboarding = useCallback(() => {
    if (!user) return;

    const updatedUser: EnhancedGoogleUser = {
      ...user,
      hasCompletedOnboarding: true,
    };

    setUser(updatedUser);
    storage.setOnboardingCompleted();
  }, [user]);

  // OAuth flow is now handled by @react-oauth/google package
  // All manual OAuth methods removed for security and simplicity

  const value: AuthContextType = useMemo(() => ({
    user,
    login,
    logout,
    completeOnboarding,
    loading,
    initializing,
    error,
    isAuthenticated: !!user,
    clearError: () => setError(null),
  }), [user, login, logout, completeOnboarding, loading, initializing, error]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

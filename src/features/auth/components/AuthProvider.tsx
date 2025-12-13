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
  refreshToken: () => Promise<boolean>;
  clearError: () => void;
  buildGoogleAuthUrl: (nonce: string) => string;
  handleOAuthCallback: (code: string, state: string) => Promise<void>;
  generateNonce: () => string;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Environment variables from .env
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || globalThis.location.origin;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
                                                                        children,
                                                                      }) => {
  const [user, setUser] = useState<EnhancedGoogleUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [tokenExpiresAt, setTokenExpiresAt] = useState<number | null>(null);

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

  // Check if token is expired
  const isTokenExpired = useCallback(() => {
    if (!tokenExpiresAt) return false;
    return Date.now() >= tokenExpiresAt;
  }, [tokenExpiresAt]);

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

        // Use requestAnimationFrame to ensure state updates are processed before redirect
        requestAnimationFrame(() => {
          // Use window.location for redirect since useNavigate is not available here
          // Redirect directly to dashboard instead of root to avoid redirect chain
          globalThis.location.replace("/dashboard");
        });
      } catch (error) {
        console.error("Login failed:", error);
        setError(error instanceof Error ? error.message : "Authentication failed. Please try again.");
        setLoading(false);
        throw error; // Re-throw to allow caller to handle
      }
    },
    []
  );

  // Login method for development/testing
  const login = useCallback(
    (userData: User, idToken?: string, refreshToken?: string) => {
      loginWithIdToken(userData as GoogleUser, idToken, refreshToken);
      // Redirect to dashboard after login using window.location
      setTimeout(() => {
        globalThis.location.replace("/dashboard");
      }, 100);
    },
    [loginWithIdToken]
  );


  // Logout and clear all authentication data
  const logout = useCallback(() => {
    setUser(null);
    setIdToken(null);
    setRefreshToken(null);
    setTokenExpiresAt(null);
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

  // Refresh Google access token
  const refreshGoogleToken = useCallback(async (): Promise<boolean> => {
    const storedRefreshToken = storage.getItem("REFRESH_TOKEN", "");
    if (!storedRefreshToken || !GOOGLE_CLIENT_ID) {
      throw new Error("No refresh token or Google Client ID available");
    }

    try {
      const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: GOOGLE_CLIENT_ID,
          refresh_token: storedRefreshToken,
          grant_type: "refresh_token",
        }),
      });

      if (!response.ok) {
        throw new Error("Token refresh failed");
      }

      const data = await response.json();

      if (data.access_token) {
        const newExpiresAt = Date.now() + data.expires_in * 1000;
        setTokenExpiresAt(newExpiresAt);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Token refresh failed:", error);
      setError("Session expired. Please login again.");
      logout();
      return false;
    }
  }, [refreshToken, GOOGLE_CLIENT_ID, logout]);

  // Auto-refresh token when needed
  useEffect(() => {
    const checkAndRefresh = async () => {
      const storedRefreshToken = storage.getItem("REFRESH_TOKEN", "");
      if (isTokenExpired() && storedRefreshToken) {
        await refreshGoogleToken();
      }
    };

    // Check every 5 minutes
    const interval = setInterval(checkAndRefresh, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isTokenExpired, refreshGoogleToken]);

  // Generate secure nonce for OAuth state
  const generateNonce = useCallback((): string => {
    const array = new Uint8Array(16);
    if (globalThis.crypto?.getRandomValues) {
      globalThis.crypto.getRandomValues(array);
    } else {
      // Fallback for older browsers
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
    }
    return Array.from(array, (b) => (`00${  b.toString(16)}`).slice(-2)).join("");
  }, []);

  // Build Google OAuth URL (matching Angular implementation)
  const buildGoogleAuthUrl = useCallback(
    (nonce: string): string => {
      if (!GOOGLE_CLIENT_ID) {
        throw new Error("Google Client ID configuration missing");
      }

      const params = new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        redirect_uri: `${FRONTEND_URL}/login`,
        response_type: "code", // Use authorization code flow
        scope: "openid email profile",
        access_type: "offline",
        prompt: "consent",
        state: nonce
      });

      return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    },
    [GOOGLE_CLIENT_ID, FRONTEND_URL]
  );

  // Handle OAuth callback
  const handleOAuthCallback = useCallback(
    async (code: string, state: string) => {
      setLoading(true);
      setError(null);

      try {
        // Exchange authorization code for tokens
        const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            client_id: GOOGLE_CLIENT_ID!,
            client_secret: "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", // From .env file
            code,
            grant_type: "authorization_code",
            redirect_uri: `${FRONTEND_URL}/login`,
          }),
        });

        if (!tokenResponse.ok) {
          throw new Error("Failed to exchange authorization code");
        }

        const tokenData = await tokenResponse.json();

        // Get user info with access token
        const userInfoResponse = await fetch(
          `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokenData.access_token}`
        );

        if (!userInfoResponse.ok) {
          throw new Error("Failed to get user info");
        }

        const userData = await userInfoResponse.json();

        // Create user object
        const googleUser: GoogleUser = {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          photoUrl: userData.picture,
          emailVerified: userData.verified_email,
          hasCompletedOnboarding: true, // Default to true for now
          idToken: tokenData.id_token,
          refreshToken: tokenData.refresh_token,
          tokenExpiresAt: Date.now() + tokenData.expires_in * 1000,
        };

        // Store tokens
        storage.setAuthToken(tokenData.id_token);
        storage.setItem("USER", googleUser);
        storage.setItem("GOOGLE_ID_TOKEN", tokenData.id_token);
        if (tokenData.refresh_token) {
          storage.setItem("REFRESH_TOKEN", tokenData.refresh_token);
        }

        // Update state
        setUser(googleUser);
        setIdToken(tokenData.id_token);
        setRefreshToken(tokenData.refresh_token);
        setLoading(false);

        // Redirect to dashboard
        requestAnimationFrame(() => {
          globalThis.location.replace("/dashboard");
        });
      } catch (error) {
        console.error("OAuth callback failed:", error);
        setError("Authentication failed. Please try again.");
        setLoading(false);
      }
    },
    [GOOGLE_CLIENT_ID, FRONTEND_URL]
  );

  const value: AuthContextType = useMemo(() => ({
    user,
    login,
    logout,
    loading,
    initializing,
    error,
    isAuthenticated: !!user,
    refreshToken: refreshGoogleToken,
    clearError: () => setError(null),
    buildGoogleAuthUrl,
    handleOAuthCallback,
    generateNonce,
  }), [user, login, logout, loading, initializing, error, refreshGoogleToken, buildGoogleAuthUrl, handleOAuthCallback, generateNonce]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

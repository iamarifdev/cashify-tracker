import {User} from "@/types";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

// Enhanced User type with Google OAuth properties
interface GoogleUser extends User {
  emailVerified?: boolean;
  idToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: number;
}

interface AuthContextType {
  user: GoogleUser | null;
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
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [tokenExpiresAt, setTokenExpiresAt] = useState<number | null>(null);

  // Initialize from localStorage
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("cashify_user");
      const storedIdToken = localStorage.getItem("cashify_google_id_token");
      const storedRefreshToken = localStorage.getItem(
        "cashify_google_refresh_token"
      );
      const storedExpiresAt = localStorage.getItem("cashify_token_expires_at");

      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);

        if (storedIdToken) setIdToken(storedIdToken);
        if (storedRefreshToken) setRefreshToken(storedRefreshToken);
        if (storedExpiresAt) setTokenExpiresAt(Number.parseInt(storedExpiresAt));
      }
    } catch (error) {
      console.error("Failed to restore auth session:", error);
      // Clear corrupted data
      localStorage.removeItem("cashify_user");
      localStorage.removeItem("cashify_google_id_token");
      localStorage.removeItem("cashify_google_refresh_token");
      localStorage.removeItem("cashify_token_expires_at");
    } finally {
      // Always set initializing to false after checking
      setInitializing(false);
    }
  }, []);

  // Store in localStorage when state changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("cashify_user", JSON.stringify(user));
      localStorage.setItem("cashify_token", "mock_jwt_token");
    }
    if (idToken) {
      localStorage.setItem("cashify_google_id_token", idToken);
    }
    if (refreshToken) {
      localStorage.setItem("cashify_google_refresh_token", refreshToken);
    }
    if (tokenExpiresAt) {
      localStorage.setItem(
        "cashify_token_expires_at",
        tokenExpiresAt.toString()
      );
    }
  }, [user, idToken, refreshToken, tokenExpiresAt]);

  // Check if token is expired
  const isTokenExpired = useCallback(() => {
    if (!tokenExpiresAt) return false;
    return Date.now() >= tokenExpiresAt;
  }, [tokenExpiresAt]);

  // Login with Google ID token (for OAuth callback)
  const loginWithIdToken = useCallback(
    (
      userData: GoogleUser,
      googleIdToken?: string,
      googleRefreshToken?: string
    ) => {
      setLoading(true);
      setError(null);

      try {
        // Create full user object with OAuth data
        const fullUser: GoogleUser = {
          ...userData,
          idToken: googleIdToken,
          refreshToken: googleRefreshToken,
          tokenExpiresAt: googleRefreshToken
            ? Date.now() + 3600 * 1000
            : undefined, // 1 hour for refresh token
          emailVerified: true,
        };

        setUser(fullUser);
        if (googleIdToken) setIdToken(googleIdToken);
        if (googleRefreshToken) setRefreshToken(googleRefreshToken);

        // Store authentication data
        localStorage.setItem("cashify_user", JSON.stringify(fullUser));
        localStorage.setItem("cashify_google_id_token", googleIdToken || "");
        localStorage.setItem(
          "cashify_google_refresh_token",
          googleRefreshToken || ""
        );
        localStorage.setItem("cashify_token", "mock_jwt_token");
        localStorage.setItem(
          "cashify_token_expires_at",
          fullUser.tokenExpiresAt?.toString() || ""
        );

        setLoading(false);
        
        // Use window.location for redirect since useNavigate is not available here
        globalThis.location.replace("/");
      } catch (error) {
        console.error("Login failed:", error);
        setError("Authentication failed. Please try again.");
        setLoading(false);
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
        globalThis.location.replace("/");
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

    // Clear all auth-related storage
    localStorage.removeItem("cashify_user");
    localStorage.removeItem("cashify_token");
    localStorage.removeItem("cashify_google_id_token");
    localStorage.removeItem("cashify_google_refresh_token");
    localStorage.removeItem("cashify_token_expires_at");
    localStorage.removeItem("cashify_google_nonce"); // Clear OAuth state

    // Clear any in-memory Google state
    if (typeof globalThis !== 'undefined' && (globalThis as any).google?.accounts?.oauth2) {
      try {
        (globalThis as any).google.accounts.oauth2.revoke("mock_jwt_token");
      } catch (e) {
        // Ignore revoke errors
      }
    }
  }, []);

  // Refresh Google access token
  const refreshGoogleToken = useCallback(async (): Promise<boolean> => {
    const storedRefreshToken = localStorage.getItem("cashify_google_refresh_token");
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
        localStorage.setItem(
          "cashify_token_expires_at",
          newExpiresAt.toString()
        );
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
      const storedRefreshToken = localStorage.getItem("cashify_google_refresh_token");
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
    return Array.from(array, (b) => ("00" + b.toString(16)).slice(-2)).join("");
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
        response_type: "token id_token",
        scope: "openid email profile",
        include_granted_scopes: "true",
        prompt: "select_account",
        nonce
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
        const response = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            client_id: GOOGLE_CLIENT_ID!,
            client_secret: "your_google_client_secret_here", // In production, this should come from backend
            code: code,
            grant_type: "authorization_code",
            redirect_uri: `${FRONTEND_URL}/login`,
          }),
        });

        if (!response.ok) {
          throw new Error("OAuth exchange failed");
        }

        const data = await response.json();

        // Get user info with ID token
        const userInfoResponse = await fetch(
          `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${data.access_token}`
        );

        if (!userInfoResponse.ok) {
          throw new Error("Failed to get user info");
        }

        const userData = await userInfoResponse.json();

        const googleUser: GoogleUser = {
          id: data.id_token || userData.sub,
          name: userData.name,
          email: userData.email,
          photoUrl: userData.picture,
          emailVerified: userData.email_verified,
          idToken: data.id_token,
          refreshToken: data.refresh_token,
          tokenExpiresAt: Date.now() + data.expires_in * 1000,
        };

        loginWithIdToken(googleUser, data.id_token, data.refresh_token);

        // Clean up URL
        globalThis.history.replaceState(
          {},
          document.title,
          globalThis.location.pathname
        );
      } catch (error) {
        console.error("OAuth callback failed:", error);
        setError("Authentication failed. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [loginWithIdToken, GOOGLE_CLIENT_ID, FRONTEND_URL]
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

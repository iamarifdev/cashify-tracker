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
      storage.clearAuth();
    } finally {
      setInitializing(false);
    }
  }, []);


  const login = useCallback(
    async (userData: User, idToken?: string, refreshToken?: string, backendToken?: string) => {
      setLoading(true);
      setError(null);

      try {
        const fullUser: EnhancedGoogleUser = {
          ...(userData as GoogleUser),
          idToken,
          refreshToken,
          tokenExpiresAt: refreshToken
            ? Date.now() + 3600 * 1000
            : undefined,
          emailVerified: true,
        };

        if (backendToken) {
          storage.setAuthToken(backendToken);
        }
        storage.setItem("USER", fullUser);
        storage.setItem("GOOGLE_ID_TOKEN", idToken || "");
        if (refreshToken) {
          storage.setItem("REFRESH_TOKEN", refreshToken);
        }

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


  const logout = useCallback(() => {
    setUser(null);
    setIdToken(null);
    setRefreshToken(null);
    setError(null);
    setLoading(false);

    storage.clearAuth();
    storage.removeItem("SELECTED_BUSINESS");

    localStorage.removeItem("cashify_google_nonce");

    const token = storage.getAuthToken();
    const googleGlobal = typeof globalThis !== 'undefined' ? (globalThis as { google?: { accounts?: { oauth2?: { revoke: (token: string) => void } } } }).google : undefined;
    if (token && googleGlobal?.accounts?.oauth2) {
      try {
        googleGlobal.accounts.oauth2.revoke(token);
      } catch {
        // Ignore errors during token revocation
      }
    }

    globalThis.location.href = '/login';
  }, []);

  const completeOnboarding = useCallback(() => {
    if (!user) return;

    const updatedUser: EnhancedGoogleUser = {
      ...user,
      hasCompletedOnboarding: true,
    };

    setUser(updatedUser);
    storage.setOnboardingCompleted();
  }, [user]);

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

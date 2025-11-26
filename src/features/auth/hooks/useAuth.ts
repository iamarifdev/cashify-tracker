import { useState, useCallback } from 'react';
import { User } from '@/types';
import { useLocalStorage } from '@/shared/hooks/useLocalStorage';

export const useAuth = () => {
  const [user, setUser] = useLocalStorage<User | null>('cashify_user', null);
  const [token, setToken] = useLocalStorage<string | null>('cashify_token', null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (userData: User, authToken: string) => {
    setIsLoading(true);
    setError(null);

    try {
      setUser(userData);
      setToken(authToken);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [setUser, setToken]);

  const loginWithGoogle = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate Google OAuth flow
      await new Promise(resolve => setTimeout(resolve, 1500));

      const mockUser: User = {
        id: 'google_user_123',
        name: 'Ariful Islam',
        email: 'ariful@example.com',
        photoUrl: 'https://ui-avatars.com/api/?name=Ariful+Islam&background=0D8ABC&color=fff'
      };

      const mockToken = 'google_token_' + Date.now();

      setUser(mockUser);
      setToken(mockToken);
    } catch (err) {
      setError('Google login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [setUser, setToken]);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setError(null);
  }, [setUser, setToken]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated: !!user,
    login,
    loginWithGoogle,
    logout,
    clearError
  };
};
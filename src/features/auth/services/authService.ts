import { User } from '@/types';

export const authService = {
  // Simulate API calls - in real app these would make HTTP requests
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock successful login
    const user: User = {
      id: 'user_123',
      name: 'Ariful Islam',
      email: email,
      photoUrl: 'https://ui-avatars.com/api/?name=Ariful+Islam&background=0D8ABC&color=fff'
    };

    return {
      user,
      token: 'mock_jwt_token_' + Date.now()
    };
  },

  async loginWithGoogle(): Promise<{ user: User; token: string }> {
    await new Promise(resolve => setTimeout(resolve, 1500));

    const user: User = {
      id: 'google_user_123',
      name: 'Ariful Islam',
      email: 'ariful@example.com',
      photoUrl: 'https://ui-avatars.com/api/?name=Ariful+Islam&background=0D8ABC&color=fff'
    };

    return {
      user,
      token: 'google_token_' + Date.now()
    };
  },

  async logout(): Promise<void> {
    // Simulate logout API call
    await new Promise(resolve => setTimeout(resolve, 500));
  },

  async refreshToken(refreshToken: string): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return 'new_jwt_token_' + Date.now();
  },

  async validateToken(token: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 200));
    // In real app, this would validate JWT signature and expiration
    return token.includes('token_');
  }
};
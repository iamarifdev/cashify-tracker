import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from './AuthProvider';
import { authService } from '../services/authService';

export const GoogleLoginButton = () => {
  const { login } = useAuth();

  const handleSuccess = async (credentialResponse: any) => {
    try {
      // Google returns the ID token
      const { credential } = credentialResponse;

      // Send ID token to your backend
      const response = await authService.authenticateWithGoogle(credential);

      // Your backend returns JWT, user info, and onboarding status
      if (response.token && response.user) {
        // Store user data using AuthProvider
        login(response.user, response.token, response.refreshToken);

        // Redirect based on onboarding status
        // Use window.location for immediate redirect
        if (response.user.hasCompletedOnboarding) {
          globalThis.location.href = '/dashboard';
        } else {
          globalThis.location.href = '/onboarding';
        }
      }
    } catch (error) {
      console.error('Authentication failed:', error);
      // TODO: Show error message to user
    }
  };

  const handleError = () => {
    console.error('Google Login Failed');
    // TODO: Show error message to user
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={handleError}
      useOneTap={false}
      type="standard"
      theme="outline"
      size="large"
      text="signin_with"
      shape="rectangular"
      logo_alignment="left"
      width="100%"
    />
  );
};
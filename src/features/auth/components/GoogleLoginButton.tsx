import { GoogleLogin } from '@react-oauth/google';
import { useRouter } from '@tanstack/react-router';
import { authService } from '../services/authService';
import { useAuth } from './AuthProvider';

export const GoogleLoginButton = () => {
  const { login } = useAuth();
  const router = useRouter();

  const handleSuccess = async (credentialResponse: any) => {
    try {
      // Google returns the ID token
      const { credential } = credentialResponse;

      // Send ID token to your backend
      const response = await authService.authenticateWithGoogle(credential);

      // DEBUG: Log backend response
      console.log('=== GOOGLE LOGIN BUTTON DEBUG ===');
      console.log('Backend response:', response);
      console.log('Backend token:', response.token);
      console.log('Backend token type:', typeof response.token);
      console.log('Backend token length:', response.token?.length);
      console.log('=====================================');

      // Your backend returns JWT, user info, and onboarding status
      if (response.token && response.user) {
        // Store user data using AuthProvider
        // Pass Google's credential as idToken, backend's refreshToken, and backend JWT token
        await login(response.user, credential, response.refreshToken, response.token);

        // Redirect based on onboarding status using TanStack Router
        if (response.user.hasCompletedOnboarding) {
          router.navigate({ to: '/dashboard' });
        } else {
          router.navigate({ to: '/onboarding' });
        }
      } else {
        console.error('No token or user in response!');
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
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from '@tanstack/react-router';
import { authService } from '../services/authService';

export const GoogleLoginButton = () => {
  const navigate = useNavigate();

  const handleSuccess = async (credentialResponse: any) => {
    try {
      // Google returns the ID token
      const { credential } = credentialResponse;

      // Send ID token to your backend
      const response = await authService.authenticateWithGoogle(credential);

      // Your backend returns JWT, user info, and onboarding status
      if (response.token) {
        // Store JWT and user data
        localStorage.setItem('cashify_token', response.token);
        localStorage.setItem('cashify_user', JSON.stringify(response.user));

        // Redirect based on onboarding status
        if (response.user.hasCompletedOnboarding) {
          navigate({ to: '/dashboard' });
        } else {
          navigate({ to: '/onboarding' });
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
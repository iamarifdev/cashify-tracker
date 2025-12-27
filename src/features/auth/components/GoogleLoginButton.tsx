import { GoogleLogin } from '@react-oauth/google';
import { useRouter } from '@tanstack/react-router';
import { authService } from '../services/authService';
import { useAuth } from './AuthProvider';

export const GoogleLoginButton = () => {
  const { login } = useAuth();
  const router = useRouter();

  const handleSuccess = async (credentialResponse: { credential?: string }) => {
    try {
      const { credential } = credentialResponse;
      if (!credential) return;
      const response = await authService.authenticateWithGoogle(credential);

      if (response.token && response.user) {
        await login(response.user, credential, response.refreshToken, response.token);

        if (response.user.hasCompletedOnboarding) {
          router.navigate({ to: '/dashboard' });
        } else {
          router.navigate({ to: '/onboarding' });
        }
      }
    } catch (error) {
      console.error('Authentication failed:', error);
    }
  };

  const handleError = () => {
    console.error('Google Login Failed');
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
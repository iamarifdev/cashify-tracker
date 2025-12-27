import { AuthProvider } from '@/features/auth';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary/ErrorBoundary';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { RouterProvider } from '@tanstack/react-router';
import React from 'react';
import { router } from './router';

const App: React.FC = () => {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <ErrorBoundary>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </ErrorBoundary>
    </GoogleOAuthProvider>
  );
};

export default App;
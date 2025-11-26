import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, initializing } = useAuth();
  
  // Show loading while checking authentication status
  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return React.createElement(Navigate, { to: "/login", replace: true });
  }

  return React.createElement(React.Fragment, null, children);
};
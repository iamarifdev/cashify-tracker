import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { checkUserHasBusinesses, hasCompletedOnboarding } from '@/features/onboarding';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowOnboarding?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowOnboarding = false
}) => {
  const { user, initializing } = useAuth();
  const location = useLocation();

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
    return React.createElement(Navigate, { to: "/login", replace: true, state: { from: location } });
  }

  // Check if user needs onboarding
  const needsOnboarding = !hasCompletedOnboarding(user.id) && !checkUserHasBusinesses(user.id);

  // If user needs onboarding and current route is not onboarding page
  if (needsOnboarding && location.pathname !== "/onboarding" && !allowOnboarding) {
    return React.createElement(Navigate, { to: "/onboarding", replace: true });
  }

  // If user doesn't need onboarding but is on onboarding page
  if (!needsOnboarding && location.pathname === "/onboarding") {
    return React.createElement(Navigate, { to: "/", replace: true });
  }

  return React.createElement(React.Fragment, null, children);
};
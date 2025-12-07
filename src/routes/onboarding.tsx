import { createFileRoute, redirect } from '@tanstack/react-router'
import { ProtectedRoute } from '../features/auth/components/ProtectedRoute'
import { OnboardingPage } from '../features/onboarding'

export const Route = createFileRoute('/onboarding')({
  component: () => (
    <ProtectedRoute>
      <OnboardingPage />
    </ProtectedRoute>
  ),
  beforeLoad: async ({ context }) => {
    // Check if user is authenticated
    const isAuthenticated = localStorage.getItem('authToken')
    if (!isAuthenticated) {
      throw redirect({
        to: '/login',
      })
    }
  },
})
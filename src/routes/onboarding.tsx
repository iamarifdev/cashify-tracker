import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { ProtectedRoute } from '../features/auth/components/ProtectedRoute'
import { OnboardingPage } from '../features/onboarding'
import { AuthUtils } from '@/features/auth/utils/auth.utils'

function OnboardingRoute() {
  const router = useRouter()

  const handleComplete = () => {
    // Mark onboarding as completed
    AuthUtils.completeOnboarding()
    // Navigate to dashboard
    router.navigate({ to: '/dashboard' })
  }

  return (
    <ProtectedRoute>
      <OnboardingPage
        onComplete={handleComplete}
      />
    </ProtectedRoute>
  )
}

export const Route = createFileRoute('/onboarding')({
  component: OnboardingRoute,
  beforeLoad: async ({ context: _context }) => {
    // Check if user is authenticated using centralized logic
    if (!AuthUtils.isAuthenticated()) {
      throw redirect({
        to: '/login',
      })
    }

    // Redirect to dashboard if onboarding is already completed
    if (AuthUtils.hasCompletedOnboarding()) {
      throw redirect({
        to: '/dashboard',
      })
    }
  },
})
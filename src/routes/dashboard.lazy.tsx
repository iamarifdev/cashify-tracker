import { Business } from '@/types'
import { createLazyFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { AuthenticatedLayout } from '../features/auth/components/AuthenticatedLayout'
import { ProtectedRoute } from '../features/auth/components/ProtectedRoute'
import { Dashboard } from '../features/cashbook/components/Dashboard'

function DashboardRoute() {
  const router = useRouter()

  // Mock business data - will be replaced with actual data from API
  const currentBusiness: Business = {
    id: '1',
    name: 'My Business',
    role: 'Owner'
  }

  const handleBookSelect = (book: any) => {
    router.navigate({ to: '/books/$bookId', params: { bookId: book.id } })
  }

  return (
    <ProtectedRoute>
      <AuthenticatedLayout>
        <Dashboard
          currentBusiness={currentBusiness}
          onBookSelect={handleBookSelect}
        />
      </AuthenticatedLayout>
    </ProtectedRoute>
  )
}

DashboardRoute.loader = async () => {
  // Check if user is authenticated using centralized logic
  const { AuthUtils } = await import('@/features/auth/utils/auth.utils')

  if (!AuthUtils.isAuthenticated()) {
    throw redirect({
      to: '/login',
    })
  }

  // Check if user has completed onboarding
  if (!AuthUtils.hasCompletedOnboarding()) {
    throw redirect({
      to: '/onboarding',
    })
  }

  return { isAuthenticated: true }
}

export const Route = createLazyFileRoute('/dashboard')({
  component: DashboardRoute,
})
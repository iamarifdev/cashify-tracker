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

export const Route = createLazyFileRoute('/dashboard')({
  component: DashboardRoute,
  loader: async () => {
    // Check if user is authenticated
    const isAuthenticated = localStorage.getItem('authToken')
    if (!isAuthenticated) {
      throw redirect({
        to: '/login',
      })
    }

    // Check if user has completed onboarding
    const userStr = localStorage.getItem('user')
    if (userStr) {
      const user = JSON.parse(userStr)
      if (!user.hasCompletedOnboarding) {
        throw redirect({
          to: '/onboarding',
        })
      }
    }

    return { isAuthenticated: true }
  },
})
import { createLazyFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { ProtectedRoute } from '../features/auth/components/ProtectedRoute'
import { AuthenticatedLayout } from '../features/auth/components/AuthenticatedLayout'
import { BookDetails } from '../features/transactions/components/BookDetails'
import { Book } from '@/types'

function BookDetailsRoute() {
  const router = useRouter()

  // Mock book data - will be replaced with actual data from API
  const mockBook: Book = {
    id: '1',
    name: 'Sample Book',
    membersCount: 3,
    lastUpdated: new Date().toISOString(),
    netBalance: 10000,
    businessId: '1'
  }

  const handleBack = () => {
    router.navigate({ to: '/dashboard' })
  }

  return (
    <ProtectedRoute>
      <AuthenticatedLayout>
        <BookDetails
          book={mockBook}
          onBack={handleBack}
        />
      </AuthenticatedLayout>
    </ProtectedRoute>
  )
}

BookDetailsRoute.loader = async ({ params }: { params: { bookId: string } }) => {
  // Check if user is authenticated using centralized logic
  const { AuthUtils } = await import('@/features/auth/utils/auth.utils')

  if (!AuthUtils.isAuthenticated()) {
    throw redirect({
      to: '/login',
    })
  }

  // Pass the bookId to the component
  return { bookId: params.bookId }
}

export const Route = createLazyFileRoute('/books/$bookId')({
  component: BookDetailsRoute,
})
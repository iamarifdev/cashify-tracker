import { createLazyFileRoute, redirect } from '@tanstack/react-router'
import { ProtectedRoute } from '../features/auth/components/ProtectedRoute'
import { AuthenticatedLayout } from '../features/auth/components/AuthenticatedLayout'
import { BookDetails } from '../features/transactions/components/BookDetails'

export const Route = createLazyFileRoute('/books/$bookId')({
  component: () => (
    <ProtectedRoute>
      <AuthenticatedLayout>
        <BookDetails />
      </AuthenticatedLayout>
    </ProtectedRoute>
  ),
  loader: async ({ params }) => {
    // Check if user is authenticated
    const isAuthenticated = localStorage.getItem('authToken')
    if (!isAuthenticated) {
      throw redirect({
        to: '/login',
      })
    }

    // Pass the bookId to the component
    return { bookId: params.bookId }
  },
})
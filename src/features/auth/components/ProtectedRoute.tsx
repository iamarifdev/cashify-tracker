import { useAuth } from './AuthProvider'
import { Navigate } from '@tanstack/react-router'
import { ReactNode } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, loading, initializing } = useAuth()

  // In debug mode, bypass authentication
  if (import.meta.env.VITE_DEBUG === 'true') {
    console.log('Development mode: Bypassing ProtectedRoute authentication')
    return <>{children}</>
  }

  // Show loading indicator while initializing or checking auth
  if (loading || initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
import { ReactNode, useState } from 'react'
import { Sidebar } from '@/shared/components/layout/Sidebar/Sidebar'
import { TopBar } from '@/shared/components/layout/Header/TopBar'
import { useAuth } from '../hooks/useAuth'
import { Business } from '@/types'

interface AuthenticatedLayoutProps {
  children: ReactNode
}

export const AuthenticatedLayout = ({ children }: AuthenticatedLayoutProps) => {
  const { user, logout } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('bookkeeping')

  // Mock data for now - will be replaced with actual data from API
  const mockBusiness: Business = {
    id: '1',
    name: 'My Business',
    role: 'Owner'
  }

  const handleBusinessChange = (business: Business) => {
    // TODO: Implement business change logic
    console.log('Business changed to:', business)
  }

  const handleCreateBusiness = async (data: { name: string; category: string; type: string }) => {
    // TODO: Implement business creation logic
    console.log('Creating business:', data)
  }

  const handleLogout = () => {
    logout()
  }

  const handleSidebarOpen = () => {
    setIsSidebarOpen(true)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Fixed on desktop, overlay on mobile */}
      <div className="hidden lg:block lg:flex-shrink-0">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
        />
      </div>

      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-gray-600 bg-opacity-50 lg:hidden p-0 m-0 border-0 cursor-pointer"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close sidebar"
          />
          <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
            <Sidebar
              activeTab={activeTab}
              onTabChange={setActiveTab}
              isOpen={isSidebarOpen}
              setIsOpen={setIsSidebarOpen}
            />
          </div>
        </>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          user={user}
          currentBusiness={mockBusiness}
          businesses={[mockBusiness]}
          onBusinessChange={handleBusinessChange}
          onCreateBusiness={handleCreateBusiness}
          onLogout={handleLogout}
          onSidebarOpen={handleSidebarOpen}
        />
        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
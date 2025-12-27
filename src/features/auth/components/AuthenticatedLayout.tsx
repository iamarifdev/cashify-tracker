import React, { ReactNode, useState } from 'react'
import { useBusinesses } from '@/features/business/hooks/useBusinesses'
import { TopBar } from '@/shared/components/layout/Header/TopBar'
import { Sidebar } from '@/shared/components/layout/Sidebar/Sidebar'
import { BusinessSummary } from '@/types'
import { useAuth } from '../hooks/useAuth'

interface AuthenticatedLayoutProps {
  children: ReactNode
}

export const AuthenticatedLayout = ({ children }: AuthenticatedLayoutProps) => {
  const { user, logout } = useAuth()
  const {
    businesses,
    currentBusiness,
    setCurrentBusiness,
    createBusiness,
    isLoading: businessesLoading
  } = useBusinesses()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('bookkeeping')

  const handleBusinessChange = (business: BusinessSummary) => {
    setCurrentBusiness(business)
  }

  const handleCreateBusiness = async (data: { name: string; category: string; type: string }) => {
    await createBusiness(data)
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
        {currentBusiness ? (
          <TopBar
            user={user}
            currentBusiness={currentBusiness}
            businesses={businesses}
            onBusinessChange={handleBusinessChange}
            onCreateBusiness={handleCreateBusiness}
            onLogout={handleLogout}
            onSidebarOpen={handleSidebarOpen}
          />
        ) : businessesLoading ? (
          <div className="h-16 border-b border-gray-200 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : null}
        <main className="flex-1 p-4 lg:p-8">
          {React.isValidElement(children) && currentBusiness
            ? React.cloneElement(children as React.ReactElement<any>, { currentBusiness })
            : children
          }
        </main>
      </div>
    </div>
  )
}
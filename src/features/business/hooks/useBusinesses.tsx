import { BusinessSummary } from '@/types'
import { useEffect, useState } from 'react'
import { useBusinesses as useBusinessesQuery, useCreateBusiness } from '../api/business.query'

// Wrapper hook that adds local state management to the TanStack Query hooks
export const useBusinesses = () => {
  const [currentBusiness, setCurrentBusiness] = useState<BusinessSummary | null>(null)

  // Use TanStack Query for data fetching
  const {
    data: businesses = [],
    isLoading,
    error,
    refetch
  } = useBusinessesQuery()

  // Use TanStack Query for mutations
  const createBusinessMutation = useCreateBusiness()

  // Set first business as current when businesses are loaded
  useEffect(() => {
    if (businesses.length > 0 && !currentBusiness) {
      setCurrentBusiness(businesses[0])
    }
  }, [businesses, currentBusiness])

  const createBusiness = (data: { name: string; category: string; type: string }) => {
    return createBusinessMutation.mutateAsync(data)
  }

  return {
    businesses,
    currentBusiness,
    setCurrentBusiness,
    createBusiness,
    isLoading,
    error,
    refetch
  }
}
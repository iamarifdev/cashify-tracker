import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Business } from '@/types'

// Temporary hook - will be replaced with proper API integration
export const useBusinesses = () => {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [currentBusiness, setCurrentBusiness] = useState<Business | null>(null)

  const createBusiness = useMutation({
    mutationFn: async (data: { name: string; category: string; type: string }) => {
      // TODO: Replace with actual API call
      console.log('Creating business:', data)
      return {
        id: Date.now().toString(),
        name: data.name,
        role: 'Owner' as const
      } as Business
    },
    onSuccess: (newBusiness) => {
      setBusinesses(prev => [...prev, newBusiness])
      setCurrentBusiness(newBusiness)
    }
  })

  return {
    businesses,
    currentBusiness,
    setCurrentBusiness,
    createBusiness
  }
}
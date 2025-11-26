import { useState, useCallback } from 'react';
import { Business } from '@/types';
import { useLocalStorage } from '@/shared/hooks/useLocalStorage';
import { MOCK_BUSINESSES } from '@/services/mockData';

export const useBusiness = () => {
  const [businesses, setBusinesses] = useLocalStorage<Business[]>('cashify_businesses', MOCK_BUSINESSES);
  const [currentBusiness, setCurrentBusiness] = useLocalStorage<Business>('cashify_current_business', MOCK_BUSINESSES[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectBusiness = useCallback((business: Business) => {
    setCurrentBusiness(business);
    setError(null);
  }, [setCurrentBusiness]);

  const createBusiness = useCallback(async (businessData: { name: string; category: string; type: string }) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newBusiness: Business = {
        id: `biz_${Date.now()}`,
        name: businessData.name,
        role: 'Owner'
      };

      const updatedBusinesses = [...businesses, newBusiness];
      setBusinesses(updatedBusinesses);
      setCurrentBusiness(newBusiness);

      return newBusiness;
    } catch (err) {
      setError('Failed to create business. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [businesses, setBusinesses, setCurrentBusiness]);

  const updateBusiness = useCallback(async (businessId: string, updates: Partial<Business>) => {
    setIsLoading(true);
    setError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const updatedBusinesses = businesses.map(b =>
        b.id === businessId ? { ...b, ...updates } : b
      );

      setBusinesses(updatedBusinesses);

      if (currentBusiness.id === businessId) {
        setCurrentBusiness({ ...currentBusiness, ...updates });
      }
    } catch (err) {
      setError('Failed to update business. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [businesses, currentBusiness, setBusinesses, setCurrentBusiness]);

  const deleteBusiness = useCallback(async (businessId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const updatedBusinesses = businesses.filter(b => b.id !== businessId);
      setBusinesses(updatedBusinesses);

      if (currentBusiness.id === businessId && updatedBusinesses.length > 0) {
        setCurrentBusiness(updatedBusinesses[0]);
      }
    } catch (err) {
      setError('Failed to delete business. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [businesses, currentBusiness, setBusinesses, setCurrentBusiness]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    businesses,
    currentBusiness,
    isLoading,
    error,
    selectBusiness,
    createBusiness,
    updateBusiness,
    deleteBusiness,
    clearError
  };
};
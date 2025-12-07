import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { businessService } from '../services/businessService';
import type { Business, CreateBusinessData } from '../types/business.types';

// Query key factory for businesses
export const businessKeys = {
  all: ['businesses'] as const,
  lists: () => [...businessKeys.all, 'list'] as const,
  list: (filters?: string) => [...businessKeys.lists(), { filters }] as const,
  details: () => [...businessKeys.all, 'detail'] as const,
  detail: (id: string) => [...businessKeys.details(), id] as const,
  stats: (id: string) => [...businessKeys.detail(id), 'stats'] as const,
};

// Get all businesses
export const useBusinesses = () => {
  return useQuery({
    queryKey: businessKeys.list(),
    queryFn: () => businessService.getAllBusinesses(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
  });
};

// Get single business
export const useBusiness = (id: string) => {
  return useQuery({
    queryKey: businessKeys.detail(id),
    queryFn: () => businessService.getBusinessById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Get business stats
export const useBusinessStats = (id: string) => {
  return useQuery({
    queryKey: businessKeys.stats(id),
    queryFn: () => businessService.getBusinessStats(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

// Create business mutation
export const useCreateBusiness = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBusinessData) => businessService.createBusiness(data),
    onSuccess: (newBusiness) => {
      // Add new business to cache
      queryClient.setQueryData(
        businessKeys.list(),
        (old: Business[] | undefined) => [...(old || []), newBusiness]
      );

      // Invalidate and refetch businesses list
      queryClient.invalidateQueries({
        queryKey: businessKeys.lists(),
      });

      // Show success toast (if toast system exists)
      console.log('Business created successfully');
    },
    onError: (error) => {
      console.error('Failed to create business:', error);
    },
  });
};

// Update business mutation
export const useUpdateBusiness = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Business> }) =>
      businessService.updateBusiness(id, updates),
    onMutate: async ({ id, updates }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: businessKeys.detail(id),
      });

      // Snapshot the previous value
      const previousBusiness = queryClient.getQueryData<Business>(
        businessKeys.detail(id)
      );

      // Optimistically update to the new value
      queryClient.setQueryData(businessKeys.detail(id), (old: Business | undefined) => ({
        ...(old || {}),
        ...updates,
      }));

      // Return a context with the previous value
      return { previousBusiness };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousBusiness) {
        queryClient.setQueryData(
          businessKeys.detail(variables.id),
          context.previousBusiness
        );
      }
      console.error('Failed to update business:', error);
    },
    onSettled: (data, error, variables) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({
        queryKey: businessKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: businessKeys.lists(),
      });
    },
  });
};

// Delete business mutation
export const useDeleteBusiness = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => businessService.deleteBusiness(id),
    onSuccess: (_, deletedId) => {
      // Remove business from cache
      queryClient.setQueryData(
        businessKeys.list(),
        (old: Business[] | undefined) =>
          (old || []).filter(business => business.id !== deletedId)
      );

      // Invalidate and refetch businesses list
      queryClient.invalidateQueries({
        queryKey: businessKeys.lists(),
      });

      console.log('Business deleted successfully');
    },
    onError: (error) => {
      console.error('Failed to delete business:', error);
    },
  });
};
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cashbookService } from '../services/cashbookService';
import type {
  AddCashbookMemberData,
  Cashbook,
  CashbookFilters,
  CreateCashbookData,
  UpdateCashbookData
} from '../types/cashbook.types';

// Query key factory for cashbooks
export const cashbookKeys = {
  all: ['cashbooks'] as const,
  lists: () => [...cashbookKeys.all, 'list'] as const,
  list: (businessId: string, filters?: CashbookFilters) =>
    [...cashbookKeys.lists(), { businessId, filters }] as const,
  details: () => [...cashbookKeys.all, 'detail'] as const,
  detail: (id: string) => [...cashbookKeys.details(), id] as const,
  stats: (id: string) => [...cashbookKeys.detail(id), 'stats'] as const,
  members: (id: string) => [...cashbookKeys.detail(id), 'members'] as const,
};

// Get all cashbooks for a business
export const useCashbooks = (businessId: string, filters?: CashbookFilters) => {
  return useQuery({
    queryKey: cashbookKeys.list(businessId, filters),
    queryFn: () => cashbookService.getCashbooks(businessId, filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!businessId,
  });
};

// Get single cashbook
export const useCashbook = (id: string) => {
  return useQuery({
    queryKey: cashbookKeys.detail(id),
    queryFn: () => cashbookService.getCashbookById(id),
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Get cashbook statistics
export const useCashbookStats = (id: string) => {
  return useQuery({
    queryKey: cashbookKeys.stats(id),
    queryFn: () => cashbookService.getCashbookStats(id),
    enabled: !!id,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  });
};

// Create cashbook mutation
export const useCreateCashbook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCashbookData) => cashbookService.createCashbook(data),
    onSuccess: (newCashbook) => {
      // Invalidate and refetch cashbooks list
      queryClient.invalidateQueries({
        queryKey: cashbookKeys.list(newCashbook.businessId),
      });

      // Add to cache optimistically
      queryClient.setQueryData(
        cashbookKeys.detail(newCashbook.id),
        newCashbook
      );

      console.log('Cashbook created successfully');
    },
    onError: (error) => {
      console.error('Failed to create cashbook:', error);
    },
  });
};

// Update cashbook mutation
export const useUpdateCashbook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateCashbookData) => cashbookService.updateCashbook(data),
    onMutate: async (updatedCashbook) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: cashbookKeys.detail(updatedCashbook.id!),
      });

      // Snapshot the previous value
      const previousCashbook = queryClient.getQueryData<Cashbook>(
        cashbookKeys.detail(updatedCashbook.id!)
      );

      // Optimistically update
      queryClient.setQueryData(
        cashbookKeys.detail(updatedCashbook.id!),
        (old: Cashbook | undefined) => ({
          ...(old || {}),
          ...updatedCashbook,
        })
      );

      // Return a context with the previous value
      return { previousCashbook };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousCashbook) {
        queryClient.setQueryData(
          cashbookKeys.detail(variables.id!),
          context.previousCashbook
        );
      }
      console.error('Failed to update cashbook:', error);
    },
    onSettled: (data, error, variables) => {
      // Always refetch after error or success
      if (variables.id) {
        queryClient.invalidateQueries({
          queryKey: cashbookKeys.detail(variables.id),
        });
        queryClient.invalidateQueries({
          queryKey: cashbookKeys.lists(),
        });
      }
    },
  });
};

// Delete cashbook mutation
export const useDeleteCashbook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cashbookService.deleteCashbook(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({
        queryKey: cashbookKeys.detail(deletedId),
      });

      // Invalidate and refetch cashbooks list
      queryClient.invalidateQueries({
        queryKey: cashbookKeys.lists(),
      });

      console.log('Cashbook deleted successfully');
    },
    onError: (error) => {
      console.error('Failed to delete cashbook:', error);
    },
  });
};

// Add cashbook member mutation
export const useAddCashbookMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cashbookId, memberData }: { cashbookId: string; memberData: AddCashbookMemberData }) =>
      cashbookService.addCashbookMember(cashbookId, memberData),
    onSuccess: (_, { cashbookId }) => {
      // Invalidate queries related to the cashbook
      queryClient.invalidateQueries({
        queryKey: cashbookKeys.detail(cashbookId),
      });
      queryClient.invalidateQueries({
        queryKey: cashbookKeys.members(cashbookId),
      });
    },
    onError: (error) => {
      console.error('Failed to add cashbook member:', error);
    },
  });
};

// Remove cashbook member mutation
export const useRemoveCashbookMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cashbookId, memberId }: { cashbookId: string; memberId: string }) =>
      cashbookService.removeCashbookMember(cashbookId, memberId),
    onSuccess: (_, { cashbookId }) => {
      // Invalidate queries related to the cashbook
      queryClient.invalidateQueries({
        queryKey: cashbookKeys.detail(cashbookId),
      });
      queryClient.invalidateQueries({
        queryKey: cashbookKeys.members(cashbookId),
      });
    },
    onError: (error) => {
      console.error('Failed to remove cashbook member:', error);
    },
  });
};

// Custom hook for managing cashbooks with additional state
export const useCashbooksManager = (businessId: string) => {
  const {
    data: cashbooks = [],
    isLoading,
    error,
    refetch
  } = useCashbooks(businessId);

  return {
    cashbooks,
    isLoading,
    error,
    refetch,
    activeCashbooks: cashbooks.filter(cb => cb.isActive),
    inactiveCashbooks: cashbooks.filter(cb => !cb.isActive),
  };
};
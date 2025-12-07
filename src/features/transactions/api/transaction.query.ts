import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { transactionService } from '../services/transactionService';
import type {
  Transaction,
  CreateTransactionData,
  UpdateTransactionData,
  TransactionFilters,
  TransactionStats
} from '../types/transaction.types';

// Query key factory for transactions
export const transactionKeys = {
  all: ['transactions'] as const,
  lists: () => [...transactionKeys.all, 'list'] as const,
  list: (bookId: string, filters?: TransactionFilters) =>
    [...transactionKeys.lists(), { bookId, filters }] as const,
  details: () => [...transactionKeys.all, 'detail'] as const,
  detail: (id: string) => [...transactionKeys.details(), id] as const,
  stats: (bookId: string, filters?: TransactionFilters) =>
    [...transactionKeys.list(bookId, filters), 'stats'] as const,
};

// Get transactions for a book
export const useTransactions = (bookId: string, filters?: TransactionFilters) => {
  return useQuery({
    queryKey: transactionKeys.list(bookId, filters),
    queryFn: () => transactionService.getTransactions(bookId, filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!bookId,
  });
};

// Get single transaction
export const useTransaction = (id: string) => {
  return useQuery({
    queryKey: transactionKeys.detail(id),
    queryFn: () => transactionService.getTransactionById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get transaction statistics
export const useTransactionStats = (bookId: string, filters?: TransactionFilters) => {
  return useQuery({
    queryKey: transactionKeys.stats(bookId, filters),
    queryFn: () => transactionService.getTransactionStats(bookId, filters),
    enabled: !!bookId,
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 3 * 60 * 1000, // Refetch every 3 minutes
  });
};

// Create transaction mutation
export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTransactionData) => transactionService.createTransaction(data),
    onSuccess: (newTransaction) => {
      // Invalidate and refetch transactions list
      queryClient.invalidateQueries({
        queryKey: transactionKeys.list(newTransaction.bookId),
      });

      // Invalidate stats
      queryClient.invalidateQueries({
        queryKey: transactionKeys.stats(newTransaction.bookId),
      });

      // Add to cache optimistically
      queryClient.setQueryData(
        transactionKeys.detail(newTransaction.id),
        newTransaction
      );

      console.log('Transaction created successfully');
    },
    onError: (error) => {
      console.error('Failed to create transaction:', error);
    },
  });
};

// Update transaction mutation
export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateTransactionData) => transactionService.updateTransaction(data),
    onMutate: async (updatedTransaction) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: transactionKeys.detail(updatedTransaction.id!),
      });

      // Snapshot previous value
      const previousTransaction = queryClient.getQueryData<Transaction>(
        transactionKeys.detail(updatedTransaction.id!)
      );

      // Optimistically update
      queryClient.setQueryData(
        transactionKeys.detail(updatedTransaction.id!),
        (old: Transaction | undefined) => ({
          ...(old || {}),
          ...updatedTransaction,
        })
      );

      return { previousTransaction };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousTransaction) {
        queryClient.setQueryData(
          transactionKeys.detail(variables.id!),
          context.previousTransaction
        );
      }
      console.error('Failed to update transaction:', error);
    },
    onSettled: (data, error, variables) => {
      // Always refetch after error or success
      if (variables.bookId) {
        queryClient.invalidateQueries({
          queryKey: transactionKeys.list(variables.bookId),
        });
        queryClient.invalidateQueries({
          queryKey: transactionKeys.stats(variables.bookId),
        });
      }
    },
  });
};

// Delete transaction mutation
export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, bookId }: { id: string; bookId: string }) =>
      transactionService.deleteTransaction(id),
    onSuccess: (_, { id, bookId }) => {
      // Remove from cache
      queryClient.removeQueries({
        queryKey: transactionKeys.detail(id),
      });

      // Invalidate list and stats
      queryClient.invalidateQueries({
        queryKey: transactionKeys.list(bookId),
      });
      queryClient.invalidateQueries({
        queryKey: transactionKeys.stats(bookId),
      });

      console.log('Transaction deleted successfully');
    },
    onError: (error) => {
      console.error('Failed to delete transaction:', error);
    },
  });
};

// Infinite scroll for transactions
export const useInfiniteTransactions = (
  bookId: string,
  filters?: TransactionFilters,
  pageSize: number = 20
) => {
  return useQuery({
    queryKey: [...transactionKeys.list(bookId, filters), 'infinite'],
    queryFn: async () => {
      // For now, return all transactions. In real implementation, this would use page/offset
      const transactions = await transactionService.getTransactions(bookId, filters);
      return {
        data: transactions,
        nextPage: transactions.length >= pageSize ? 2 : undefined,
      };
    },
    staleTime: 2 * 60 * 1000,
    enabled: !!bookId,
  });
};
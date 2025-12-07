import { useState, useMemo } from 'react';
import {
  useTransactions,
  useCreateTransaction,
  useUpdateTransaction,
  useDeleteTransaction,
  useTransactionStats
} from '../api/transaction.query';
import type { Transaction, TransactionFilters } from '../types/transaction.types';
import { TransactionType } from '@/types';

export const useTransactionsManager = (bookId: string) => {
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Get transactions with filters
  const {
    data: transactions = [],
    isLoading: isLoadingTransactions,
    error: transactionsError
  } = useTransactions(bookId, filters);

  // Get transaction statistics
  const {
    data: stats,
    isLoading: isLoadingStats,
    error: statsError
  } = useTransactionStats(bookId, filters);

  // Mutations
  const createTransactionMutation = useCreateTransaction();
  const updateTransactionMutation = useUpdateTransaction();
  const deleteTransactionMutation = useDeleteTransaction();

  // Derived state
  const cashInTransactions = useMemo(
    () => transactions.filter(t => t.type === TransactionType.CASH_IN),
    [transactions]
  );

  const cashOutTransactions = useMemo(
    () => transactions.filter(t => t.type === TransactionType.CASH_OUT),
    [transactions]
  );

  const totalCashIn = useMemo(
    () => cashInTransactions.reduce((sum, t) => sum + t.amount, 0),
    [cashInTransactions]
  );

  const totalCashOut = useMemo(
    () => cashOutTransactions.reduce((sum, t) => sum + t.amount, 0),
    [cashOutTransactions]
  );

  // Actions
  const createTransaction = async (data: Omit<Transaction, 'id' | 'createdBy' | 'balanceAfter'>) => {
    return createTransactionMutation.mutateAsync({
      ...data,
      bookId
    });
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    return updateTransactionMutation.mutateAsync({
      id,
      bookId,
      ...updates
    });
  };

  const deleteTransaction = async (id: string) => {
    return deleteTransactionMutation.mutateAsync({ id, bookId });
  };

  const updateFilters = (newFilters: Partial<TransactionFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const selectTransaction = (transaction: Transaction | null) => {
    setSelectedTransaction(transaction);
  };

  return {
    // Data
    transactions,
    selectedTransaction,
    stats,
    filters,

    // Derived data
    cashInTransactions,
    cashOutTransactions,
    totalCashIn,
    totalCashOut,

    // Loading states
    isLoadingTransactions,
    isLoadingStats,
    isLoading: isLoadingTransactions || isLoadingStats,

    // Errors
    transactionsError,
    statsError,
    error: transactionsError || statsError,

    // Actions
    createTransaction,
    updateTransaction,
    deleteTransaction,
    updateFilters,
    clearFilters,
    selectTransaction,

    // Mutation states
    isCreating: createTransactionMutation.isPending,
    isUpdating: updateTransactionMutation.isPending,
    isDeleting: deleteTransactionMutation.isPending,
  };
};
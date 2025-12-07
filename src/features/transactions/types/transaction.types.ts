import { Transaction, TransactionType } from '@/types';

// Re-export Transaction and TransactionType for use within the feature
export type { Transaction, TransactionType };

export interface CreateTransactionData {
  bookId: string;
  type: TransactionType;
  date: string;
  time: string;
  amount: number;
  details: string;
  category: string;
  paymentMode: string;
  contactName?: string;
  attachments?: string[];
}

export interface UpdateTransactionData extends Partial<CreateTransactionData> {
  id: string;
}

export interface TransactionFilters {
  type?: TransactionType;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface TransactionState {
  transactions: Transaction[];
  selectedTransaction: Transaction | null;
  filters: TransactionFilters;
  isLoading: boolean;
  error: string | null;
}

export interface TransactionStats {
  totalCashIn: number;
  totalCashOut: number;
  netBalance: number;
  transactionCount: number;
  averageTransactionValue: number;
}
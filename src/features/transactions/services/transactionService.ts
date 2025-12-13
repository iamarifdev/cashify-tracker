import { apiClient } from '@/shared/api/fetch-client';
import { Transaction, TransactionType } from '@/types';
import { CreateTransactionData, UpdateTransactionData, TransactionFilters, TransactionStats } from '../types/transaction.types';

// Type definitions for API requests/responses
interface TransactionResponse {
  id: string;
  bookId: string;
  type: TransactionType;
  date: string;
  time: string;
  amount: number;
  details: string;
  category: string;
  paymentMode: string;
  contactName?: string;
  attachments: string[];
  balanceAfter: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateTransactionRequest {
  type: TransactionType;
  date: string;
  time: string;
  amount: number;
  details: string;
  category: string;
  paymentMode: string;
  contactName?: string;
  attachments?: string[];
  categoryId?: string;
  contactId?: string;
  paymentMethodId?: string;
}

interface TransactionQueryParams {
  type?: TransactionType;
  categoryId?: string;
  paymentMethodId?: string;
  contactId?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
  page?: number;
  pageSize?: number;
}

// Transform API response to our Transaction type
const transformTransactionResponse = (response: TransactionResponse): Transaction => ({
  id: response.id,
  bookId: response.bookId,
  type: response.type,
  date: response.date.split('T')[0], // Ensure date is in YYYY-MM-DD format
  time: response.time,
  amount: response.amount,
  details: response.details,
  category: response.category,
  paymentMode: response.paymentMode,
  contactName: response.contactName,
  attachments: response.attachments,
  balanceAfter: response.balanceAfter,
  createdBy: response.createdBy
});

export const transactionService = {
  /**
   * Get transactions for a specific cashbook
   */
  async getTransactions(
    bookId: string,
    filters?: TransactionFilters
  ): Promise<Transaction[]> {
    try {
      const queryParams: TransactionQueryParams = {
        ...filters,
      };

      // Build query string
      const params = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });

      const url = `/businesses/${bookId.split('_')[0]}/cashbooks/${bookId}/transactions?${params.toString()}`;
      const response = await apiClient.get<TransactionResponse[]>(url);

      return response.map(transformTransactionResponse);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      throw error;
    }
  },

  /**
   * Get a single transaction by ID
   */
  async getTransactionById(id: string): Promise<Transaction> {
    try {
      // Note: We need businessId and bookId for the full URL
      // This might need to be adjusted based on your API structure
      const response = await apiClient.get<TransactionResponse>(`/transactions/${id}`);
      return transformTransactionResponse(response);
    } catch (error) {
      console.error(`Failed to fetch transaction ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new transaction
   */
  async createTransaction(data: CreateTransactionData): Promise<Transaction> {
    try {
      // Extract businessId from bookId (assuming format: businessId_bookId)
      const [businessId] = data.bookId.split('_');

      const requestData: CreateTransactionRequest = {
        type: data.type,
        date: data.date,
        time: data.time,
        amount: data.amount,
        details: data.details,
        category: data.category,
        paymentMode: data.paymentMode,
        contactName: data.contactName,
        attachments: data.attachments || []
      };

      const url = `/businesses/${businessId}/cashbooks/${data.bookId}/transactions`;
      const response = await apiClient.post<TransactionResponse>(url, requestData);

      return transformTransactionResponse(response);
    } catch (error) {
      console.error('Failed to create transaction:', error);
      throw error;
    }
  },

  /**
   * Update an existing transaction
   */
  async updateTransaction(data: UpdateTransactionData): Promise<Transaction> {
    try {
      // Extract businessId from bookId (assuming format: businessId_bookId)
      const [businessId] = (data.bookId || '').split('_');

      const requestData: Partial<CreateTransactionRequest> = {
        type: data.type,
        date: data.date,
        time: data.time,
        amount: data.amount,
        details: data.details,
        category: data.category,
        paymentMode: data.paymentMode,
        contactName: data.contactName,
        attachments: data.attachments
      };

      const url = `/businesses/${businessId}/cashbooks/${data.bookId}/transactions/${data.id}`;
      const response = await apiClient.put<TransactionResponse>(url, requestData);

      return transformTransactionResponse(response);
    } catch (error) {
      console.error(`Failed to update transaction ${data.id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a transaction
   */
  async deleteTransaction(id: string): Promise<void> {
    try {
      // Note: You might need businessId and bookId for the full URL
      await apiClient.delete(`/transactions/${id}`);
    } catch (error) {
      console.error(`Failed to delete transaction ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get transaction statistics for a cashbook
   */
  async getTransactionStats(
    bookId: string,
    filters?: TransactionFilters
  ): Promise<TransactionStats> {
    try {
      const [businessId] = bookId.split('_');

      // Build query string for filters
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, String(value));
          }
        });
      }

      const url = `/businesses/${businessId}/cashbooks/${bookId}/transactions/stats?${params.toString()}`;

      try {
        const response = await apiClient.get<{
          totalCashIn: number;
          totalCashOut: number;
          transactionCount: number;
          averageTransactionValue: number;
        }>(url);

        return {
          totalCashIn: response.totalCashIn,
          totalCashOut: response.totalCashOut,
          netBalance: response.totalCashIn - response.totalCashOut,
          transactionCount: response.transactionCount,
          averageTransactionValue: response.averageTransactionValue
        };
      } catch (statsError) {
        // If stats endpoint doesn't exist, fetch transactions and calculate
        console.warn('Stats endpoint not available, calculating from transactions');
        const transactions = await this.getTransactions(bookId, filters);

        const cashInTotal = transactions
          .filter(t => t.type === TransactionType.CASH_IN)
          .reduce((sum, t) => sum + t.amount, 0);

        const cashOutTotal = transactions
          .filter(t => t.type === TransactionType.CASH_OUT)
          .reduce((sum, t) => sum + t.amount, 0);

        return {
          totalCashIn: cashInTotal,
          totalCashOut: cashOutTotal,
          netBalance: cashInTotal - cashOutTotal,
          transactionCount: transactions.length,
          averageTransactionValue: transactions.length > 0
            ? (cashInTotal + cashOutTotal) / transactions.length
            : 0
        };
      }
    } catch (error) {
      console.error('Failed to fetch transaction stats:', error);
      throw error;
    }
  }
};
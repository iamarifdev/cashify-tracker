import { apiClient } from '@/shared/api/fetch-client';
import type { Cashbook, CreateCashbookData, UpdateCashbookData, CashbookMember, AddCashbookMemberData, CashbookStats, CashbookFilters } from '../types/cashbook.types';

// Type definitions for API requests/responses
interface CashbookResponse {
  id: string;
  businessId: string;
  name: string;
  description?: string;
  openingBalance: number;
  currentBalance: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  members: CashbookMember[];
}

interface CreateCashbookRequest {
  name: string;
  description?: string;
  openingBalance: number;
}

interface AddMemberRequest {
  email: string;
  role: 'Owner' | 'Editor' | 'Viewer';
}

// Transform API response to our Cashbook type
const transformCashbookResponse = (response: CashbookResponse): Cashbook => ({
  id: response.id,
  businessId: response.businessId,
  name: response.name,
  description: response.description,
  openingBalance: response.openingBalance,
  currentBalance: response.currentBalance,
  membersCount: response.members.length,
  memberRole: response.members[0]?.role || 'Viewer', // Assuming first member is the current user
  isActive: response.isActive,
  createdAt: response.createdAt,
  updatedAt: response.updatedAt,
});

export const cashbookService = {
  /**
   * Get all cashbooks for a business
   */
  async getCashbooks(
    businessId: string,
    filters?: CashbookFilters
  ): Promise<Cashbook[]> {
    try {
      const queryParams = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
          }
        });
      }

      const url = `/businesses/${businessId}/cashbooks?${queryParams.toString()}`;
      const response = await apiClient.get<CashbookResponse[]>(url);
      return response.map(transformCashbookResponse);
    } catch (error) {
      console.error('Failed to fetch cashbooks:', error);
      throw error;
    }
  },

  /**
   * Get a single cashbook by ID
   */
  async getCashbookById(id: string): Promise<Cashbook> {
    try {
      const response = await apiClient.get<CashbookResponse>(`/cashbooks/${id}`);
      return transformCashbookResponse(response);
    } catch (error) {
      console.error(`Failed to fetch cashbook ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new cashbook
   */
  async createCashbook(data: CreateCashbookData): Promise<Cashbook> {
    try {
      const requestData: CreateCashbookRequest = {
        name: data.name,
        description: data.description,
        openingBalance: data.openingBalance,
      };

      const response = await apiClient.post<CashbookResponse>(`/businesses/${data.businessId}/cashbooks`, requestData);
      return transformCashbookResponse(response);
    } catch (error) {
      console.error('Failed to create cashbook:', error);
      throw error;
    }
  },

  /**
   * Update a cashbook
   */
  async updateCashbook(data: UpdateCashbookData): Promise<Cashbook> {
    try {
      const requestData: Partial<CreateCashbookRequest> = {
        name: data.name,
        description: data.description,
        openingBalance: data.openingBalance,
      };

      const response = await apiClient.put<CashbookResponse>(`/cashbooks/${data.id}`, requestData);
      return transformCashbookResponse(response);
    } catch (error) {
      console.error(`Failed to update cashbook ${data.id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a cashbook
   */
  async deleteCashbook(id: string): Promise<void> {
    try {
      await apiClient.delete(`/cashbooks/${id}`);
    } catch (error) {
      console.error(`Failed to delete cashbook ${id}:`, error);
      throw error;
    }
  },

  /**
   * Add a member to a cashbook
   */
  async addCashbookMember(
    cashbookId: string,
    memberData: AddCashbookMemberData
  ): Promise<CashbookMember> {
    try {
      const requestData: AddMemberRequest = {
        email: memberData.email,
        role: memberData.role,
      };

      const response = await apiClient.post<CashbookMember>(`/cashbooks/${cashbookId}/members`, requestData);
      return response;
    } catch (error) {
      console.error(`Failed to add member to cashbook ${cashbookId}:`, error);
      throw error;
    }
  },

  /**
   * Remove a member from a cashbook
   */
  async removeCashbookMember(cashbookId: string, memberId: string): Promise<void> {
    try {
      await apiClient.delete(`/cashbooks/${cashbookId}/members/${memberId}`);
    } catch (error) {
      console.error(`Failed to remove member from cashbook ${cashbookId}:`, error);
      throw error;
    }
  },

  /**
   * Get cashbook statistics
   */
  async getCashbookStats(cashbookId: string): Promise<CashbookStats> {
    try {
      const response = await apiClient.get<{
        totalTransactions: number;
        totalCashIn: number;
        totalCashOut: number;
        thisMonthTransactions: number;
        thisMonthBalance: number;
        lastTransactionDate: string | null;
      }>(`/cashbooks/${cashbookId}/stats`);

      return {
        totalTransactions: response.totalTransactions,
        totalCashIn: response.totalCashIn,
        totalCashOut: response.totalCashOut,
        netBalance: response.totalCashIn - response.totalCashOut,
        averageTransaction: response.totalTransactions > 0
          ? (response.totalCashIn + response.totalCashOut) / response.totalTransactions
          : 0,
        lastTransactionDate: response.lastTransactionDate,
        thisMonthTransactions: response.thisMonthTransactions,
        thisMonthBalance: response.thisMonthBalance,
      };
    } catch (error) {
      // If stats endpoint doesn't exist, return default values
      console.warn('Stats endpoint not available for cashbook');
      return {
        totalTransactions: 0,
        totalCashIn: 0,
        totalCashOut: 0,
        netBalance: 0,
        averageTransaction: 0,
        lastTransactionDate: null,
        thisMonthTransactions: 0,
        thisMonthBalance: 0,
      };
    }
  }
};
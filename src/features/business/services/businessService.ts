import { apiClient } from '@/shared/api/fetch-client';
import type { BusinessSummary } from '@/types';
import type { CreateBusinessData } from '../types/business.types';

// Type definitions for API responses
interface BusinessResponse {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  members: BusinessMember[];
}

interface BusinessMember {
  userId: string;
  email: string;
  name: string;
  role: 'Owner' | 'Editor' | 'Viewer';
  joinedAt: string;
}

interface CreateBusinessRequest {
  name: string;
  description?: string;
  category?: string;
  type?: string;
}

interface BusinessStatsResponse {
  totalBooks: number;
  totalBalance: number;
  memberCount: number;
  lastActivity: string;
}

// Transform API response to our Business type
const transformBusinessResponse = (response: BusinessResponse): BusinessSummary => {
  const userRole = response.members.find(m => m.email === response.members[0]?.email)?.role || 'Viewer';
  return {
    id: response.id,
    name: response.name,
    role: userRole as 'Owner' | 'Editor' | 'Viewer'
  };
};

export const businessService = {
  /**
   * Get all businesses where the current user is a member
   */
  async getAllBusinesses(): Promise<BusinessSummary[]> {
    try {
      const response = await apiClient.get<BusinessSummary[]>('/businesses');
      return response;
    } catch (error) {
      console.error('Failed to fetch businesses:', error);
      throw error;
    }
  },

  /**
   * Get a specific business by ID
   */
  async getBusinessById(id: string): Promise<BusinessSummary> {
    try {
      const response = await apiClient.get<BusinessResponse>(`/businesses/${id}`);
      return transformBusinessResponse(response);
    } catch (error) {
      console.error(`Failed to fetch business ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new business
   */
  async createBusiness(data: CreateBusinessData): Promise<BusinessSummary> {
    try {
      const requestData: CreateBusinessRequest = {
        name: data.name,
        description: `${data.category} - ${data.type}`,
        category: data.category,
        type: data.type
      };

      // Create business - returns { id, name }
      const createResponse = await apiClient.post<{ id: string; name: string }>('/businesses', requestData);

      // Fetch full business details including members
      const fullResponse = await apiClient.get<BusinessResponse>(`/businesses/${createResponse.id}`);

      return transformBusinessResponse(fullResponse);
    } catch (error) {
      console.error('Failed to create business:', error);
      throw error;
    }
  },

  /**
   * Update a business (limited to name for now)
   */
  async updateBusiness(businessId: string, updates: Partial<BusinessSummary>): Promise<BusinessSummary> {
    try {
      const requestData = {
        name: updates.name
      };

      const response = await apiClient.put<BusinessResponse>(`/businesses/${businessId}`, requestData);
      return transformBusinessResponse(response);
    } catch (error) {
      console.error(`Failed to update business ${businessId}:`, error);
      throw error;
    }
  },

  /**
   * Delete a business (only if user is owner)
   */
  async deleteBusiness(businessId: string): Promise<void> {
    try {
      await apiClient.delete(`/businesses/${businessId}`);
    } catch (error) {
      console.error(`Failed to delete business ${businessId}:`, error);
      throw error;
    }
  },

  /**
   * Get business statistics
   */
  async getBusinessStats(businessId: string): Promise<{
    totalBooks: number;
    totalBalance: number;
    memberCount: number;
    lastActivity: string;
  }> {
    try {
      // Check if there's a specific stats endpoint
      const response = await apiClient.get<BusinessStatsResponse>(`/businesses/${businessId}/stats`);
      return response;
    } catch (error) {
      // If stats endpoint doesn't exist, we can calculate from business data
      console.warn('Stats endpoint not available, returning mock data');
      return {
        totalBooks: 1,
        totalBalance: 0,
        memberCount: 1,
        lastActivity: new Date().toISOString()
      };
    }
  }
};
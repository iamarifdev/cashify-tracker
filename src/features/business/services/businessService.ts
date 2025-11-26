import { Business } from '@/types';

export const businessService = {
  // Simulate API calls
  async getAllBusinesses(): Promise<Business[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    // In real app, this would fetch from API
    return [];
  },

  async createBusiness(businessData: { name: string; category: string; type: string }): Promise<Business> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newBusiness: Business = {
      id: `biz_${Date.now()}`,
      name: businessData.name,
      role: 'Owner'
    };

    return newBusiness;
  },

  async updateBusiness(businessId: string, updates: Partial<Business>): Promise<Business> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const updatedBusiness: Business = {
      id: businessId,
      name: updates.name || 'Updated Business',
      role: updates.role || 'Editor'
    };

    return updatedBusiness;
  },

  async deleteBusiness(businessId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    // In real app, this would make API call to delete
  },

  async getBusinessStats(businessId: string): Promise<{
    totalBooks: number;
    totalBalance: number;
    memberCount: number;
    lastActivity: string;
  }> {
    await new Promise(resolve => setTimeout(resolve, 300));

    // Mock stats
    return {
      totalBooks: Math.floor(Math.random() * 20) + 1,
      totalBalance: Math.floor(Math.random() * 1000000) - 500000,
      memberCount: Math.floor(Math.random() * 10) + 1,
      lastActivity: new Date().toISOString()
    };
  }
};
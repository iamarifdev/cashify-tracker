import { BusinessSummary } from '@/types';

// Re-export Business for use within the feature
export type { BusinessSummary as Business };

export interface CreateBusinessData {
  name: string;
  category: string;
  type: string;
}

export interface BusinessState {
  businesses: BusinessSummary[];
  currentBusiness: BusinessSummary;
  isLoading: boolean;
  error: string | null;
}

export interface BusinessStats {
  totalBooks: number;
  totalBalance: number;
  memberCount: number;
  lastActivity: string;
}
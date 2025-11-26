import { Business } from '@/types';

export interface CreateBusinessData {
  name: string;
  category: string;
  type: string;
}

export interface BusinessState {
  businesses: Business[];
  currentBusiness: Business;
  isLoading: boolean;
  error: string | null;
}

export interface BusinessStats {
  totalBooks: number;
  totalBalance: number;
  memberCount: number;
  lastActivity: string;
}
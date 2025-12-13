export interface Cashbook {
  id: string;
  businessId: string;
  name: string;
  description?: string;
  openingBalance: number;
  currentBalance: number;
  membersCount: number;
  memberRole: 'Owner' | 'Editor' | 'Viewer';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCashbookData {
  businessId: string;
  name: string;
  description?: string;
  openingBalance: number;
}

export interface UpdateCashbookData extends Partial<CreateCashbookData> {
  id: string;
}

export interface CashbookMember {
  id: string;
  cashbookId: string;
  userId: string;
  email: string;
  name: string;
  role: 'Owner' | 'Editor' | 'Viewer';
  joinedAt: string;
}

export interface AddCashbookMemberData {
  email: string;
  role: 'Editor' | 'Viewer';
}

export interface CashbookStats {
  totalTransactions: number;
  totalCashIn: number;
  totalCashOut: number;
  netBalance: number;
  averageTransaction: number;
  lastTransactionDate: string | null;
  thisMonthTransactions: number;
  thisMonthBalance: number;
}

export interface CashbookFilters {
  isActive?: boolean;
  memberRole?: 'Owner' | 'Editor' | 'Viewer';
  search?: string;
}
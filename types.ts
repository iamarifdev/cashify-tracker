
export interface User {
  id: string;
  name: string;
  email: string;
  photoUrl: string;
}

export interface Business {
  id: string;
  name: string;
  role: 'Owner' | 'Editor' | 'Viewer';
}

export interface Book {
  id: string;
  name: string;
  membersCount: number;
  lastUpdated: string; // ISO date string
  netBalance: number;
  businessId: string;
}

export enum TransactionType {
  CASH_IN = 'CASH_IN',
  CASH_OUT = 'CASH_OUT'
}

export interface Transaction {
  id: string;
  bookId: string;
  date: string; // ISO date
  time: string; // HH:mm format
  amount: number;
  details: string;
  category: string;
  paymentMode: string;
  contactName?: string;
  attachments: string[];
  balanceAfter: number;
  createdBy: string;
}

export type ViewState = 'LOGIN' | 'ONBOARDING' | 'DASHBOARD' | 'BOOK_DETAILS';

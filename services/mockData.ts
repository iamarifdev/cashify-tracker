
import { Book, Business, Transaction, TransactionType } from '../types';

export const MOCK_USER = {
  id: 'u1',
  name: 'Ariful Islam',
  email: 'ariful@example.com',
  photoUrl: 'https://picsum.photos/100/100'
};

export const MOCK_BUSINESSES: Business[] = [
  { id: 'b1', name: "Ariful Islam's Business", role: 'Owner' },
  { id: 'b2', name: "Brothers Communications", role: 'Viewer' },
  { id: 'b3', name: "Test", role: 'Editor' }
];

export const MOCK_BOOKS: Book[] = [
  { id: 'book1', name: "Building Home", membersCount: 2, lastUpdated: new Date().toISOString(), netBalance: -3523569, businessId: 'b1' },
  { id: 'book2', name: "Brothers Cable Network Income", membersCount: 2, lastUpdated: new Date(Date.now() - 86400000).toISOString(), netBalance: 58085, businessId: 'b1' },
  { id: 'book3', name: "Messers Hujera Traders", membersCount: 2, lastUpdated: new Date(Date.now() - 172800000).toISOString(), netBalance: 877504, businessId: 'b1' },
  { id: 'book4', name: "Transactions with Sharif", membersCount: 2, lastUpdated: new Date(Date.now() - 200000000).toISOString(), netBalance: -6020, businessId: 'b1' },
  { id: 'book5', name: "Business Investment", membersCount: 2, lastUpdated: new Date(Date.now() - 300000000).toISOString(), netBalance: -1004700, businessId: 'b1' },
  // Books for second business
  { id: 'book6', name: "Office Expenses", membersCount: 5, lastUpdated: new Date().toISOString(), netBalance: -25000, businessId: 'b2' },
  { id: 'book7', name: "Client Payments", membersCount: 3, lastUpdated: new Date(Date.now() - 400000000).toISOString(), netBalance: 150000, businessId: 'b2' },
];

const generateTransactions = (bookId: string, count: number): Transaction[] => {
  let runningBalance = -3523569; // Start with the final balance and work backwards or just mock it
  const transactions: Transaction[] = [];
  
  for (let i = 0; i < count; i++) {
    const isCashIn = Math.random() > 0.6;
    const amount = Math.floor(Math.random() * 50000) + 1000;
    runningBalance += isCashIn ? amount : -amount;

    transactions.push({
      id: `t${i}`,
      bookId,
      date: new Date(Date.now() - (i * 86400000)).toISOString(),
      time: '17:05',
      amount: amount,
      details: isCashIn ? 'Payment Received' : 'Material Purchase',
      category: isCashIn ? 'Sales' : 'Expense',
      paymentMode: Math.random() > 0.5 ? 'Cash' : 'bKash',
      contactName: 'Rafiq Bhai',
      attachments: [],
      balanceAfter: runningBalance,
      createdBy: 'You'
    });
  }
  return transactions;
};

export const MOCK_TRANSACTIONS = generateTransactions('book1', 50);

import { Transaction, TransactionType } from '@/types';
import { CreateTransactionData, UpdateTransactionData, TransactionFilters, TransactionStats } from '../types/transaction.types';

export const transactionService = {
  // Simulate API calls with mock data
  async getTransactions(
    bookId: string,
    filters?: TransactionFilters
  ): Promise<Transaction[]> {
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock transactions data
    const mockTransactions: Transaction[] = [
      {
        id: 'txn_1',
        bookId,
        type: TransactionType.CASH_IN,
        date: '2025-12-06',
        time: '10:30',
        amount: 5000,
        details: 'Payment from customer A',
        category: 'Sales',
        paymentMode: 'Cash',
        contactName: 'Customer A',
        attachments: [],
        balanceAfter: 15000,
        createdBy: 'user1'
      },
      {
        id: 'txn_2',
        bookId,
        type: TransactionType.CASH_OUT,
        date: '2025-12-05',
        time: '14:20',
        amount: 2000,
        details: 'Office supplies',
        category: 'Expenses',
        paymentMode: 'Bank Transfer',
        attachments: ['receipt1.pdf'],
        balanceAfter: 10000,
        createdBy: 'user1'
      },
      {
        id: 'txn_3',
        bookId,
        type: TransactionType.CASH_IN,
        date: '2025-12-04',
        time: '09:15',
        amount: 3000,
        details: 'Service fee',
        category: 'Service Income',
        paymentMode: 'UPI',
        contactName: 'Client B',
        attachments: [],
        balanceAfter: 12000,
        createdBy: 'user1'
      }
    ];

    // Apply filters if provided
    let filteredTransactions = mockTransactions;

    if (filters) {
      if (filters.type) {
        filteredTransactions = filteredTransactions.filter(t => t.type === filters.type);
      }
      if (filters.category) {
        filteredTransactions = filteredTransactions.filter(t =>
          t.category.toLowerCase().includes(filters.category!.toLowerCase())
        );
      }
      if (filters.dateFrom) {
        filteredTransactions = filteredTransactions.filter(t => t.date >= filters.dateFrom!);
      }
      if (filters.dateTo) {
        filteredTransactions = filteredTransactions.filter(t => t.date <= filters.dateTo!);
      }
      if (filters.minAmount) {
        filteredTransactions = filteredTransactions.filter(t => t.amount >= filters.minAmount!);
      }
      if (filters.maxAmount) {
        filteredTransactions = filteredTransactions.filter(t => t.amount <= filters.maxAmount!);
      }
    }

    return filteredTransactions.sort((a, b) =>
      new Date(`${b.date} ${b.time}`).getTime() - new Date(`${a.date} ${a.time}`).getTime()
    );
  },

  async getTransactionById(id: string): Promise<Transaction> {
    await new Promise(resolve => setTimeout(resolve, 300));

    // Mock single transaction
    return {
      id,
      bookId: 'book_1',
      type: TransactionType.CASH_IN,
      date: '2025-12-06',
      time: '10:30',
      amount: 5000,
      details: 'Payment from customer A',
      category: 'Sales',
      paymentMode: 'Cash',
      contactName: 'Customer A',
      attachments: ['invoice.pdf'],
      balanceAfter: 15000,
      createdBy: 'user1'
    };
  },

  async createTransaction(data: CreateTransactionData): Promise<Transaction> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newTransaction: Transaction = {
      id: `txn_${Date.now()}`,
      ...data,
      attachments: data.attachments || [],
      balanceAfter: 0, // Would be calculated based on previous transactions
      createdBy: 'user1'
    };

    // Store in localStorage for persistence
    const key = `transactions_${data.bookId}`;
    const existing = localStorage.getItem(key);
    const transactions: Transaction[] = existing ? JSON.parse(existing) : [];
    transactions.push(newTransaction);
    localStorage.setItem(key, JSON.stringify(transactions));

    return newTransaction;
  },

  async updateTransaction(data: UpdateTransactionData): Promise<Transaction> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const updatedTransaction: Transaction = {
      id: data.id!,
      bookId: data.bookId || 'book_1',
      type: data.type || TransactionType.CASH_IN,
      date: data.date || new Date().toISOString().split('T')[0],
      time: data.time || '12:00',
      amount: data.amount || 0,
      details: data.details || '',
      category: data.category || '',
      paymentMode: data.paymentMode || 'Cash',
      contactName: data.contactName,
      attachments: data.attachments || [],
      balanceAfter: 0,
      createdBy: 'user1'
    };

    // Update in localStorage
    const key = `transactions_${updatedTransaction.bookId}`;
    const existing = localStorage.getItem(key);
    const transactions: Transaction[] = existing ? JSON.parse(existing) : [];
    const index = transactions.findIndex(t => t.id === data.id);
    if (index !== -1) {
      transactions[index] = updatedTransaction;
      localStorage.setItem(key, JSON.stringify(transactions));
    }

    return updatedTransaction;
  },

  async deleteTransaction(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));

    // Find and remove from localStorage
    const keys = Object.keys(localStorage).filter(k => k.startsWith('transactions_'));
    for (const key of keys) {
      const existing = localStorage.getItem(key);
      if (existing) {
        const transactions: Transaction[] = JSON.parse(existing);
        const filtered = transactions.filter(t => t.id !== id);
        if (filtered.length !== transactions.length) {
          localStorage.setItem(key, JSON.stringify(filtered));
          break;
        }
      }
    }
  },

  async getTransactionStats(
    bookId: string,
    filters?: TransactionFilters
  ): Promise<TransactionStats> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const transactions = await this.getTransactions(bookId, filters);

    const cashInTotal = transactions
      .filter(t => t.type === 'CASH_IN')
      .reduce((sum, t) => sum + t.amount, 0);

    const cashOutTotal = transactions
      .filter(t => t.type === 'CASH_OUT')
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
};
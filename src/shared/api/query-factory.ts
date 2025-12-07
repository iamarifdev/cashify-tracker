// Query factory for organized cache keys
export const queryKeys = {
  // Auth queries
  auth: {
    all: ['auth'] as const,
    user: () => [...queryKeys.auth.all, 'user'] as const,
  },

  // Business queries
  businesses: {
    all: ['businesses'] as const,
    lists: () => [...queryKeys.businesses.all, 'list'] as const,
    list: (filters?: Record<string, any>) =>
      [...queryKeys.businesses.lists(), { filters }] as const,
    details: () => [...queryKeys.businesses.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.businesses.details(), id] as const,
  },

  // Cashbook/Book queries
  books: {
    all: ['books'] as const,
    lists: () => [...queryKeys.books.all, 'list'] as const,
    list: (businessId: string, filters?: Record<string, any>) =>
      [...queryKeys.books.lists(), { businessId, filters }] as const,
    details: () => [...queryKeys.books.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.books.details(), id] as const,
  },

  // Transaction queries
  transactions: {
    all: ['transactions'] as const,
    lists: () => [...queryKeys.transactions.all, 'list'] as const,
    list: (bookId: string, filters?: Record<string, any>) =>
      [...queryKeys.transactions.lists(), { bookId, filters }] as const,
    infinite: (bookId: string, filters?: Record<string, any>) =>
      [...queryKeys.transactions.all, 'infinite', { bookId, filters }] as const,
    details: () => [...queryKeys.transactions.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.transactions.details(), id] as const,
    changes: (id: string) => [...queryKeys.transactions.detail(id), 'changes'] as const,
  },

  // Contact queries
  contacts: {
    all: ['contacts'] as const,
    lists: () => [...queryKeys.contacts.all, 'list'] as const,
    list: (businessId: string, filters?: Record<string, any>) =>
      [...queryKeys.contacts.lists(), { businessId, filters }] as const,
    details: () => [...queryKeys.contacts.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.contacts.details(), id] as const,
  },

  // Category queries
  categories: {
    all: ['categories'] as const,
    lists: () => [...queryKeys.categories.all, 'list'] as const,
    list: (businessId?: string) =>
      [...queryKeys.categories.lists(), { businessId }] as const,
    details: () => [...queryKeys.categories.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.categories.details(), id] as const,
  },

  // Payment method queries
  paymentMethods: {
    all: ['paymentMethods'] as const,
    lists: () => [...queryKeys.paymentMethods.all, 'list'] as const,
    list: (businessId?: string) =>
      [...queryKeys.paymentMethods.lists(), { businessId }] as const,
    details: () => [...queryKeys.paymentMethods.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.paymentMethods.details(), id] as const,
  },

  // Reports queries
  reports: {
    all: ['reports'] as const,
    summary: (businessId?: string) =>
      [...queryKeys.reports.all, 'summary', { businessId }] as const,
    balance: (bookId: string) =>
      [...queryKeys.reports.all, 'balance', { bookId }] as const,
    export: (filters?: Record<string, any>) =>
      [...queryKeys.reports.all, 'export', { filters }] as const,
  },

  // Activity logs
  activityLogs: {
    all: ['activityLogs'] as const,
    list: (filters?: Record<string, any>) =>
      [...queryKeys.activityLogs.all, { filters }] as const,
  },
}
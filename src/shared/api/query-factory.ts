export const queryKeys = {
  auth: {
    all: ['auth'] as const,
    user: () => [...queryKeys.auth.all, 'user'] as const,
  },

  businesses: {
    all: ['businesses'] as const,
    lists: () => [...queryKeys.businesses.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.businesses.lists(), { filters }] as const,
    details: () => [...queryKeys.businesses.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.businesses.details(), id] as const,
  },

  books: {
    all: ['books'] as const,
    lists: () => [...queryKeys.books.all, 'list'] as const,
    list: (businessId: string, filters?: Record<string, unknown>) =>
      [...queryKeys.books.lists(), { businessId, filters }] as const,
    details: () => [...queryKeys.books.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.books.details(), id] as const,
  },

  transactions: {
    all: ['transactions'] as const,
    lists: () => [...queryKeys.transactions.all, 'list'] as const,
    list: (bookId: string, filters?: Record<string, unknown>) =>
      [...queryKeys.transactions.lists(), { bookId, filters }] as const,
    infinite: (bookId: string, filters?: Record<string, unknown>) =>
      [...queryKeys.transactions.all, 'infinite', { bookId, filters }] as const,
    details: () => [...queryKeys.transactions.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.transactions.details(), id] as const,
    changes: (id: string) => [...queryKeys.transactions.detail(id), 'changes'] as const,
  },

  contacts: {
    all: ['contacts'] as const,
    lists: () => [...queryKeys.contacts.all, 'list'] as const,
    list: (businessId: string, filters?: Record<string, unknown>) =>
      [...queryKeys.contacts.lists(), { businessId, filters }] as const,
    details: () => [...queryKeys.contacts.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.contacts.details(), id] as const,
  },

  categories: {
    all: ['categories'] as const,
    lists: () => [...queryKeys.categories.all, 'list'] as const,
    list: (businessId?: string) =>
      [...queryKeys.categories.lists(), { businessId }] as const,
    details: () => [...queryKeys.categories.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.categories.details(), id] as const,
  },

  paymentMethods: {
    all: ['paymentMethods'] as const,
    lists: () => [...queryKeys.paymentMethods.all, 'list'] as const,
    list: (businessId?: string) =>
      [...queryKeys.paymentMethods.lists(), { businessId }] as const,
    details: () => [...queryKeys.paymentMethods.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.paymentMethods.details(), id] as const,
  },

  reports: {
    all: ['reports'] as const,
    summary: (businessId?: string) =>
      [...queryKeys.reports.all, 'summary', { businessId }] as const,
    balance: (bookId: string) =>
      [...queryKeys.reports.all, 'balance', { bookId }] as const,
    export: (filters?: Record<string, unknown>) =>
      [...queryKeys.reports.all, 'export', { filters }] as const,
  },

  activityLogs: {
    all: ['activityLogs'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.activityLogs.all, { filters }] as const,
  },
}
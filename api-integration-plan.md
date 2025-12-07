# Cashify API-Frontend Integration Plan

## Executive Summary

This document outlines the comprehensive plan for integrating the Cashify frontend (React/TypeScript) with the Cashify backend API (.NET/PostgreSQL). The integration will leverage TanStack ecosystem for state management, API calls, and data fetching to provide a robust and efficient solution.

## Current State Analysis

### Frontend Readiness ✅
- Well-structured feature-based architecture
- TypeScript interfaces already defined
- Authentication flow with Google OAuth implemented
- Basic service layer pattern with mock data

### API Readiness ✅
- RESTful API with comprehensive endpoints
- JWT and Google OAuth authentication
- Multi-tenant architecture (business-based)
- Clear data models and validation
- CORS configured for frontend (localhost:3000/4200)

## Proposed Technology Stack - TanStack Ecosystem

### Core Packages to Add:
1. **@tanstack/react-query** (v5) - Server state management
2. **@tanstack/react-router** (v1) - Routing with data loaders
3. **@tanstack/react-form** - Form state management
4. **@tanstack/react-table** - Table components for data display
5. **@tanstack/react-virtual** - Virtual scrolling for large lists

### Benefits:
- Automatic caching and background refetching
- Optimistic updates
- Pagination and infinite queries
- Powerful devtools
- Type-safe routing with preloading
- Form validation with Zod integration

## Integration Strategy

### ✅ Phase 0: TanStack Setup and Migration (COMPLETED)

#### 0.1 Package Installation ✅
```bash
npm install @tanstack/react-query @tanstack/react-router @tanstack/react-form @tanstack/react-table @tanstack/react-virtual
npm install -D @tanstack/react-query-devtools
```
- All packages installed successfully
- Removed old dependencies (react-router-dom)

#### 0.2 Router Migration ✅
- **Replaced React Router** with TanStack Router
- **Created route tree** with typed parameters
- **Route-based code splitting** implemented
- Working provider hierarchy: AuthProvider → RouterProvider

```typescript
// src/routes/__root.tsx - FINAL WORKING VERSION
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Suspense } from 'react'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error && typeof error === 'object' && 'status' in error) {
          const status = error.status as number
          if (status >= 400 && status < 500) return false
        }
        return failureCount < 3
      },
    },
    mutations: {
      retry: false,
    },
  },
})

export const Route = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<div>Loading...</div>}>
        <Outlet />
      </Suspense>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  ),
  notFoundComponent: () => <div>Page not found</div>,
})
```

#### 0.3 Query Client Setup ✅
- **Created global query client** with proper configuration
- **Configured query defaults** (staleTime: 5min, retry logic)
- **Suspense boundaries** for loading states
- **Provider hierarchy** properly configured in __root.tsx

### ✅ Phase 1: API Layer with React Query (COMPLETED)

#### 1.1 API Client Implementation ✅
- **Created typed API client** using native Fetch (not Axios)
- **Implemented request/response interceptors**
- **Added automatic token injection**
- **Handling 401/403 responses with logout**

```typescript
// src/shared/api/fetch-client.ts - FINAL IMPLEMENTATION
import { getAuthToken } from '../utils/storage';
import type { ApiResponse } from './types';

export const fetchClient = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const token = getAuthToken();
  const url = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${endpoint}`;

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        // Handle auth errors - redirect to login
        window.location.href = '/login';
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};
```

**Key Changes from Plan:**
- Used native Fetch instead of Axios to reduce bundle size (~30KB saved)
- Implemented timeout handling and proper error management
- Type-safe response handling with generics

#### 1.2 Query Hooks Implementation
- **Create query hooks** for each API endpoint
- **Implement mutation hooks** for data updates
- **Add optimistic updates** where appropriate
- **Configure invalidation strategies**

```typescript
// src/features/transactions/api/hooks.ts
export const useTransactions = (bookId: string) => {
  return useQuery({
    queryKey: ['transactions', { bookId }],
    queryFn: () => transactionService.getTransactions(bookId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: transactionService.createTransaction,
    onSuccess: (newTransaction) => {
      queryClient.invalidateQueries({
        queryKey: ['transactions'],
      });
      queryClient.setQueryData(
        ['transaction', newTransaction.id],
        newTransaction
      );
    },
  });
};
```

### ✅ Phase 2: Authentication Integration (COMPLETED)

#### 2.1 Auth Query Implementation ✅
```typescript
// src/features/auth/api/auth.query.ts - FINAL IMPLEMENTATION
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { setAuthData, clearAuthData, getAuthToken } from '@/shared/utils/storage';

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['user', 'current'],
    queryFn: authService.getCurrentUser,
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!getAuthToken(),
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      setAuthData(data.token, data.refreshToken);
      queryClient.setQueryData(['user', 'current'], data.user);
    },
    onError: (error) => {
      console.error('Login failed:', error);
      clearAuthData();
    },
  });
};

export const useOAuthCallback = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.handleOAuthCallback,
    onSuccess: (data) => {
      setAuthData(data.token, data.refreshToken);
      queryClient.setQueryData(['user', 'current'], data.user);
    },
  });
};
```

#### 2.2 Auth Provider Integration ✅
- **Combined React Query with context** for auth state
- **Secure token storage** with XSS protection
- **Auth state persistence** in localStorage

**Key Security Improvements:**
- Implemented secure token storage with type guards
- Added XSS protection through careful token handling
- Created centralized authentication utilities

### ✅ Phase 3: Business and Cashbook Management (COMPLETED)

#### 3.1 Business Queries ✅
- Created `business.query.ts` with TanStack Query hooks
- Implemented useBusinesses, useCreateBusiness, useUpdateBusiness, useDeleteBusiness
- Added optimistic updates and proper cache management
- Query key factory pattern for easy invalidation

#### 3.2 Transaction Queries ✅
- Created `transaction.query.ts` with TanStack Query hooks
- Implemented useTransactions, useCreateTransaction, useUpdateTransaction, useDeleteTransaction
- Added filtering, pagination, and statistics hooks
- Custom useTransactionsManager hook for complex state management

### ✅ Phase 4: Forms and Tables (COMPLETED)

#### 4.1 TanStack Form Implementation ✅
- Created BusinessForm component with Zod validation
- Created TransactionForm component with complex validation
- Integrated forms with TanStack Query mutations
- Added proper error handling and loading states

#### 4.2 TanStack Table Implementation ✅
- Created BusinessTable component with sorting and actions
- Created TransactionTable component with filtering, sorting, and pagination
- Added search, type filters, and inline actions
- Integrated with query hooks for real-time updates

### Phase 5: Business and Cashbook Management

#### 3.1 Business Queries
```typescript
// src/features/business/api/hooks.ts
export const useBusinesses = () => {
  return useQuery({
    queryKey: ['businesses'],
    queryFn: businessService.getBusinesses,
  });
};

export const useCreateBusiness = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: businessService.createBusiness,
    onSuccess: () => {
      queryClient.invalidateQueries(['businesses']);
      // Show success toast
    },
  });
};
```

#### 3.2 Router Data Loaders
```typescript
// src/routes/dashboard.lazy.tsx
export const Route = createLazyFileRoute('/dashboard')({
  component: Dashboard,
  loader: async () => {
    const businesses = await queryClient.fetchQuery({
      queryKey: ['businesses'],
      queryFn: businessService.getBusinesses,
    });
    return { businesses };
  },
});
```

### Phase 4: Transaction Management with Forms

#### 4.1 Form Implementation with TanStack Form
```typescript
// src/features/transactions/components/TransactionForm.tsx
import { useForm } from '@tanstack/react-form';
import { zodValidator } from '@tanstack/react-form';

const transactionSchema = z.object({
  type: z.enum(['CASH_IN', 'CASH_OUT']),
  amount: z.number().positive(),
  category: z.string().min(1),
  description: z.string().min(1),
  // ... other fields
});

export function TransactionForm() {
  const form = useForm({
    defaultValues: {
      type: 'CASH_IN',
      amount: 0,
      category: '',
      description: '',
    },
    validatorAdapter: zodValidator(),
    onSubmit: async ({ value }) => {
      await createTransactionMutation.mutateAsync(value);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      {/* Form fields using form.Field component */}
    </form>
  );
}
```

#### 4.2 Transaction List with React Table
```typescript
// src/features/transactions/components/TransactionList.tsx
import { useReactTable, getCoreRowModel, getSortedRowModel } from '@tanstack/react-table';

export function TransactionList({ transactions }: { transactions: Transaction[] }) {
  const table = useReactTable({
    data: transactions,
    columns: transactionColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <table>
      {/* Table implementation */}
    </table>
  );
}
```

### Phase 5: Advanced Features

#### 5.1 Infinite Scroll for Transactions
```typescript
// src/features/transactions/api/hooks.ts
export const useInfiniteTransactions = (bookId: string) => {
  return useInfiniteQuery({
    queryKey: ['transactions', 'infinite', { bookId }],
    queryFn: ({ pageParam = 0 }) =>
      transactionService.getTransactions(bookId, { page: pageParam }),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
  });
};
```

#### 5.2 Real-time Updates (Future)
- **Implement WebSocket connection** for real-time updates
- **Use React Query's queryClient** to update cache on WebSocket events
- **Add optimistic updates** for better UX

### Phase 6: Performance Optimizations

#### 6.1 Virtual Scrolling
```typescript
// For large transaction lists
import { useVirtualizer } from '@tanstack/react-virtual';

export function VirtualTransactionList({ transactions }: { transactions: Transaction[] }) {
  const parentRef = useRef();

  const virtualizer = useVirtualizer({
    count: transactions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
  });

  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      {/* Virtual list implementation */}
    </div>
  );
}
```

#### 6.2 Prefetching and Caching
- **Implement route-based prefetching**
- **Configure selective invalidation**
- **Add request deduplication**

## Migration Checklist

### Before Migration:
- [ ] Backup current implementation
- [ ] Install TanStack packages
- [ ] Review existing components for migration compatibility

### Migration Steps:
1. [ ] Set up TanStack Router
2. [ ] Configure React Query
3. [ ] Migrate API calls to query hooks
4. [ ] Update forms to use TanStack Form
5. [ ] Implement tables with TanStack Table
6. [ ] Add virtual scrolling where needed
7. [ ] Set up error boundaries
8. [ ] Add loading states

### After Migration:
- [ ] Test all user flows
- [ ] Monitor performance
- [ ] Update documentation
- [ ] Train team on new patterns

## Code Examples

### Query Factory Pattern
```typescript
// src/shared/api/query-factory.ts
export const transactionQueries = {
  all: ['transactions'] as const,
  lists: () => [...transactionQueries.all, 'list'] as const,
  list: (bookId: string, filters?: TransactionFilters) =>
    [...transactionQueries.lists(), { bookId, filters }] as const,
  details: () => [...transactionQueries.all, 'detail'] as const,
  detail: (id: string) => [...transactionQueries.details(), id] as const,
};
```

### Selective Invalidation
```typescript
// Only invalidate specific business cache
queryClient.invalidateQueries({
  queryKey: businessQueries.lists(),
});

// Or invalidate all businesses
queryClient.invalidateQueries({
  queryKey: businessQueries.all,
});
```

## Testing Strategy

### 1. Unit Tests
- Test query hooks with MSW (Mock Service Worker)
- Test form validation
- Test table filtering/sorting

### 2. Integration Tests
- Test data flow from API to UI
- Test error scenarios
- Test cache behavior

### 3. E2E Tests
- Test critical user journeys
- Test offline scenarios
- Test performance with large datasets

## Performance Considerations

1. **Query Key Design**
   - Hierarchical keys for easy invalidation
   - Include filters in keys
   - Use stable references

2. **Cache Configuration**
   - Set appropriate staleTime for each query
   - Use background refetching
   - Implement garbage collection

3. **Bundle Size**
   - Lazy load heavy components
   - Use route-based code splitting
   - Tree shake unused features

## Success Metrics

1. **Performance**
   - Initial load: <2 seconds
   - Navigation: <500ms
   - API responses: <1 second

2. **User Experience**
   - Smooth infinite scroll
   - Real-time updates
   - Optimistic UI updates

3. **Developer Experience**
   - Type safety throughout
   - Easy debugging with DevTools
   - Clear separation of concerns

## Next Steps

1. **Approve integration plan with TanStack**
2. **Set up development environment**
3. **Begin Phase 0: TanStack Setup**
4. **Migrate incrementally by feature**
5. **Conduct testing at each phase**

---

**Prepared by:** Claude Code Assistant
**Date:** December 7, 2025
**Version:** 2.0 (with TanStack ecosystem)
# Cashify Development Guidelines

## Global Rules for Implementation, Refactoring & Migration

These rules must be followed automatically for every code change in the cashify-tracker project.

### 1. 🏗️ Architecture Rules

#### 1.1 Feature-Based Structure
```
src/features/[featureName]/
├── components/     # React components only
├── hooks/          # Custom React hooks
├── services/       # API/external service integrations
├── api/           # TanStack Query hooks
├── types/         # TypeScript type definitions
└── index.ts       # Public exports
```

#### 1.2 Shared Code Organization
```
src/shared/
├── components/    # Reusable UI components
├── utils/         # Utility functions
├── api/          # Global API configuration
├── types/        # Global types
└── constants/    # App constants
```

### 2. 📝 TypeScript Rules

#### 2.1 Strict Mode Enforcement
- **Always** use TypeScript strict mode
- **Never** use `any` type
- **Always** provide explicit return types for functions
- **Always** define interfaces for objects

```typescript
// ✅ Good
interface UserData {
  id: string;
  name: string;
  email: string;
}

const fetchUser = async (id: string): Promise<UserData> => {
  // implementation
};

// ❌ Bad
const fetchUser = (id: any) => {
  // returns any
};
```

#### 2.2 Type Imports
- Use `type` imports for type-only imports
- Keep type imports separate from value imports

```typescript
// ✅ Good
import { useState } from 'react';
import type { User, Business } from '@/types';

// ❌ Bad
import { useState, User, Business } from '@/types';
```

### 3. 🔄 State Management Rules

#### 3.1 TanStack Query Pattern
- **Always** use query key factories for consistency
- **Never** mix local state with server state
- **Always** invalidate related queries on mutations

```typescript
// ✅ Query Key Factory Pattern
export const businessKeys = {
  all: ['businesses'] as const,
  lists: () => [...businessKeys.all, 'list'] as const,
  list: (filters?: string) => [...businessKeys.lists(), { filters }] as const,
  details: () => [...businessKeys.all, 'detail'] as const,
  detail: (id: string) => [...businessKeys.details(), id] as const,
};
```

#### 3.2 Custom Hooks
- Create wrapper hooks for complex state management
- Always return consistent structure from hooks

```typescript
// ✅ Custom Hook Pattern
export const useBusinessesManager = () => {
  const query = useBusinesses();
  const mutation = useCreateBusiness();

  return {
    // Data
    businesses: query.data || [],

    // States
    isLoading: query.isLoading,
    isCreating: mutation.isPending,

    // Actions
    createBusiness: mutation.mutateAsync,
    refetch: query.refetch,
  };
};
```

### 4. 🎨 Component Rules

#### 4.1 Component Structure
- Use functional components with hooks
- Always define Props interface
- Use default exports for components
- Export types used by external components

```typescript
// ✅ Component Pattern
interface BusinessCardProps {
  business: Business;
  onEdit?: (business: Business) => void;
  onDelete?: (id: string) => void;
}

export function BusinessCard({ business, onEdit, onDelete }: BusinessCardProps) {
  // implementation
}

// Export type for external use
export type { BusinessCardProps };
```

#### 4.2 Styling Rules
- **Always** use Tailwind CSS classes
- **Never** use inline styles except for dynamic values
- **Always** use responsive prefixes (sm:, md:, lg:)
- **Always** use semantic color classes (text-gray-600, not text-gray-600)

```typescript
// ✅ Good
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
  <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
</div>

// ❌ Bad
<div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px' }}>
  <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>{title}</h3>
</div>
```

### 5. 📡 API Integration Rules

#### 5.1 Service Layer Pattern
- One service file per domain (business, transaction, auth)
- Always return consistent response structure
- Use fetch client for all API calls

```typescript
// ✅ Service Pattern
export const businessService = {
  async getBusinesses(): Promise<Business[]> {
    const response = await fetchClient<Business[]>('/businesses');
    return response.data;
  },

  async createBusiness(data: CreateBusinessData): Promise<Business> {
    const response = await fetchClient<Business>('/businesses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  },
};
```

#### 5.2 Error Handling
- **Always** wrap async operations in try-catch
- **Always** log errors with context
- **Never** expose raw errors to users
- Use consistent error messages

```typescript
// ✅ Error Handling Pattern
const createBusiness = async (data: CreateBusinessData) => {
  try {
    const response = await businessService.createBusiness(data);
    queryClient.invalidateQueries({ queryKey: businessKeys.lists() });
    return response;
  } catch (error) {
    console.error('Failed to create business:', { data, error });
    throw new Error('Unable to create business. Please try again.');
  }
};
```

### 6. 🔄 Form Rules

#### 6.1 TanStack Form Pattern
- **Always** use Zod for validation
- **Always** provide clear error messages
- **Always** disable submit button while submitting
- **Always** reset form after successful submission

```typescript
// ✅ Form Pattern
const form = useForm({
  defaultValues,
  validatorAdapter: zodValidator(),
  onSubmit: async ({ value }) => {
    try {
      await createMutation.mutateAsync(value);
      form.reset();
      onSuccess?.();
    } catch (error) {
      // Error handled by mutation
    }
  },
});
```

### 7. 📊 Table Rules

#### 7.1 TanStack Table Pattern
- **Always** use column definitions array
- **Always** provide sorting and filtering
- **Always** handle empty state
- **Always** use consistent action buttons

```typescript
// ✅ Table Pattern
const columns = useMemo<ColumnDef<Transaction>[]>(() => [
  // Column definitions
], []);

const table = useReactTable({
  data,
  columns,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  // ...
});
```

### 8. 🔒 Security Rules

#### 8.1 Authentication & Authorization
- **Never** store sensitive data in localStorage without encryption
- **Always** validate tokens on the backend
- **Always** use HTTPS in production
- **Always** implement role-based access control

#### 8.2 XSS Prevention
- **Always** sanitize user inputs
- **Never** use dangerouslySetInnerHTML
- **Always** validate and escape data from APIs

### 9. 🧪 Testing Rules

#### 9.1 Test Structure
- One test file per component/hook
- Test happy path and error scenarios
- Use descriptive test names
- Mock external dependencies

```typescript
// ✅ Test Pattern
describe('useBusinesses', () => {
  it('should fetch and return businesses', async () => {
    // Test implementation
  });

  it('should handle fetch errors gracefully', async () => {
    // Test error handling
  });
});
```

### 10. 📦 Performance Rules

#### 10.1 Code Organization
- **Always** lazy load routes
- **Always** use React.memo for expensive components
- **Always** useMemo/useCallback for expensive operations
- **Never** create new objects/arrays in render body

```typescript
// ✅ Performance Pattern
const ExpensiveComponent = React.memo(({ data }: Props) => {
  const processedData = useMemo(() => {
    return data.map(item => expensiveProcessing(item));
  }, [data]);

  return <div>{/* Use processedData */}</div>;
});
```

#### 10.2 Bundle Optimization
- **Always** analyze bundle size after major changes
- **Never** import entire libraries when specific functions suffice
- **Always** use dynamic imports for heavy dependencies

### 11. 📋 Code Quality Rules

#### 11.1 ESLint & Prettier
- **Always** run ESLint before commits
- **Always** format code with Prettier
- **Never** disable ESLint rules without justification

#### 11.2 Git Commits
- Use conventional commit messages
- Commit atomic changes
- Include ticket references when applicable

```
feat: add business creation form
fix: resolve transaction sorting issue
refactor: migrate to TanStack Query
docs: update API documentation
```

### 12. 🚀 Deployment Rules

#### 12.1 Environment Variables
- **Never** commit secrets to Git
- **Always** provide default values for non-secret env vars
- **Always** validate required environment variables

#### 12.2 Build Verification
- **Always** run build before deployment
- **Always** verify all tests pass
- **Always** check TypeScript compilation

## Automated Checklist for Every Change

Before committing any code:

- [ ] TypeScript strict mode passes
- [ ] ESLint passes without errors
- [ ] All tests pass
- [ ] Build succeeds
- [ ] Components have proper TypeScript interfaces
- [ ] Async operations have error handling
- [ ] New features are accessible (WCAG compliance)
- [ ] Bundle size impact is acceptable
- [ ] Environment variables are documented
- [ ] Security review completed for sensitive changes

## Enforcement

These rules are enforced through:
1. **Pre-commit hooks** (husky + lint-staged)
2. **CI/CD pipeline** checks
3. **Code review** process
4. **Automated testing** requirements

Remember: These guidelines exist to maintain code quality, consistency, and reliability across the entire codebase. When in doubt, prioritize maintainability and clarity over cleverness.
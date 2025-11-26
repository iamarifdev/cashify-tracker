# Import Style Guide - Absolute Imports with @ Aliases

This guide shows how to use clean absolute imports instead of messy relative paths.

## 🎯 Available Path Aliases

```typescript
'@/'                    // → src/
'@/features/'           // → src/features/
'@/shared/'            // → src/shared/
'@/pages/'             // → src/pages/
'@/types/'             // → src/types/
'@/utils/'             // → src/utils/
'@/hooks/'             // → src/hooks/
'@/assets/'            // → src/assets/
'@/services/'          // → src/services/
```

## 🔄 Before vs After

### ❌ Before (Relative Imports)
```typescript
// Ugly and hard to maintain
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../../hooks/useAuth';
import { User } from '../../../../types';
import { formatCurrency } from '../utils/formatCurrency';
```

### ✅ After (Absolute Imports)
```typescript
// Clean and readable
import { Button } from '@/shared/components/ui/Button';
import { useAuth } from '@/shared/hooks/useAuth';
import { User } from '@/types';
import { formatCurrency } from '@/utils/formatCurrency';
```

## 🎯 Import Patterns by Directory

### **1. Feature Components (`src/features/*/components/`)**
```typescript
// Import shared components
import { Button, Modal } from '@/shared/components/ui';
import { Sidebar, TopBar } from '@/shared/components/layout';

// Import shared utilities
import { useLocalStorage } from '@/shared/hooks';
import { formatCurrency } from '@/shared/utils';
import type { User } from '@/types';

// Import feature-specific items
import { useTransactions } from '../hooks/useTransactions';
import type { Transaction } from '../types/transaction.types';
```

### **2. Shared Components (`src/shared/components/`)**
```typescript
// Import other shared components
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

// Import shared utilities
import { cn } from '@/utils/cn';
import type { ComponentProps } from '@/types';
```

### **3. Pages (`src/pages/`)**
```typescript
// Import feature components
import { LoginForm } from '@/features/auth';
import { BookList } from '@/features/cashbook';
import { TransactionTable } from '@/features/transactions';

// Import layout components
import { AppLayout } from '@/shared/components/layout/AppLayout';
```

### **4. App Root (`src/App.tsx`)**
```typescript
// Import features
import { LoginForm } from '@/features/auth';
import { BookList } from '@/features/cashbook';
import { TransactionTable } from '@/features/transactions';

// Import shared components
import { AppLayout } from '@/shared/components/layout';
import { Button, Modal } from '@/shared/components/ui';

// Import types and utilities
import type { User, ViewState } from '@/types';
import { useLocalStorage } from '@/shared/hooks';
```

## 🎯 Best Practices

### **1. Use Specific Imports When Possible**
```typescript
// ✅ Good - Specific import
import { Button } from '@/shared/components/ui/Button';

// ✅ Also Good - Barrel export (if feature exports multiple things)
import { LoginForm, useAuth } from '@/features/auth';

// ⚠️ Acceptable - General import for many items
import * as UI from '@/shared/components/ui';
```

### **2. Group Imports Logically**
```typescript
// React and external libraries
import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

// Shared components and utilities
import { Button, Modal } from '@/shared/components/ui';
import { useLocalStorage } from '@/shared/hooks';

// Feature-specific imports
import { useTransactions } from '@/features/transactions/hooks';
import { TransactionTable } from '@/features/transactions/components';

// Types
import type { User, Transaction } from '@/types';
```

### **3. Consistent File Extensions**
```typescript
// For .tsx files (with JSX)
import { LoginForm } from '@/features/auth/components/LoginForm.tsx';

// For .ts files (TypeScript only)
import { User } from '@/types/user.ts';

// For index files (barrel exports)
import { LoginForm, useAuth } from '@/features/auth';
```

## 🎯 VS Code Integration

Your `.vscode/settings.json` is configured for:
- ✅ Auto-import suggestions
- ✅ Import organization on save
- ✅ Import path auto-update when moving files

### **Keyboard Shortcuts**
- `Shift + Option + O` (Mac) / `Shift + Alt + O` (Windows) - Organize imports
- `Cmd + .` (Mac) / `Ctrl + .` (Windows) - Quick fix suggestions

## 🎯 Migration Steps

When migrating from relative to absolute imports:

1. **Start with one file at a time**
2. **Use the import paths above as reference**
3. **Run build to verify everything works**
4. **Test the app functionality**

### **Migration Example:**
```typescript
// Before
import { Button } from '../../../shared/components/ui/Button';
import { Modal } from '../../../shared/components/ui/Modal';
import { useAuth } from '../../hooks/useAuth';

// After
import { Button, Modal } from '@/shared/components/ui';
import { useAuth } from '@/shared/hooks/useAuth';
```

## 🎯 Troubleshooting

### **Import Not Working?**
1. Check that the file exists at the expected path
2. Verify the alias is in both `vite.config.ts` and `tsconfig.json`
3. Restart VS Code if intellisense isn't working
4. Run `npm run build` to verify Vite can resolve imports

### **TypeScript Errors?**
1. Ensure `tsconfig.json` paths match `vite.config.ts` aliases
2. Check that index.ts files export what you're trying to import

### **Build Errors?**
1. Vite build will fail if an import path is wrong
2. Check the error message - it shows the exact path it's looking for

## 🎯 Benefits of Absolute Imports

- ✅ **Cleaner code** - No more `../../../` gymnastics
- ✅ **Easier refactoring** - Move files without breaking imports
- ✅ **Better readability** - Clear import origins
- ✅ **IDE support** - Better auto-completion and navigation
- ✅ **Team consistency** - Everyone uses the same patterns

This makes your codebase much more maintainable and developer-friendly! 🚀
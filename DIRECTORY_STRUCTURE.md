# Directory Structure

This project follows React/Vite best practices with a clean, scalable directory structure.

## 📁 Structure Overview

```
cashify-tracker/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── features/       # Feature-specific components
│   │   ├── layout/         # Layout components
│   │   │   ├── Sidebar.tsx
│   │   │   ├── TopBar.tsx
│   │   │   ├── RoleBanner.tsx
│   │   │   └── PromoSidebar.tsx
│   │   ├── modals/         # Modal and drawer components
│   │   │   ├── AddContactModal.tsx
│   │   │   ├── AddItemModal.tsx
│   │   │   ├── CreateBusinessModal.tsx
│   │   │   ├── DeleteEntryModal.tsx
│   │   │   ├── EntryDrawer.tsx
│   │   │   └── EntryDetailsDrawer.tsx
│   │   └── ui/             # Reusable UI primitives
│   │       ├── Button.tsx
│   │       ├── FilterDropdown.tsx
│   │       └── SearchableDropdown.tsx
│   ├── pages/              # Page-level components
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   └── BookDetails.tsx
│   ├── services/           # API and data services
│   │   ├── api/            # API calls (future)
│   │   ├── mock/           # Mock data utilities (future)
│   │   └── mockData.ts     # Current mock data
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts        # All type exports
│   ├── assets/             # Static assets
│   │   ├── images/
│   │   ├── icons/
│   │   └── fonts/
│   ├── hooks/              # Custom React hooks (future)
│   ├── utils/              # Utility functions (future)
│   ├── constants/          # App constants (future)
│   ├── lib/                # Third-party library configs (future)
│   ├── config/             # App configuration (future)
│   └── App.tsx             # Main app component
├── public/                 # Static public assets
├── dist/                   # Build output
├── styles.css              # Global styles
├── index.html              # HTML template
├── index.tsx               # App entry point
├── tailwind.config.js      # Tailwind CSS configuration
├── vite.config.ts          # Vite configuration
└── package.json            # Dependencies and scripts
```

## 📋 Component Categories

### 📄 Pages (`src/pages/`)
Top-level route components that represent entire pages:
- **Login.tsx** - Authentication page
- **Dashboard.tsx** - Main dashboard page
- **BookDetails.tsx** - Individual book details page

### 🎨 Layout (`src/components/layout/`)
Components that define the application structure and layout:
- **Sidebar.tsx** - Main navigation sidebar
- **TopBar.tsx** - Header with business selector and user menu
- **RoleBanner.tsx** - User role display banner
- **PromoSidebar.tsx** - Promotional sidebar content

### 🎯 Modals (`src/components/modals/`)
Overlay components for user interactions:
- **EntryDrawer.tsx** - Add/edit transaction drawer
- **EntryDetailsDrawer.tsx** - View transaction details
- **CreateBusinessModal.tsx** - Create new business modal
- **DeleteEntryModal.tsx** - Delete confirmation modal
- **AddContactModal.tsx** - Add contact modal
- **AddItemModal.tsx** - Add item modal

### 🧩 UI Components (`src/components/ui/`)
Reusable, presentational components:
- **Button.tsx** - Consistent button component
- **FilterDropdown.tsx** - Dropdown for filtering
- **SearchableDropdown.tsx** - Dropdown with search functionality

## 🚦 Import Patterns

### ✅ Correct Import Examples

```typescript
// From pages to components
import { Button } from '../components/ui/Button';
import { TopBar } from '../components/layout/TopBar';

// From components to types/services
import { User, Business } from '../../types';
import { MOCK_DATA } from '../../services/mockData';

// From layout to modals
import { CreateBusinessModal } from '../modals/CreateBusinessModal';

// Root imports (from App.tsx)
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Sidebar } from './components/layout/Sidebar';
```

### ❌ Avoid These

```typescript
// Don't import from node_modules directly in components
import React from 'react'; // ✅ OK
import lodash from 'lodash'; // ❌ Import utils from utils/

// Don't deeply nest imports unless necessary
import { Component } from '../../../components/ui/subfolder/Component'; // ⚠️ Consider restructuring

// Don't mix relative and absolute imports inconsistently
import { A } from './types';
import { B } from 'src/services/data'; // ⚠️ Be consistent
```

## 📁 File Naming Conventions

- **PascalCase** for components: `UserProfile.tsx`
- **camelCase** for utilities: `formatDate.ts`
- **kebab-case** for assets: `user-avatar.png`
- **UPPER_CASE** for constants: `API_ENDPOINTS.ts`

## 🎯 Best Practices

1. **Keep components small and focused** (≤ 300 lines when possible)
2. **Use index files** for clean exports from directories
3. **Group related files** in feature folders
4. **Separate presentational and container logic**
5. **Use absolute imports for shared utilities**
6. **Place types close to their usage**

## 🔄 Future Structure

As the app grows, consider these additions:

```
src/
├── hooks/              # Custom React hooks
├── utils/              # Pure utility functions
├── constants/          # App constants
├── lib/                # Third-party integrations
├── config/             # Environment and app config
├── store/              # State management (if needed)
└── testing/            # Test utilities and mocks
```

## 🎨 Component Architecture

```
Component Structure:
├── Imports (React, third-party, internal)
├── Type definitions
├── Component implementation
├── Export statement
```

This structure ensures:
- **Scalability** - Easy to add new features
- **Maintainability** - Clear separation of concerns
- **Developer Experience** - Intuitive file location
- **Performance** - Optimized imports and code splitting
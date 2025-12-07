# Cashify Development Guide

## 🚀 Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Run type checking**
   ```bash
   npm run typecheck
   ```

4. **Run linting**
   ```bash
   npm run lint
   ```

## 📋 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run typecheck` | Run TypeScript compiler check |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint issues automatically |
| `npm run gen:routes` | Generate TanStack Router routes |
| `npm run test` | Run tests |
| `npm run preview` | Preview production build |
| `npm run precommit` | Run all pre-commit checks (typecheck, lint, build, test) |
| `npm run check-all` | Run checks without tests (typecheck, lint, build) |

### Pre-commit Checks

The same checks that run automatically before each commit can be run manually:

```bash
# Run all checks (same as pre-commit hook)
npm run precommit

# Run checks without tests (faster)
npm run check-all

# Run individual checks
npm run typecheck
npm run lint
npm run build
npm test
```

## 🏗️ Project Structure

```
cashify-tracker/
├── .husky/                 # Git hooks
├── .templates/            # Code templates
├── dist/                  # Build output
├── public/                # Public assets
├── src/
│   ├── features/          # Feature modules
│   │   ├── auth/         # Authentication
│   │   ├── business/     # Business management
│   │   └── transactions/ # Transaction management
│   ├── routes/           # TanStack Router
│   ├── shared/           # Shared utilities
│   │   ├── api/         # API configuration
│   │   ├── components/  # Reusable components
│   │   └── utils/       # Utility functions
│   └── types/           # Global types
├── DEVELOPMENT_GUIDELINES.md  # Full development guidelines
└── package.json
```

## 🎯 Before You Commit

Pre-commit hooks will automatically run these checks:

1. ✅ TypeScript compilation
2. ✅ ESLint validation
3. ✅ Build verification
4. ✅ Test execution

To manually run all checks (same as pre-commit):

```bash
npm run precommit
```

Or run checks without tests (faster for development):

```bash
npm run check-all
```

## 📝 Development Guidelines

All development must follow the rules in [DEVELOPMENT_GUIDELINES.md](./DEVELOPMENT_GUIDELINES.md)

### Key Rules to Remember:

1. **TypeScript Strict Mode** - Always enabled
2. **No `any` Types** - Use proper typing
3. **Feature-Based Structure** - Keep related files together
4. **TanStack Ecosystem** - Use Query, Router, Form, Table
5. **Tailwind CSS** - For all styling
6. **Error Handling** - Always handle async errors

## 🚨 Common Gotchas

### 1. TypeScript Errors
- If you see "Property 'x' does not exist", check your types
- Use `unknown` instead of `any` when needed
- Always provide explicit return types

### 2. TanStack Query
- Remember to invalidate related queries after mutations
- Use query key factories for consistency
- Don't mix local state with server state

### 3. Forms
- Always use Zod for validation
- Reset form after successful submission
- Disable submit button during submission

### 4. Routing
- Generate routes with `npm run gen:routes`
- Use typed navigation
- Implement proper route guards

## 🔧 Code Templates

Use the templates in `.templates/` for consistency:

- `component.tsx` - For new components
- `hook.ts` - For custom hooks

## 🐛 Debugging

### React DevTools
Install for component inspection

### TanStack Query DevTools
Enabled automatically in development

### Browser DevTools
Check Network tab for API calls
Console for errors

## 📚 Learning Resources

- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [TanStack Router Documentation](https://tanstack.com/router/latest)
- [TanStack Table Documentation](https://tanstack.com/table/latest)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Follow all development guidelines
4. Ensure all tests pass
5. Submit a pull request

## 📞 Support

If you encounter issues:

1. Check the [Development Guidelines](./DEVELOPMENT_GUIDELINES.md)
2. Review existing code for similar patterns
3. Ask for help in team channels

Remember: Consistency is key to maintainable code! 🎯
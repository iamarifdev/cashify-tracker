import React from 'react';
import { AppRouter } from './AppRouter';
import { AuthProvider } from '@/features/auth';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
};

export default App;
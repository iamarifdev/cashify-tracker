import React, { useEffect } from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RouteErrorBoundary({ children, fallback }: Props) {
  useEffect(() => {
    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      event.preventDefault();
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <div className="w-full h-full">
      {children}
    </div>
  );
}
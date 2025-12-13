import { Suspense } from 'react';
import { PageLoading } from './LoadingSpinner';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function SuspenseWrapper({ children, fallback }: Props) {
  return (
    <Suspense fallback={fallback || <PageLoading />}>
      {children}
    </Suspense>
  );
}

// Specific wrappers for common use cases
export function SuspenseWithSpinner({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-8">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-gray-300 h-12 w-12"></div>
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

export function SuspenseWithTable({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="w-full">
          <table className="min-w-full divide-y divide-gray-200">
            <tbody>
              <tr>
                <td className="px-6 py-12 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="text-gray-500">Loading...</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
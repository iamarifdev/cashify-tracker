import React from 'react';
import { LoadingSpinner } from '@/shared/components/Loading/LoadingSpinner';
import { ApiErrorDisplay } from '@/shared/components/Error/ApiError';

interface QueryStateWrapperProps<T> {
  children: (data: T) => React.ReactNode;
  query: {
    data: T | undefined;
    isLoading: boolean;
    isError: boolean;
    error: unknown;
    refetch: () => void;
    status?: {
      isLoading: boolean;
      isError: boolean;
      isSuccess: boolean;
      error: Error | null;
    };
  };
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  showRetryButton?: boolean;
}

export function QueryStateWrapper<T>({
  children,
  query,
  loadingComponent,
  errorComponent,
  emptyComponent,
  showRetryButton = true
}: QueryStateWrapperProps<T>) {
  const { data, isLoading, isError, error, refetch } = query;

  if (isLoading) {
    return (
      <>
        {loadingComponent || (
          <div className="flex items-center justify-center p-8">
            <LoadingSpinner size="lg" />
          </div>
        )}
      </>
    );
  }

  if (isError) {
    return (
      <>
        {errorComponent || (
          <div className="p-4">
            <ApiErrorDisplay
              error={error}
              onRetry={showRetryButton ? refetch : undefined}
            />
          </div>
        )}
      </>
    );
  }

  if (!data) {
    return (
      <>
        {emptyComponent || (
          <div className="text-center py-12 text-gray-500">
            No data available
          </div>
        )}
      </>
    );
  }

  return <>{children(data)}</>;
}
export function useQueryState<T>(
  query: {
    data: T | undefined;
    isLoading: boolean;
    isError: boolean;
    error: unknown;
    refetch: () => void;
  }
) {
  return {
    ...query,
    isLoaded: !query.isLoading && !query.isError,
    hasData: !!query.data,
    isInitialLoad: query.isLoading && !query.data,
  };
}
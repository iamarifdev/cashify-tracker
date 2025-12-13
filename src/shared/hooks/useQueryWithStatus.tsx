import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { useState } from 'react';

interface QueryStatus {
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  error: Error | null;
}

interface UseQueryWithStatusResult<TData, TError> extends Omit<UseQueryResult<TData, TError>, 'status'> {
  status: QueryStatus;
  retry: () => void;
}

/**
 * Enhanced useQuery hook with additional status management
 */
export function useQueryWithStatus<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends readonly unknown[] = readonly unknown[]
>(
  options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>
): UseQueryWithStatusResult<TData, TError> {
  const [retryCount, setRetryCount] = useState(0);
  const [hasRetried, setHasRetried] = useState(false);

  const query = useQuery({
    ...options,
    retry: (failureCount, error) => {
      // Custom retry logic
      if (error && typeof error === 'object' && 'status' in error) {
        const status = error.status as number;
        // Don't retry on client errors (4xx)
        if (status >= 400 && status < 500) {
          return false;
        }
      }

      // Retry up to 3 times for server errors
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => {
      // Exponential backoff
      return Math.min(1000 * 2 ** attemptIndex, 30000);
    },
  });

  const status: QueryStatus = {
    isLoading: query.isLoading && !query.data,
    isError: query.isError,
    isSuccess: query.isSuccess,
    error: query.error as Error | null,
  };

  const retry = () => {
    if (!hasRetried || retryCount < 3) {
      setRetryCount(prev => prev + 1);
      setHasRetried(true);
      query.refetch();
    }
  };

  return {
    ...query,
    status,
    retry,
  };
}
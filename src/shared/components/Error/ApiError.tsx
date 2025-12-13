import { isApiError } from '@/shared/api/fetch-client';
import { AlertTriangle, RefreshCw, X } from 'lucide-react';

interface ApiErrorDisplayProps {
  error: unknown;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
  showRetry?: boolean;
}

export function ApiErrorDisplay({
  error,
  onRetry,
  onDismiss,
  className = '',
  showRetry = true
}: Readonly<ApiErrorDisplayProps>) {
  if (!error) return null;

  const apiError = isApiError(error) ? error : null;
  const message = apiError?.message || (error instanceof Error ? error.message : 'An unexpected error occurred');
  const status = apiError?.status;

  const getErrorIcon = () => {
    if (status === 401 || status === 403) {
      return <X className="w-5 h-5 text-red-500" />;
    }
    if (status && status >= 500) {
      return <AlertTriangle className="w-5 h-5 text-orange-500" />;
    }
    return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
  };

  const getErrorMessage = () => {
    if (status === 401) {
      return 'You need to be logged in to access this resource.';
    }
    if (status === 403) {
      return "You don't have permission to access this resource.";
    }
    if (status === 404) {
      return 'The requested resource was not found.';
    }
    if (status && status >= 500) {
      return 'Server error. Please try again later.';
    }
    if (status && status >= 400) {
      return message || 'Invalid request. Please check your input and try again.';
    }
    return message || 'An unexpected error occurred. Please try again.';
  };

  const getRetryMessage = () => {
    if (status && status >= 500) {
      return 'Retry';
    }
    return 'Try Again';
  };

  return (
    <div className={`rounded-lg border border-gray-200 bg-white p-4 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getErrorIcon()}
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-gray-900">
            {status ? `Error ${status}` : 'Error'}
          </h3>
          <div className="mt-1 text-sm text-gray-500">
            <p>{getErrorMessage()}</p>
            {import.meta.env.DEV && apiError?.details && (
              <details className="mt-2">
                <summary className="cursor-pointer text-xs text-gray-400 hover:text-gray-600">
                  Technical details
                </summary>
                <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto">
                  {JSON.stringify(apiError.details, null, 2)}
                </pre>
              </details>
            )}
          </div>
          {showRetry && onRetry && (
            <div className="mt-3 flex space-x-2">
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                {getRetryMessage()}
              </button>
            </div>
          )}
        </div>
        {onDismiss && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={onDismiss}
                className="inline-flex rounded-md p-1.5 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface ApiErrorAlertProps {
  error: unknown;
  className?: string;
}

export function ApiErrorAlert({ error, className = '' }: Readonly<ApiErrorAlertProps>) {
  if (!error) return null;

  return (
    <div className={`rounded-md bg-red-50 p-4 ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <X className="h-5 w-5 text-red-400" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">
            Error occurred
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{error instanceof Error ? error.message : 'An unexpected error occurred'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
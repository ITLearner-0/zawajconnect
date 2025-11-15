import { useState, useCallback } from 'react';

interface ErrorInfo {
  message: string;
  stack?: string;
  componentStack?: string;
}

export const useErrorBoundary = () => {
  const [error, setError] = useState<ErrorInfo | null>(null);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  const captureError = useCallback((error: Error, errorInfo?: any) => {
    setError({
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack,
    });

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error captured by boundary:', error);
      console.error('Error info:', errorInfo);
    }
  }, []);

  return {
    error,
    resetError,
    captureError,
    hasError: error !== null,
  };
};

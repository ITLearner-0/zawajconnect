
import { useState, useCallback, useEffect } from 'react';

interface UseRetryableLoadOptions {
  maxRetries?: number;
  retryDelay?: number;
  backoffMultiplier?: number;
  onRetryExhausted?: () => void;
}

export const useRetryableLoad = (
  loadFunction: () => Promise<void>,
  options: UseRetryableLoadOptions = {}
) => {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    backoffMultiplier = 1.5,
    onRetryExhausted,
  } = options;

  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const retry = useCallback(async () => {
    if (retryCount >= maxRetries) {
      onRetryExhausted?.();
      return;
    }

    setIsRetrying(true);
    setHasError(false);

    try {
      // Calculate delay with exponential backoff
      const delay = retryDelay * Math.pow(backoffMultiplier, retryCount);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      await loadFunction();
      setRetryCount(0);
      setHasError(false);
    } catch (error) {
      setRetryCount(prev => prev + 1);
      setHasError(true);
      console.warn(`Retry attempt ${retryCount + 1} failed:`, error);
    } finally {
      setIsRetrying(false);
    }
  }, [retryCount, maxRetries, retryDelay, backoffMultiplier, loadFunction, onRetryExhausted]);

  const reset = useCallback(() => {
    setRetryCount(0);
    setIsRetrying(false);
    setHasError(false);
  }, []);

  const canRetry = retryCount < maxRetries && isOnline;

  return {
    retry,
    reset,
    retryCount,
    isRetrying,
    hasError,
    canRetry,
    isOnline,
    maxRetries,
  };
};


import { useState, useCallback, useEffect } from 'react';
import { useNetworkStatus } from './useNetworkStatus';
import { errorRecoveryService } from './services/errorRecoveryService';

interface ResilientImageLoadingOptions {
  src: string;
  fallbackSources?: string[];
  enableNetworkOptimization?: boolean;
  enableCircuitBreaker?: boolean;
  maxRetries?: number;
  onError?: (error: Error) => void;
  onLoad?: () => void;
}

export const useResilientImageLoading = (options: ResilientImageLoadingOptions) => {
  const {
    src,
    fallbackSources = [],
    enableNetworkOptimization = true,
    enableCircuitBreaker = true,
    maxRetries = 3,
    onError,
    onLoad,
  } = options;

  const [currentSrc, setCurrentSrc] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [networkOptimizedSrc, setNetworkOptimizedSrc] = useState<string>(src);

  const { isOnline, isSlowConnection, saveData } = useNetworkStatus();

  // Optimize image URL based on network conditions
  useEffect(() => {
    if (!enableNetworkOptimization) {
      setNetworkOptimizedSrc(src);
      return;
    }

    let optimizedUrl = src;

    // Apply network-based optimizations
    if (isSlowConnection || saveData) {
      // Reduce quality and size for slow connections
      if (src.includes('?')) {
        optimizedUrl = `${src}&q=50&w=400`;
      } else {
        optimizedUrl = `${src}?q=50&w=400`;
      }
    }

    setNetworkOptimizedSrc(optimizedUrl);
  }, [src, isSlowConnection, saveData, enableNetworkOptimization]);

  const loadImage = useCallback(async (imageSrc: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      const timeoutId = setTimeout(() => {
        reject(new Error(`Image load timeout: ${imageSrc}`));
      }, 15000); // 15 second timeout

      img.onload = () => {
        clearTimeout(timeoutId);
        resolve();
      };

      img.onerror = () => {
        clearTimeout(timeoutId);
        reject(new Error(`Failed to load image: ${imageSrc}`));
      };

      img.src = imageSrc;
    });
  }, []);

  const attemptLoad = useCallback(async () => {
    if (!isOnline) {
      setHasError(true);
      onError?.(new Error('No internet connection'));
      return;
    }

    setIsLoading(true);
    setHasError(false);

    const sourcesToTry = [networkOptimizedSrc, ...fallbackSources];
    let lastError: Error;

    for (let i = 0; i < sourcesToTry.length; i++) {
      const sourceToTry = sourcesToTry[i];
      
      try {
        await errorRecoveryService.executeWithRetry(
          () => loadImage(sourceToTry ?? ''),
          `image-${sourceToTry ?? ''}`,
          {
            maxRetries: maxRetries,
            enableCircuitBreaker,
            baseDelay: 1000,
            backoffFactor: 1.5,
          }
        );

        setCurrentSrc(sourceToTry);
        setIsLoading(false);
        setLoadAttempt(prev => prev + 1);
        onLoad?.(
        );
        return;
        
      } catch (error) {
        lastError = error as Error;
        console.warn(`Failed to load image source ${i + 1}/${sourcesToTry.length}:`, sourceToTry, error);
      }
    }

    // All sources failed
    setHasError(true);
    setIsLoading(false);
    setLoadAttempt(prev => prev + 1);
    onError?.(lastError! || new Error('All image sources failed to load'));
  }, [
    networkOptimizedSrc,
    fallbackSources,
    isOnline,
    maxRetries,
    enableCircuitBreaker,
    loadImage,
    onError,
    onLoad,
  ]);

  const retry = useCallback(() => {
    attemptLoad();
  }, [attemptLoad]);

  // Auto-retry when coming back online
  useEffect(() => {
    if (isOnline && hasError && loadAttempt > 0) {
      const timer = setTimeout(() => {
        retry();
      }, 1000);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isOnline, hasError, loadAttempt, retry]);

  return {
    currentSrc,
    isLoading,
    hasError,
    loadAttempt,
    isOnline,
    attemptLoad,
    retry,
    circuitBreakerStatus: errorRecoveryService.getCircuitBreakerStatus(`image-${networkOptimizedSrc}`),
  };
};

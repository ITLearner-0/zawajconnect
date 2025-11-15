import { useState, useCallback, useRef } from 'react';
import { useCentralizedLazyLoading } from './useCentralizedLazyLoading';

interface UseStatefulLazyImageOptions {
  src: string;
  alt: string;
  id?: string;
  priority?: 'high' | 'medium' | 'low';
  threshold?: number;
  rootMargin?: string;
  enableRetry?: boolean;
  maxRetries?: number;
}

export const useStatefulLazyImage = (options: UseStatefulLazyImageOptions) => {
  const {
    src,
    alt,
    id = src,
    priority = 'medium',
    threshold,
    rootMargin,
    enableRetry = true,
    maxRetries = 3,
  } = options;

  const [retryCount, setRetryCount] = useState(0);
  const [actualSrc, setActualSrc] = useState<string>('');
  const imageRef = useRef<HTMLImageElement>();

  const {
    elementRef,
    shouldLoad,
    isLoaded,
    hasFailed,
    isLoading,
    markAsLoaded,
    markAsFailed,
    globalState,
  } = useCentralizedLazyLoading<HTMLDivElement>({
    id: `${id}-${priority}`,
    threshold,
    rootMargin,
    triggerOnce: true,
    configType: 'image',
    priority,
  });

  // Handle image loading
  const handleImageLoad = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement>) => {
      markAsLoaded();
      setRetryCount(0);
    },
    [markAsLoaded]
  );

  // Handle image error with retry logic
  const handleImageError = useCallback(() => {
    if (enableRetry && retryCount < maxRetries) {
      setTimeout(
        () => {
          setRetryCount((prev) => prev + 1);
          setActualSrc(`${src}?retry=${retryCount + 1}`);
        },
        globalState.retryDelay * Math.pow(2, retryCount)
      ); // Exponential backoff
    } else {
      markAsFailed();
    }
  }, [enableRetry, retryCount, maxRetries, src, markAsFailed, globalState.retryDelay]);

  // Update src when should load changes
  const effectiveSrc = shouldLoad ? actualSrc || src : '';

  return {
    elementRef,
    imageRef,
    src: effectiveSrc,
    alt,
    isLoaded,
    hasFailed,
    isLoading,
    retryCount,
    handleImageLoad,
    handleImageError,
    canRetry: enableRetry && retryCount < maxRetries,
    globalLoadingState: {
      totalImages: globalState.totalImages,
      loadedImages: globalState.loadedImages,
      queueLength: globalState.loadingQueue.length,
      successRate:
        globalState.totalImages > 0
          ? (globalState.loadedImages / globalState.totalImages) * 100
          : 0,
    },
  };
};

import { useState, useEffect, useCallback } from 'react';
import { useEnhancedLazyLoading } from './useEnhancedLazyLoading';
import { MemoryManagementService } from './services/memoryService';

interface UseEnhancedLazyImageOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  maxRetries?: number;
  fallbackSources?: string[];
  enableProgressiveLoading?: boolean;
  enableMemoryOptimization?: boolean;
}

export const useEnhancedLazyImage = (src: string, options: UseEnhancedLazyImageOptions = {}) => {
  const {
    maxRetries = 3,
    fallbackSources = [],
    enableProgressiveLoading = false,
    enableMemoryOptimization = true,
    ...lazyOptions
  } = options;

  const { elementRef, shouldLoad, config, isIntersecting } = useEnhancedLazyLoading<HTMLDivElement>(
    {
      ...lazyOptions,
      configType: 'image',
    }
  );

  const [imageSrc, setImageSrc] = useState<string | undefined>(undefined);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [loadStartTime, setLoadStartTime] = useState<number | null>(null);

  const memoryService = enableMemoryOptimization ? MemoryManagementService.getInstance() : null;

  // Performance tracking (development only)
  const trackLoadTime = useCallback((startTime: number) => {
    if (process.env.NODE_ENV === 'development') {
      const loadTime = performance.now() - startTime;
      console.log(`Image loaded in ${loadTime.toFixed(2)}ms`);
    }
  }, []);

  const handleLoad = useCallback(
    (event: Event) => {
      const imgElement = event.target as HTMLImageElement;

      // Cache the image for memory optimization
      if (memoryService && imgElement) {
        memoryService.cacheImage(src, imgElement);
      }

      setIsLoaded(true);
      setHasError(false);
      if (loadStartTime) {
        trackLoadTime(loadStartTime);
      }
    },
    [loadStartTime, trackLoadTime, memoryService, src]
  );

  const handleError = useCallback(() => {
    if (retryCount < maxRetries) {
      // Try fallback sources or retry
      const nextSource = fallbackSources[retryCount] || src;
      setRetryCount((prev) => prev + 1);
      setImageSrc(nextSource);
    } else {
      setHasError(true);
      setIsLoaded(false);
    }
  }, [retryCount, maxRetries, fallbackSources, src]);

  // Memory optimization: unload image when not visible and triggerOnce is false
  useEffect(() => {
    if (enableMemoryOptimization && !isIntersecting && !options.triggerOnce && isLoaded) {
      // Don't immediately unload, wait a bit to avoid thrashing
      const unloadTimer = setTimeout(() => {
        if (!isIntersecting) {
          setImageSrc(undefined);
          setIsLoaded(false);
          if (process.env.NODE_ENV === 'development') {
            console.log('Unloaded image to save memory:', src);
          }
        }
      }, 5000); // Wait 5 seconds before unloading

      return () => clearTimeout(unloadTimer);
    }
  }, [isIntersecting, options.triggerOnce, isLoaded, enableMemoryOptimization, src]);

  useEffect(() => {
    if (shouldLoad && src && !imageSrc) {
      // Check if image is already cached
      const cachedImage = memoryService?.getCachedImage(src);
      if (cachedImage) {
        setImageSrc(src);
        setIsLoaded(true);
        if (process.env.NODE_ENV === 'development') {
          console.log('Using cached image:', src);
        }
        return;
      }

      setLoadStartTime(performance.now());
      setImageSrc(src);
    }
  }, [shouldLoad, src, imageSrc, memoryService]);

  // Progressive loading effect
  useEffect(() => {
    if (enableProgressiveLoading && shouldLoad && src) {
      // Create a low-quality placeholder URL
      const lowQualityUrl = src.includes('?') ? `${src}&w=50&q=30` : `${src}?w=50&q=30`;

      setImageSrc(lowQualityUrl);

      // Load full quality after a delay
      const timer = setTimeout(() => {
        setImageSrc(src);
      }, config.delay);

      return () => clearTimeout(timer);
    }
  }, [enableProgressiveLoading, shouldLoad, src, config.delay]);

  return {
    elementRef,
    imageSrc,
    isLoaded,
    hasError,
    shouldLoad,
    handleLoad,
    handleError,
    retryCount,
    isRetrying: retryCount > 0 && retryCount < maxRetries,
  };
};

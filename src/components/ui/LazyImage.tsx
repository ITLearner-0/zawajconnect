
import React, { useState } from 'react';
import { useEnhancedLazyImage } from '@/hooks/useLazyLoading/useEnhancedLazyImage';
import { useAccessibleLazyLoading } from '@/hooks/useLazyLoading/useAccessibleLazyLoading';
import { useResilientImageLoading } from '@/hooks/useLazyLoading/useResilientImageLoading';
import { useNetworkStatus } from '@/hooks/useLazyLoading/useNetworkStatus';
import EnhancedLoadingState from './EnhancedLoadingState';
import ProgressiveImage from './ProgressiveImage';
import LazyLoadingErrorBoundary from './LazyLoadingErrorBoundary';
import { WifiOff, Signal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholderClassName?: string;
  fallbackSrc?: string;
  onLoad?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
  onError?: () => void;
  enableMemoryOptimization?: boolean;
  enableProgressiveLoading?: boolean;
  enableRetry?: boolean;
  enableResilientLoading?: boolean;
  enableNetworkOptimization?: boolean;
  maxRetries?: number;
  showLoadingText?: boolean;
  showNetworkStatus?: boolean;
}

const LazyImage = ({
  src,
  alt,
  className,
  placeholderClassName,
  fallbackSrc,
  onLoad,
  onError,
  enableMemoryOptimization = true,
  enableProgressiveLoading = false,
  enableRetry = true,
  enableResilientLoading = true,
  enableNetworkOptimization = true,
  maxRetries = 3,
  showLoadingText = false,
  showNetworkStatus = false,
}: LazyImageProps) => {
  const [loadState, setLoadState] = useState<'loading' | 'loaded' | 'error' | 'retry'>('loading');

  const { reducedMotion } = useAccessibleLazyLoading({
    threshold: 0.1,
    triggerOnce: true,
    configType: 'image',
  });

  const { isOnline, isSlowConnection } = useNetworkStatus();

  const {
    elementRef,
    imageSrc,
    isLoaded,
    hasError,
    shouldLoad,
    handleLoad,
    handleError,
  } = useEnhancedLazyImage(src, {
    enableMemoryOptimization,
    enableProgressiveLoading,
    fallbackSources: fallbackSrc ? [fallbackSrc] : [],
    maxRetries: enableRetry ? maxRetries : 1,
  });

  const resilientLoading = useResilientImageLoading({
    src,
    fallbackSources: fallbackSrc ? [fallbackSrc] : [],
    enableNetworkOptimization,
    enableCircuitBreaker: enableResilientLoading,
    maxRetries: enableRetry ? maxRetries : 1,
    onLoad: () => {
      setLoadState('loaded');
    },
    onError: (error) => {
      setLoadState('error');
      onError?.();
      console.error('Resilient image loading failed:', error);
    },
  });

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    handleLoad(event.nativeEvent);
    setLoadState('loaded');
    onLoad?.(event);
  };

  const handleImageError = () => {
    handleError();
    if (enableRetry && resilientLoading.loadAttempt < maxRetries) {
      setLoadState('retry');
      resilientLoading.retry();
    } else {
      setLoadState('error');
      onError?.();
    }
  };

  const handleRetryClick = () => {
    setLoadState('retry');
    resilientLoading.retry();
  };

  // Use resilient loading when enabled
  const actualImageSrc = enableResilientLoading ? resilientLoading.currentSrc : imageSrc;
  const actualIsLoaded = enableResilientLoading ? !resilientLoading.isLoading && !resilientLoading.hasError : isLoaded;
  const actualHasError = enableResilientLoading ? resilientLoading.hasError : hasError;

  // Generate low quality src for progressive loading
  const lowQualitySrc = enableProgressiveLoading && src.includes('?') 
    ? `${src}&w=50&q=30` 
    : enableProgressiveLoading 
    ? `${src}?w=50&q=30` 
    : undefined;

  return (
    <LazyLoadingErrorBoundary showRetry={enableRetry}>
      <div 
        ref={elementRef} 
        className={cn('relative overflow-hidden', className)}
        role="img"
        aria-label={alt}
      >
        {/* Network Status Indicator */}
        {showNetworkStatus && (
          <div className="absolute top-2 right-2 z-10">
            {!isOnline ? (
              <WifiOff className="h-4 w-4 text-red-500" />
            ) : isSlowConnection ? (
              <Signal className="h-4 w-4 text-yellow-500" />
            ) : (
              <Signal className="h-4 w-4 text-green-500" />
            )}
          </div>
        )}

        {/* Offline State */}
        {!isOnline && (
          <EnhancedLoadingState
            state="offline"
            className={cn('w-full h-full', placeholderClassName)}
            showText={showLoadingText}
            reducedMotion={reducedMotion}
          />
        )}

        {/* Loading State */}
        {isOnline && (!shouldLoad || (!actualIsLoaded && !actualHasError && !resilientLoading.isLoading)) && (
          <EnhancedLoadingState
            state="loading"
            className={cn('w-full h-full', placeholderClassName)}
            showText={showLoadingText}
            reducedMotion={reducedMotion}
          />
        )}

        {/* Retry State */}
        {isOnline && (resilientLoading.isLoading || loadState === 'retry') && (
          <EnhancedLoadingState
            state="retry"
            className={cn('w-full h-full', placeholderClassName)}
            showText={showLoadingText}
            reducedMotion={reducedMotion}
          />
        )}

        {/* Error State */}
        {isOnline && actualHasError && loadState === 'error' && (
          <EnhancedLoadingState
            state="error"
            onRetry={enableRetry ? handleRetryClick : undefined}
            className={cn('w-full h-full', placeholderClassName)}
            showText={showLoadingText}
            reducedMotion={reducedMotion}
          />
        )}
        
        {/* Image Display */}
        {isOnline && shouldLoad && actualImageSrc && !actualHasError && (
          enableProgressiveLoading ? (
            <ProgressiveImage
              src={actualImageSrc}
              lowQualitySrc={lowQualitySrc}
              alt={alt}
              className={cn(
                'w-full h-full object-cover',
                actualIsLoaded ? 'opacity-100' : 'opacity-0',
                !reducedMotion && 'transition-opacity duration-300'
              )}
              onLoad={handleImageLoad}
              onError={handleImageError}
              reducedMotion={reducedMotion}
            />
          ) : (
            <img
              src={actualImageSrc}
              alt={alt}
              className={cn(
                'w-full h-full object-cover',
                !reducedMotion && 'transition-opacity duration-300',
                actualIsLoaded ? 'opacity-100' : 'opacity-0'
              )}
              onLoad={handleImageLoad}
              onError={handleImageError}
              loading="lazy"
            />
          )
        )}

        {/* Screen reader announcements */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {!isOnline && 'No internet connection'}
          {isOnline && loadState === 'loading' && 'Image is loading'}
          {isOnline && loadState === 'loaded' && 'Image loaded successfully'}
          {isOnline && loadState === 'error' && 'Image failed to load'}
          {isOnline && loadState === 'retry' && 'Retrying image load'}
        </div>
      </div>
    </LazyLoadingErrorBoundary>
  );
};

export default LazyImage;


import React, { useState } from 'react';
import { useEnhancedLazyImage } from '@/hooks/useLazyLoading/useEnhancedLazyImage';
import { useAccessibleLazyLoading } from '@/hooks/useLazyLoading/useAccessibleLazyLoading';
import { useRetryableLoad } from '@/hooks/useLazyLoading/useRetryableLoad';
import { Skeleton } from '@/components/ui/skeleton';
import EnhancedLoadingState from './EnhancedLoadingState';
import ProgressiveImage from './ProgressiveImage';
import { cn } from '@/lib/utils';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholderClassName?: string;
  fallbackSrc?: string;
  onLoad?: () => void;
  onError?: () => void;
  enableMemoryOptimization?: boolean;
  enableProgressiveLoading?: boolean;
  enableRetry?: boolean;
  maxRetries?: number;
  showLoadingText?: boolean;
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
  maxRetries = 3,
  showLoadingText = false,
}: LazyImageProps) => {
  const [loadState, setLoadState] = useState<'loading' | 'loaded' | 'error' | 'retry'>('loading');

  const { reducedMotion } = useAccessibleLazyLoading({
    threshold: 0.1,
    triggerOnce: true,
    configType: 'image',
  });

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

  const loadImage = async () => {
    // This would trigger the image load - the actual loading is handled by useEnhancedLazyImage
    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Image load failed'));
      img.src = src;
    });
  };

  const { retry, isRetrying, canRetry } = useRetryableLoad(loadImage, {
    maxRetries: enableRetry ? maxRetries : 1,
    onRetryExhausted: () => {
      setLoadState('error');
      onError?.();
    },
  });

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    handleLoad(event.nativeEvent);
    setLoadState('loaded');
    onLoad?.();
  };

  const handleImageError = () => {
    handleError();
    if (enableRetry && canRetry) {
      setLoadState('retry');
      retry();
    } else {
      setLoadState('error');
      onError?.();
    }
  };

  const handleRetryClick = () => {
    if (canRetry) {
      setLoadState('retry');
      retry();
    }
  };

  // Generate low quality src for progressive loading
  const lowQualitySrc = enableProgressiveLoading && src.includes('?') 
    ? `${src}&w=50&q=30` 
    : enableProgressiveLoading 
    ? `${src}?w=50&q=30` 
    : undefined;

  return (
    <div 
      ref={elementRef} 
      className={cn('relative overflow-hidden', className)}
      role="img"
      aria-label={alt}
    >
      {!shouldLoad || (!isLoaded && !hasError && !isRetrying) ? (
        <EnhancedLoadingState
          state="loading"
          className={cn('w-full h-full', placeholderClassName)}
          showText={showLoadingText}
          reducedMotion={reducedMotion}
        />
      ) : null}

      {isRetrying && (
        <EnhancedLoadingState
          state="retry"
          className={cn('w-full h-full', placeholderClassName)}
          showText={showLoadingText}
          reducedMotion={reducedMotion}
        />
      )}

      {loadState === 'error' && (
        <EnhancedLoadingState
          state="error"
          onRetry={enableRetry ? handleRetryClick : undefined}
          className={cn('w-full h-full', placeholderClassName)}
          showText={showLoadingText}
          reducedMotion={reducedMotion}
        />
      )}
      
      {shouldLoad && imageSrc && loadState !== 'error' && !isRetrying && (
        enableProgressiveLoading ? (
          <ProgressiveImage
            src={hasError && fallbackSrc ? fallbackSrc : imageSrc}
            lowQualitySrc={lowQualitySrc}
            alt={alt}
            className={cn(
              'w-full h-full object-cover',
              isLoaded ? 'opacity-100' : 'opacity-0',
              !reducedMotion && 'transition-opacity duration-300'
            )}
            onLoad={handleImageLoad}
            onError={handleImageError}
            reducedMotion={reducedMotion}
          />
        ) : (
          <img
            src={hasError && fallbackSrc ? fallbackSrc : imageSrc}
            alt={alt}
            className={cn(
              'w-full h-full object-cover',
              !reducedMotion && 'transition-opacity duration-300',
              isLoaded ? 'opacity-100' : 'opacity-0'
            )}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
          />
        )
      )}

      {/* Screen reader announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {loadState === 'loading' && 'Image is loading'}
        {loadState === 'loaded' && 'Image loaded successfully'}
        {loadState === 'error' && 'Image failed to load'}
        {loadState === 'retry' && 'Retrying image load'}
      </div>
    </div>
  );
};

export default LazyImage;

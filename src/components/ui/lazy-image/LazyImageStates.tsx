import React from 'react';
import { useNetworkStatus } from '@/hooks/useLazyLoading/useNetworkStatus';
import EnhancedLoadingState from '@/components/ui/EnhancedLoadingState';
import ProgressiveImage from '@/components/ui/ProgressiveImage';
import { cn } from '@/lib/utils';

interface LazyImageStatesProps {
  actualImageSrc: string | undefined;
  actualIsLoaded: boolean;
  actualHasError: boolean;
  loadState: 'loading' | 'loaded' | 'error' | 'retry';
  src: string;
  alt: string;
  className?: string;
  placeholderClassName?: string;
  enableProgressiveLoading?: boolean;
  enableRetry?: boolean;
  showLoadingText?: boolean;
  handleImageLoad: (event: React.SyntheticEvent<HTMLImageElement>) => void;
  handleImageError: () => void;
  handleRetryClick: () => void;
  reducedMotion: boolean;
  monitoring: any;
  resilientLoading: any;
}

const LazyImageStates = ({
  actualImageSrc,
  actualIsLoaded,
  actualHasError,
  loadState,
  src,
  alt,
  className,
  placeholderClassName,
  enableProgressiveLoading = false,
  enableRetry = true,
  showLoadingText = false,
  handleImageLoad,
  handleImageError,
  handleRetryClick,
  reducedMotion,
  monitoring,
  resilientLoading,
}: LazyImageStatesProps) => {
  const { isOnline } = useNetworkStatus();

  // Generate low quality src for progressive loading
  const lowQualitySrc =
    enableProgressiveLoading && src.includes('?')
      ? `${src}&w=50&q=30`
      : enableProgressiveLoading
        ? `${src}?w=50&q=30`
        : undefined;

  return (
    <>
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
      {isOnline &&
        (!monitoring.shouldLoad ||
          (!actualIsLoaded && !actualHasError && !resilientLoading.isLoading)) && (
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
      {isOnline &&
        monitoring.shouldLoad &&
        actualImageSrc &&
        !actualHasError &&
        (enableProgressiveLoading ? (
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
        ))}
    </>
  );
};

export default LazyImageStates;

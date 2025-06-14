
import React from 'react';
import { useStatefulLazyImage } from '@/hooks/useLazyLoading/state/useStatefulLazyImage';
import { cn } from '@/lib/utils';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StatefulLazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholderClassName?: string;
  id?: string;
  priority?: 'high' | 'medium' | 'low';
  threshold?: number;
  rootMargin?: string;
  enableRetry?: boolean;
  maxRetries?: number;
  showGlobalStats?: boolean;
  onLoad?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
  onError?: () => void;
}

const StatefulLazyImage = ({
  src,
  alt,
  className,
  placeholderClassName,
  id,
  priority = 'medium',
  threshold,
  rootMargin,
  enableRetry = true,
  maxRetries = 3,
  showGlobalStats = false,
  onLoad,
  onError,
}: StatefulLazyImageProps) => {
  const {
    elementRef,
    imageRef,
    src: effectiveSrc,
    isLoaded,
    hasFailed,
    isLoading,
    retryCount,
    handleImageLoad,
    handleImageError,
    canRetry,
    globalLoadingState,
  } = useStatefulLazyImage({
    src,
    alt,
    id,
    priority,
    threshold,
    rootMargin,
    enableRetry,
    maxRetries,
  });

  const handleLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    handleImageLoad(event);
    onLoad?.(event);
  };

  const handleError = () => {
    handleImageError();
    onError?.();
  };

  const handleRetryClick = () => {
    if (canRetry) {
      handleImageError(); // This will trigger the retry logic
    }
  };

  return (
    <div ref={elementRef} className={cn('relative overflow-hidden', className)}>
      {/* Global stats display */}
      {showGlobalStats && (
        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded z-10">
          {globalLoadingState.loadedImages}/{globalLoadingState.totalImages} 
          ({globalLoadingState.successRate.toFixed(1)}%)
        </div>
      )}

      {/* Priority indicator */}
      {priority === 'high' && (
        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-1 rounded z-10">
          High Priority
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className={cn(
          'flex items-center justify-center bg-gray-100 animate-pulse',
          placeholderClassName
        )}>
          <div className="text-gray-400 text-sm">Loading...</div>
        </div>
      )}

      {/* Error state with retry */}
      {hasFailed && (
        <div className={cn(
          'flex flex-col items-center justify-center bg-gray-100 p-4',
          placeholderClassName
        )}>
          <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
          <p className="text-red-600 text-sm mb-2">Failed to load image</p>
          {retryCount > 0 && (
            <p className="text-xs text-gray-500 mb-2">Retries: {retryCount}/{maxRetries}</p>
          )}
          {canRetry && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleRetryClick}
              className="flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3" />
              Retry
            </Button>
          )}
        </div>
      )}

      {/* Actual image */}
      {effectiveSrc && !hasFailed && (
        <img
          ref={imageRef}
          src={effectiveSrc}
          alt={alt}
          className={cn(
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            className
          )}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}

      {/* Loading indicator for queue position */}
      {isLoading && globalLoadingState.queueLength > 1 && (
        <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
          Queue: {globalLoadingState.queueLength}
        </div>
      )}
    </div>
  );
};

export default StatefulLazyImage;

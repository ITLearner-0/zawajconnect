
import React from 'react';
import { useEnhancedLazyImage } from '@/hooks/useLazyLoading/useEnhancedLazyImage';
import { Skeleton } from '@/components/ui/skeleton';
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
}: LazyImageProps) => {
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
  });

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    handleLoad(event.nativeEvent);
    onLoad?.();
  };

  const handleImageError = () => {
    handleError();
    onError?.();
  };

  return (
    <div ref={elementRef} className={cn('relative overflow-hidden', className)}>
      {!shouldLoad || (!isLoaded && !hasError) ? (
        <Skeleton className={cn('w-full h-full', placeholderClassName)} />
      ) : null}
      
      {shouldLoad && imageSrc && (
        <img
          src={hasError && fallbackSrc ? fallbackSrc : imageSrc}
          alt={alt}
          className={cn(
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            className
          )}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading="lazy"
        />
      )}
    </div>
  );
};

export default LazyImage;

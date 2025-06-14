
import React from 'react';
import { useLazyImage } from '@/hooks/useLazyLoading';
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
}

const LazyImage = ({
  src,
  alt,
  className,
  placeholderClassName,
  fallbackSrc,
  onLoad,
  onError,
}: LazyImageProps) => {
  const {
    elementRef,
    imageSrc,
    isLoaded,
    hasError,
    shouldLoad,
    handleLoad,
    handleError,
  } = useLazyImage(src);

  const handleImageLoad = () => {
    handleLoad();
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
      
      {shouldLoad && (
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

import React, { useState, useCallback } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}

const OptimizedImage = ({
  src,
  alt,
  className = '',
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PC9zdmc+',
  onLoad,
  onError,
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { ref, hasIntersected } = useIntersectionObserver({ threshold: 0.1 });

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setHasError(true);
    onError?.();
  }, [onError]);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      {!hasIntersected && (
        <img
          src={placeholder}
          alt=""
          className="w-full h-full object-cover filter blur-sm"
          aria-hidden="true"
        />
      )}

      {hasIntersected && (
        <img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${hasError ? 'hidden' : ''}`}
        />
      )}

      {hasError && (
        <div className="w-full h-full flex items-center justify-center bg-rose-100 dark:bg-rose-900/30">
          <span className="text-rose-400 text-sm">Image non disponible</span>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;

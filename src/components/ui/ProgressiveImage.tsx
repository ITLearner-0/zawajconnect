
import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface ProgressiveImageProps {
  src: string;
  lowQualitySrc?: string;
  alt: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
  enableBlur?: boolean;
  reducedMotion?: boolean;
}

const ProgressiveImage = ({
  src,
  lowQualitySrc,
  alt,
  className,
  onLoad,
  onError,
  enableBlur = true,
  reducedMotion = false,
}: ProgressiveImageProps) => {
  const [currentSrc, setCurrentSrc] = useState<string | undefined>(lowQualitySrc);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHighQualityLoaded, setIsHighQualityLoaded] = useState(false);

  const handleImageLoad = useCallback(() => {
    setIsLoaded(true);
    if (currentSrc === src) {
      setIsHighQualityLoaded(true);
    }
    onLoad?.();
  }, [currentSrc, src, onLoad]);

  const handleImageError = useCallback(() => {
    onError?.();
  }, [onError]);

  useEffect(() => {
    if (!src) return;

    // Start with low quality if available
    if (lowQualitySrc && !currentSrc) {
      setCurrentSrc(lowQualitySrc);
    }

    // Load high quality image
    const img = new Image();
    img.onload = () => {
      setCurrentSrc(src);
      setIsHighQualityLoaded(true);
    };
    img.onerror = handleImageError;
    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, lowQualitySrc, currentSrc, handleImageError]);

  const isLowQuality = currentSrc === lowQualitySrc && !isHighQualityLoaded;

  return (
    <img
      src={currentSrc}
      alt={alt}
      onLoad={handleImageLoad}
      onError={handleImageError}
      className={cn(
        "transition-all duration-300",
        isLowQuality && enableBlur && "filter blur-sm scale-105",
        isLoaded ? "opacity-100" : "opacity-0",
        !reducedMotion && "transition-all duration-300",
        className
      )}
      loading="lazy"
      aria-label={alt}
    />
  );
};

export default ProgressiveImage;

import React, { useState, useEffect } from 'react';
import { useNetworkOptimization } from '@/hooks/useLazyLoading/useNetworkOptimization';
import LazyImage from './LazyImage';
import { cn } from '@/lib/utils';

interface NetworkOptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholderClassName?: string;
  fallbackSrc?: string;
  onLoad?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
  onError?: () => void;
  enableNetworkOptimization?: boolean;
  enableAdaptiveQuality?: boolean;
  priority?: boolean;
  showNetworkIndicator?: boolean;
}

const NetworkOptimizedImage = ({
  src,
  alt,
  className,
  placeholderClassName,
  fallbackSrc,
  onLoad,
  onError,
  enableNetworkOptimization = true,
  enableAdaptiveQuality = true,
  priority = false,
  showNetworkIndicator = false,
  ...props
}: NetworkOptimizedImageProps) => {
  const [optimizedSrc, setOptimizedSrc] = useState<string>(src);
  const [isOptimized, setIsOptimized] = useState<boolean>(false);

  const networkOptimization = useNetworkOptimization({
    enableAdaptiveLoading: enableNetworkOptimization,
    enableDataSaver: false,
  });

  const {
    optimizeImageUrl,
    getPreloadStrategy,
    isOptimizedForPerformance,
    loadingStrategy,
    isSlowConnection,
    saveData,
  } = networkOptimization;

  // Optimize image URL based on network conditions
  useEffect(() => {
    if (enableAdaptiveQuality && enableNetworkOptimization) {
      const newOptimizedSrc = optimizeImageUrl(src);
      setOptimizedSrc(newOptimizedSrc);
      setIsOptimized(newOptimizedSrc !== src);
    } else {
      setOptimizedSrc(src);
      setIsOptimized(false);
    }
  }, [src, optimizeImageUrl, enableAdaptiveQuality, enableNetworkOptimization]);

  const preloadStrategy = getPreloadStrategy();

  return (
    <div className="relative">
      {showNetworkIndicator && isOptimized && (
        <div className="absolute top-1 right-1 z-10 bg-blue-500 text-white text-xs px-1 rounded">
          {loadingStrategy.imageQuality}
        </div>
      )}

      {showNetworkIndicator && (isSlowConnection || saveData) && (
        <div className="absolute top-1 left-1 z-10 bg-orange-500 text-white text-xs px-1 rounded">
          {saveData ? 'Data Saver' : 'Slow Connection'}
        </div>
      )}

      <LazyImage
        src={optimizedSrc}
        alt={alt}
        className={className}
        placeholderClassName={placeholderClassName}
        fallbackSrc={fallbackSrc}
        onLoad={onLoad}
        onError={onError}
        enableProgressiveLoading={loadingStrategy.enableProgressiveLoading}
        enableRetry={true}
        enableResilientLoading={true}
        enableNetworkOptimization={true}
        maxRetries={isSlowConnection ? 2 : 3}
        showNetworkStatus={showNetworkIndicator}
        {...props}
      />
    </div>
  );
};

export default NetworkOptimizedImage;

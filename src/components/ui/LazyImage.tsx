
import React, { useState } from 'react';
import { useEnhancedLazyImage } from '@/hooks/useLazyLoading/useEnhancedLazyImage';
import { useAccessibleLazyLoading } from '@/hooks/useLazyLoading/useAccessibleLazyLoading';
import { useResilientImageLoading } from '@/hooks/useLazyLoading/useResilientImageLoading';
import { useNetworkStatus } from '@/hooks/useLazyLoading/useNetworkStatus';
import { useEnhancedMonitoring } from '@/hooks/useLazyLoading/useEnhancedMonitoring';
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
  enableDebug?: boolean;
  enablePerformanceMonitoring?: boolean;
  enableAnalytics?: boolean;
  maxRetries?: number;
  showLoadingText?: boolean;
  showNetworkStatus?: boolean;
  showPerformanceInfo?: boolean;
  debugId?: string;
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
  enableDebug = process.env.NODE_ENV === 'development',
  enablePerformanceMonitoring = false,
  enableAnalytics = false,
  maxRetries = 3,
  showLoadingText = false,
  showNetworkStatus = false,
  showPerformanceInfo = false,
  debugId,
}: LazyImageProps) => {
  const [loadState, setLoadState] = useState<'loading' | 'loaded' | 'error' | 'retry'>('loading');

  const { reducedMotion } = useAccessibleLazyLoading({
    threshold: 0.1,
    triggerOnce: true,
    configType: 'image',
  });

  const { isOnline, isSlowConnection } = useNetworkStatus();

  // Enhanced monitoring with analytics, performance, and debug capabilities
  const monitoring = useEnhancedMonitoring<HTMLDivElement>({
    elementId: debugId,
    elementType: 'image',
    enableAnalytics,
    enablePerformanceMonitoring,
    enableDebugMode: enableDebug,
    trackConversions: false,
    threshold: 0.1,
    triggerOnce: true,
  });

  const {
    imageSrc,
    isLoaded,
    hasError,
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
      monitoring.endMonitoring(true);
    },
    onError: (error) => {
      setLoadState('error');
      monitoring.endMonitoring(false);
      monitoring.trackError(error);
      onError?.();
      console.error('Resilient image loading failed:', error);
    },
  });

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    handleLoad(event.nativeEvent);
    setLoadState('loaded');
    monitoring.endMonitoring(true);
    onLoad?.(event);
  };

  const handleImageError = () => {
    handleError();
    const error = new Error('Image failed to load');
    monitoring.trackError(error);
    
    if (enableRetry && resilientLoading.loadAttempt < maxRetries) {
      setLoadState('retry');
      resilientLoading.retry();
    } else {
      setLoadState('error');
      monitoring.endMonitoring(false);
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
        ref={monitoring.elementRef} 
        className={cn('relative overflow-hidden', className)}
        role="img"
        aria-label={alt}
        data-debug-id={enableDebug ? debugId : undefined}
      >
        {/* Performance Info */}
        {showPerformanceInfo && monitoring.performance?.metrics && (
          <div className="absolute top-0 left-0 z-20 bg-black bg-opacity-75 text-white text-xs p-1 rounded-br">
            <div>Grade: {monitoring.performance.getPerformanceGrade()}</div>
            <div>Time: {monitoring.performance.metrics.totalTime.toFixed(0)}ms</div>
            {monitoring.performance.metrics.transferSize > 0 && (
              <div>Size: {(monitoring.performance.metrics.transferSize / 1024).toFixed(1)}KB</div>
            )}
          </div>
        )}

        {/* Analytics Info */}
        {enableAnalytics && monitoring.analytics?.aggregatedMetrics && (
          <div className="absolute top-0 right-0 z-20 bg-blue-900 bg-opacity-75 text-white text-xs p-1 rounded-bl">
            <div>Success: {monitoring.analytics.aggregatedMetrics.successRate.toFixed(1)}%</div>
            <div>Cache: {monitoring.analytics.aggregatedMetrics.cacheHitRate.toFixed(1)}%</div>
          </div>
        )}

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
        {isOnline && (!monitoring.shouldLoad || (!actualIsLoaded && !actualHasError && !resilientLoading.isLoading)) && (
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
        {isOnline && monitoring.shouldLoad && actualImageSrc && !actualHasError && (
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

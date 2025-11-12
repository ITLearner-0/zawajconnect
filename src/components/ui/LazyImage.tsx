import React from 'react';
import LazyImageCore from './lazy-image/LazyImageCore';
import LazyImageStatusIndicators from './lazy-image/LazyImageStatusIndicators';
import LazyImageStates from './lazy-image/LazyImageStates';
import LazyImageAccessibility from './lazy-image/LazyImageAccessibility';
import LazyLoadingErrorBoundary from './LazyLoadingErrorBoundary';
import { useNetworkOptimization } from '@/hooks/useLazyLoading/useNetworkOptimization';
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
  // Network optimization hook
  const networkOptimization = useNetworkOptimization({
    enableAdaptiveLoading: enableNetworkOptimization,
    enableBandwidthMonitoring: enableNetworkOptimization,
  });

  // Use optimized image URL if network optimization is enabled
  const optimizedSrc = enableNetworkOptimization ? networkOptimization.optimizeImageUrl(src) : src;

  // Adjust progressive loading based on network conditions
  const shouldUseProgressiveLoading =
    enableProgressiveLoading ||
    (enableNetworkOptimization && networkOptimization.loadingStrategy.enableProgressiveLoading);

  // Adjust retry attempts based on network conditions
  const optimizedMaxRetries =
    enableNetworkOptimization && networkOptimization.isSlowConnection
      ? Math.min(maxRetries, 2)
      : maxRetries;

  const coreProps = LazyImageCore({
    src: optimizedSrc,
    alt,
    className,
    onLoad,
    onError,
    fallbackSrc,
    enableMemoryOptimization,
    enableRetry,
    enableResilientLoading,
    maxRetries: optimizedMaxRetries,
    debugId,
    enableDebug,
    enablePerformanceMonitoring,
    enableAnalytics,
  });

  const {
    elementRef,
    actualImageSrc,
    actualIsLoaded,
    actualHasError,
    loadState,
    handleImageLoad,
    handleImageError,
    handleRetryClick,
    reducedMotion,
    monitoring,
    resilientLoading,
  } = coreProps;

  return (
    <LazyLoadingErrorBoundary showRetry={enableRetry}>
      <div
        ref={elementRef}
        className={cn('relative overflow-hidden', className)}
        role="img"
        aria-label={alt}
        data-debug-id={enableDebug ? debugId : undefined}
        data-network-optimized={enableNetworkOptimization}
        data-connection-type={
          enableNetworkOptimization ? networkOptimization.effectiveType : undefined
        }
      >
        <LazyImageStatusIndicators
          showNetworkStatus={showNetworkStatus}
          showPerformanceInfo={showPerformanceInfo}
          enableAnalytics={enableAnalytics}
          monitoring={monitoring}
        />

        <LazyImageStates
          actualImageSrc={actualImageSrc}
          actualIsLoaded={actualIsLoaded}
          actualHasError={actualHasError}
          loadState={loadState}
          src={optimizedSrc}
          alt={alt}
          className={className}
          placeholderClassName={placeholderClassName}
          enableProgressiveLoading={shouldUseProgressiveLoading}
          enableRetry={enableRetry}
          showLoadingText={showLoadingText}
          handleImageLoad={handleImageLoad}
          handleImageError={handleImageError}
          handleRetryClick={handleRetryClick}
          reducedMotion={reducedMotion}
          monitoring={monitoring}
          resilientLoading={resilientLoading}
        />

        <LazyImageAccessibility loadState={loadState} />
      </div>
    </LazyLoadingErrorBoundary>
  );
};

export default LazyImage;

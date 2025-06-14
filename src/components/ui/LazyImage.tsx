
import React from 'react';
import LazyImageCore from './lazy-image/LazyImageCore';
import LazyImageStatusIndicators from './lazy-image/LazyImageStatusIndicators';
import LazyImageStates from './lazy-image/LazyImageStates';
import LazyImageAccessibility from './lazy-image/LazyImageAccessibility';
import LazyLoadingErrorBoundary from './LazyLoadingErrorBoundary';
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
  const coreProps = LazyImageCore({
    src,
    alt,
    className,
    onLoad,
    onError,
    fallbackSrc,
    enableMemoryOptimization,
    enableRetry,
    enableResilientLoading,
    maxRetries,
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
          src={src}
          alt={alt}
          className={className}
          placeholderClassName={placeholderClassName}
          enableProgressiveLoading={enableProgressiveLoading}
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

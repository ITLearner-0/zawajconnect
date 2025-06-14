
import React, { useState } from 'react';
import { useEnhancedLazyImage } from '@/hooks/useLazyLoading/useEnhancedLazyImage';
import { useAccessibleLazyLoading } from '@/hooks/useLazyLoading/useAccessibleLazyLoading';
import { useResilientImageLoading } from '@/hooks/useLazyLoading/useResilientImageLoading';
import { useEnhancedMonitoring } from '@/hooks/useLazyLoading/useEnhancedMonitoring';
import { cn } from '@/lib/utils';

interface LazyImageCoreProps {
  src: string;
  alt: string;
  className?: string;
  onLoad?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
  onError?: () => void;
  fallbackSrc?: string;
  enableMemoryOptimization?: boolean;
  enableRetry?: boolean;
  enableResilientLoading?: boolean;
  maxRetries?: number;
  debugId?: string;
  enableDebug?: boolean;
  enablePerformanceMonitoring?: boolean;
  enableAnalytics?: boolean;
}

const LazyImageCore = ({
  src,
  alt,
  className,
  onLoad,
  onError,
  fallbackSrc,
  enableMemoryOptimization = true,
  enableRetry = true,
  enableResilientLoading = true,
  maxRetries = 3,
  debugId,
  enableDebug = process.env.NODE_ENV === 'development',
  enablePerformanceMonitoring = false,
  enableAnalytics = false,
}: LazyImageCoreProps) => {
  const [loadState, setLoadState] = useState<'loading' | 'loaded' | 'error' | 'retry'>('loading');

  const { reducedMotion } = useAccessibleLazyLoading({
    threshold: 0.1,
    triggerOnce: true,
    configType: 'image',
  });

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
    enableProgressiveLoading: false,
    fallbackSources: fallbackSrc ? [fallbackSrc] : [],
    maxRetries: enableRetry ? maxRetries : 1,
  });

  const resilientLoading = useResilientImageLoading({
    src,
    fallbackSources: fallbackSrc ? [fallbackSrc] : [],
    enableNetworkOptimization: true,
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

  return {
    elementRef: monitoring.elementRef,
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
  };
};

export default LazyImageCore;

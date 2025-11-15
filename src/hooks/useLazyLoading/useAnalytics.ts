import { useEffect, useRef, useState, useCallback } from 'react';
import {
  analyticsService,
  LazyLoadingMetrics,
  AggregatedMetrics,
  UsagePattern,
} from './services/analyticsService';

interface UseAnalyticsOptions {
  elementId?: string;
  elementType?: 'image' | 'component' | 'content';
  trackConversions?: boolean;
  enableRealTimeMetrics?: boolean;
}

export const useAnalytics = (options: UseAnalyticsOptions = {}) => {
  const {
    elementId = `analytics-${Math.random().toString(36).substr(2, 9)}`,
    elementType = 'image',
    trackConversions = false,
    enableRealTimeMetrics = false,
  } = options;

  const [aggregatedMetrics, setAggregatedMetrics] = useState<AggregatedMetrics | null>(null);
  const [usagePatterns, setUsagePatterns] = useState<Map<string, UsagePattern>>(new Map());
  const elementIdRef = useRef(elementId);
  const startTimeRef = useRef<number>(0);
  const viewStartTimeRef = useRef<number>(0);

  const trackLoadStart = useCallback(() => {
    startTimeRef.current = performance.now();
    analyticsService.trackViewportEntry(elementIdRef.current, Date.now());
  }, []);

  const trackLoadEnd = useCallback(
    (success: boolean = true, additionalMetrics: Partial<LazyLoadingMetrics> = {}) => {
      const loadTime = performance.now() - startTimeRef.current;

      analyticsService.trackLoadEvent(elementIdRef.current, {
        type: elementType,
        loadTime,
        success,
        ...additionalMetrics,
      });
    },
    [elementType]
  );

  const trackError = useCallback(
    (error: Error) => {
      analyticsService.trackLoadEvent(elementIdRef.current, {
        type: elementType,
        success: false,
        errorCount: 1,
      });
    },
    [elementType]
  );

  const trackConversion = useCallback(() => {
    if (trackConversions) {
      analyticsService.trackConversionEvent(elementIdRef.current);
    }
  }, [trackConversions]);

  const trackViewportEntry = useCallback(() => {
    viewStartTimeRef.current = Date.now();
    analyticsService.trackViewportEntry(elementIdRef.current, viewStartTimeRef.current);
  }, []);

  const trackViewportExit = useCallback(() => {
    if (viewStartTimeRef.current > 0) {
      const viewTime = Date.now() - viewStartTimeRef.current;
      // Track view time if needed
      viewStartTimeRef.current = 0;
    }
  }, []);

  // Update metrics periodically if real-time is enabled
  useEffect(() => {
    if (!enableRealTimeMetrics) return;

    const updateMetrics = () => {
      setAggregatedMetrics(analyticsService.getAggregatedMetrics());
      setUsagePatterns(analyticsService.getUsagePatterns());
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [enableRealTimeMetrics]);

  const getElementMetrics = useCallback(() => {
    return analyticsService.getAggregatedMetrics();
  }, []);

  const exportAnalytics = useCallback(() => {
    return analyticsService.exportMetrics();
  }, []);

  const clearAnalytics = useCallback(() => {
    analyticsService.clearMetrics();
    setAggregatedMetrics(null);
    setUsagePatterns(new Map());
  }, []);

  return {
    elementId: elementIdRef.current,
    trackLoadStart,
    trackLoadEnd,
    trackError,
    trackConversion,
    trackViewportEntry,
    trackViewportExit,
    aggregatedMetrics,
    usagePatterns,
    getElementMetrics,
    exportAnalytics,
    clearAnalytics,
  };
};

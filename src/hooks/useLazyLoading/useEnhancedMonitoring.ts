import { useEffect, useRef, useState, useCallback } from 'react';
import { useAnalytics } from './useAnalytics';
import { usePerformanceMonitor } from './usePerformanceMonitor';
import { useDebuggedLazyLoading } from './useDebuggedLazyLoading';

interface UseEnhancedMonitoringOptions {
  elementId?: string;
  elementType?: 'image' | 'component' | 'content';
  enableAnalytics?: boolean;
  enablePerformanceMonitoring?: boolean;
  enableDebugMode?: boolean;
  trackConversions?: boolean;
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export const useEnhancedMonitoring = <T extends HTMLElement = HTMLDivElement>(
  options: UseEnhancedMonitoringOptions = {}
) => {
  const {
    elementId,
    elementType = 'image',
    enableAnalytics = true,
    enablePerformanceMonitoring = true,
    enableDebugMode = process.env.NODE_ENV === 'development',
    trackConversions = false,
    threshold = 0.1,
    rootMargin = '50px',
    triggerOnce = true,
  } = options;

  const [monitoringState, setMonitoringState] = useState({
    isActive: false,
    totalEvents: 0,
    lastEventTime: null as number | null,
    errors: [] as string[],
  });

  // Analytics tracking
  const analytics = useAnalytics({
    elementId,
    elementType,
    trackConversions,
    enableRealTimeMetrics: enableAnalytics,
  });

  // Performance monitoring
  const performance = usePerformanceMonitor(enablePerformanceMonitoring ? elementId : undefined);

  // Debug monitoring
  const debug = useDebuggedLazyLoading<T>({
    threshold,
    rootMargin,
    triggerOnce,
    enableDebug: enableDebugMode,
    debugId: elementId,
  });

  const startMonitoring = useCallback(() => {
    setMonitoringState((prev) => ({
      ...prev,
      isActive: true,
      lastEventTime: Date.now(),
    }));

    if (enableAnalytics) {
      analytics.trackLoadStart();
      analytics.trackViewportEntry();
    }

    if (enablePerformanceMonitoring) {
      performance.startMonitoring();
    }

    if (enableDebugMode) {
      debug.debug.logLoadStart();
    }
  }, [
    enableAnalytics,
    enablePerformanceMonitoring,
    enableDebugMode,
    analytics,
    performance,
    debug,
  ]);

  const endMonitoring = useCallback(
    (success: boolean = true) => {
      setMonitoringState((prev) => ({
        ...prev,
        isActive: false,
        totalEvents: prev.totalEvents + 1,
      }));

      if (enableAnalytics) {
        analytics.trackLoadEnd(success, {
          cacheHit: performance.metrics?.cacheHit || false,
          networkSpeed: navigator.onLine ? 'fast' : 'offline',
        });
      }

      if (enablePerformanceMonitoring) {
        performance.endMonitoring(success);
      }

      if (enableDebugMode) {
        debug.debug.logLoadEnd(success);
      }
    },
    [enableAnalytics, enablePerformanceMonitoring, enableDebugMode, analytics, performance, debug]
  );

  const trackError = useCallback(
    (error: Error) => {
      setMonitoringState((prev) => ({
        ...prev,
        errors: [...prev.errors, error.message],
      }));

      if (enableAnalytics) {
        analytics.trackError(error);
      }

      if (enableDebugMode) {
        debug.debug.logError(error);
      }
    },
    [enableAnalytics, enableDebugMode, analytics, debug]
  );

  const trackConversion = useCallback(() => {
    if (trackConversions && enableAnalytics) {
      analytics.trackConversion();
    }
  }, [trackConversions, enableAnalytics, analytics]);

  const getMonitoringReport = useCallback(() => {
    return {
      state: monitoringState,
      analytics: enableAnalytics ? analytics.aggregatedMetrics : null,
      performance: enablePerformanceMonitoring ? performance.metrics : null,
      debug: enableDebugMode ? debug.debug.metrics : null,
      insights: {
        performanceGrade: performance.getPerformanceGrade?.() || 'unknown',
        optimizationSuggestions: performance.getOptimizationSuggestions?.() || [],
        errorRate: monitoringState.errors.length / Math.max(monitoringState.totalEvents, 1),
      },
    };
  }, [
    monitoringState,
    analytics,
    performance,
    debug,
    enableAnalytics,
    enablePerformanceMonitoring,
    enableDebugMode,
  ]);

  const exportMonitoringData = useCallback(() => {
    const report = getMonitoringReport();
    const analyticsData = enableAnalytics ? analytics.exportAnalytics() : null;

    return JSON.stringify(
      {
        report,
        analyticsData: analyticsData ? JSON.parse(analyticsData) : null,
        exportedAt: new Date().toISOString(),
      },
      null,
      2
    );
  }, [getMonitoringReport, analytics, enableAnalytics]);

  const clearMonitoringData = useCallback(() => {
    setMonitoringState({
      isActive: false,
      totalEvents: 0,
      lastEventTime: null,
      errors: [],
    });

    if (enableAnalytics) {
      analytics.clearAnalytics();
    }
  }, [analytics, enableAnalytics]);

  // Auto-start monitoring when element becomes visible
  useEffect(() => {
    if (debug.shouldLoad && !monitoringState.isActive) {
      startMonitoring();
    }
  }, [debug.shouldLoad, monitoringState.isActive, startMonitoring]);

  return {
    // Element reference and loading state
    elementRef: debug.elementRef,
    isIntersecting: debug.isIntersecting,
    shouldLoad: debug.shouldLoad,
    isPreloading: debug.isPreloading,

    // Monitoring controls
    startMonitoring,
    endMonitoring,
    trackError,
    trackConversion,

    // Monitoring data
    monitoringState,
    analytics: enableAnalytics ? analytics : null,
    performance: enablePerformanceMonitoring ? performance : null,
    debug: enableDebugMode ? debug.debug : null,

    // Reports and export
    getMonitoringReport,
    exportMonitoringData,
    clearMonitoringData,
  };
};

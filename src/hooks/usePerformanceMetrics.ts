
import { useState, useEffect, useCallback } from 'react';
import { logger } from '@/services/logging/LoggingService';
import { PerformanceTracker, PerformanceMetricsState } from '@/services/performance/performanceTracker';
import { PageMetrics } from '@/services/performance/pageMetricsService';

export const usePerformanceMetrics = () => {
  const [metrics, setMetrics] = useState<PerformanceMetricsState>({
    pageMetrics: null,
    componentMetrics: new Map(),
    apiMetrics: [],
    userInteractions: [],
    memoryUsage: 0,
    isTracking: false,
  });

  const [performanceTracker] = useState(() => new PerformanceTracker());

  // Start performance tracking
  const startTracking = useCallback(() => {
    setMetrics(prev => ({ ...prev, isTracking: true }));
    
    // Track page load metrics
    if (typeof window !== 'undefined' && 'performance' in window) {
      const pageMetrics = performanceTracker.measurePageMetrics();
      if (pageMetrics) {
        setMetrics(prev => ({ ...prev, pageMetrics }));
      }

      performanceTracker.setupPerformanceObserver((updatedMetrics) => {
        setMetrics(prev => ({
          ...prev,
          pageMetrics: prev.pageMetrics ? { ...prev.pageMetrics, ...updatedMetrics } : null
        }));
      });

      updateMemoryUsage();
    }
    
    logger.info('Performance metrics tracking started');
  }, [performanceTracker]);

  // Stop performance tracking
  const stopTracking = useCallback(() => {
    setMetrics(prev => ({ ...prev, isTracking: false }));
    performanceTracker.disconnectObserver();
    logger.info('Performance metrics tracking stopped');
  }, [performanceTracker]);

  // Update memory usage
  const updateMemoryUsage = useCallback(() => {
    const memoryUsage = performanceTracker.trackMemoryUsage();
    setMetrics(prev => ({ ...prev, memoryUsage }));
  }, [performanceTracker]);

  // Track component render performance
  const trackComponentRender = useCallback((componentName: string, renderTime: number) => {
    performanceTracker.trackComponentRender(componentName, renderTime);
    setMetrics(prev => ({
      ...prev,
      componentMetrics: performanceTracker.getComponentMetrics()
    }));
  }, [performanceTracker]);

  // Track API call performance
  const trackAPICall = useCallback((endpoint: string, method: string, duration: number, status: number) => {
    performanceTracker.trackAPICall(endpoint, method, duration, status);
    setMetrics(prev => ({
      ...prev,
      apiMetrics: performanceTracker.getAPIMetrics()
    }));
  }, [performanceTracker]);

  // Track user interactions
  const trackUserInteraction = useCallback((action: string, element: string, duration?: number) => {
    performanceTracker.trackUserInteraction(action, element, duration);
    setMetrics(prev => ({
      ...prev,
      userInteractions: performanceTracker.getUserInteractions()
    }));
  }, [performanceTracker]);

  // Start interaction timing
  const startInteraction = useCallback(() => {
    performanceTracker.startInteraction();
  }, [performanceTracker]);

  // End interaction timing
  const endInteraction = useCallback((action: string, element: string) => {
    performanceTracker.endInteraction(action, element);
    setMetrics(prev => ({
      ...prev,
      userInteractions: performanceTracker.getUserInteractions()
    }));
  }, [performanceTracker]);

  // Get performance summary
  const getPerformanceSummary = useCallback(() => {
    const summary = performanceTracker.getPerformanceSummary();
    return {
      page: metrics.pageMetrics,
      ...summary,
      memory: metrics.memoryUsage,
    };
  }, [metrics, performanceTracker]);

  // Clear metrics
  const clearMetrics = useCallback(() => {
    performanceTracker.clearAllMetrics();
    setMetrics({
      pageMetrics: null,
      componentMetrics: new Map(),
      apiMetrics: [],
      userInteractions: [],
      memoryUsage: 0,
      isTracking: metrics.isTracking,
    });
    
    logger.info('Performance metrics cleared');
  }, [metrics.isTracking, performanceTracker]);

  // Auto-start tracking on mount
  useEffect(() => {
    startTracking();
    
    // Update memory usage periodically
    const memoryInterval = setInterval(updateMemoryUsage, 30000); // Every 30 seconds
    
    return () => {
      stopTracking();
      clearInterval(memoryInterval);
    };
  }, [startTracking, stopTracking, updateMemoryUsage]);

  return {
    metrics,
    startTracking,
    stopTracking,
    trackComponentRender,
    trackAPICall,
    trackUserInteraction,
    startInteraction,
    endInteraction,
    getPerformanceSummary,
    clearMetrics,
    isTracking: metrics.isTracking,
  };
};

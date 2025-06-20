
import { useState, useEffect, useCallback, useRef } from 'react';
import { logger } from '@/services/logging/LoggingService';

interface PageMetrics {
  loadTime: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
}

interface ComponentMetrics {
  componentName: string;
  renderTime: number;
  mountTime: number;
  updateCount: number;
  lastUpdate: number;
}

interface APIMetrics {
  endpoint: string;
  method: string;
  duration: number;
  status: number;
  timestamp: number;
}

interface UserInteractionMetrics {
  action: string;
  element: string;
  timestamp: number;
  duration?: number;
}

interface PerformanceMetricsState {
  pageMetrics: PageMetrics | null;
  componentMetrics: Map<string, ComponentMetrics>;
  apiMetrics: APIMetrics[];
  userInteractions: UserInteractionMetrics[];
  memoryUsage: number;
  isTracking: boolean;
}

export const usePerformanceMetrics = () => {
  const [metrics, setMetrics] = useState<PerformanceMetricsState>({
    pageMetrics: null,
    componentMetrics: new Map(),
    apiMetrics: [],
    userInteractions: [],
    memoryUsage: 0,
    isTracking: false,
  });

  const observer = useRef<PerformanceObserver | null>(null);
  const interactionStartTime = useRef<number>(0);

  // Start performance tracking
  const startTracking = useCallback(() => {
    setMetrics(prev => ({ ...prev, isTracking: true }));
    
    // Track page load metrics
    if (typeof window !== 'undefined' && 'performance' in window) {
      measurePageMetrics();
      setupPerformanceObserver();
      trackMemoryUsage();
    }
    
    logger.info('Performance metrics tracking started');
  }, []);

  // Stop performance tracking
  const stopTracking = useCallback(() => {
    setMetrics(prev => ({ ...prev, isTracking: false }));
    
    if (observer.current) {
      observer.current.disconnect();
      observer.current = null;
    }
    
    logger.info('Performance metrics tracking stopped');
  }, []);

  // Measure page load metrics
  const measurePageMetrics = useCallback(() => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paintEntries = performance.getEntriesByType('paint');
    
    if (navigation) {
      const pageMetrics: PageMetrics = {
        loadTime: navigation.loadEventEnd - navigation.fetchStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
        firstContentfulPaint: 0,
        largestContentfulPaint: 0,
        cumulativeLayoutShift: 0,
        firstInputDelay: 0,
      };

      // Get First Contentful Paint
      const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      if (fcpEntry) {
        pageMetrics.firstContentfulPaint = fcpEntry.startTime;
      }

      setMetrics(prev => ({ ...prev, pageMetrics }));
      
      logger.logPerformance('page-load-time', pageMetrics.loadTime);
      logger.logPerformance('dom-content-loaded', pageMetrics.domContentLoaded);
    }
  }, []);

  // Setup Performance Observer for web vitals
  const setupPerformanceObserver = useCallback(() => {
    if ('PerformanceObserver' in window) {
      observer.current = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          switch (entry.entryType) {
            case 'largest-contentful-paint':
              setMetrics(prev => ({
                ...prev,
                pageMetrics: prev.pageMetrics ? {
                  ...prev.pageMetrics,
                  largestContentfulPaint: entry.startTime
                } : null
              }));
              logger.logPerformance('largest-contentful-paint', entry.startTime);
              break;
              
            case 'layout-shift':
              if (!(entry as any).hadRecentInput) {
                setMetrics(prev => ({
                  ...prev,
                  pageMetrics: prev.pageMetrics ? {
                    ...prev.pageMetrics,
                    cumulativeLayoutShift: prev.pageMetrics.cumulativeLayoutShift + (entry as any).value
                  } : null
                }));
              }
              break;
              
            case 'first-input':
              setMetrics(prev => ({
                ...prev,
                pageMetrics: prev.pageMetrics ? {
                  ...prev.pageMetrics,
                  firstInputDelay: (entry as any).processingStart - entry.startTime
                } : null
              }));
              logger.logPerformance('first-input-delay', (entry as any).processingStart - entry.startTime);
              break;
          }
        }
      });

      try {
        observer.current.observe({ entryTypes: ['largest-contentful-paint', 'layout-shift', 'first-input'] });
      } catch (e) {
        console.warn('Some performance metrics not supported');
      }
    }
  }, []);

  // Track memory usage
  const trackMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const memoryUsage = memory.usedJSHeapSize;
      
      setMetrics(prev => ({ ...prev, memoryUsage }));
      logger.logPerformance('memory-usage', memoryUsage / 1024 / 1024, 'MB');
    }
  }, []);

  // Track component render performance
  const trackComponentRender = useCallback((componentName: string, renderTime: number) => {
    setMetrics(prev => {
      const newComponentMetrics = new Map(prev.componentMetrics);
      const existing = newComponentMetrics.get(componentName);
      
      if (existing) {
        existing.renderTime = renderTime;
        existing.updateCount += 1;
        existing.lastUpdate = Date.now();
      } else {
        newComponentMetrics.set(componentName, {
          componentName,
          renderTime,
          mountTime: Date.now(),
          updateCount: 1,
          lastUpdate: Date.now(),
        });
      }
      
      return { ...prev, componentMetrics: newComponentMetrics };
    });
    
    logger.logPerformance(`component-render-${componentName}`, renderTime);
  }, []);

  // Track API call performance
  const trackAPICall = useCallback((endpoint: string, method: string, duration: number, status: number) => {
    const apiMetric: APIMetrics = {
      endpoint,
      method,
      duration,
      status,
      timestamp: Date.now(),
    };
    
    setMetrics(prev => ({
      ...prev,
      apiMetrics: [...prev.apiMetrics.slice(-99), apiMetric], // Keep last 100 API calls
    }));
    
    logger.logApiCall(endpoint, method, duration, status);
  }, []);

  // Track user interactions
  const trackUserInteraction = useCallback((action: string, element: string, duration?: number) => {
    const interaction: UserInteractionMetrics = {
      action,
      element,
      timestamp: Date.now(),
      duration,
    };
    
    setMetrics(prev => ({
      ...prev,
      userInteractions: [...prev.userInteractions.slice(-199), interaction], // Keep last 200 interactions
    }));
    
    logger.logUserAction(action, element, { duration });
  }, []);

  // Start interaction timing
  const startInteraction = useCallback(() => {
    interactionStartTime.current = performance.now();
  }, []);

  // End interaction timing
  const endInteraction = useCallback((action: string, element: string) => {
    const duration = performance.now() - interactionStartTime.current;
    trackUserInteraction(action, element, duration);
  }, [trackUserInteraction]);

  // Get performance summary
  const getPerformanceSummary = useCallback(() => {
    const { pageMetrics, componentMetrics, apiMetrics, userInteractions } = metrics;
    
    return {
      page: pageMetrics,
      components: {
        total: componentMetrics.size,
        slowest: Array.from(componentMetrics.values()).sort((a, b) => b.renderTime - a.renderTime)[0],
        mostUpdated: Array.from(componentMetrics.values()).sort((a, b) => b.updateCount - a.updateCount)[0],
      },
      api: {
        total: apiMetrics.length,
        averageResponseTime: apiMetrics.length > 0 
          ? apiMetrics.reduce((sum, metric) => sum + metric.duration, 0) / apiMetrics.length 
          : 0,
        errorRate: apiMetrics.length > 0 
          ? (apiMetrics.filter(metric => metric.status >= 400).length / apiMetrics.length) * 100 
          : 0,
      },
      interactions: {
        total: userInteractions.length,
        averageResponseTime: userInteractions
          .filter(i => i.duration)
          .reduce((sum, i, _, arr) => sum + (i.duration! / arr.length), 0),
      },
      memory: metrics.memoryUsage,
    };
  }, [metrics]);

  // Clear metrics
  const clearMetrics = useCallback(() => {
    setMetrics({
      pageMetrics: null,
      componentMetrics: new Map(),
      apiMetrics: [],
      userInteractions: [],
      memoryUsage: 0,
      isTracking: metrics.isTracking,
    });
    
    logger.info('Performance metrics cleared');
  }, [metrics.isTracking]);

  // Auto-start tracking on mount
  useEffect(() => {
    startTracking();
    
    // Update memory usage periodically
    const memoryInterval = setInterval(trackMemoryUsage, 30000); // Every 30 seconds
    
    return () => {
      stopTracking();
      clearInterval(memoryInterval);
    };
  }, [startTracking, stopTracking, trackMemoryUsage]);

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

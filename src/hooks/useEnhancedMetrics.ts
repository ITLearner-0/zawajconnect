
import { useEffect, useRef } from 'react';
import { useMetrics } from '@/services/analytics/metricsService';
import { performanceOptimizer } from '@/utils/performance/performanceOptimizer';
import { performance } from '@/utils/helpers/performance';

interface UseEnhancedMetricsOptions {
  trackPageViews?: boolean;
  trackPerformance?: boolean;
  trackErrors?: boolean;
  trackUserInteractions?: boolean;
  componentName?: string;
}

export const useEnhancedMetrics = (options: UseEnhancedMetricsOptions = {}) => {
  const {
    trackPageViews = true,
    trackPerformance = true,
    trackErrors = true,
    trackUserInteractions = true,
    componentName
  } = options;

  const metrics = useMetrics();
  const measurementId = useRef<string | null>(null);
  const mounted = useRef(false);

  // Track component mount performance
  useEffect(() => {
    if (trackPerformance && componentName) {
      measurementId.current = performanceOptimizer.startMeasure(`component-mount-${componentName}`);
    }

    mounted.current = true;

    return () => {
      if (measurementId.current) {
        performanceOptimizer.endMeasure(measurementId.current);
      }
      mounted.current = false;
    };
  }, [trackPerformance, componentName]);

  // Track page views
  useEffect(() => {
    if (trackPageViews) {
      const path = window.location.pathname;
      metrics.trackAction('page_view', undefined, { path });
      
      // Track page load performance
      if (trackPerformance) {
        performance.getCoreWebVitals().then(vitals => {
          Object.entries(vitals).forEach(([metric, value]) => {
            if (value !== undefined) {
              metrics.trackPerformance(metric, value, 'ms', { path });
            }
          });
        });
      }
    }
  }, [trackPageViews, trackPerformance, metrics]);

  // Track errors
  useEffect(() => {
    if (!trackErrors) return;

    const handleError = (event: ErrorEvent) => {
      metrics.trackError(
        event.message,
        componentName || 'global',
        'high',
        undefined
      );
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      metrics.trackError(
        `Promise rejection: ${event.reason}`,
        componentName || 'global',
        'medium',
        undefined
      );
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [trackErrors, componentName, metrics]);

  // Enhanced tracking functions
  const trackInteraction = (action: string, element?: string, metadata?: Record<string, any>) => {
    if (trackUserInteractions) {
      metrics.trackAction(action, undefined, {
        element,
        component: componentName,
        timestamp: Date.now(),
        ...metadata
      });
    }
  };

  const trackComponentPerformance = async <T>(
    operation: () => Promise<T> | T,
    operationName: string
  ): Promise<T> => {
    if (!trackPerformance) {
      return typeof operation === 'function' ? operation() : operation;
    }

    const { result, duration } = await performance.measureTime(operation, operationName);
    
    metrics.trackPerformance(
      operationName,
      duration,
      'ms',
      { component: componentName }
    );

    return result;
  };

  const trackBusinessMetric = (
    type: 'conversion' | 'engagement' | 'retention' | 'satisfaction',
    value: number,
    metadata?: Record<string, any>
  ) => {
    metrics.trackBusiness(type, value, 'daily');
    
    if (metadata) {
      metrics.trackAction(`business_metric_${type}`, undefined, {
        value,
        component: componentName,
        ...metadata
      });
    }
  };

  return {
    trackInteraction,
    trackComponentPerformance,
    trackBusinessMetric,
    trackError: (error: string, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium') => {
      metrics.trackError(error, componentName || 'unknown', severity);
    },
    trackCustomEvent: (eventName: string, metadata?: Record<string, any>) => {
      metrics.trackAction(eventName, undefined, {
        component: componentName,
        ...metadata
      });
    }
  };
};

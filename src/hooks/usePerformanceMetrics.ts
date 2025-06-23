
import { useState, useEffect, useCallback } from 'react';

export interface PerformanceMetrics {
  // Core Web Vitals
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  fcp: number; // First Contentful Paint
  ttfb: number; // Time to First Byte
  
  // Custom metrics
  componentRenderTime: Record<string, number[]>;
  apiResponseTimes: Record<string, number[]>;
  userInteractions: Array<{
    type: string;
    timestamp: number;
    duration: number;
  }>;
  
  // Resource metrics
  resourceLoadTimes: Record<string, number>;
  memoryUsage: number;
  connectionType: string;
  
  // Additional metrics for PerformanceWidget
  componentMetrics: Map<string, any>;
  apiMetrics: Array<any>;
}

export interface MetricsState {
  pageMetrics: any;
  componentMetrics: Map<string, any>;
  apiMetrics: Array<any>;
  userInteractions: Array<any>;
  memoryUsage: number;
  isTracking: boolean;
}

export const usePerformanceMetrics = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    lcp: 0,
    fid: 0,
    cls: 0,
    fcp: 0,
    ttfb: 0,
    componentRenderTime: {},
    apiResponseTimes: {},
    userInteractions: [],
    resourceLoadTimes: {},
    memoryUsage: 0,
    connectionType: 'unknown',
    componentMetrics: new Map(),
    apiMetrics: []
  });

  const [metricsState, setMetricsState] = useState<MetricsState>({
    pageMetrics: null,
    componentMetrics: new Map(),
    apiMetrics: [],
    userInteractions: [],
    memoryUsage: 0,
    isTracking: false
  });

  const [interactionStart, setInteractionStart] = useState<number>(0);

  // Start tracking
  const startTracking = useCallback(() => {
    setIsTracking(true);
    setMetricsState(prev => ({ ...prev, isTracking: true }));
  }, []);

  // Stop tracking
  const stopTracking = useCallback(() => {
    setIsTracking(false);
    setMetricsState(prev => ({ ...prev, isTracking: false }));
  }, []);

  // Clear metrics
  const clearMetrics = useCallback(() => {
    setMetrics({
      lcp: 0,
      fid: 0,
      cls: 0,
      fcp: 0,
      ttfb: 0,
      componentRenderTime: {},
      apiResponseTimes: {},
      userInteractions: [],
      resourceLoadTimes: {},
      memoryUsage: 0,
      connectionType: 'unknown',
      componentMetrics: new Map(),
      apiMetrics: []
    });
    setMetricsState(prev => ({
      ...prev,
      componentMetrics: new Map(),
      apiMetrics: [],
      userInteractions: [],
      memoryUsage: 0
    }));
  }, []);

  // Mesurer les Core Web Vitals
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const measureWebVitals = () => {
      // LCP - Largest Contentful Paint
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          setMetrics(prev => ({ ...prev, lcp: entry.startTime }));
        }
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // FCP - First Contentful Paint
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            setMetrics(prev => ({ ...prev, fcp: entry.startTime }));
          }
        }
      }).observe({ entryTypes: ['paint'] });

      // CLS - Cumulative Layout Shift
      let clsValue = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
            setMetrics(prev => ({ ...prev, cls: clsValue }));
          }
        }
      }).observe({ entryTypes: ['layout-shift'] });

      // TTFB - Time to First Byte
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        const ttfb = navigation.responseStart - navigation.fetchStart;
        setMetrics(prev => ({ ...prev, ttfb }));
        setMetricsState(prev => ({
          ...prev,
          pageMetrics: { loadTime: navigation.loadEventEnd - navigation.fetchStart, ttfb }
        }));
      }
    };

    measureWebVitals();

    // Mesurer l'utilisation mémoire
    const measureMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const memoryUsage = memory.usedJSHeapSize / memory.totalJSHeapSize;
        setMetrics(prev => ({ ...prev, memoryUsage }));
        setMetricsState(prev => ({ ...prev, memoryUsage: memory.usedJSHeapSize }));
      }
    };

    // Détecter le type de connexion
    const detectConnection = () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        setMetrics(prev => ({
          ...prev,
          connectionType: connection.effectiveType || 'unknown'
        }));
      }
    };

    measureMemory();
    detectConnection();

    // Mesurer périodiquement
    const interval = setInterval(() => {
      measureMemory();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Tracker le temps de rendu des composants
  const trackComponentRender = useCallback((componentName: string, renderTime: number) => {
    setMetrics(prev => ({
      ...prev,
      componentRenderTime: {
        ...prev.componentRenderTime,
        [componentName]: [
          ...(prev.componentRenderTime[componentName] || []).slice(-9),
          renderTime
        ]
      }
    }));

    // Update component metrics for PerformanceWidget
    setMetricsState(prev => {
      const newComponentMetrics = new Map(prev.componentMetrics);
      newComponentMetrics.set(componentName, {
        componentName,
        renderTime,
        updateCount: (newComponentMetrics.get(componentName)?.updateCount || 0) + 1,
        lastUpdate: Date.now()
      });
      return { ...prev, componentMetrics: newComponentMetrics };
    });
  }, []);

  // Tracker les temps de réponse API
  const trackApiResponse = useCallback((endpoint: string, responseTime: number) => {
    setMetrics(prev => ({
      ...prev,
      apiResponseTimes: {
        ...prev.apiResponseTimes,
        [endpoint]: [
          ...(prev.apiResponseTimes[endpoint] || []).slice(-9),
          responseTime
        ]
      }
    }));

    // Update API metrics for PerformanceWidget
    setMetricsState(prev => ({
      ...prev,
      apiMetrics: [
        ...prev.apiMetrics.slice(-99),
        {
          endpoint,
          duration: responseTime,
          status: 200,
          timestamp: Date.now()
        }
      ]
    }));
  }, []);

  // Démarrer le tracking d'une interaction
  const startInteraction = useCallback(() => {
    setInteractionStart(performance.now());
  }, []);

  // Terminer le tracking d'une interaction
  const endInteraction = useCallback((type: string, details?: string) => {
    if (interactionStart > 0) {
      const duration = performance.now() - interactionStart;
      const interaction = {
        type: details ? `${type}:${details}` : type,
        timestamp: Date.now(),
        duration
      };
      
      setMetrics(prev => ({
        ...prev,
        userInteractions: [...prev.userInteractions.slice(-99), interaction]
      }));
      
      setMetricsState(prev => ({
        ...prev,
        userInteractions: [...prev.userInteractions.slice(-99), interaction]
      }));
      
      setInteractionStart(0);
    }
  }, [interactionStart]);

  // Calculer les moyennes
  const getAverageRenderTime = useCallback((componentName: string): number => {
    const times = metrics.componentRenderTime[componentName] || [];
    return times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
  }, [metrics.componentRenderTime]);

  const getAverageApiResponseTime = useCallback((endpoint: string): number => {
    const times = metrics.apiResponseTimes[endpoint] || [];
    return times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
  }, [metrics.apiResponseTimes]);

  // Get performance summary for PerformanceWidget
  const getPerformanceSummary = useCallback(() => {
    return {
      page: metricsState.pageMetrics,
      memory: metricsState.memoryUsage,
      components: {
        total: metricsState.componentMetrics.size,
        slowest: Array.from(metricsState.componentMetrics.values()).sort((a, b) => b.renderTime - a.renderTime)[0],
        mostUpdated: Array.from(metricsState.componentMetrics.values()).sort((a, b) => b.updateCount - a.updateCount)[0],
      },
      api: {
        total: metricsState.apiMetrics.length,
        averageResponseTime: metricsState.apiMetrics.length > 0 
          ? metricsState.apiMetrics.reduce((sum, metric) => sum + metric.duration, 0) / metricsState.apiMetrics.length 
          : 0,
        errorRate: metricsState.apiMetrics.length > 0 
          ? (metricsState.apiMetrics.filter(metric => metric.status >= 400).length / metricsState.apiMetrics.length) * 100 
          : 0,
      },
      interactions: {
        total: metricsState.userInteractions.length,
        averageResponseTime: metricsState.userInteractions
          .filter(i => i.duration)
          .reduce((sum, i, _, arr) => sum + (i.duration! / arr.length), 0),
      },
    };
  }, [metricsState]);

  // Identifier les goulots d'étranglement
  const getPerformanceIssues = useCallback(() => {
    const issues: Array<{ type: string; severity: 'low' | 'medium' | 'high'; description: string }> = [];

    // Vérifier LCP
    if (metrics.lcp > 4000) {
      issues.push({
        type: 'lcp',
        severity: 'high',
        description: `LCP élevé: ${metrics.lcp.toFixed(0)}ms (objectif: <2500ms)`
      });
    } else if (metrics.lcp > 2500) {
      issues.push({
        type: 'lcp',
        severity: 'medium',
        description: `LCP modéré: ${metrics.lcp.toFixed(0)}ms`
      });
    }

    // Vérifier CLS
    if (metrics.cls > 0.25) {
      issues.push({
        type: 'cls',
        severity: 'high',
        description: `CLS élevé: ${metrics.cls.toFixed(3)} (objectif: <0.1)`
      });
    } else if (metrics.cls > 0.1) {
      issues.push({
        type: 'cls',
        severity: 'medium',
        description: `CLS modéré: ${metrics.cls.toFixed(3)}`
      });
    }

    // Vérifier l'utilisation mémoire
    if (metrics.memoryUsage > 0.8) {
      issues.push({
        type: 'memory',
        severity: 'high',
        description: `Utilisation mémoire élevée: ${(metrics.memoryUsage * 100).toFixed(1)}%`
      });
    }

    return issues;
  }, [metrics]);

  // Générer un rapport de performance
  const getPerformanceReport = useCallback(() => {
    return {
      summary: {
        webVitalsScore: calculateWebVitalsScore(metrics),
        performanceIssues: getPerformanceIssues(),
        totalMetrics: Object.keys(metrics.componentRenderTime).length + Object.keys(metrics.apiResponseTimes).length
      },
      coreWebVitals: {
        lcp: metrics.lcp,
        fid: metrics.fid,
        cls: metrics.cls,
        fcp: metrics.fcp,
        ttfb: metrics.ttfb
      },
      components: Object.entries(metrics.componentRenderTime).map(([name, times]) => ({
        name,
        averageRenderTime: times.reduce((a, b) => a + b, 0) / times.length,
        measurements: times.length
      })),
      apis: Object.entries(metrics.apiResponseTimes).map(([endpoint, times]) => ({
        endpoint,
        averageResponseTime: times.reduce((a, b) => a + b, 0) / times.length,
        measurements: times.length
      })),
      interactions: metrics.userInteractions.slice(-20),
      system: {
        memoryUsage: metrics.memoryUsage,
        connectionType: metrics.connectionType
      }
    };
  }, [metrics, getPerformanceIssues]);

  return {
    metrics: metricsState,
    isTracking,
    trackComponentRender,
    trackApiResponse,
    startInteraction,
    endInteraction,
    getAverageRenderTime,
    getAverageApiResponseTime,
    getPerformanceIssues,
    getPerformanceReport,
    getPerformanceSummary,
    clearMetrics,
    startTracking,
    stopTracking
  };
};

// Calculer le score Web Vitals
function calculateWebVitalsScore(metrics: PerformanceMetrics): number {
  let score = 100;
  
  if (metrics.lcp > 4000) score -= 30;
  else if (metrics.lcp > 2500) score -= 15;
  
  if (metrics.cls > 0.25) score -= 25;
  else if (metrics.cls > 0.1) score -= 10;
  
  if (metrics.fcp > 3000) score -= 20;
  else if (metrics.fcp > 1800) score -= 10;
  
  if (metrics.ttfb > 800) score -= 15;
  else if (metrics.ttfb > 600) score -= 8;
  
  return Math.max(0, score);
}

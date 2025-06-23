
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
}

export const usePerformanceMetrics = () => {
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
    connectionType: 'unknown'
  });

  const [interactionStart, setInteractionStart] = useState<number>(0);

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
      }
    };

    measureWebVitals();

    // Mesurer l'utilisation mémoire
    const measureMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMetrics(prev => ({
          ...prev,
          memoryUsage: memory.usedJSHeapSize / memory.totalJSHeapSize
        }));
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
          ...(prev.componentRenderTime[componentName] || []).slice(-9), // Garder 10 dernières mesures
          renderTime
        ]
      }
    }));
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
  }, []);

  // Démarrer le tracking d'une interaction
  const startInteraction = useCallback(() => {
    setInteractionStart(performance.now());
  }, []);

  // Terminer le tracking d'une interaction
  const endInteraction = useCallback((type: string, details?: string) => {
    if (interactionStart > 0) {
      const duration = performance.now() - interactionStart;
      setMetrics(prev => ({
        ...prev,
        userInteractions: [
          ...prev.userInteractions.slice(-99), // Garder 100 dernières interactions
          {
            type: details ? `${type}:${details}` : type,
            timestamp: Date.now(),
            duration
          }
        ]
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

    // Vérifier les temps de rendu des composants
    Object.entries(metrics.componentRenderTime).forEach(([component, times]) => {
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      if (avgTime > 100) {
        issues.push({
          type: 'component',
          severity: avgTime > 200 ? 'high' : 'medium',
          description: `Rendu lent du composant ${component}: ${avgTime.toFixed(1)}ms`
        });
      }
    });

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
      interactions: metrics.userInteractions.slice(-20), // 20 dernières interactions
      system: {
        memoryUsage: metrics.memoryUsage,
        connectionType: metrics.connectionType
      }
    };
  }, [metrics, getPerformanceIssues]);

  return {
    metrics,
    trackComponentRender,
    trackApiResponse,
    startInteraction,
    endInteraction,
    getAverageRenderTime,
    getAverageApiResponseTime,
    getPerformanceIssues,
    getPerformanceReport
  };
};

// Calculer le score Web Vitals
function calculateWebVitalsScore(metrics: PerformanceMetrics): number {
  let score = 100;
  
  // LCP penalty
  if (metrics.lcp > 4000) score -= 30;
  else if (metrics.lcp > 2500) score -= 15;
  
  // CLS penalty
  if (metrics.cls > 0.25) score -= 25;
  else if (metrics.cls > 0.1) score -= 10;
  
  // FCP penalty
  if (metrics.fcp > 3000) score -= 20;
  else if (metrics.fcp > 1800) score -= 10;
  
  // TTFB penalty
  if (metrics.ttfb > 800) score -= 15;
  else if (metrics.ttfb > 600) score -= 8;
  
  return Math.max(0, score);
}

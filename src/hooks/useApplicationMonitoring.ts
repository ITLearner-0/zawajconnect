import { useState, useEffect, useRef, useCallback } from 'react';
import { logger } from '@/services/logging/LoggingService';

interface PerformanceMetrics {
  pageLoadTime: number;
  timeToFirstByte: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  memoryUsage: number;
  connectionType: string;
}

interface ErrorInfo {
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: string;
  url: string;
  userAgent: string;
}

interface UserSession {
  sessionId: string;
  startTime: string;
  pageViews: number;
  actionsCount: number;
  totalTimeSpent: number;
  lastActivity: string;
}

interface MonitoringState {
  isMonitoring: boolean;
  performanceMetrics: PerformanceMetrics | null;
  errors: ErrorInfo[];
  userSession: UserSession;
  networkStatus: 'online' | 'offline';
  isSlowConnection: boolean;
}

export const useApplicationMonitoring = () => {
  const [monitoringState, setMonitoringState] = useState<MonitoringState>({
    isMonitoring: false,
    performanceMetrics: null,
    errors: [],
    userSession: {
      sessionId: `session_${Date.now()}`,
      startTime: new Date().toISOString(),
      pageViews: 0,
      actionsCount: 0,
      totalTimeSpent: 0,
      lastActivity: new Date().toISOString(),
    },
    networkStatus: navigator.onLine ? 'online' : 'offline',
    isSlowConnection: false,
  });

  const sessionStartTime = useRef(Date.now());
  const lastActivityTime = useRef(Date.now());
  const performanceObserver = useRef<PerformanceObserver | null>(null);

  // Start monitoring
  const startMonitoring = useCallback(() => {
    setMonitoringState((prev) => ({ ...prev, isMonitoring: true }));
    logger.info('Application monitoring started');
  }, []);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    setMonitoringState((prev) => ({ ...prev, isMonitoring: false }));
    if (performanceObserver.current) {
      performanceObserver.current.disconnect();
    }
    logger.info('Application monitoring stopped');
  }, []);

  // Track page view
  const trackPageView = useCallback((page: string) => {
    setMonitoringState((prev) => ({
      ...prev,
      userSession: {
        ...prev.userSession,
        pageViews: prev.userSession.pageViews + 1,
        lastActivity: new Date().toISOString(),
      },
    }));

    logger.logPageView(page);
  }, []);

  // Track user action
  const trackUserAction = useCallback(
    (action: string, component: string, metadata?: Record<string, any>) => {
      setMonitoringState((prev) => ({
        ...prev,
        userSession: {
          ...prev.userSession,
          actionsCount: prev.userSession.actionsCount + 1,
          lastActivity: new Date().toISOString(),
        },
      }));

      lastActivityTime.current = Date.now();
      logger.logUserAction(action, component, metadata);
    },
    []
  );

  // Track error
  const trackError = useCallback((error: Error, componentStack?: string) => {
    const errorInfo: ErrorInfo = {
      message: error.message,
      stack: error.stack,
      componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    setMonitoringState((prev) => ({
      ...prev,
      errors: [...prev.errors.slice(-49), errorInfo], // Keep last 50 errors
    }));

    logger.error('Application error', errorInfo);
  }, []);

  // Measure performance metrics
  const measurePerformance = useCallback(() => {
    if (!window.performance) return;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paintEntries = performance.getEntriesByType('paint');

    const metrics: Partial<PerformanceMetrics> = {
      pageLoadTime: navigation?.loadEventEnd - navigation?.fetchStart || 0,
      timeToFirstByte: navigation?.responseStart - navigation?.fetchStart || 0,
      memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
      connectionType: (navigator as any).connection?.effectiveType || 'unknown',
    };

    // First Contentful Paint
    const fcpEntry = paintEntries.find((entry) => entry.name === 'first-contentful-paint');
    if (fcpEntry) {
      metrics.firstContentfulPaint = fcpEntry.startTime;
    }

    // Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            metrics.largestContentfulPaint = entry.startTime;
          }
        }
      });

      try {
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
        performanceObserver.current = observer;
      } catch (e) {
        console.warn('LCP observer not supported');
      }
    }

    setMonitoringState((prev) => ({
      ...prev,
      performanceMetrics: { ...prev.performanceMetrics, ...metrics } as PerformanceMetrics,
    }));

    // Log performance metrics
    Object.entries(metrics).forEach(([key, value]) => {
      if (typeof value === 'number' && value > 0) {
        logger.logPerformance(key, value);
      }
    });
  }, []);

  // Check network speed
  const checkNetworkSpeed = useCallback(() => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      const isSlowConnection =
        connection.effectiveType === 'slow-2g' ||
        connection.effectiveType === '2g' ||
        connection.downlink < 1.5;

      setMonitoringState((prev) => ({
        ...prev,
        isSlowConnection,
      }));

      if (isSlowConnection) {
        logger.warn('Slow network connection detected', {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
        });
      }
    }
  }, []);

  // Update session time
  const updateSessionTime = useCallback(() => {
    const now = Date.now();
    const totalTimeSpent = Math.floor((now - sessionStartTime.current) / 1000);

    setMonitoringState((prev) => ({
      ...prev,
      userSession: {
        ...prev.userSession,
        totalTimeSpent,
      },
    }));
  }, []);

  // Get monitoring report
  const getMonitoringReport = useCallback(() => {
    return {
      session: monitoringState.userSession,
      performance: monitoringState.performanceMetrics,
      errors: monitoringState.errors,
      networkStatus: monitoringState.networkStatus,
      isSlowConnection: monitoringState.isSlowConnection,
      logs: logger.getLocalLogs(),
    };
  }, [monitoringState]);

  // Export monitoring data
  const exportMonitoringData = useCallback(() => {
    const report = getMonitoringReport();
    return JSON.stringify(report, null, 2);
  }, [getMonitoringReport]);

  // Setup event listeners
  useEffect(() => {
    if (!monitoringState.isMonitoring) return;

    // Network status listeners
    const handleOnline = () => {
      setMonitoringState((prev) => ({ ...prev, networkStatus: 'online' }));
      logger.info('Network connection restored');
    };

    const handleOffline = () => {
      setMonitoringState((prev) => ({ ...prev, networkStatus: 'offline' }));
      logger.warn('Network connection lost');
    };

    // Page visibility listener
    const handleVisibilityChange = () => {
      if (document.hidden) {
        logger.debug('Page became hidden');
      } else {
        logger.debug('Page became visible');
        lastActivityTime.current = Date.now();
      }
    };

    // Unhandled error listener
    const handleUnhandledError = (event: ErrorEvent) => {
      trackError(new Error(event.message));
    };

    // Unhandled promise rejection listener
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      trackError(new Error(event.reason));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('error', handleUnhandledError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Periodic updates
    const sessionInterval = setInterval(updateSessionTime, 10000); // Every 10 seconds
    const networkInterval = setInterval(checkNetworkSpeed, 30000); // Every 30 seconds

    // Initial measurements
    setTimeout(measurePerformance, 1000);
    checkNetworkSpeed();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('error', handleUnhandledError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      clearInterval(sessionInterval);
      clearInterval(networkInterval);

      if (performanceObserver.current) {
        performanceObserver.current.disconnect();
      }
    };
  }, [
    monitoringState.isMonitoring,
    trackError,
    updateSessionTime,
    checkNetworkSpeed,
    measurePerformance,
  ]);

  return {
    ...monitoringState,
    startMonitoring,
    stopMonitoring,
    trackPageView,
    trackUserAction,
    trackError,
    measurePerformance,
    getMonitoringReport,
    exportMonitoringData,
  };
};

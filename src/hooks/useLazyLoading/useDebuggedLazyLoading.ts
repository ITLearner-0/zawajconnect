import { useEffect, useRef, useState, useCallback } from 'react';
import { useEnhancedLazyLoading } from './useEnhancedLazyLoading';
import { debugService } from './services/debug/debugService';

interface UseDebuggedLazyLoadingOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  configType?: 'image' | 'matchList' | 'compatibility';
  enablePreload?: boolean;
  debugId?: string;
  enableDebug?: boolean;
}

export const useDebuggedLazyLoading = <T extends HTMLElement = HTMLDivElement>(
  options: UseDebuggedLazyLoadingOptions = {}
) => {
  const {
    debugId = `element-${Math.random().toString(36).substr(2, 9)}`,
    enableDebug = process.env.NODE_ENV === 'development',
    ...lazyOptions
  } = options;

  const debugIdRef = useRef(debugId);
  const [debugMetrics, setDebugMetrics] = useState<any>(null);

  const { elementRef, isIntersecting, shouldLoad, isPreloading, config } =
    useEnhancedLazyLoading<T>(lazyOptions);

  // Debug intersection observer
  useEffect(() => {
    if (!enableDebug) return;

    debugService.startTracking(debugIdRef.current, 'intersection');
    debugService.logEvent(debugIdRef.current, {
      type: 'mount',
      data: { config, options: lazyOptions },
    });

    return () => {
      debugService.endTracking(debugIdRef.current, 'intersection');
      debugService.logEvent(debugIdRef.current, {
        type: 'unmount',
      });
    };
  }, [enableDebug, config, lazyOptions]);

  // Debug intersection changes
  useEffect(() => {
    if (!enableDebug) return;

    if (isIntersecting) {
      const duration = debugService.endTracking(debugIdRef.current, 'intersection');
      debugService.logEvent(debugIdRef.current, {
        type: 'intersection',
        data: { isIntersecting, shouldLoad, duration },
      });
    }
  }, [isIntersecting, shouldLoad, enableDebug]);

  // Update debug metrics
  useEffect(() => {
    if (!enableDebug) return;

    const updateMetrics = () => {
      const metrics = debugService.getMetrics(debugIdRef.current);
      setDebugMetrics(metrics);
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 1000);
    return () => clearInterval(interval);
  }, [enableDebug]);

  const logLoadStart = useCallback(() => {
    if (!enableDebug) return;
    debugService.startTracking(debugIdRef.current, 'load');
  }, [enableDebug]);

  const logLoadEnd = useCallback(
    (success: boolean = true) => {
      if (!enableDebug) return;

      const duration = debugService.endTracking(debugIdRef.current, 'load');
      debugService.logEvent(debugIdRef.current, {
        type: success ? 'load' : 'error',
        data: { duration, success },
      });

      if (!success) {
        debugService.incrementError(debugIdRef.current);
      }
    },
    [enableDebug]
  );

  const logRetry = useCallback(() => {
    if (!enableDebug) return;

    debugService.incrementRetry(debugIdRef.current);
    debugService.logEvent(debugIdRef.current, {
      type: 'retry',
    });
  }, [enableDebug]);

  const logError = useCallback(
    (error: Error) => {
      if (!enableDebug) return;

      debugService.incrementError(debugIdRef.current, error);
      debugService.logEvent(debugIdRef.current, {
        type: 'error',
        data: { error: error.message, stack: error.stack },
      });
    },
    [enableDebug]
  );

  return {
    elementRef,
    isIntersecting,
    shouldLoad,
    isPreloading,
    config,
    debug: {
      elementId: debugIdRef.current,
      metrics: debugMetrics,
      logLoadStart,
      logLoadEnd,
      logRetry,
      logError,
    },
  };
};


// Performance utilities for optimization
export const performance = {
  // Debounce function
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  // Throttle function
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  // Measure execution time
  measureTime: async <T>(
    operation: () => Promise<T> | T,
    label?: string
  ): Promise<{ result: T; duration: number }> => {
    const start = globalThis.performance.now();
    const result = await operation();
    const duration = globalThis.performance.now() - start;
    
    if (label) {
      console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`);
    }
    
    return { result, duration };
  },

  // Memory usage helper
  getMemoryUsage: (): string => {
    if ('memory' in globalThis.performance) {
      const memory = (globalThis.performance as any).memory;
      return `Used: ${(memory.usedJSHeapSize / 1048576).toFixed(2)}MB / Limit: ${(memory.jsHeapSizeLimit / 1048576).toFixed(2)}MB`;
    }
    return 'Memory info not available';
  },

  // Advanced performance monitoring
  startProfiling: (name: string): { end: () => number } => {
    const start = globalThis.performance.now();
    globalThis.performance.mark(`${name}-start`);
    
    return {
      end: () => {
        const end = globalThis.performance.now();
        globalThis.performance.mark(`${name}-end`);
        globalThis.performance.measure(name, `${name}-start`, `${name}-end`);
        const duration = end - start;
        console.log(`🚀 Performance Profile [${name}]: ${duration.toFixed(2)}ms`);
        return duration;
      }
    };
  },

  // Resource timing analysis
  getResourceTimings: (): {
    scripts: number;
    stylesheets: number;
    images: number;
    other: number;
    totalSize: number;
  } => {
    const resources = globalThis.performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const analysis = {
      scripts: 0,
      stylesheets: 0,
      images: 0,
      other: 0,
      totalSize: 0
    };

    resources.forEach(resource => {
      const size = resource.transferSize || 0;
      analysis.totalSize += size;

      if (resource.name.includes('.js')) {
        analysis.scripts += size;
      } else if (resource.name.includes('.css')) {
        analysis.stylesheets += size;
      } else if (resource.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
        analysis.images += size;
      } else {
        analysis.other += size;
      }
    });

    return analysis;
  },

  // Core Web Vitals
  getCoreWebVitals: (): Promise<{
    lcp?: number;
    fid?: number;
    cls?: number;
    fcp?: number;
    ttfb?: number;
  }> => {
    return new Promise((resolve) => {
      const vitals: any = {};

      // First Contentful Paint
      const fcpEntry = globalThis.performance.getEntriesByName('first-contentful-paint')[0];
      if (fcpEntry) {
        vitals.fcp = fcpEntry.startTime;
      }

      // Time to First Byte
      const navigationEntry = globalThis.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigationEntry) {
        vitals.ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
      }

      // Largest Contentful Paint
      if ('PerformanceObserver' in window) {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry) {
            vitals.lcp = lastEntry.startTime;
          }
        });

        try {
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (e) {
          console.warn('LCP observation not supported');
        }

        // Cumulative Layout Shift
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          list.getEntries().forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          vitals.cls = clsValue;
        });

        try {
          clsObserver.observe({ entryTypes: ['layout-shift'] });
        } catch (e) {
          console.warn('CLS observation not supported');
        }
      }

      // Return what we have after a delay
      setTimeout(() => resolve(vitals), 1000);
    });
  }
};

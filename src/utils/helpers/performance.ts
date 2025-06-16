
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
};

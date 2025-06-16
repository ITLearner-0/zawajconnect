
// Core performance measurement utilities
export const performanceCore = {
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

  // Memory usage helper
  getMemoryUsage: (): string => {
    if ('memory' in globalThis.performance) {
      const memory = (globalThis.performance as any).memory;
      return `Used: ${(memory.usedJSHeapSize / 1048576).toFixed(2)}MB / Limit: ${(memory.jsHeapSizeLimit / 1048576).toFixed(2)}MB`;
    }
    return 'Memory info not available';
  }
};

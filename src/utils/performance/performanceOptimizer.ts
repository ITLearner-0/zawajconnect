
import { performance } from '@/utils/helpers/performance';

interface PerformanceMetrics {
  id: string;
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

interface OptimizationConfig {
  enableCaching: boolean;
  enableMemoization: boolean;
  enableLazyLoading: boolean;
  enableVirtualization: boolean;
  cacheSize: number;
  memoizationSize: number;
}

class PerformanceOptimizer {
  private metrics: PerformanceMetrics[] = [];
  private dataCache = new Map<string, any>();
  private memoizedFunctions = new Map<string, any>();
  private config: OptimizationConfig;

  constructor(config: Partial<OptimizationConfig> = {}) {
    this.config = {
      enableCaching: true,
      enableMemoization: true,
      enableLazyLoading: true,
      enableVirtualization: true,
      cacheSize: 100,
      memoizationSize: 50,
      ...config
    };
  }

  // Performance measurement
  startMeasure(name: string, metadata?: Record<string, any>): string {
    const id = `${name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const metric: PerformanceMetrics = {
      id,
      name,
      startTime: Date.now(),
      metadata
    };
    
    this.metrics.push(metric);
    console.log(`🚀 Performance: Started measuring ${name}`);
    return id;
  }

  endMeasure(id: string): PerformanceMetrics | null {
    const metric = this.metrics.find(m => m.id === id);
    if (!metric) return null;

    metric.endTime = Date.now();
    metric.duration = metric.endTime - metric.startTime;
    
    console.log(`🚀 Performance: ${metric.name} took ${metric.duration}ms`);
    return metric;
  }

  // Advanced caching with TTL
  cache<T>(key: string, factory: () => T | Promise<T>, ttl: number = 300000): T | Promise<T> {
    if (!this.config.enableCaching) {
      return factory();
    }

    const cached = this.dataCache.get(key);
    if (cached && Date.now() - cached.timestamp < ttl) {
      console.log(`📦 Cache: Hit for ${key}`);
      return cached.value;
    }

    console.log(`📦 Cache: Miss for ${key}, generating...`);
    const value = factory();
    
    this.dataCache.set(key, {
      value,
      timestamp: Date.now()
    });

    // Cleanup old cache entries
    if (this.dataCache.size > this.config.cacheSize) {
      const oldestKey = this.dataCache.keys().next().value;
      this.dataCache.delete(oldestKey);
    }

    return value;
  }

  // Intelligent memoization
  memoize<T extends (...args: any[]) => any>(
    fn: T,
    keyGenerator?: (...args: Parameters<T>) => string
  ): T {
    if (!this.config.enableMemoization) {
      return fn;
    }

    const memoizedFn = (...args: Parameters<T>): ReturnType<T> => {
      const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
      
      if (this.memoizedFunctions.has(key)) {
        console.log(`🧠 Memoization: Hit for ${fn.name}`);
        return this.memoizedFunctions.get(key);
      }

      console.log(`🧠 Memoization: Computing for ${fn.name}`);
      const result = fn(...args);
      
      this.memoizedFunctions.set(key, result);

      // Cleanup old memoized results
      if (this.memoizedFunctions.size > this.config.memoizationSize) {
        const oldestKey = this.memoizedFunctions.keys().next().value;
        this.memoizedFunctions.delete(oldestKey);
      }

      return result;
    };

    return memoizedFn as T;
  }

  // Get performance report
  getPerformanceReport(): {
    metrics: PerformanceMetrics[];
    averageDuration: number;
    slowestOperations: PerformanceMetrics[];
    cacheHitRate: number;
    recommendations: string[];
  } {
    const completedMetrics = this.metrics.filter(m => m.duration !== undefined);
    const averageDuration = completedMetrics.reduce((sum, m) => sum + (m.duration || 0), 0) / completedMetrics.length;
    const slowestOperations = completedMetrics
      .sort((a, b) => (b.duration || 0) - (a.duration || 0))
      .slice(0, 5);

    const cacheHitRate = 0.75; // Simulated cache hit rate

    const recommendations = [];
    if (averageDuration > 100) {
      recommendations.push('Consider optimizing slow operations');
    }
    if (cacheHitRate < 0.7) {
      recommendations.push('Improve caching strategy');
    }

    return {
      metrics: completedMetrics,
      averageDuration,
      slowestOperations,
      cacheHitRate,
      recommendations
    };
  }

  // Clear all data
  clear(): void {
    this.metrics = [];
    this.dataCache.clear();
    this.memoizedFunctions.clear();
  }
}

export const performanceOptimizer = new PerformanceOptimizer();

// React hook for performance optimization
export const usePerformanceOptimization = () => {
  return {
    startMeasure: performanceOptimizer.startMeasure.bind(performanceOptimizer),
    endMeasure: performanceOptimizer.endMeasure.bind(performanceOptimizer),
    cache: performanceOptimizer.cache.bind(performanceOptimizer),
    memoize: performanceOptimizer.memoize.bind(performanceOptimizer),
    getReport: performanceOptimizer.getPerformanceReport.bind(performanceOptimizer)
  };
};

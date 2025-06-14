
import { PerformanceMetrics } from './types';
import { DebugLogger } from './logger';

export class PerformanceTracker {
  private performance: Map<string, PerformanceMetrics> = new Map();
  private startTimes: Map<string, number> = new Map();

  constructor(
    private logger: DebugLogger,
    private enableTracking: boolean = true
  ) {}

  startTracking(elementId: string, type: 'intersection' | 'load' | 'render' = 'load'): void {
    if (!this.enableTracking) return;
    
    const key = `${elementId}-${type}`;
    this.startTimes.set(key, performance.now());
    this.logger.log('debug', `Started tracking ${type} for ${elementId}`);
  }

  endTracking(elementId: string, type: 'intersection' | 'load' | 'render' = 'load'): number {
    if (!this.enableTracking) return 0;
    
    const key = `${elementId}-${type}`;
    const startTime = this.startTimes.get(key);
    
    if (!startTime) return 0;
    
    const duration = performance.now() - startTime;
    this.startTimes.delete(key);
    
    // Update performance metrics
    const metrics = this.performance.get(elementId) || {
      loadTime: 0,
      intersectionTime: 0,
      renderTime: 0,
      retryCount: 0,
      errorCount: 0,
    };
    
    switch (type) {
      case 'intersection':
        metrics.intersectionTime = duration;
        break;
      case 'load':
        metrics.loadTime = duration;
        break;
      case 'render':
        metrics.renderTime = duration;
        break;
    }
    
    this.performance.set(elementId, metrics);
    this.logger.log('debug', `${type} completed for ${elementId} in ${duration.toFixed(2)}ms`);
    
    return duration;
  }

  incrementRetry(elementId: string): void {
    const metrics = this.getOrCreateMetrics(elementId);
    metrics.retryCount++;
    this.performance.set(elementId, metrics);
    this.logger.log('warn', `Retry attempt ${metrics.retryCount} for ${elementId}`);
  }

  incrementError(elementId: string, error?: Error): void {
    const metrics = this.getOrCreateMetrics(elementId);
    metrics.errorCount++;
    this.performance.set(elementId, metrics);
    this.logger.log('error', `Error ${metrics.errorCount} for ${elementId}`, error);
  }

  getMetrics(elementId?: string): Map<string, PerformanceMetrics> | PerformanceMetrics | null {
    if (elementId) {
      return this.performance.get(elementId) || null;
    }
    return this.performance;
  }

  clearMetrics(elementId?: string): void {
    if (elementId) {
      this.performance.delete(elementId);
    } else {
      this.performance.clear();
    }
  }

  private getOrCreateMetrics(elementId: string): PerformanceMetrics {
    return this.performance.get(elementId) || {
      loadTime: 0,
      intersectionTime: 0,
      renderTime: 0,
      retryCount: 0,
      errorCount: 0,
    };
  }
}

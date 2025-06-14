
interface DebugConfig {
  enableLogging: boolean;
  enablePerformanceTracking: boolean;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  trackingPrefix: string;
}

interface PerformanceMetrics {
  loadTime: number;
  intersectionTime: number;
  renderTime: number;
  retryCount: number;
  errorCount: number;
}

interface LazyLoadingEvent {
  type: 'intersection' | 'load' | 'error' | 'retry' | 'mount' | 'unmount';
  timestamp: number;
  elementId?: string;
  data?: any;
  performance?: Partial<PerformanceMetrics>;
}

class LazyLoadingDebugService {
  private static instance: LazyLoadingDebugService;
  private config: DebugConfig = {
    enableLogging: process.env.NODE_ENV === 'development',
    enablePerformanceTracking: true,
    logLevel: 'info',
    trackingPrefix: '[LazyLoading]',
  };
  
  private events: Map<string, LazyLoadingEvent[]> = new Map();
  private performance: Map<string, PerformanceMetrics> = new Map();
  private startTimes: Map<string, number> = new Map();

  static getInstance(): LazyLoadingDebugService {
    if (!LazyLoadingDebugService.instance) {
      LazyLoadingDebugService.instance = new LazyLoadingDebugService();
    }
    return LazyLoadingDebugService.instance;
  }

  configure(config: Partial<DebugConfig>): void {
    this.config = { ...this.config, ...config };
  }

  startTracking(elementId: string, type: 'intersection' | 'load' | 'render' = 'load'): void {
    if (!this.config.enablePerformanceTracking) return;
    
    const key = `${elementId}-${type}`;
    this.startTimes.set(key, performance.now());
    this.log('debug', `Started tracking ${type} for ${elementId}`);
  }

  endTracking(elementId: string, type: 'intersection' | 'load' | 'render' = 'load'): number {
    if (!this.config.enablePerformanceTracking) return 0;
    
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
    this.log('debug', `${type} completed for ${elementId} in ${duration.toFixed(2)}ms`);
    
    return duration;
  }

  logEvent(elementId: string, event: Omit<LazyLoadingEvent, 'timestamp'>): void {
    if (!this.config.enableLogging) return;
    
    const fullEvent: LazyLoadingEvent = {
      ...event,
      timestamp: Date.now(),
    };
    
    const events = this.events.get(elementId) || [];
    events.push(fullEvent);
    this.events.set(elementId, events);
    
    this.log('debug', `Event: ${event.type}`, { elementId, ...event.data });
  }

  incrementRetry(elementId: string): void {
    const metrics = this.performance.get(elementId) || {
      loadTime: 0,
      intersectionTime: 0,
      renderTime: 0,
      retryCount: 0,
      errorCount: 0,
    };
    
    metrics.retryCount++;
    this.performance.set(elementId, metrics);
    this.log('warn', `Retry attempt ${metrics.retryCount} for ${elementId}`);
  }

  incrementError(elementId: string, error?: Error): void {
    const metrics = this.performance.get(elementId) || {
      loadTime: 0,
      intersectionTime: 0,
      renderTime: 0,
      retryCount: 0,
      errorCount: 0,
    };
    
    metrics.errorCount++;
    this.performance.set(elementId, metrics);
    this.log('error', `Error ${metrics.errorCount} for ${elementId}`, error);
  }

  getMetrics(elementId?: string): Map<string, PerformanceMetrics> | PerformanceMetrics | null {
    if (elementId) {
      return this.performance.get(elementId) || null;
    }
    return this.performance;
  }

  getEvents(elementId?: string): LazyLoadingEvent[] {
    if (elementId) {
      return this.events.get(elementId) || [];
    }
    return Array.from(this.events.values()).flat();
  }

  generateReport(elementId?: string): string {
    const metrics = elementId ? 
      new Map([[elementId, this.performance.get(elementId)!]]) : 
      this.performance;
    
    let report = `${this.config.trackingPrefix} Performance Report\n`;
    report += `Generated at: ${new Date().toISOString()}\n\n`;
    
    metrics.forEach((metric, id) => {
      if (!metric) return;
      
      report += `Element: ${id}\n`;
      report += `  Load Time: ${metric.loadTime.toFixed(2)}ms\n`;
      report += `  Intersection Time: ${metric.intersectionTime.toFixed(2)}ms\n`;
      report += `  Render Time: ${metric.renderTime.toFixed(2)}ms\n`;
      report += `  Retry Count: ${metric.retryCount}\n`;
      report += `  Error Count: ${metric.errorCount}\n\n`;
    });
    
    return report;
  }

  clearMetrics(elementId?: string): void {
    if (elementId) {
      this.performance.delete(elementId);
      this.events.delete(elementId);
    } else {
      this.performance.clear();
      this.events.clear();
    }
  }

  private log(level: 'error' | 'warn' | 'info' | 'debug', message: string, data?: any): void {
    if (!this.config.enableLogging) return;
    
    const levels = ['error', 'warn', 'info', 'debug'];
    const currentLevelIndex = levels.indexOf(this.config.logLevel);
    const messageLevel = levels.indexOf(level);
    
    if (messageLevel > currentLevelIndex) return;
    
    const prefix = `${this.config.trackingPrefix} [${level.toUpperCase()}]`;
    
    switch (level) {
      case 'error':
        console.error(prefix, message, data);
        break;
      case 'warn':
        console.warn(prefix, message, data);
        break;
      case 'info':
        console.info(prefix, message, data);
        break;
      case 'debug':
        console.log(prefix, message, data);
        break;
    }
  }
}

export const debugService = LazyLoadingDebugService.getInstance();

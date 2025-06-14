
export interface DebugConfig {
  enableLogging: boolean;
  enablePerformanceTracking: boolean;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  trackingPrefix: string;
}

export interface PerformanceMetrics {
  loadTime: number;
  intersectionTime: number;
  renderTime: number;
  retryCount: number;
  errorCount: number;
}

export interface LazyLoadingEvent {
  type: 'intersection' | 'load' | 'error' | 'retry' | 'mount' | 'unmount';
  timestamp: number;
  elementId?: string;
  data?: any;
  performance?: Partial<PerformanceMetrics>;
}

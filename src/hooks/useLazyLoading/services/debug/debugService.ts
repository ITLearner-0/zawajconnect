
import { DebugConfig, PerformanceMetrics, LazyLoadingEvent } from './types';
import { DebugLogger } from './logger';
import { PerformanceTracker } from './performanceTracker';
import { EventTracker } from './eventTracker';
import { ReportGenerator } from './reportGenerator';

class LazyLoadingDebugService {
  private static instance: LazyLoadingDebugService;
  private config: DebugConfig = {
    enableLogging: process.env.NODE_ENV === 'development',
    enablePerformanceTracking: true,
    logLevel: 'info',
    trackingPrefix: '[LazyLoading]',
  };
  
  private logger: DebugLogger;
  private performanceTracker: PerformanceTracker;
  private eventTracker: EventTracker;
  private reportGenerator: ReportGenerator;

  private constructor() {
    this.logger = new DebugLogger(this.config);
    this.performanceTracker = new PerformanceTracker(this.logger, this.config.enablePerformanceTracking);
    this.eventTracker = new EventTracker(this.logger, this.config.enableLogging);
    this.reportGenerator = new ReportGenerator(this.config);
  }

  static getInstance(): LazyLoadingDebugService {
    if (!LazyLoadingDebugService.instance) {
      LazyLoadingDebugService.instance = new LazyLoadingDebugService();
    }
    return LazyLoadingDebugService.instance;
  }

  configure(config: Partial<DebugConfig>): void {
    this.config = { ...this.config, ...config };
    this.logger = new DebugLogger(this.config);
    this.performanceTracker = new PerformanceTracker(this.logger, this.config.enablePerformanceTracking);
    this.eventTracker = new EventTracker(this.logger, this.config.enableLogging);
    this.reportGenerator = new ReportGenerator(this.config);
  }

  // Performance tracking methods
  startTracking(elementId: string, type: 'intersection' | 'load' | 'render' = 'load'): void {
    this.performanceTracker.startTracking(elementId, type);
  }

  endTracking(elementId: string, type: 'intersection' | 'load' | 'render' = 'load'): number {
    return this.performanceTracker.endTracking(elementId, type);
  }

  incrementRetry(elementId: string): void {
    this.performanceTracker.incrementRetry(elementId);
  }

  incrementError(elementId: string, error?: Error): void {
    this.performanceTracker.incrementError(elementId, error);
  }

  // Event tracking methods
  logEvent(elementId: string, event: Omit<LazyLoadingEvent, 'timestamp'>): void {
    this.eventTracker.logEvent(elementId, event);
  }

  // Data retrieval methods
  getMetrics(elementId?: string): Map<string, PerformanceMetrics> | PerformanceMetrics | null {
    return this.performanceTracker.getMetrics(elementId);
  }

  getEvents(elementId?: string): LazyLoadingEvent[] {
    return this.eventTracker.getEvents(elementId);
  }

  // Report generation
  generateReport(elementId?: string): string {
    const performanceData = this.performanceTracker.getMetrics() as Map<string, PerformanceMetrics>;
    return this.reportGenerator.generateReport(performanceData, elementId);
  }

  // Cleanup methods
  clearMetrics(elementId?: string): void {
    this.performanceTracker.clearMetrics(elementId);
    this.eventTracker.clearEvents(elementId);
  }
}

export const debugService = LazyLoadingDebugService.getInstance();

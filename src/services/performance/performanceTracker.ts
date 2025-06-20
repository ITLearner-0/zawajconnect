
import { PageMetricsService, PageMetrics } from './pageMetricsService';
import { ComponentMetricsService, ComponentMetrics } from './componentMetricsService';
import { APIMetricsService, APIMetrics } from './apiMetricsService';
import { UserInteractionService, UserInteractionMetrics } from './userInteractionService';
import { MemoryService } from './memoryService';

export interface PerformanceMetricsState {
  pageMetrics: PageMetrics | null;
  componentMetrics: Map<string, ComponentMetrics>;
  apiMetrics: APIMetrics[];
  userInteractions: UserInteractionMetrics[];
  memoryUsage: number;
  isTracking: boolean;
}

export class PerformanceTracker {
  private pageMetricsService = new PageMetricsService();
  private componentMetricsService = new ComponentMetricsService();
  private apiMetricsService = new APIMetricsService();
  private userInteractionService = new UserInteractionService();
  private memoryService = new MemoryService();

  // Expose service methods
  measurePageMetrics = () => this.pageMetricsService.measurePageMetrics();
  setupPerformanceObserver = (callback: (metrics: Partial<PageMetrics>) => void) => 
    this.pageMetricsService.setupPerformanceObserver(callback);
  disconnectObserver = () => this.pageMetricsService.disconnect();

  trackComponentRender = (componentName: string, renderTime: number) =>
    this.componentMetricsService.trackComponentRender(componentName, renderTime);
  getComponentMetrics = () => this.componentMetricsService.getComponentMetrics();

  trackAPICall = (endpoint: string, method: string, duration: number, status: number) =>
    this.apiMetricsService.trackAPICall(endpoint, method, duration, status);
  getAPIMetrics = () => this.apiMetricsService.getAPIMetrics();

  trackUserInteraction = (action: string, element: string, duration?: number) =>
    this.userInteractionService.trackUserInteraction(action, element, duration);
  startInteraction = () => this.userInteractionService.startInteraction();
  endInteraction = (action: string, element: string) =>
    this.userInteractionService.endInteraction(action, element);
  getUserInteractions = () => this.userInteractionService.getUserInteractions();

  trackMemoryUsage = () => this.memoryService.trackMemoryUsage();

  clearAllMetrics(): void {
    this.componentMetricsService.clearComponentMetrics();
    this.apiMetricsService.clearAPIMetrics();
    this.userInteractionService.clearUserInteractions();
  }

  getPerformanceSummary() {
    const componentMetrics = this.getComponentMetrics();
    const apiMetrics = this.getAPIMetrics();
    const userInteractions = this.getUserInteractions();
    
    return {
      components: {
        total: componentMetrics.size,
        slowest: Array.from(componentMetrics.values()).sort((a, b) => b.renderTime - a.renderTime)[0],
        mostUpdated: Array.from(componentMetrics.values()).sort((a, b) => b.updateCount - a.updateCount)[0],
      },
      api: {
        total: apiMetrics.length,
        averageResponseTime: apiMetrics.length > 0 
          ? apiMetrics.reduce((sum, metric) => sum + metric.duration, 0) / apiMetrics.length 
          : 0,
        errorRate: apiMetrics.length > 0 
          ? (apiMetrics.filter(metric => metric.status >= 400).length / apiMetrics.length) * 100 
          : 0,
      },
      interactions: {
        total: userInteractions.length,
        averageResponseTime: userInteractions
          .filter(i => i.duration)
          .reduce((sum, i, _, arr) => sum + (i.duration! / arr.length), 0),
      },
    };
  }
}

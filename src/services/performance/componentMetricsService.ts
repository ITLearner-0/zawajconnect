import { logger } from '@/services/logging/LoggingService';

export interface ComponentMetrics {
  componentName: string;
  renderTime: number;
  mountTime: number;
  updateCount: number;
  lastUpdate: number;
}

export class ComponentMetricsService {
  private componentMetrics = new Map<string, ComponentMetrics>();

  trackComponentRender(componentName: string, renderTime: number): void {
    const existing = this.componentMetrics.get(componentName);

    if (existing) {
      existing.renderTime = renderTime;
      existing.updateCount += 1;
      existing.lastUpdate = Date.now();
    } else {
      this.componentMetrics.set(componentName, {
        componentName,
        renderTime,
        mountTime: Date.now(),
        updateCount: 1,
        lastUpdate: Date.now(),
      });
    }

    logger.logPerformance(`component-render-${componentName}`, renderTime);
  }

  getComponentMetrics(): Map<string, ComponentMetrics> {
    return new Map(this.componentMetrics);
  }

  clearComponentMetrics(): void {
    this.componentMetrics.clear();
  }
}

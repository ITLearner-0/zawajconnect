import { PerformanceMetrics, DebugConfig } from './types';

export class ReportGenerator {
  constructor(private config: DebugConfig) {}

  generateReport(performanceData: Map<string, PerformanceMetrics>, elementId?: string): string {
    const metrics = elementId
      ? new Map([[elementId, performanceData.get(elementId)!]])
      : performanceData;

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
}

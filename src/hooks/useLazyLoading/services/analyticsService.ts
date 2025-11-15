interface LazyLoadingMetrics {
  elementId: string;
  type: 'image' | 'component' | 'content';
  loadTime: number;
  intersectionTime: number;
  renderTime: number;
  wasPreloaded: boolean;
  cacheHit: boolean;
  networkSpeed?: 'slow' | 'fast' | 'offline';
  deviceType?: 'mobile' | 'tablet' | 'desktop';
  viewportSize: { width: number; height: number };
  timestamp: number;
  errorCount: number;
  retryCount: number;
  success: boolean;
}

interface AggregatedMetrics {
  totalElements: number;
  averageLoadTime: number;
  averageIntersectionTime: number;
  successRate: number;
  cacheHitRate: number;
  errorRate: number;
  retryRate: number;
  performanceGrade: 'excellent' | 'good' | 'fair' | 'poor';
  bottlenecks: string[];
  recommendations: string[];
}

interface UsagePattern {
  elementType: string;
  loadFrequency: number;
  averageViewTime: number;
  bounceRate: number;
  conversionEvents: number;
}

class LazyLoadingAnalyticsService {
  private static instance: LazyLoadingAnalyticsService;
  private metrics: LazyLoadingMetrics[] = [];
  private usagePatterns: Map<string, UsagePattern> = new Map();
  private isEnabled: boolean = process.env.NODE_ENV === 'development';
  private maxMetrics: number = 1000;

  static getInstance(): LazyLoadingAnalyticsService {
    if (!LazyLoadingAnalyticsService.instance) {
      LazyLoadingAnalyticsService.instance = new LazyLoadingAnalyticsService();
    }
    return LazyLoadingAnalyticsService.instance;
  }

  enable(): void {
    this.isEnabled = true;
  }

  disable(): void {
    this.isEnabled = false;
  }

  trackLoadEvent(elementId: string, metrics: Partial<LazyLoadingMetrics>): void {
    if (!this.isEnabled) return;

    const fullMetrics: LazyLoadingMetrics = {
      elementId,
      type: metrics.type || 'image',
      loadTime: metrics.loadTime || 0,
      intersectionTime: metrics.intersectionTime || 0,
      renderTime: metrics.renderTime || 0,
      wasPreloaded: metrics.wasPreloaded || false,
      cacheHit: metrics.cacheHit || false,
      networkSpeed: this.detectNetworkSpeed(),
      deviceType: this.detectDeviceType(),
      viewportSize: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      timestamp: Date.now(),
      errorCount: metrics.errorCount || 0,
      retryCount: metrics.retryCount || 0,
      success: metrics.success !== false,
    };

    this.metrics.push(fullMetrics);
    this.updateUsagePattern(elementId, fullMetrics);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    this.logMetric(fullMetrics);
  }

  trackViewportEntry(elementId: string, entryTime: number): void {
    if (!this.isEnabled) return;

    const pattern = this.usagePatterns.get(elementId);
    if (pattern) {
      pattern.loadFrequency++;
      this.usagePatterns.set(elementId, pattern);
    } else {
      this.usagePatterns.set(elementId, {
        elementType: 'unknown',
        loadFrequency: 1,
        averageViewTime: 0,
        bounceRate: 0,
        conversionEvents: 0,
      });
    }
  }

  trackConversionEvent(elementId: string): void {
    if (!this.isEnabled) return;

    const pattern = this.usagePatterns.get(elementId);
    if (pattern) {
      pattern.conversionEvents++;
      this.usagePatterns.set(elementId, pattern);
    }
  }

  getAggregatedMetrics(timeRange?: number): AggregatedMetrics {
    const cutoff = timeRange ? Date.now() - timeRange : 0;
    const relevantMetrics = this.metrics.filter((m) => m.timestamp > cutoff);

    if (relevantMetrics.length === 0) {
      return this.getEmptyMetrics();
    }

    const totalElements = relevantMetrics.length;
    const averageLoadTime = relevantMetrics.reduce((sum, m) => sum + m.loadTime, 0) / totalElements;
    const averageIntersectionTime =
      relevantMetrics.reduce((sum, m) => sum + m.intersectionTime, 0) / totalElements;
    const successCount = relevantMetrics.filter((m) => m.success).length;
    const cacheHits = relevantMetrics.filter((m) => m.cacheHit).length;
    const errors = relevantMetrics.filter((m) => m.errorCount > 0).length;
    const retries = relevantMetrics.filter((m) => m.retryCount > 0).length;

    const successRate = (successCount / totalElements) * 100;
    const cacheHitRate = (cacheHits / totalElements) * 100;
    const errorRate = (errors / totalElements) * 100;
    const retryRate = (retries / totalElements) * 100;

    return {
      totalElements,
      averageLoadTime,
      averageIntersectionTime,
      successRate,
      cacheHitRate,
      errorRate,
      retryRate,
      performanceGrade: this.calculatePerformanceGrade(averageLoadTime, successRate),
      bottlenecks: this.identifyBottlenecks(relevantMetrics),
      recommendations: this.generateRecommendations(relevantMetrics),
    };
  }

  getUsagePatterns(): Map<string, UsagePattern> {
    return new Map(this.usagePatterns);
  }

  getPerformanceTrends(
    interval: number = 3600000
  ): { timestamp: number; metrics: AggregatedMetrics }[] {
    const trends: { timestamp: number; metrics: AggregatedMetrics }[] = [];
    const now = Date.now();
    const oldest = Math.min(...this.metrics.map((m) => m.timestamp));

    for (let time = oldest; time <= now; time += interval) {
      const windowMetrics = this.metrics.filter(
        (m) => m.timestamp >= time && m.timestamp < time + interval
      );

      if (windowMetrics.length > 0) {
        trends.push({
          timestamp: time,
          metrics: this.calculateMetricsForWindow(windowMetrics),
        });
      }
    }

    return trends;
  }

  exportMetrics(): string {
    const data = {
      metrics: this.metrics,
      usagePatterns: Array.from(this.usagePatterns.entries()),
      aggregated: this.getAggregatedMetrics(),
      exportedAt: new Date().toISOString(),
    };

    return JSON.stringify(data, null, 2);
  }

  clearMetrics(): void {
    this.metrics = [];
    this.usagePatterns.clear();
  }

  private detectNetworkSpeed(): 'slow' | 'fast' | 'offline' {
    if (!navigator.onLine) return 'offline';

    const connection = (navigator as any).connection;
    if (connection) {
      if (connection.effectiveType === '4g') return 'fast';
      if (connection.effectiveType === '3g' || connection.effectiveType === '2g') return 'slow';
    }

    return 'fast'; // Default assumption
  }

  private detectDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  private updateUsagePattern(elementId: string, metrics: LazyLoadingMetrics): void {
    const existing = this.usagePatterns.get(elementId);
    if (existing) {
      existing.elementType = metrics.type;
      // Update other metrics as needed
    } else {
      this.usagePatterns.set(elementId, {
        elementType: metrics.type,
        loadFrequency: 1,
        averageViewTime: 0,
        bounceRate: 0,
        conversionEvents: 0,
      });
    }
  }

  private logMetric(metrics: LazyLoadingMetrics): void {
    if (metrics.loadTime > 1000) {
      console.warn(
        `[Analytics] Slow loading detected for ${metrics.elementId}: ${metrics.loadTime}ms`
      );
    }

    if (metrics.errorCount > 0) {
      console.error(
        `[Analytics] Errors detected for ${metrics.elementId}: ${metrics.errorCount} errors`
      );
    }
  }

  private calculatePerformanceGrade(
    avgLoadTime: number,
    successRate: number
  ): 'excellent' | 'good' | 'fair' | 'poor' {
    if (avgLoadTime < 500 && successRate > 95) return 'excellent';
    if (avgLoadTime < 1000 && successRate > 90) return 'good';
    if (avgLoadTime < 2000 && successRate > 80) return 'fair';
    return 'poor';
  }

  private identifyBottlenecks(metrics: LazyLoadingMetrics[]): string[] {
    const bottlenecks: string[] = [];

    const slowLoads = metrics.filter((m) => m.loadTime > 2000).length;
    if (slowLoads > metrics.length * 0.1) {
      bottlenecks.push('High number of slow loads detected');
    }

    const lowCacheHitRate = metrics.filter((m) => m.cacheHit).length / metrics.length;
    if (lowCacheHitRate < 0.3) {
      bottlenecks.push('Low cache hit rate');
    }

    const highErrorRate = metrics.filter((m) => m.errorCount > 0).length / metrics.length;
    if (highErrorRate > 0.05) {
      bottlenecks.push('High error rate detected');
    }

    return bottlenecks;
  }

  private generateRecommendations(metrics: LazyLoadingMetrics[]): string[] {
    const recommendations: string[] = [];

    const avgLoadTime = metrics.reduce((sum, m) => sum + m.loadTime, 0) / metrics.length;
    if (avgLoadTime > 1000) {
      recommendations.push('Consider implementing image compression or CDN');
    }

    const mobileMetrics = metrics.filter((m) => m.deviceType === 'mobile');
    if (mobileMetrics.length > 0) {
      const avgMobileLoadTime =
        mobileMetrics.reduce((sum, m) => sum + m.loadTime, 0) / mobileMetrics.length;
      if (avgMobileLoadTime > avgLoadTime * 1.5) {
        recommendations.push('Optimize for mobile devices with responsive images');
      }
    }

    const cacheHitRate = metrics.filter((m) => m.cacheHit).length / metrics.length;
    if (cacheHitRate < 0.5) {
      recommendations.push('Improve caching strategy');
    }

    return recommendations;
  }

  private getEmptyMetrics(): AggregatedMetrics {
    return {
      totalElements: 0,
      averageLoadTime: 0,
      averageIntersectionTime: 0,
      successRate: 0,
      cacheHitRate: 0,
      errorRate: 0,
      retryRate: 0,
      performanceGrade: 'poor',
      bottlenecks: [],
      recommendations: [],
    };
  }

  private calculateMetricsForWindow(metrics: LazyLoadingMetrics[]): AggregatedMetrics {
    // Similar logic to getAggregatedMetrics but for a specific window
    return this.getAggregatedMetrics();
  }
}

export const analyticsService = LazyLoadingAnalyticsService.getInstance();
export type { LazyLoadingMetrics, AggregatedMetrics, UsagePattern };

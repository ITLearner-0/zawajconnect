
import { logger } from '@/services/logging/LoggingService';

export interface PageMetrics {
  loadTime: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
}

export class PageMetricsService {
  private observer: PerformanceObserver | null = null;

  measurePageMetrics(): PageMetrics | null {
    if (typeof window === 'undefined' || !window.performance) return null;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paintEntries = performance.getEntriesByType('paint');
    
    if (!navigation) return null;

    const pageMetrics: PageMetrics = {
      loadTime: navigation.loadEventEnd - navigation.fetchStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      cumulativeLayoutShift: 0,
      firstInputDelay: 0,
    };

    // Get First Contentful Paint
    const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    if (fcpEntry) {
      pageMetrics.firstContentfulPaint = fcpEntry.startTime;
    }

    logger.logPerformance('page-load-time', pageMetrics.loadTime);
    logger.logPerformance('dom-content-loaded', pageMetrics.domContentLoaded);

    return pageMetrics;
  }

  setupPerformanceObserver(onMetricUpdate: (metrics: Partial<PageMetrics>) => void): void {
    if (!('PerformanceObserver' in window)) return;

    this.observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        switch (entry.entryType) {
          case 'largest-contentful-paint':
            onMetricUpdate({ largestContentfulPaint: entry.startTime });
            logger.logPerformance('largest-contentful-paint', entry.startTime);
            break;
            
          case 'layout-shift':
            if (!(entry as any).hadRecentInput) {
              onMetricUpdate({ 
                cumulativeLayoutShift: (entry as any).value 
              });
            }
            break;
            
          case 'first-input':
            const firstInputDelay = (entry as any).processingStart - entry.startTime;
            onMetricUpdate({ firstInputDelay });
            logger.logPerformance('first-input-delay', firstInputDelay);
            break;
        }
      }
    });

    try {
      this.observer.observe({ entryTypes: ['largest-contentful-paint', 'layout-shift', 'first-input'] });
    } catch (e) {
      console.warn('Some performance metrics not supported');
    }
  }

  disconnect(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}

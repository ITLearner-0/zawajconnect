import React, { useEffect, useState } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
}

const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.performance) return;

    const measurePerformance = () => {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;

      let fcp = 0;
      let lcp = 0;

      // Get First Contentful Paint
      const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
      if (fcpEntry) {
        fcp = fcpEntry.startTime;
      }

      // Get Largest Contentful Paint
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            lcp = entry.startTime;
          }
        }
      });

      try {
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        // LCP not supported
      }

      setMetrics({
        loadTime: navigation.loadEventEnd - navigation.fetchStart,
        firstContentfulPaint: fcp,
        largestContentfulPaint: lcp,
      });
    };

    // Wait for load event
    if (document.readyState === 'complete') {
      setTimeout(measurePerformance, 100);
    } else {
      window.addEventListener('load', () => {
        setTimeout(measurePerformance, 100);
      });
    }
  }, []);

  // Only show in development
  if (process.env.NODE_ENV !== 'development' || !metrics) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white text-xs p-2 rounded z-50 font-mono">
      <div>Load: {Math.round(metrics.loadTime)}ms</div>
      <div>FCP: {Math.round(metrics.firstContentfulPaint)}ms</div>
      <div>LCP: {Math.round(metrics.largestContentfulPaint)}ms</div>
    </div>
  );
};

export default PerformanceMonitor;

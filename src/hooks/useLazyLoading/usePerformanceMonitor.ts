
import { useEffect, useRef, useState } from 'react';

interface PerformanceEntry {
  name: string;
  startTime: number;
  duration: number;
  transferSize?: number;
  decodedBodySize?: number;
  encodedBodySize?: number;
}

interface ImagePerformanceMetrics {
  fetchTime: number;
  decodeTime: number;
  renderTime: number;
  totalTime: number;
  transferSize: number;
  compressionRatio: number;
  cacheHit: boolean;
}

export const usePerformanceMonitor = (src?: string) => {
  const [metrics, setMetrics] = useState<ImagePerformanceMetrics | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const startTimeRef = useRef<number>(0);
  const decodeStartRef = useRef<number>(0);

  const startMonitoring = () => {
    if (!src) return;
    
    startTimeRef.current = performance.now();
    setIsMonitoring(true);
    setMetrics(null);
  };

  const endMonitoring = (success: boolean = true) => {
    if (!isMonitoring || !src || !success) {
      setIsMonitoring(false);
      return;
    }

    const totalTime = performance.now() - startTimeRef.current;
    
    // Try to get detailed performance data
    try {
      const entries = performance.getEntriesByName(src, 'resource') as PerformanceEntry[];
      const entry = entries[entries.length - 1]; // Get the latest entry
      
      if (entry) {
        const transferSize = entry.transferSize || 0;
        const decodedSize = entry.decodedBodySize || 0;
        const encodedSize = entry.encodedBodySize || 0;
        
        const metrics: ImagePerformanceMetrics = {
          fetchTime: entry.duration,
          decodeTime: decodeStartRef.current > 0 ? performance.now() - decodeStartRef.current : 0,
          renderTime: totalTime - entry.duration,
          totalTime,
          transferSize,
          compressionRatio: decodedSize > 0 ? encodedSize / decodedSize : 1,
          cacheHit: transferSize === 0, // If transfer size is 0, likely from cache
        };
        
        setMetrics(metrics);
      } else {
        // Fallback metrics when detailed data isn't available
        setMetrics({
          fetchTime: totalTime * 0.7, // Estimate
          decodeTime: totalTime * 0.2, // Estimate
          renderTime: totalTime * 0.1, // Estimate
          totalTime,
          transferSize: 0,
          compressionRatio: 1,
          cacheHit: false,
        });
      }
    } catch (error) {
      console.warn('Performance monitoring failed:', error);
    }
    
    setIsMonitoring(false);
  };

  const onDecodeStart = () => {
    decodeStartRef.current = performance.now();
  };

  // Clear old performance entries to prevent memory leaks
  useEffect(() => {
    const cleanup = () => {
      try {
        if ('performance' in window && 'clearResourceTimings' in performance) {
          const entries = performance.getEntriesByType('resource');
          if (entries.length > 100) {
            performance.clearResourceTimings();
          }
        }
      } catch (error) {
        // Ignore cleanup errors
      }
    };

    const interval = setInterval(cleanup, 30000); // Cleanup every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getPerformanceGrade = (): 'excellent' | 'good' | 'fair' | 'poor' => {
    if (!metrics) return 'fair';
    
    const { totalTime, transferSize } = metrics;
    
    // Grade based on total time and file size
    if (totalTime < 200 && transferSize < 50000) return 'excellent';
    if (totalTime < 500 && transferSize < 100000) return 'good';
    if (totalTime < 1000 && transferSize < 200000) return 'fair';
    return 'poor';
  };

  const getOptimizationSuggestions = (): string[] => {
    if (!metrics) return [];
    
    const suggestions: string[] = [];
    
    if (metrics.transferSize > 100000) {
      suggestions.push('Consider compressing the image or using a smaller resolution');
    }
    
    if (metrics.compressionRatio < 0.5) {
      suggestions.push('Image could benefit from better compression (WebP, AVIF)');
    }
    
    if (metrics.fetchTime > 1000) {
      suggestions.push('Network fetch time is high - consider CDN or image optimization');
    }
    
    if (metrics.decodeTime > 100) {
      suggestions.push('Image decode time is high - consider simpler formats');
    }
    
    if (!metrics.cacheHit && metrics.transferSize > 0) {
      suggestions.push('Enable proper caching headers for this image');
    }
    
    return suggestions;
  };

  return {
    metrics,
    isMonitoring,
    startMonitoring,
    endMonitoring,
    onDecodeStart,
    getPerformanceGrade,
    getOptimizationSuggestions,
  };
};

import { useState, useEffect, useCallback } from 'react';
import { useNetworkStatus } from './useNetworkStatus';

interface NetworkOptimizationConfig {
  enableAdaptiveLoading: boolean;
  enableBandwidthMonitoring: boolean;
  enableDataSaver: boolean;
  qualityThresholds: {
    high: number; // Mbps
    medium: number; // Mbps
    low: number; // Mbps
  };
}

interface OptimizedLoadingStrategy {
  imageQuality: 'high' | 'medium' | 'low';
  batchSize: number;
  preloadDistance: number;
  enableProgressiveLoading: boolean;
  enableLazyLoading: boolean;
  compressionLevel: number;
}

export const useNetworkOptimization = (config?: Partial<NetworkOptimizationConfig>) => {
  const networkStatus = useNetworkStatus();
  const [bandwidth, setBandwidth] = useState<number>(0);
  const [loadingStrategy, setLoadingStrategy] = useState<OptimizedLoadingStrategy>({
    imageQuality: 'high',
    batchSize: 10,
    preloadDistance: 200,
    enableProgressiveLoading: false,
    enableLazyLoading: true,
    compressionLevel: 0.8,
  });

  const defaultConfig: NetworkOptimizationConfig = {
    enableAdaptiveLoading: true,
    enableBandwidthMonitoring: true,
    enableDataSaver: false,
    qualityThresholds: {
      high: 10, // 10 Mbps
      medium: 3, // 3 Mbps
      low: 1, // 1 Mbps
    },
    ...config,
  };

  // Estimate bandwidth based on download tests
  const estimateBandwidth = useCallback(async () => {
    if (!defaultConfig.enableBandwidthMonitoring) return;

    try {
      const startTime = performance.now();
      const testImageUrl =
        'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';

      await fetch(testImageUrl);
      const endTime = performance.now();
      const duration = (endTime - startTime) / 1000; // seconds

      // Estimate based on test file size (very small, so this is a rough estimate)
      const estimatedBandwidth = (0.1 / duration) * 8; // Convert to Mbps
      setBandwidth(estimatedBandwidth);
    } catch (error) {
      console.warn('Bandwidth estimation failed:', error);
    }
  }, [defaultConfig.enableBandwidthMonitoring]);

  // Optimize loading strategy based on network conditions
  const optimizeLoadingStrategy = useCallback(() => {
    if (!defaultConfig.enableAdaptiveLoading) return;

    const { effectiveType, downlink, saveData } = networkStatus;
    const currentBandwidth = downlink || bandwidth;

    let strategy: OptimizedLoadingStrategy = {
      imageQuality: 'high',
      batchSize: 10,
      preloadDistance: 200,
      enableProgressiveLoading: false,
      enableLazyLoading: true,
      compressionLevel: 0.8,
    };

    // Apply data saver mode
    if (saveData || defaultConfig.enableDataSaver) {
      strategy = {
        imageQuality: 'low',
        batchSize: 3,
        preloadDistance: 50,
        enableProgressiveLoading: true,
        enableLazyLoading: true,
        compressionLevel: 0.5,
      };
    }
    // Optimize based on connection type
    else if (effectiveType === 'slow-2g' || effectiveType === '2g') {
      strategy = {
        imageQuality: 'low',
        batchSize: 2,
        preloadDistance: 50,
        enableProgressiveLoading: true,
        enableLazyLoading: true,
        compressionLevel: 0.4,
      };
    } else if (
      effectiveType === '3g' ||
      (currentBandwidth > 0 && currentBandwidth < defaultConfig.qualityThresholds.medium)
    ) {
      strategy = {
        imageQuality: 'medium',
        batchSize: 5,
        preloadDistance: 100,
        enableProgressiveLoading: true,
        enableLazyLoading: true,
        compressionLevel: 0.6,
      };
    } else if (effectiveType === '4g' || currentBandwidth >= defaultConfig.qualityThresholds.high) {
      strategy = {
        imageQuality: 'high',
        batchSize: 15,
        preloadDistance: 300,
        enableProgressiveLoading: false,
        enableLazyLoading: true,
        compressionLevel: 0.9,
      };
    }

    setLoadingStrategy(strategy);
  }, [networkStatus, bandwidth, defaultConfig]);

  // Generate optimized image URL based on strategy
  const optimizeImageUrl = useCallback(
    (originalUrl: string) => {
      const strategy = loadingStrategy;
      let optimizedUrl = originalUrl;

      // Add quality and compression parameters
      const separator = originalUrl.includes('?') ? '&' : '?';

      switch (strategy.imageQuality) {
        case 'low':
          optimizedUrl += `${separator}q=30&w=400&f=webp`;
          break;
        case 'medium':
          optimizedUrl += `${separator}q=60&w=800&f=webp`;
          break;
        case 'high':
          optimizedUrl += `${separator}q=90&w=1200&f=webp`;
          break;
      }

      return optimizedUrl;
    },
    [loadingStrategy]
  );

  // Get preload strategy
  const getPreloadStrategy = useCallback(() => {
    return {
      shouldPreload: !networkStatus.isSlowConnection && !networkStatus.saveData,
      preloadDistance: loadingStrategy.preloadDistance,
      batchSize: loadingStrategy.batchSize,
    };
  }, [networkStatus, loadingStrategy]);

  // Initialize bandwidth estimation
  useEffect(() => {
    estimateBandwidth();
  }, [estimateBandwidth]);

  // Update strategy when network conditions change
  useEffect(() => {
    optimizeLoadingStrategy();
  }, [optimizeLoadingStrategy]);

  return {
    ...networkStatus,
    bandwidth,
    loadingStrategy,
    optimizeImageUrl,
    getPreloadStrategy,
    estimateBandwidth,
    isOptimizedForPerformance: loadingStrategy.imageQuality !== 'high',
    config: defaultConfig,
  };
};

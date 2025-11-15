interface NetworkOptimizationConfig {
  imageOptimization: {
    enableWebP: boolean;
    enableAVIF: boolean;
    qualityLevels: {
      high: number;
      medium: number;
      low: number;
    };
    maxDimensions: {
      high: { width: number; height: number };
      medium: { width: number; height: number };
      low: { width: number; height: number };
    };
  };
  loadingOptimization: {
    batchSizes: {
      fast: number;
      medium: number;
      slow: number;
    };
    preloadDistances: {
      fast: number;
      medium: number;
      slow: number;
    };
    retryStrategies: {
      fast: { maxRetries: number; delay: number };
      medium: { maxRetries: number; delay: number };
      slow: { maxRetries: number; delay: number };
    };
  };
  cacheOptimization: {
    enableServiceWorker: boolean;
    cacheStrategies: {
      images: 'cache-first' | 'network-first' | 'stale-while-revalidate';
      api: 'cache-first' | 'network-first' | 'stale-while-revalidate';
    };
    maxCacheSize: number; // MB
    cacheTTL: number; // seconds
  };
}

class NetworkOptimizationService {
  private static instance: NetworkOptimizationService;
  private config: NetworkOptimizationConfig;
  private networkMetrics: Map<string, { bandwidth: number; latency: number; timestamp: number }> =
    new Map();
  private contentCache: Map<string, { data: any; timestamp: number; size: number }> = new Map();

  constructor() {
    this.config = {
      imageOptimization: {
        enableWebP: this.supportsWebP(),
        enableAVIF: this.supportsAVIF(),
        qualityLevels: {
          high: 90,
          medium: 70,
          low: 50,
        },
        maxDimensions: {
          high: { width: 1920, height: 1080 },
          medium: { width: 1280, height: 720 },
          low: { width: 640, height: 360 },
        },
      },
      loadingOptimization: {
        batchSizes: {
          fast: 20,
          medium: 10,
          slow: 5,
        },
        preloadDistances: {
          fast: 500,
          medium: 200,
          slow: 100,
        },
        retryStrategies: {
          fast: { maxRetries: 2, delay: 1000 },
          medium: { maxRetries: 3, delay: 2000 },
          slow: { maxRetries: 5, delay: 3000 },
        },
      },
      cacheOptimization: {
        enableServiceWorker: 'serviceWorker' in navigator,
        cacheStrategies: {
          images: 'cache-first',
          api: 'stale-while-revalidate',
        },
        maxCacheSize: 50, // 50MB
        cacheTTL: 3600, // 1 hour
      },
    };
  }

  static getInstance(): NetworkOptimizationService {
    if (!NetworkOptimizationService.instance) {
      NetworkOptimizationService.instance = new NetworkOptimizationService();
    }
    return NetworkOptimizationService.instance;
  }

  private supportsWebP(): boolean {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }

  private supportsAVIF(): boolean {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    try {
      return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
    } catch {
      return false;
    }
  }

  optimizeImageUrl(
    originalUrl: string,
    networkSpeed: 'fast' | 'medium' | 'slow',
    options: {
      width?: number;
      height?: number;
      quality?: 'high' | 'medium' | 'low';
      format?: 'auto' | 'webp' | 'avif' | 'jpeg' | 'png';
    } = {}
  ): string {
    const { imageOptimization } = this.config;
    const quality = options.quality || this.getQualityForSpeed(networkSpeed);
    const format = options.format || this.getBestFormat();
    const dimensions = this.getDimensionsForQuality(quality);

    const params = new URLSearchParams();

    // Add quality parameter
    params.set('q', imageOptimization.qualityLevels[quality].toString());

    // Add dimensions
    if (options.width || dimensions.width) {
      params.set('w', (options.width || dimensions.width).toString());
    }
    if (options.height || dimensions.height) {
      params.set('h', (options.height || dimensions.height).toString());
    }

    // Add format
    if (format !== 'auto') {
      params.set('f', format);
    }

    // Add fit parameter for better resizing
    params.set('fit', 'cover');

    const separator = originalUrl.includes('?') ? '&' : '?';
    return `${originalUrl}${separator}${params.toString()}`;
  }

  private getQualityForSpeed(speed: 'fast' | 'medium' | 'slow'): 'high' | 'medium' | 'low' {
    switch (speed) {
      case 'fast':
        return 'high';
      case 'medium':
        return 'medium';
      case 'slow':
        return 'low';
      default:
        return 'medium';
    }
  }

  private getBestFormat(): string {
    if (this.config.imageOptimization.enableAVIF) return 'avif';
    if (this.config.imageOptimization.enableWebP) return 'webp';
    return 'auto';
  }

  private getDimensionsForQuality(quality: 'high' | 'medium' | 'low') {
    return this.config.imageOptimization.maxDimensions[quality];
  }

  getLoadingStrategy(networkSpeed: 'fast' | 'medium' | 'slow') {
    const { loadingOptimization } = this.config;

    return {
      batchSize: loadingOptimization.batchSizes[networkSpeed],
      preloadDistance: loadingOptimization.preloadDistances[networkSpeed],
      retryStrategy: loadingOptimization.retryStrategies[networkSpeed],
    };
  }

  // Bandwidth monitoring
  async measureBandwidth(testUrl?: string): Promise<number> {
    const url = testUrl || this.generateTestUrl();
    const startTime = performance.now();

    try {
      const response = await fetch(url, { mode: 'no-cors' });
      const endTime = performance.now();
      const duration = (endTime - startTime) / 1000; // seconds

      // Estimate bandwidth based on known test file size
      const testFileSize = 0.5; // MB (estimated)
      const bandwidth = (testFileSize / duration) * 8; // Mbps

      // Store metric
      this.networkMetrics.set('bandwidth', {
        bandwidth,
        latency: duration * 1000,
        timestamp: Date.now(),
      });

      return bandwidth;
    } catch (error) {
      console.warn('Bandwidth measurement failed:', error);
      return 0;
    }
  }

  private generateTestUrl(): string {
    // Use a small image for bandwidth testing
    return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';
  }

  // Content caching
  cacheContent(key: string, data: any, size: number = 0): void {
    const { cacheOptimization } = this.config;
    const totalSize = Array.from(this.contentCache.values()).reduce(
      (sum, item) => sum + item.size,
      0
    );

    // Check if adding this content would exceed cache size limit
    const maxSizeBytes = cacheOptimization.maxCacheSize * 1024 * 1024; // Convert MB to bytes

    if (totalSize + size > maxSizeBytes) {
      this.evictOldestCacheEntries(size);
    }

    this.contentCache.set(key, {
      data,
      timestamp: Date.now(),
      size,
    });
  }

  getCachedContent(key: string): any | null {
    const item = this.contentCache.get(key);

    if (!item) return null;

    const { cacheOptimization } = this.config;
    const isExpired = Date.now() - item.timestamp > cacheOptimization.cacheTTL * 1000;

    if (isExpired) {
      this.contentCache.delete(key);
      return null;
    }

    return item.data;
  }

  private evictOldestCacheEntries(neededSpace: number): void {
    const entries = Array.from(this.contentCache.entries()).sort(
      ([, a], [, b]) => a.timestamp - b.timestamp
    );

    let freedSpace = 0;
    for (const [key, item] of entries) {
      this.contentCache.delete(key);
      freedSpace += item.size;

      if (freedSpace >= neededSpace) break;
    }
  }

  clearCache(): void {
    this.contentCache.clear();
  }

  getNetworkMetrics() {
    return Object.fromEntries(this.networkMetrics);
  }

  getCacheStats() {
    const totalSize = Array.from(this.contentCache.values()).reduce(
      (sum, item) => sum + item.size,
      0
    );

    return {
      entriesCount: this.contentCache.size,
      totalSize: totalSize / (1024 * 1024), // MB
      maxSize: this.config.cacheOptimization.maxCacheSize,
      utilizationPercentage:
        (totalSize / (this.config.cacheOptimization.maxCacheSize * 1024 * 1024)) * 100,
    };
  }
}

export const networkOptimizationService = NetworkOptimizationService.getInstance();

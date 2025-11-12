// WeakRef polyfill for better browser compatibility
interface WeakRefLike<T extends object> {
  deref(): T | undefined;
}

class WeakRefPolyfill<T extends object> implements WeakRefLike<T> {
  private ref: T | undefined;

  constructor(target: T) {
    this.ref = target;
  }

  deref(): T | undefined {
    return this.ref;
  }
}

// Type-safe WeakRef implementation
type WeakRefImpl<T extends object> = WeakRefLike<T>;

// Use native WeakRef if available, otherwise use polyfill
const createWeakRef = <T extends object>(target: T): WeakRefImpl<T> => {
  if (typeof globalThis !== 'undefined' && 'WeakRef' in globalThis) {
    return new (globalThis as any).WeakRef(target) as WeakRefImpl<T>;
  }
  return new WeakRefPolyfill(target);
};

interface MemoryStats {
  totalObservedElements: number;
  totalCachedImages: number;
  memoryUsage: number;
}

interface ImageCacheEntry {
  url: string;
  element: WeakRefImpl<HTMLImageElement>;
  lastAccessed: number;
  size: number;
}

export class MemoryManagementService {
  private static instance: MemoryManagementService;
  private imageCache: Map<string, ImageCacheEntry> = new Map();
  private cleanupInterval: number | null = null;
  private readonly MAX_CACHE_SIZE = 50; // Maximum cached images
  private readonly CLEANUP_INTERVAL = 30000; // 30 seconds
  private readonly MAX_IDLE_TIME = 300000; // 5 minutes

  private constructor() {
    this.startCleanupInterval();
    this.setupMemoryPressureListener();
  }

  static getInstance(): MemoryManagementService {
    if (!MemoryManagementService.instance) {
      MemoryManagementService.instance = new MemoryManagementService();
    }
    return MemoryManagementService.instance;
  }

  private startCleanupInterval(): void {
    this.cleanupInterval = window.setInterval(() => {
      this.cleanupStaleImages();
    }, this.CLEANUP_INTERVAL);
  }

  private setupMemoryPressureListener(): void {
    // Listen for memory pressure events (if supported)
    if ('memory' in performance) {
      const checkMemory = () => {
        const memInfo = (performance as any).memory;
        if (memInfo && memInfo.usedJSHeapSize / memInfo.totalJSHeapSize > 0.9) {
          this.forceCleanup();
        }
      };

      // Check memory every minute
      setInterval(checkMemory, 60000);
    }
  }

  cacheImage(url: string, element: HTMLImageElement): void {
    if (this.imageCache.size >= this.MAX_CACHE_SIZE) {
      this.evictOldestImage();
    }

    this.imageCache.set(url, {
      url,
      element: createWeakRef(element),
      lastAccessed: Date.now(),
      size: this.estimateImageSize(element),
    });
  }

  getCachedImage(url: string): HTMLImageElement | null {
    const entry = this.imageCache.get(url);
    if (!entry) return null;

    const element = entry.element.deref();
    if (!element) {
      // Element was garbage collected, remove from cache
      this.imageCache.delete(url);
      return null;
    }

    // Update last accessed time
    entry.lastAccessed = Date.now();
    return element;
  }

  private estimateImageSize(element: HTMLImageElement): number {
    // Rough estimation: width * height * 4 bytes (RGBA)
    return (element.naturalWidth || 0) * (element.naturalHeight || 0) * 4;
  }

  private evictOldestImage(): void {
    let oldestEntry: [string, ImageCacheEntry] | null = null;
    let oldestTime = Date.now();

    for (const entry of this.imageCache.entries()) {
      if (entry[1].lastAccessed < oldestTime) {
        oldestTime = entry[1].lastAccessed;
        oldestEntry = entry;
      }
    }

    if (oldestEntry) {
      this.imageCache.delete(oldestEntry[0]);
    }
  }

  private cleanupStaleImages(): void {
    const now = Date.now();
    const staleEntries: string[] = [];

    for (const [url, entry] of this.imageCache.entries()) {
      // Remove if element was garbage collected or hasn't been accessed recently
      const element = entry.element.deref();
      if (!element || now - entry.lastAccessed > this.MAX_IDLE_TIME) {
        staleEntries.push(url);
      }
    }

    staleEntries.forEach((url) => this.imageCache.delete(url));

    if (process.env.NODE_ENV === 'development') {
      console.log(`Cleaned up ${staleEntries.length} stale image cache entries`);
    }
  }

  forceCleanup(): void {
    this.imageCache.clear();
    if (process.env.NODE_ENV === 'development') {
      console.log('Forced memory cleanup: cleared all image cache');
    }
  }

  getMemoryStats(): MemoryStats {
    const totalCachedImages = this.imageCache.size;
    const memoryUsage = Array.from(this.imageCache.values()).reduce(
      (total, entry) => total + entry.size,
      0
    );

    return {
      totalObservedElements: 0, // Will be updated by observer service
      totalCachedImages,
      memoryUsage,
    };
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.imageCache.clear();
  }
}

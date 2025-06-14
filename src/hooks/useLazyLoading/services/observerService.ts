
interface ObserverCallback {
  (entry: IntersectionObserverEntry): void;
}

interface ObserverConfig {
  threshold: number;
  rootMargin: string;
}

export class IntersectionObserverService {
  private static instance: IntersectionObserverService;
  private observers: Map<string, IntersectionObserver> = new Map();
  private callbacks: Map<Element, ObserverCallback> = new Map();
  private elementCounts: Map<string, number> = new Map(); // Track elements per observer

  private constructor() {}

  static getInstance(): IntersectionObserverService {
    if (!IntersectionObserverService.instance) {
      IntersectionObserverService.instance = new IntersectionObserverService();
    }
    return IntersectionObserverService.instance;
  }

  private getObserverKey(config: ObserverConfig): string {
    return `${config.threshold}-${config.rootMargin}`;
  }

  private createObserver(config: ObserverConfig): IntersectionObserver {
    return new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const callback = this.callbacks.get(entry.target);
          if (callback) {
            callback(entry);
          }
        });
      },
      {
        threshold: config.threshold,
        rootMargin: config.rootMargin,
      }
    );
  }

  observe(element: Element, config: ObserverConfig, callback: ObserverCallback): void {
    const key = this.getObserverKey(config);
    
    if (!this.observers.has(key)) {
      this.observers.set(key, this.createObserver(config));
      this.elementCounts.set(key, 0);
    }

    const observer = this.observers.get(key)!;
    this.callbacks.set(element, callback);
    observer.observe(element);

    // Increment element count for this observer
    const currentCount = this.elementCounts.get(key) || 0;
    this.elementCounts.set(key, currentCount + 1);
  }

  unobserve(element: Element, config: ObserverConfig): void {
    const key = this.getObserverKey(config);
    const observer = this.observers.get(key);
    
    if (observer) {
      observer.unobserve(element);
      this.callbacks.delete(element);

      // Decrement element count
      const currentCount = this.elementCounts.get(key) || 0;
      const newCount = Math.max(0, currentCount - 1);
      this.elementCounts.set(key, newCount);

      // If no elements are being observed, cleanup the observer
      if (newCount === 0) {
        observer.disconnect();
        this.observers.delete(key);
        this.elementCounts.delete(key);

        if (process.env.NODE_ENV === 'development') {
          console.log(`Cleaned up unused observer: ${key}`);
        }
      }
    }
  }

  // Enhanced cleanup with memory optimization
  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    this.callbacks.clear();
    this.elementCounts.clear();
  }

  // Get memory statistics
  getObserverStats() {
    return {
      totalObservers: this.observers.size,
      totalObservedElements: Array.from(this.elementCounts.values())
        .reduce((total, count) => total + count, 0),
      observerDetails: Array.from(this.elementCounts.entries()).map(([key, count]) => ({
        config: key,
        elementCount: count,
      })),
    };
  }
}


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
    }

    const observer = this.observers.get(key)!;
    this.callbacks.set(element, callback);
    observer.observe(element);
  }

  unobserve(element: Element, config: ObserverConfig): void {
    const key = this.getObserverKey(config);
    const observer = this.observers.get(key);
    
    if (observer) {
      observer.unobserve(element);
      this.callbacks.delete(element);
    }
  }

  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    this.callbacks.clear();
  }
}

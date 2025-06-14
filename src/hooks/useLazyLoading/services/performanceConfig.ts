
interface DeviceCapabilities {
  cores: number;
  memory: number;
  connection: string;
  isLowEndDevice: boolean;
}

interface LazyLoadingConfig {
  rootMargin: string;
  batchSize: number;
  delay: number;
  threshold: number;
  preloadDistance: number;
}

export class PerformanceConfigService {
  private static instance: PerformanceConfigService;
  private deviceCapabilities: DeviceCapabilities;

  private constructor() {
    this.deviceCapabilities = this.detectDeviceCapabilities();
  }

  static getInstance(): PerformanceConfigService {
    if (!PerformanceConfigService.instance) {
      PerformanceConfigService.instance = new PerformanceConfigService();
    }
    return PerformanceConfigService.instance;
  }

  private detectDeviceCapabilities(): DeviceCapabilities {
    const cores = navigator.hardwareConcurrency || 4;
    const memory = (navigator as any).deviceMemory || 4;
    const connection = (navigator as any).connection?.effectiveType || '4g';
    const isLowEndDevice = cores <= 2 || memory <= 2;

    return { cores, memory, connection, isLowEndDevice };
  }

  getImageConfig(): LazyLoadingConfig {
    const { isLowEndDevice, connection } = this.deviceCapabilities;
    
    return {
      rootMargin: connection === '4g' && !isLowEndDevice ? '100px' : '50px',
      batchSize: isLowEndDevice ? 5 : 10,
      delay: isLowEndDevice ? 200 : 100,
      threshold: 0.1,
      preloadDistance: isLowEndDevice ? 2 : 5,
    };
  }

  getMatchListConfig(): LazyLoadingConfig {
    const { isLowEndDevice, cores } = this.deviceCapabilities;
    
    return {
      rootMargin: '75px',
      batchSize: cores > 4 ? 15 : isLowEndDevice ? 5 : 10,
      delay: isLowEndDevice ? 150 : 100,
      threshold: 0.5,
      preloadDistance: isLowEndDevice ? 3 : 8,
    };
  }

  getCompatibilityConfig(): LazyLoadingConfig {
    const { isLowEndDevice } = this.deviceCapabilities;
    
    return {
      rootMargin: '50px',
      batchSize: isLowEndDevice ? 3 : 8,
      delay: isLowEndDevice ? 300 : 150,
      threshold: 0.3,
      preloadDistance: isLowEndDevice ? 1 : 3,
    };
  }
}

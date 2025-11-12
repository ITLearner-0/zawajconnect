import { logger } from '@/services/logging/LoggingService';

export class MemoryService {
  trackMemoryUsage(): number {
    if (!('memory' in performance)) return 0;

    const memory = (performance as any).memory;
    const memoryUsage = memory.usedJSHeapSize;

    logger.logPerformance('memory-usage', memoryUsage / 1024 / 1024, 'MB');
    return memoryUsage;
  }
}

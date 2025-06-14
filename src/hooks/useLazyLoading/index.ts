
// Re-export original hooks for backward compatibility
export { useLazyLoading, useLazyImage } from '../useLazyLoading';

// Export enhanced performance-optimized hooks
export { useEnhancedLazyLoading } from './useEnhancedLazyLoading';
export { useEnhancedLazyImage } from './useEnhancedLazyImage';

// Export memory-optimized hooks
export { useMemoryOptimizedLazyLoading } from './useMemoryOptimizedLazyLoading';

// Export UX enhancement hooks
export { useAccessibleLazyLoading } from './useAccessibleLazyLoading';
export { useRetryableLoad } from './useRetryableLoad';

// Export error handling & resilience hooks
export { useNetworkStatus } from './useNetworkStatus';
export { useResilientImageLoading } from './useResilientImageLoading';

// Export services
export { PerformanceConfigService } from './services/performanceConfig';
export { IntersectionObserverService } from './services/observerService';
export { MemoryManagementService } from './services/memoryService';
export { errorRecoveryService } from './services/errorRecoveryService';

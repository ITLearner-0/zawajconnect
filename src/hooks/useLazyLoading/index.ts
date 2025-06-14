
// Re-export original hooks for backward compatibility
export { useLazyLoading, useLazyImage } from '../useLazyLoading';

// Export enhanced performance-optimized hooks
export { useEnhancedLazyLoading } from './useEnhancedLazyLoading';
export { useEnhancedLazyImage } from './useEnhancedLazyImage';

// Export services
export { PerformanceConfigService } from './services/performanceConfig';
export { IntersectionObserverService } from './services/observerService';

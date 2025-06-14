
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

// Export developer experience hooks
export { useDebuggedLazyLoading } from './useDebuggedLazyLoading';
export { usePerformanceMonitor } from './usePerformanceMonitor';

// Export monitoring & analytics hooks
export { useAnalytics } from './useAnalytics';
export { useEnhancedMonitoring } from './useEnhancedMonitoring';

// Export monitoring & analytics services
export { analyticsService } from './services/analyticsService';
export type { LazyLoadingMetrics, AggregatedMetrics, UsagePattern } from './services/analyticsService';

// Export monitoring & analytics components
export { default as LazyLoadingAnalyticsDashboard } from '../../components/ui/LazyLoadingAnalyticsDashboard';

// Export services
export { PerformanceConfigService } from './services/performanceConfig';
export { IntersectionObserverService } from './services/observerService';
export { MemoryManagementService } from './services/memoryService';
export { errorRecoveryService } from './services/errorRecoveryService';
export { debugService } from './services/debug/debugService';

// Export components
export { default as LazyLoadingDevPanel } from '../../components/ui/LazyLoadingDevPanel';

// Export accessibility context and components
export { AccessibilityProvider, useAccessibility } from '../../contexts/AccessibilityContext';
export { default as AccessibilityControls } from '../../components/AccessibilityControls';

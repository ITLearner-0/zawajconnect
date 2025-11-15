import React from 'react';
import { useNetworkStatus } from '@/hooks/useLazyLoading/useNetworkStatus';

interface LazyImageAccessibilityProps {
  loadState: 'loading' | 'loaded' | 'error' | 'retry';
}

const LazyImageAccessibility = ({ loadState }: LazyImageAccessibilityProps) => {
  const { isOnline } = useNetworkStatus();

  return (
    <div className="sr-only" aria-live="polite" aria-atomic="true">
      {!isOnline && 'No internet connection'}
      {isOnline && loadState === 'loading' && 'Image is loading'}
      {isOnline && loadState === 'loaded' && 'Image loaded successfully'}
      {isOnline && loadState === 'error' && 'Image failed to load'}
      {isOnline && loadState === 'retry' && 'Retrying image load'}
    </div>
  );
};

export default LazyImageAccessibility;

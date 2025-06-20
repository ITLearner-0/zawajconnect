
import React, { lazy, Suspense } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ProviderErrorBoundary } from './ProviderErrorBoundary';

// Lazy load heavy providers
const MonitoringProvider = lazy(() => 
  import('@/components/monitoring/MonitoringProvider').then(module => ({
    default: module.MonitoringProvider
  }))
);

interface LazyMonitoringProviderProps {
  children: React.ReactNode;
  autoStart?: boolean;
}

export const LazyMonitoringProvider: React.FC<LazyMonitoringProviderProps> = ({
  children,
  autoStart = true
}) => (
  <ProviderErrorBoundary 
    fallbackTitle="Monitoring System Error"
    fallbackDescription="The monitoring system encountered an error. The app will continue to work normally."
  >
    <Suspense fallback={<LoadingSpinner />}>
      <MonitoringProvider autoStart={autoStart}>
        {children}
      </MonitoringProvider>
    </Suspense>
  </ProviderErrorBoundary>
);

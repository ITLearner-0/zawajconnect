import React, { Suspense } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AccessibilityProvider } from '@/contexts/AccessibilityContext';
import AuthProvider from '@/contexts/AuthContext';
import { SecurityProvider } from '@/components/security/SecurityProvider';
import { MonitoringProvider } from '@/components/monitoring/MonitoringProvider';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Create a stable query client instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

interface AppProviderProps {
  children: React.ReactNode;
}

// Core providers that are always needed
const CoreProviders: React.FC<AppProviderProps> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AccessibilityProvider>
        <Router>
          {children}
        </Router>
      </AccessibilityProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

// Auth and Security providers with error boundaries
const AuthSecurityProviders: React.FC<AppProviderProps> = ({ children }) => (
  <ErrorBoundary fallback={<div>Authentication Error</div>}>
    <AuthProvider>
      <ErrorBoundary fallback={<div>Security Error</div>}>
        <SecurityProvider>
          {children}
        </SecurityProvider>
      </ErrorBoundary>
    </AuthProvider>
  </ErrorBoundary>
);

// Monitoring provider with lazy loading
const MonitoringWrapper: React.FC<AppProviderProps> = ({ children }) => (
  <Suspense fallback={<LoadingSpinner />}>
    <ErrorBoundary fallback={<div>Monitoring Error</div>}>
      <MonitoringProvider autoStart={true}>
        {children}
      </MonitoringProvider>
    </ErrorBoundary>
  </Suspense>
);

// Main AppProvider that composes all providers in the correct order
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <CoreProviders>
      <AuthSecurityProviders>
        <MonitoringWrapper>
          {children}
          <Toaster />
        </MonitoringWrapper>
      </AuthSecurityProviders>
    </CoreProviders>
  );
};

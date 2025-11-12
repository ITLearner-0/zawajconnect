import React, { createContext, useContext, useEffect } from 'react';
import { useApplicationMonitoring } from '@/hooks/useApplicationMonitoring';
import { logger } from '@/services/logging/LoggingService';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'react-router-dom';

interface MonitoringContextType {
  trackPageView: (page: string) => void;
  trackUserAction: (action: string, component: string, metadata?: Record<string, any>) => void;
  trackError: (error: Error, componentStack?: string) => void;
  isMonitoring: boolean;
}

const MonitoringContext = createContext<MonitoringContextType | undefined>(undefined);

export const useMonitoring = () => {
  const context = useContext(MonitoringContext);
  if (!context) {
    throw new Error('useMonitoring must be used within a MonitoringProvider');
  }
  return context;
};

interface MonitoringProviderProps {
  children: React.ReactNode;
  autoStart?: boolean;
}

export const MonitoringProvider: React.FC<MonitoringProviderProps> = ({
  children,
  autoStart = true,
}) => {
  const { user } = useAuth();
  const location = useLocation();
  const { isMonitoring, startMonitoring, trackPageView, trackUserAction, trackError } =
    useApplicationMonitoring();

  // Set user ID when user changes
  useEffect(() => {
    if (user?.id) {
      logger.setUserId(user.id);
    }
  }, [user?.id]);

  // Auto-start monitoring
  useEffect(() => {
    if (autoStart && !isMonitoring) {
      startMonitoring();
    }
  }, [autoStart, isMonitoring, startMonitoring]);

  // Track page views
  useEffect(() => {
    if (isMonitoring) {
      trackPageView(location.pathname);
    }
  }, [location.pathname, isMonitoring, trackPageView]);

  const contextValue: MonitoringContextType = {
    trackPageView,
    trackUserAction,
    trackError,
    isMonitoring,
  };

  return <MonitoringContext.Provider value={contextValue}>{children}</MonitoringContext.Provider>;
};


import React, { createContext, useContext, ReactNode } from 'react';
import { useEnhancedAuth } from '@/hooks/useEnhancedAuth';
import { useRateLimiting } from '@/hooks/useRateLimiting';
import { useSecurityHeaders } from '@/hooks/useSecurityHeaders';
import { SecurityEventLogger } from './SecurityEventLogger';
import { ContentSecurityPolicy } from './ContentSecurityPolicy';

interface SecurityContextType {
  enhancedAuth: ReturnType<typeof useEnhancedAuth>;
  rateLimiting: ReturnType<typeof useRateLimiting>;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

interface SecurityProviderProps {
  children: ReactNode;
}

export const SecurityProvider: React.FC<SecurityProviderProps> = ({ children }) => {
  const enhancedAuth = useEnhancedAuth();
  const rateLimiting = useRateLimiting();
  
  // Apply security headers
  useSecurityHeaders();

  const value: SecurityContextType = {
    enhancedAuth,
    rateLimiting
  };

  return (
    <SecurityContext.Provider value={value}>
      <ContentSecurityPolicy />
      <SecurityEventLogger />
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = (): SecurityContextType => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};


import React, { createContext, useContext } from 'react';

interface SecurityContextType {
  isSecure: boolean;
  threatLevel: 'low' | 'medium' | 'high';
  lastSecurityCheck: Date | null;
  performSecurityAudit: () => Promise<void>;
  validateUserAction: (action: string, data?: any) => Promise<boolean>;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const useSecurityContext = (): SecurityContextType => {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error('useSecurityContext must be used within a SecurityProvider');
  }
  return context;
};

export { SecurityContext, type SecurityContextType };


import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SecurityContext } from './security/SecurityContext';
import { useSecurityAudit } from './security/SecurityAudit';
import { useSecurityValidation } from './security/SecurityValidation';
import { useSecurityEventHandlers } from './security/SecurityEventHandlers';

interface SecurityMiddlewareProps {
  children: React.ReactNode;
}

export const SecurityMiddleware: React.FC<SecurityMiddlewareProps> = ({ children }) => {
  const { user, session } = useAuth();
  const [isSecure, setIsSecure] = useState(false);
  const [threatLevel, setThreatLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [lastSecurityCheck, setLastSecurityCheck] = useState<Date | null>(null);

  const { performSecurityAudit: auditFunction } = useSecurityAudit();
  const { validateUserAction } = useSecurityValidation();

  // Security audit function
  const performSecurityAudit = async (): Promise<void> => {
    const { isSecure: secure, threatLevel: level } = await auditFunction();
    setIsSecure(secure);
    setThreatLevel(level);
    setLastSecurityCheck(new Date());
  };

  // Initial security check
  useEffect(() => {
    performSecurityAudit();
    
    // Periodic security checks
    const interval = setInterval(performSecurityAudit, 5 * 60 * 1000); // Every 5 minutes
    
    return () => clearInterval(interval);
  }, [user, session]);

  // Security event listeners
  useSecurityEventHandlers(performSecurityAudit);

  return (
    <SecurityContext.Provider
      value={{
        isSecure,
        threatLevel,
        lastSecurityCheck,
        performSecurityAudit,
        validateUserAction
      }}
    >
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurityMiddleware = () => {
  const context = React.useContext(SecurityContext);
  if (context === undefined) {
    throw new Error('useSecurityMiddleware must be used within a SecurityMiddleware');
  }
  return context;
};

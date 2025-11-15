import React from 'react';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';
import SessionTimeoutWarning from './SessionTimeoutWarning';
import { useAuth } from '@/contexts/AuthContext';

interface SessionTimeoutProviderProps {
  children: React.ReactNode;
}

const SessionTimeoutProvider: React.FC<SessionTimeoutProviderProps> = ({ children }) => {
  const { signOut } = useAuth();
  const { showWarning, remainingTime, extendSession } = useSessionTimeout();

  return (
    <>
      {children}
      <SessionTimeoutWarning
        show={showWarning}
        remainingTime={remainingTime}
        onExtend={extendSession}
        onLogout={signOut}
      />
    </>
  );
};

export default SessionTimeoutProvider;

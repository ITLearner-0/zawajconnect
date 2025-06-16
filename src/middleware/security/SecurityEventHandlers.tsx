
import { useEffect } from 'react';

export const useSecurityEventHandlers = (performSecurityAudit: () => Promise<void>) => {
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('🔒 Tab hidden - pausing security checks');
      } else {
        console.log('🔒 Tab visible - resuming security checks');
        performSecurityAudit();
      }
    };

    const handleBeforeUnload = () => {
      console.log('🔒 Page unloading - clearing sensitive data');
      // Clear sensitive data
      sessionStorage.clear();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [performSecurityAudit]);
};

import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useOfflineTracking = (userId: string | null, isDemoUser: boolean) => {
  // Update to offline status when component unmounts
  useEffect(() => {
    // When the user leaves or closes the tab
    const handleBeforeUnload = () => {
      if (userId && !isDemoUser) {
        // This is a synchronous call that might not complete before the page unloads
        // But we'll try anyway
        supabase
          .from('user_sessions' as any)
          .update({
            status: 'offline',
            last_active: new Date().toISOString(),
          })
          .eq('user_id', userId)
          .then(() => {
            console.log('Status set to offline on page unload');
          });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);

      // Also try to set status to offline when component unmounts
      if (userId && !isDemoUser) {
        supabase
          .from('user_sessions' as any)
          .update({
            status: 'offline',
            last_active: new Date().toISOString(),
          })
          .eq('user_id', userId)
          .then(() => {
            console.log('Status set to offline on unmount');
          });
      }
    };
  }, [userId, isDemoUser]);
};

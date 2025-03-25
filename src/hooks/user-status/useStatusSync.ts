
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

type UserStatus = 'online' | 'offline' | 'away' | 'busy';

export const useStatusSync = (
  userId: string | null,
  isDemoUser: boolean,
  setStatus: (status: UserStatus) => void,
  setLastActive: (lastActive: string | null) => void
) => {
  // Set up a listening channel for status updates
  useEffect(() => {
    if (userId && !isDemoUser) {
      const channel = supabase
        .channel(`user_status_${userId}`)
        .on('postgres_changes', { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'user_sessions',
          filter: `user_id=eq.${userId}`
        }, (payload) => {
          if (payload.new) {
            const userData = payload.new as any;
            setStatus(userData.status || 'offline');
            setLastActive(userData.last_active || null);
          }
        })
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [userId, isDemoUser, setStatus, setLastActive]);
};

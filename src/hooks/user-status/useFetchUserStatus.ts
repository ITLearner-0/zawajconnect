
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { tableExists } from '@/utils/database/core';

type UserStatus = 'online' | 'offline' | 'away' | 'busy';

export const useFetchUserStatus = (
  userId: string | null,
  isDemoUser: boolean,
  setStatus: (status: UserStatus) => void,
  setLastActive: (lastActive: string | null) => void,
  setLoading: (loading: boolean) => void,
  setError: (error: string | null) => void
) => {
  
  const fetchUserStatus = useCallback(async () => {
    if (!userId || isDemoUser) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Check if the user_sessions table exists
      const sessionsTableExists = await tableExists('user_sessions');
      
      if (!sessionsTableExists) {
        setStatus('offline');
        setLastActive(null);
        setLoading(false);
        return;
      }

      // Perform RPC call to get user session data
      const { data, error: rpcError } = await supabase.rpc(
        'get_user_session' as any,
        { user_id: userId }
      );

      if (rpcError) {
        console.error('Error fetching user status:', rpcError);
        throw rpcError;
      }

      if (data) {
        setStatus(data.status as UserStatus);
        setLastActive(data.last_active);
      } else {
        // Default to offline if no session found
        setStatus('offline');
        setLastActive(null);
      }
    } catch (err: any) {
      console.error('Error fetching user status:', err);
      setError(err.message || 'Failed to load user status');
      
      // Default to offline status on error
      setStatus('offline');
      setLastActive(null);
    } finally {
      setLoading(false);
    }
  }, [userId, isDemoUser, setStatus, setLastActive, setLoading, setError]);

  return { fetchUserStatus };
};

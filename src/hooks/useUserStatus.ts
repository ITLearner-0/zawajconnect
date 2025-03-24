
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserStatusData {
  status: 'online' | 'offline' | 'away' | 'busy';
  lastActive: string | null;
}

/**
 * Hook to get and set user status
 */
export const useUserStatus = (userId: string | null | undefined) => {
  const [status, setStatus] = useState<'online' | 'offline' | 'away' | 'busy'>('offline');
  const [lastActive, setLastActive] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if this is a demo user ID (starting with 'user-')
  const isDemoUser = userId?.startsWith('user-');

  useEffect(() => {
    // Skip for demo users or when userId is not available
    if (!userId || isDemoUser) {
      // Set default status for demo users
      if (isDemoUser) {
        setStatus('online');
        setLastActive(new Date().toISOString());
      }
      
      setLoading(false);
      return;
    }

    // Fetch initial status
    fetchUserStatus();

    // Set up subscription for real-time updates
    const channel = supabase.channel(`user_status_${userId}`);
    
    channel
      .on('presence', { event: 'sync' }, () => {
        updateStatusFromPresence(channel, userId);
      })
      .on('presence', { event: 'join' }, () => {
        updateStatusFromPresence(channel, userId);
      })
      .on('presence', { event: 'leave' }, () => {
        updateStatusFromPresence(channel, userId);
      })
      .subscribe(async (status) => {
        if (status !== 'SUBSCRIBED') return;
        
        // No need to track our own status in this hook
      });

    return () => {
      channel.unsubscribe();
    };
  }, [userId, isDemoUser]);

  /**
   * Update status based on presence information
   */
  const updateStatusFromPresence = (channel: any, userId: string) => {
    try {
      const presenceState = channel.presenceState();
      const userPresence = Object.values(presenceState)
        .flat()
        .find((presence: any) => presence.user_id === userId);
      
      if (userPresence) {
        setStatus(userPresence.status || 'online');
        setLastActive(userPresence.last_active || new Date().toISOString());
      } else {
        checkDatabaseStatus(userId);
      }
    } catch (err: any) {
      console.error("Error updating status from presence:", err);
    }
  };

  /**
   * Fetch user status from database
   */
  const fetchUserStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Skip database operations for demo users
      if (isDemoUser) {
        setStatus('online');
        setLastActive(new Date().toISOString());
        setLoading(false);
        return;
      }

      // First check if the user_sessions table exists
      const tableExists = await checkTableExists('user_sessions');
      
      if (!tableExists) {
        setStatus('offline');
        setLastActive(null);
        setLoading(false);
        return;
      }

      // Try to get user session from database
      await checkDatabaseStatus(userId as string);
      
    } catch (err: any) {
      console.error("Error fetching user status:", err);
      setError(`Failed to fetch user status: ${err.message}`);
      setStatus('offline');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Set user status
   */
  const setUserStatus = async (newStatus: 'online' | 'offline' | 'away' | 'busy') => {
    try {
      // Skip for demo users
      if (isDemoUser) {
        setStatus(newStatus);
        return;
      }
      
      const tableExists = await checkTableExists('user_sessions');
      
      if (!tableExists) {
        console.log("User sessions table doesn't exist, skipping status update");
        return;
      }
      
      const timestamp = new Date().toISOString();
      
      // Try to update existing session
      const { error: updateError } = await supabase
        .from('user_sessions')
        .update({
          status: newStatus,
          last_active: timestamp
        })
        .eq('user_id', userId);
      
      if (updateError) {
        // If update fails, try to insert
        const { error: insertError } = await supabase
          .from('user_sessions')
          .insert({
            user_id: userId,
            status: newStatus,
            last_active: timestamp
          });
          
        if (insertError) {
          throw insertError;
        }
      }
      
      // Update local state
      setStatus(newStatus);
      setLastActive(timestamp);
      
    } catch (err: any) {
      console.error("Error setting user status:", err);
      setError(`Failed to set user status: ${err.message}`);
    }
  };

  /**
   * Check user status from database
   */
  const checkDatabaseStatus = async (userId: string) => {
    try {
      // Check if user has an active session in the database
      const { data, error } = await supabase
        .from('user_sessions')
        .select('status, last_active')
        .eq('user_id', userId)
        .maybeSingle();
        
      if (error) {
        throw error;
      }
      
      if (data) {
        // If session exists, check if it's still valid (within last 5 minutes)
        const lastActiveTime = new Date(data.last_active).getTime();
        const now = new Date().getTime();
        const fiveMinutesInMs = 5 * 60 * 1000;
        
        if (now - lastActiveTime < fiveMinutesInMs) {
          setStatus(data.status || 'online');
        } else {
          setStatus('offline');
        }
        
        setLastActive(data.last_active);
      } else {
        setStatus('offline');
        setLastActive(null);
      }
    } catch (err: any) {
      console.error("Error checking database status:", err);
      setStatus('offline');
    }
  };

  /**
   * Check if a table exists in the database
   */
  const checkTableExists = async (tableName: string): Promise<boolean> => {
    try {
      // Use RPC call to check if table exists
      const { data, error } = await supabase.rpc('check_table_exists' as any, {
        table_name: tableName
      });
      
      if (error) {
        console.error("Error checking if table exists:", error);
        return false;
      }
      
      return !!data;
    } catch (err: any) {
      console.error(`Error checking if table ${tableName} exists:`, err);
      return false;
    }
  };

  /**
   * Set user as offline when they leave the site
   */
  useEffect(() => {
    // Skip for demo users
    if (isDemoUser || !userId) return;
    
    const handleBeforeUnload = async () => {
      try {
        await setUserStatus('offline');
      } catch (err) {
        console.error("Error setting offline status on unload:", err);
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      handleBeforeUnload();
    };
  }, [userId, isDemoUser]);

  // Provide default values for demo users
  if (isDemoUser) {
    return {
      status: 'online' as const,
      lastActive: new Date().toISOString(),
      loading: false,
      error: null,
      setUserStatus: (status: 'online' | 'offline' | 'away' | 'busy') => {
        setStatus(status);
      }
    };
  }

  return {
    status,
    lastActive,
    loading,
    error,
    setUserStatus
  };
};

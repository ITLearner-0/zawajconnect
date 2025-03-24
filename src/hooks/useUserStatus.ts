
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import { tableExists } from '@/utils/database/core';

type UserStatus = 'online' | 'offline' | 'away' | 'busy';

interface UserStatusData {
  status: UserStatus;
  lastActive: string | null;
}

export const useUserStatus = (userId: string | null) => {
  const [status, setStatus] = useState<UserStatus>('offline');
  const [lastActive, setLastActive] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Don't attempt database operations for demo users
  const isDemoUser = userId?.startsWith('user-');

  // Get user status
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
  }, [userId, isDemoUser, toast]);

  // Update user status
  const updateUserStatus = useCallback(async (newStatus: UserStatus) => {
    if (!userId || isDemoUser) return false;

    try {
      setError(null);

      // Check if the user_sessions table exists
      const sessionsTableExists = await tableExists('user_sessions');
      
      if (!sessionsTableExists) {
        // Table doesn't exist, can't update status
        toast({
          title: "Status Update Failed",
          description: "User status tracking is not available",
          variant: "destructive"
        });
        return false;
      }

      // First check if a record exists for this user
      const { data: existingSession } = await supabase
        .from('user_sessions' as any)
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (existingSession) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('user_sessions' as any)
          .update({ 
            status: newStatus,
            last_active: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (updateError) throw updateError;
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from('user_sessions' as any)
          .insert({ 
            user_id: userId, 
            status: newStatus,
            last_active: new Date().toISOString()
          });

        if (insertError) throw insertError;
      }

      // Update local state
      setStatus(newStatus);
      setLastActive(new Date().toISOString());
      
      return true;
    } catch (err: any) {
      console.error('Error updating user status:', err);
      setError(err.message || 'Failed to update status');
      
      toast({
        title: "Status Update Failed",
        description: err.message || "Could not update your status",
        variant: "destructive"
      });
      
      return false;
    }
  }, [userId, isDemoUser, toast]);

  // Fetch status on component mount or when userId changes
  useEffect(() => {
    fetchUserStatus();
    
    // Set up a listening channel for status updates
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
  }, [userId, fetchUserStatus, isDemoUser]);

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
            last_active: new Date().toISOString()
          })
          .eq('user_id', userId)
          .then(() => {
            console.log('Status set to offline on page unload');
          })
          .catch(err => {
            console.error('Error updating status on unload:', err);
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
            last_active: new Date().toISOString()
          })
          .eq('user_id', userId)
          .then(() => {
            console.log('Status set to offline on unmount');
          })
          .catch(err => {
            console.error('Error updating status on unmount:', err);
          });
      }
    };
  }, [userId, isDemoUser]);

  // Check if table exists before initial query
  useEffect(() => {
    const checkTable = async () => {
      if (!userId || isDemoUser) return;
      
      try {
        const exists = await tableExists('user_sessions');
        if (!exists) {
          console.log('user_sessions table does not exist');
        }
      } catch (err) {
        console.error('Error checking if user_sessions table exists:', err);
      }
    };
    
    checkTable();
  }, [userId, isDemoUser]);

  return {
    status,
    lastActive,
    loading,
    error,
    updateStatus: updateUserStatus,
    refreshStatus: fetchUserStatus
  };
};


import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { tableExists } from '@/utils/database/core';

type UserStatus = 'online' | 'offline' | 'away' | 'busy';

export interface UserStatusInfo {
  status: UserStatus;
  lastActive: string | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to get user status and last active time
 */
export const useUserStatus = (userId: string | null) => {
  const [userStatusInfo, setUserStatusInfo] = useState<UserStatusInfo>({
    status: 'offline',
    lastActive: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    if (!userId) {
      setUserStatusInfo({
        status: 'offline',
        lastActive: null,
        loading: false,
        error: null
      });
      return;
    }

    const fetchUserStatus = async () => {
      try {
        // First check if there's a wali profile (they have presence status)
        const { data: waliData, error: waliError } = await supabase
          .from('wali_profiles')
          .select('availability_status, last_active')
          .eq('user_id', userId)
          .maybeSingle();

        if (waliError && waliError.code !== 'PGRST116') {
          throw waliError;
        }

        if (waliData) {
          // Map wali availability status to our UserStatus type
          let mappedStatus: UserStatus = 'offline';
          switch (waliData.availability_status) {
            case 'available':
              mappedStatus = 'online';
              break;
            case 'busy':
              mappedStatus = 'busy';
              break;
            default:
              mappedStatus = 'offline';
          }

          setUserStatusInfo({
            status: mappedStatus,
            lastActive: waliData.last_active,
            loading: false,
            error: null
          });
          return;
        }

        // Check if user_sessions table exists before trying to query it
        const userSessionsTableExists = await tableExists('user_sessions');
        
        if (userSessionsTableExists) {
          // If table exists, use a generic approach to call the stored procedure
          const response = await supabase.rpc(
            'get_user_session' as any, 
            { user_id_param: userId }
          );
          
          const sessionData = response.data as { status: string; last_active: string | null } | null;
          const sessionError = response.error;

          if (sessionError) {
            console.error('Error fetching user session:', sessionError);
            throw sessionError;
          }

          if (sessionData) {
            // Map the status to our UserStatus type
            let status: UserStatus = 'offline';
            switch (sessionData.status) {
              case 'online':
                status = 'online';
                break;
              case 'away':
                status = 'away';
                break;
              case 'busy':
                status = 'busy';
                break;
              default:
                status = 'offline';
            }
            
            setUserStatusInfo({
              status,
              lastActive: sessionData.last_active,
              loading: false,
              error: null
            });
            return;
          }
        }

        // If we don't have any status data, return a default
        setUserStatusInfo({
          status: 'offline',
          lastActive: null,
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Error fetching user status:', error);
        setUserStatusInfo({
          status: 'offline',
          lastActive: null,
          loading: false,
          error: 'Failed to fetch user status'
        });
      }
    };

    fetchUserStatus();

    // Set up a realtime subscription for user status changes
    // Only if user_sessions table exists
    const checkAndSubscribe = async () => {
      const userSessionsTableExists = await tableExists('user_sessions');
      if (!userSessionsTableExists) return;
      
      const userStatusChannel = supabase
        .channel('user_status_changes')
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_sessions',
          filter: `user_id=eq.${userId}`
        }, (payload) => {
          if (payload.new) {
            setUserStatusInfo({
              status: (payload.new as any).status || 'offline',
              lastActive: (payload.new as any).last_active || null,
              loading: false,
              error: null
            });
          }
        })
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'wali_profiles',
          filter: `user_id=eq.${userId}`
        }, (payload) => {
          if (payload.new) {
            const newData = payload.new as any;
            let mappedStatus: UserStatus = 'offline';
            
            switch (newData.availability_status) {
              case 'available':
                mappedStatus = 'online';
                break;
              case 'busy':
                mappedStatus = 'busy';
                break;
              default:
                mappedStatus = 'offline';
            }
            
            setUserStatusInfo({
              status: mappedStatus,
              lastActive: newData.last_active || null,
              loading: false,
              error: null
            });
          }
        })
        .subscribe();

      return userStatusChannel;
    };
    
    // Start the subscription
    const channelPromise = checkAndSubscribe();
    
    // Clean up subscription on unmount
    return () => {
      channelPromise.then(channel => {
        if (channel) {
          supabase.removeChannel(channel);
        }
      });
    };
  }, [userId]);

  return userStatusInfo;
};

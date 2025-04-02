
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserStatus } from './types';

export const useUserStatus = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userStatus, setUserStatus] = useState<UserStatus>({
    online: false,
    lastActive: null,
    status: 'offline'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get the user's session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          setUserId(session.user.id);
          setIsAuthenticated(true);
          updateUserStatus(session.user.id, 'online');
        } else {
          setIsAuthenticated(false);
          setUserId(null);
        }
      } catch (error) {
        console.error('Error checking user session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setUserId(session.user.id);
          setIsAuthenticated(true);
          updateUserStatus(session.user.id, 'online');
        } else if (event === 'SIGNED_OUT') {
          if (userId) {
            updateUserStatus(userId, 'offline');
          }
          setUserId(null);
          setIsAuthenticated(false);
        }
      }
    );

    // Clean up the subscription
    return () => {
      authListener.subscription.unsubscribe();
      
      // Set status to offline on unmount if we have a userId
      if (userId) {
        updateUserStatus(userId, 'offline');
      }
    };
  }, [userId]);

  const updateUserStatus = async (uid: string, status: 'online' | 'away' | 'offline') => {
    try {
      const now = new Date().toISOString();

      const { error } = await supabase
        .from('profiles')
        .update({
          is_active: status !== 'offline',
          last_active: now
        })
        .eq('id', uid);

      if (error) {
        console.error('Error updating user status:', error);
        return;
      }

      setUserStatus({
        online: status !== 'offline',
        lastActive: now,
        status
      });
    } catch (error) {
      console.error('Error in updateUserStatus:', error);
    }
  };

  const setAway = () => {
    if (userId) {
      updateUserStatus(userId, 'away');
    }
  };

  const setOnline = () => {
    if (userId) {
      updateUserStatus(userId, 'online');
    }
  };

  return {
    userId,
    isAuthenticated,
    userStatus,
    loading,
    setAway,
    setOnline
  };
};

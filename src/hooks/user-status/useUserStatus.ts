
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserStatus } from './types';
import { useOfflineTracking } from './useOfflineTracking';
import { useStatusTableCheck } from './useStatusTableCheck';
import { useFetchUserStatus } from './useFetchUserStatus';
import { useStatusSync } from './useStatusSync';

export const useUserStatus = (userId?: string) => {
  // Internal state for the hook
  const [userToCheck, setUserToCheck] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userStatus, setUserStatus] = useState<UserStatus>({
    online: false,
    lastActive: null,
    status: 'offline'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // If userId is passed, we're checking another user's status
  const isDemoUser = !userId || userId === 'current-user';

  // Set userToCheck based on input userId or current user session
  useEffect(() => {
    if (userId) {
      setUserToCheck(userId);
      setLoading(false);
    } else {
      // Get the user's session
      const checkSession = async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session) {
            setUserToCheck(session.user.id);
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
            setUserToCheck(null);
          }
        } catch (error) {
          console.error('Error checking user session:', error);
        } finally {
          setLoading(false);
        }
      };

      checkSession();
    }
  }, [userId]);

  // Check if user_sessions table exists before querying
  useStatusTableCheck(userToCheck, isDemoUser);

  // Fetch user status
  const { fetchUserStatus } = useFetchUserStatus(
    userToCheck,
    isDemoUser,
    (status) => setUserStatus(prev => ({ ...prev, status })),
    (lastActive) => setUserStatus(prev => ({ ...prev, lastActive })),
    setLoading,
    setError
  );

  // Set up realtime subscription for status updates
  useStatusSync(
    userToCheck,
    isDemoUser,
    (status) => setUserStatus(prev => ({ ...prev, status })),
    (lastActive) => setUserStatus(prev => ({ ...prev, lastActive }))
  );

  // Handle offline status tracking
  useOfflineTracking(userToCheck, isDemoUser);

  // Fetch the initial status
  useEffect(() => {
    if (userToCheck) {
      fetchUserStatus();
    }
  }, [userToCheck, fetchUserStatus]);

  const setAway = () => {
    if (userToCheck && !isDemoUser) {
      updateUserStatus(userToCheck, 'away');
    }
  };

  const setOnline = () => {
    if (userToCheck && !isDemoUser) {
      updateUserStatus(userToCheck, 'online');
    }
  };

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

  return {
    userId: userToCheck,
    isAuthenticated,
    userStatus,
    status: userStatus.status,
    lastActive: userStatus.lastActive,
    loading,
    setAway,
    setOnline
  };
};

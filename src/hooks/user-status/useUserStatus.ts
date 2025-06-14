
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useFetchUserStatus } from './useFetchUserStatus';
import { useUpdateUserStatus } from './useUpdateUserStatus';
import { useOfflineTracking } from './useOfflineTracking';

export interface UserStatusData {
  status: 'online' | 'offline' | 'away' | 'busy';
  lastActive: string | null;
}

export const useUserStatus = (userId?: string | null) => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Get current user ID if not provided
  useEffect(() => {
    if (userId) {
      setCurrentUserId(userId);
      return;
    }

    const getCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUserId(session?.user?.id || null);
    };

    getCurrentUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUserId(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, [userId]);

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Use the custom hooks
  const { userStatus, loading: fetchLoading, error: fetchError } = useFetchUserStatus(userId || currentUserId);
  const { updateStatus, loading: updateLoading } = useUpdateUserStatus();
  const { } = useOfflineTracking(currentUserId);

  // Update user status when online status changes
  useEffect(() => {
    if (currentUserId && updateStatus) {
      const status = isOnline ? 'online' : 'offline';
      updateStatus(status);
    }
  }, [isOnline, currentUserId, updateStatus]);

  // Update user status on page visibility change
  useEffect(() => {
    if (!currentUserId || !updateStatus) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updateStatus('online');
      } else {
        updateStatus('away');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [currentUserId, updateStatus]);

  const setUserStatus = async (status: 'online' | 'offline' | 'away' | 'busy') => {
    if (updateStatus) {
      await updateStatus(status);
    }
  };

  return {
    userId: currentUserId, // Add userId to the return object
    status: userStatus?.status || 'offline',
    lastActive: userStatus?.last_active || null,
    isOnline,
    setStatus: setUserStatus,
    loading: fetchLoading || updateLoading,
    error: fetchError
  };
};

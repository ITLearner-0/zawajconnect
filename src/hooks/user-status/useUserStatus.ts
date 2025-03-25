
import { useState, useEffect, useCallback } from 'react';
import { useFetchUserStatus } from './useFetchUserStatus';
import { useUpdateUserStatus } from './useUpdateUserStatus';
import { useStatusTableCheck } from './useStatusTableCheck';
import { useStatusSync } from './useStatusSync';
import { useOfflineTracking } from './useOfflineTracking';

type UserStatus = 'online' | 'offline' | 'away' | 'busy';

export const useUserStatus = (userId: string | null) => {
  const [status, setStatus] = useState<UserStatus>('offline');
  const [lastActive, setLastActive] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Don't attempt database operations for demo users
  const isDemoUser = userId?.startsWith('user-');

  // Get user status
  const { fetchUserStatus } = useFetchUserStatus(
    userId, 
    isDemoUser, 
    setStatus, 
    setLastActive, 
    setLoading, 
    setError
  );

  // Update user status
  const { updateUserStatus } = useUpdateUserStatus(
    userId, 
    isDemoUser, 
    setStatus, 
    setLastActive, 
    setError
  );

  // Check if table exists before initial query
  useStatusTableCheck(userId, isDemoUser);

  // Set up a listening channel for status updates
  useStatusSync(userId, isDemoUser, setStatus, setLastActive);

  // Handle offline status when the component unmounts or window unloads
  useOfflineTracking(userId, isDemoUser);

  // Initial fetch of user status on mount
  useEffect(() => {
    fetchUserStatus();
  }, [fetchUserStatus]);

  return {
    status,
    lastActive,
    loading,
    error,
    updateStatus: updateUserStatus,
    refreshStatus: fetchUserStatus
  };
};

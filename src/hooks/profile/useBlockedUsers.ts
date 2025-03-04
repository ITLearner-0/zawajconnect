
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { executeSql } from '@/utils/database';

export const useBlockedUsers = (userId: string | null) => {
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBlockedUsers = async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('blocked_users')
        .eq('id', userId)
        .single();

      if (error) {
        console.error("Error fetching blocked users:", error);
        setError("Failed to load blocked users.");
      } else {
        setBlockedUsers(data?.blocked_users || []);
      }
    } catch (err: any) {
      console.error("Error fetching blocked users:", err);
      setError("Failed to load blocked users.");
    } finally {
      setLoading(false);
    }
  };

  const blockUser = async (targetUserId: string) => {
    if (!userId) return false;

    setLoading(true);
    setError(null);

    try {
      // Use SQL query to update the blocked_users array
      const query = `
        UPDATE profiles
        SET blocked_users = array_append(blocked_users, '${targetUserId}')
        WHERE id = '${userId}'
        AND NOT array_contains(blocked_users, ARRAY['${targetUserId}'])
      `;

      const result = await executeSql(query);

      if (!result) {
        setError("Failed to block user.");
        return false;
      } else {
        setBlockedUsers(prev => [...prev, targetUserId]);
        return true;
      }
    } catch (err: any) {
      console.error("Error blocking user:", err);
      setError("Failed to block user.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const unblockUser = async (targetUserId: string) => {
    if (!userId) return false;

    setLoading(true);
    setError(null);

    try {
      // Use SQL query to update the blocked_users array
      const query = `
        UPDATE profiles
        SET blocked_users = array_remove(blocked_users, '${targetUserId}')
        WHERE id = '${userId}'
      `;

      const result = await executeSql(query);

      if (!result) {
        setError("Failed to unblock user.");
        return false;
      } else {
        setBlockedUsers(prev => prev.filter(id => id !== targetUserId));
        return true;
      }
    } catch (err: any) {
      console.error("Error unblocking user:", err);
      setError("Failed to unblock user.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    blockedUsers,
    loading,
    error,
    fetchBlockedUsers,
    blockUser,
    unblockUser
  };
};

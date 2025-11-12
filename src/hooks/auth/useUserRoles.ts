import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type UserRole = 'admin' | 'moderator' | 'user';

export const useUserRoles = () => {
  const { user } = useAuth();
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserRoles = async () => {
    if (!user) {
      setRoles([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      setRoles(data?.map((item) => item.role as UserRole) || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching user roles:', err);
      setError(err.message);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserRoles();
  }, [user]);

  const hasRole = (role: UserRole): boolean => {
    return roles.includes(role);
  };

  const isAdmin = (): boolean => {
    return hasRole('admin');
  };

  const isModerator = (): boolean => {
    return hasRole('moderator');
  };

  const hasAdminOrModerator = (): boolean => {
    return isAdmin() || isModerator();
  };

  return {
    roles,
    loading,
    error,
    hasRole,
    isAdmin,
    isModerator,
    hasAdminOrModerator,
    refetch: fetchUserRoles,
  };
};

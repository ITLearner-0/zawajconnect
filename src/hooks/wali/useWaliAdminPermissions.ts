import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export type WaliAdminRole = 'viewer' | 'editor' | 'approver' | 'super_admin';

export interface WaliAdminPermission {
  id: string;
  user_id: string;
  role: WaliAdminRole;
  assigned_by?: string;
  assigned_at: string;
  notes?: string;
  user_email?: string;
  user_name?: string;
}

export interface WaliPermissionCheck {
  canView: boolean;
  canEdit: boolean;
  canApprove: boolean;
  canManagePermissions: boolean;
  role: WaliAdminRole | null;
}

export const useWaliAdminPermissions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [permissions, setPermissions] = useState<WaliPermissionCheck>({
    canView: false,
    canEdit: false,
    canApprove: false,
    canManagePermissions: false,
    role: null,
  });
  const [loading, setLoading] = useState(true);
  const [allPermissions, setAllPermissions] = useState<WaliAdminPermission[]>([]);

  useEffect(() => {
    if (user) {
      fetchUserPermissions();
    }
  }, [user]);

  const fetchUserPermissions = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await (supabase as any)
        .from('wali_admin_permissions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      const role = data?.role as WaliAdminRole | null;

      setPermissions({
        canView: !!role,
        canEdit: role === 'editor' || role === 'approver' || role === 'super_admin',
        canApprove: role === 'approver' || role === 'super_admin',
        canManagePermissions: role === 'super_admin',
        role,
      });
    } catch (err) {
      console.error('Error fetching user permissions:', err);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger vos permissions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAllPermissions = async () => {
    if (!permissions.canManagePermissions) {
      return;
    }

    try {
      const { data, error } = await (supabase as any)
        .from('wali_admin_permissions')
        .select('*')
        .order('assigned_at', { ascending: false });

      if (error) throw error;

      const enrichedPermissions = data.map((perm: any) => ({
        ...perm,
        user_email: undefined,
        user_name: `Utilisateur ${perm.user_id.substring(0, 8)}`,
      }));

      setAllPermissions(enrichedPermissions as WaliAdminPermission[]);
    } catch (err) {
      console.error('Error fetching all permissions:', err);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les permissions',
        variant: 'destructive',
      });
    }
  };

  const assignPermission = async (
    userId: string,
    role: WaliAdminRole,
    notes?: string
  ): Promise<boolean> => {
    if (!permissions.canManagePermissions) {
      toast({
        title: 'Accès refusé',
        description: 'Vous n\'avez pas la permission de gérer les rôles',
        variant: 'destructive',
      });
      return false;
    }

    try {
      const { error } = await (supabase as any).from('wali_admin_permissions').upsert({
        user_id: userId,
        role,
        assigned_by: user?.id,
        notes,
      });

      if (error) throw error;

      toast({
        title: 'Permission assignée',
        description: `Le rôle ${role} a été assigné avec succès`,
      });

      await fetchAllPermissions();
      return true;
    } catch (err) {
      console.error('Error assigning permission:', err);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'assigner la permission',
        variant: 'destructive',
      });
      return false;
    }
  };

  const revokePermission = async (userId: string): Promise<boolean> => {
    if (!permissions.canManagePermissions) {
      toast({
        title: 'Accès refusé',
        description: 'Vous n\'avez pas la permission de révoquer les rôles',
        variant: 'destructive',
      });
      return false;
    }

    try {
      const { error } = await (supabase as any)
        .from('wali_admin_permissions')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: 'Permission révoquée',
        description: 'La permission a été révoquée avec succès',
      });

      await fetchAllPermissions();
      return true;
    } catch (err) {
      console.error('Error revoking permission:', err);
      toast({
        title: 'Erreur',
        description: 'Impossible de révoquer la permission',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    permissions,
    loading,
    allPermissions,
    fetchAllPermissions,
    assignPermission,
    revokePermission,
    refetch: fetchUserPermissions,
  };
};

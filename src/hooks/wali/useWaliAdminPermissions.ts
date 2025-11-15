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

export interface WaliPermissionAudit {
  id: string;
  user_id: string;
  old_role: WaliAdminRole | null;
  new_role: WaliAdminRole | null;
  changed_by: string;
  changed_at: string;
  reason?: string;
  user_email?: string;
  changed_by_email?: string;
}

export interface UserSearchResult {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
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
  const [auditHistory, setAuditHistory] = useState<WaliPermissionAudit[]>([]);

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
      // Fetch permissions with user emails from profiles
      const { data, error } = await (supabase as any)
        .from('wali_admin_permissions')
        .select(`
          *,
          profiles!wali_admin_permissions_user_id_fkey(email, full_name)
        `)
        .order('assigned_at', { ascending: false });

      if (error) throw error;

      const enrichedPermissions = data.map((perm: any) => ({
        ...perm,
        user_email: perm.profiles?.email,
        user_name: perm.profiles?.full_name || `Utilisateur ${perm.user_id.substring(0, 8)}`,
        profiles: undefined, // Remove nested object
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

  const searchUsers = async (email: string): Promise<UserSearchResult[]> => {
    if (!permissions.canManagePermissions || !email) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, email, full_name, created_at')
        .ilike('email', `%${email}%`)
        .limit(10);

      if (error) throw error;

      return (data || []).map((profile: any) => ({
        id: profile.user_id,
        email: profile.email,
        full_name: profile.full_name,
        created_at: profile.created_at,
      }));
    } catch (err) {
      console.error('Error searching users:', err);
      return [];
    }
  };

  const fetchAuditHistory = async (userId?: string) => {
    if (!permissions.canManagePermissions) {
      return;
    }

    try {
      let query = (supabase as any)
        .from('wali_admin_permission_audit')
        .select(`
          *,
          user:profiles!wali_admin_permission_audit_user_id_fkey(email),
          changer:profiles!wali_admin_permission_audit_changed_by_fkey(email)
        `)
        .order('changed_at', { ascending: false })
        .limit(100);

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const enrichedHistory = (data || []).map((audit: any) => ({
        ...audit,
        user_email: audit.user?.email,
        changed_by_email: audit.changer?.email,
        user: undefined,
        changer: undefined,
      }));

      setAuditHistory(enrichedHistory as WaliPermissionAudit[]);
    } catch (err) {
      console.error('Error fetching audit history:', err);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger l\'historique',
        variant: 'destructive',
      });
    }
  };

  const fetchUserActions = async (adminUserId: string) => {
    if (!permissions.canManagePermissions) {
      return [];
    }

    try {
      const { data, error } = await (supabase as any)
        .from('wali_admin_audit_trail')
        .select('*')
        .eq('admin_user_id', adminUserId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      return data || [];
    } catch (err) {
      console.error('Error fetching user actions:', err);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les actions de l\'utilisateur',
        variant: 'destructive',
      });
      return [];
    }
  };

  const fetchUserPermission = async (userId: string): Promise<WaliAdminPermission | null> => {
    if (!permissions.canManagePermissions) {
      return null;
    }

    try {
      const { data, error } = await (supabase as any)
        .from('wali_admin_permissions')
        .select(`
          *,
          profiles!wali_admin_permissions_user_id_fkey(email, full_name)
        `)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;

      if (!data) return null;

      return {
        ...data,
        user_email: data.profiles?.email,
        user_name: data.profiles?.full_name || `Utilisateur ${data.user_id.substring(0, 8)}`,
        profiles: undefined,
      };
    } catch (err) {
      console.error('Error fetching user permission:', err);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les informations de l\'utilisateur',
        variant: 'destructive',
      });
      return null;
    }
  };

  const assignPermissionBulk = async (
    assignments: Array<{ userId: string; role: WaliAdminRole; notes?: string }>
  ): Promise<{ success: number; failed: number }> => {
    if (!permissions.canManagePermissions) {
      toast({
        title: 'Accès refusé',
        description: 'Vous n\'avez pas la permission de gérer les rôles',
        variant: 'destructive',
      });
      return { success: 0, failed: assignments.length };
    }

    let success = 0;
    let failed = 0;

    for (const assignment of assignments) {
      try {
        const { error } = await (supabase as any)
          .from('wali_admin_permissions')
          .upsert({
            user_id: assignment.userId,
            role: assignment.role,
            assigned_by: user?.id,
            notes: assignment.notes,
          });

        if (error) throw error;
        success++;
      } catch (err) {
        console.error('Error assigning permission:', err);
        failed++;
      }
    }

    toast({
      title: 'Assignation en masse terminée',
      description: `${success} succès, ${failed} échecs`,
      variant: failed > 0 ? 'destructive' : 'default',
    });

    await fetchAllPermissions();
    await fetchAuditHistory();

    return { success, failed };
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
    auditHistory,
    fetchAllPermissions,
    assignPermission,
    revokePermission,
    refetch: fetchUserPermissions,
    searchUsers,
    fetchAuditHistory,
    assignPermissionBulk,
    fetchUserActions,
    fetchUserPermission,
  };
};

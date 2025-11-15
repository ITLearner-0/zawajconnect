import { useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWaliAdminPermissions, WaliAdminPermission } from '@/hooks/wali/useWaliAdminPermissions';
import { WaliAdminTabs } from '@/components/wali/navigation';
import { UserDetailsCard } from '@/components/wali/permissions/UserDetailsCard';
import { UserActionsHistory, AdminAction } from '@/components/wali/permissions/UserActionsHistory';
import { PermissionHistory } from '@/components/wali/permissions/PermissionHistory';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AdminWaliUserDetails = () => {
  const { userId } = useParams<{ userId: string }>();
  const {
    permissions,
    loading: permissionsLoading,
    fetchUserPermission,
    fetchUserActions,
    fetchAuditHistory,
    auditHistory,
  } = useWaliAdminPermissions();

  const [userPermission, setUserPermission] = useState<WaliAdminPermission | null>(null);
  const [userActions, setUserActions] = useState<AdminAction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      if (!userId || !permissions.canManagePermissions) return;

      setLoading(true);

      // Fetch user permission details
      const permData = await fetchUserPermission(userId);
      setUserPermission(permData);

      // Fetch user actions history
      const actions = await fetchUserActions(userId);
      setUserActions(actions);

      // Fetch permission change history for this user
      await fetchAuditHistory(userId);

      setLoading(false);
    };

    if (permissions.canManagePermissions) {
      loadUserData();
    }
  }, [userId, permissions.canManagePermissions]);

  if (permissionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!permissions.canManagePermissions) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (!userId) {
    return <Navigate to="/admin/wali-permissions" replace />;
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <WaliAdminTabs />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/admin/wali-permissions">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Détails de l'Administrateur</h1>
            <p className="text-muted-foreground">Historique complet des permissions et actions</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : !userPermission ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Aucune permission trouvée pour cet utilisateur</p>
          <Button variant="outline" className="mt-4" asChild>
            <Link to="/admin/wali-permissions">Retour à la liste</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <UserDetailsCard permission={userPermission} />

          <Tabs defaultValue="actions" className="space-y-6">
            <TabsList>
              <TabsTrigger value="actions">Actions ({userActions.length})</TabsTrigger>
              <TabsTrigger value="permissions">
                Changements de Permissions ({auditHistory.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="actions">
              <UserActionsHistory actions={userActions} />
            </TabsContent>

            <TabsContent value="permissions">
              <PermissionHistory history={auditHistory} />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default AdminWaliUserDetails;

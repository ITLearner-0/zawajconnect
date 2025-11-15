import { useEffect, useState } from 'react';
import { Shield, Users, Plus, Search, UserPlus, History, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useWaliAdminPermissions } from '@/hooks/wali/useWaliAdminPermissions';
import { Navigate, Link } from 'react-router-dom';
import {
  AssignPermissionDialog,
  UserSearchDialog,
  BulkAssignDialog,
  PermissionHistory,
} from '@/components/wali/permissions';
import { WaliAdminTabs } from '@/components/wali/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AdminWaliPermissions = () => {
  const {
    permissions,
    loading,
    allPermissions,
    auditHistory,
    fetchAllPermissions,
    assignPermission,
    revokePermission,
    searchUsers,
    fetchAuditHistory,
    assignPermissionBulk,
  } = useWaliAdminPermissions();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  useEffect(() => {
    if (permissions.canManagePermissions) {
      fetchAllPermissions();
      fetchAuditHistory();
    }
  }, [permissions.canManagePermissions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Chargement...</p>
      </div>
    );
  }

  if (!permissions.canManagePermissions) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const getRoleBadge = (role: string) => {
    const variants: Record<
      string,
      { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }
    > = {
      super_admin: { variant: 'destructive', label: 'Super Admin' },
      approver: { variant: 'default', label: 'Approbateur' },
      editor: { variant: 'secondary', label: 'Éditeur' },
      viewer: { variant: 'outline', label: 'Visualiseur' },
    };
    const config = variants[role] ?? { variant: 'outline' as const, label: 'Visualiseur' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getRoleDescription = (role: string) => {
    const descriptions: Record<string, string> = {
      super_admin: 'Tous les droits + gestion des permissions',
      approver: 'Peut approuver/rejeter les inscriptions',
      editor: 'Peut modifier les inscriptions',
      viewer: 'Lecture seule',
    };
    return descriptions[role] || '';
  };

  const filteredPermissions = allPermissions.filter((perm) => {
    if (!searchFilter) return true;
    const searchLower = searchFilter.toLowerCase();
    return (
      perm.user_email?.toLowerCase().includes(searchLower) ||
      perm.user_name?.toLowerCase().includes(searchLower) ||
      perm.user_id.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="container mx-auto py-8 space-y-6">
      <WaliAdminTabs />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Gestion des Permissions</h1>
            <p className="text-muted-foreground">
              Gérer les niveaux d'accès des administrateurs Wali
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setSearchDialogOpen(true)}>
            <Search className="w-4 h-4 mr-2" />
            Rechercher
          </Button>
          <Button variant="outline" onClick={() => setBulkDialogOpen(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            En masse
          </Button>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Assigner
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allPermissions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Super Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {allPermissions.filter((p) => p.role === 'super_admin').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Approbateurs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {allPermissions.filter((p) => p.role === 'approver').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Éditeurs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {allPermissions.filter((p) => p.role === 'editor').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="permissions" className="space-y-6">
        <TabsList>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
        </TabsList>

        <TabsContent value="permissions" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <Input
              placeholder="Rechercher par email ou nom..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Permissions Actuelles</CardTitle>
              <CardDescription>
                Liste des administrateurs et leurs niveaux d'accès ({filteredPermissions.length})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Assigné le</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPermissions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        {searchFilter ? 'Aucun résultat trouvé' : 'Aucune permission configurée'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPermissions.map((perm) => (
                      <TableRow key={perm.id}>
                        <TableCell className="font-medium">
                          {perm.user_name || 'Utilisateur inconnu'}
                        </TableCell>
                        <TableCell>{perm.user_email || '-'}</TableCell>
                        <TableCell>{getRoleBadge(perm.role)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {getRoleDescription(perm.role)}
                        </TableCell>
                        <TableCell>
                          {new Date(perm.assigned_at).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link to={`/admin/wali-permissions/${perm.user_id}`}>
                                <Eye className="w-4 h-4 mr-2" />
                                Détails
                              </Link>
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => revokePermission(perm.user_id)}
                            >
                              Révoquer
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <PermissionHistory history={auditHistory} />
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Niveaux de Permission</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {getRoleBadge('super_admin')}
              <span className="font-medium">Super Admin</span>
            </div>
            <p className="text-sm text-muted-foreground ml-20">
              Accès complet : peut voir, modifier, approuver/rejeter les inscriptions et gérer
              toutes les permissions.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {getRoleBadge('approver')}
              <span className="font-medium">Approbateur</span>
            </div>
            <p className="text-sm text-muted-foreground ml-20">
              Peut voir, modifier et approuver/rejeter les inscriptions Wali.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {getRoleBadge('editor')}
              <span className="font-medium">Éditeur</span>
            </div>
            <p className="text-sm text-muted-foreground ml-20">
              Peut voir et modifier les inscriptions, mais ne peut pas approuver/rejeter.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {getRoleBadge('viewer')}
              <span className="font-medium">Visualiseur</span>
            </div>
            <p className="text-sm text-muted-foreground ml-20">
              Lecture seule : peut uniquement consulter les inscriptions et statistiques.
            </p>
          </div>
        </CardContent>
      </Card>

      <AssignPermissionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onAssign={assignPermission}
      />

      <UserSearchDialog
        open={searchDialogOpen}
        onOpenChange={setSearchDialogOpen}
        onAssign={assignPermission}
        onSearch={searchUsers}
      />

      <BulkAssignDialog
        open={bulkDialogOpen}
        onOpenChange={setBulkDialogOpen}
        onAssign={assignPermissionBulk}
        onSearchUser={searchUsers}
      />
    </div>
  );
};

export default AdminWaliPermissions;

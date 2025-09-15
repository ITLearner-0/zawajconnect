import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import IslamicModerationPanel from './IslamicModerationPanel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import SecurityPrivacyPanel from '@/components/SecurityPrivacyPanel';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import SubscriptionManagement from '@/components/SubscriptionManagement';
import { 
  Users, 
  Heart, 
  MessageCircle, 
  AlertTriangle, 
  Shield, 
  Crown,
  Eye,
  Ban,
  CheckCircle,
  XCircle,
  BarChart3,
  Settings,
  UserCheck,
  Search,
  Lock,
  Trash2
} from 'lucide-react';

interface AdminDashboardProps {
  userRole?: string | null;
}

interface User {
  id: string;
  user_id: string;
  full_name: string;
  age: number;
  location: string;
  created_at: string;
  user_roles: {
    role: string;
  }[] | null;
  user_status?: {
    status: string;
    reason?: string;
    expires_at?: string;
  } | null;
}

interface Report {
  id: string;
  report_type: string;
  description: string;
  status: string;
  created_at: string;
  reporter: {
    full_name: string;
  } | null;
  reported_user: {
    full_name: string;
  } | null;
}

interface Stats {
  totalUsers: number;
  activeMatches: number;
  totalMessages: number;
  pendingReports: number;
  verifiedUsers: number;
}

const AdminDashboard = ({ userRole }: AdminDashboardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeMatches: 0,
    totalMessages: 0,
    pendingReports: 0,
    verifiedUsers: 0
  });
  const [users, setUsers] = useState<User[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [assigningRole, setAssigningRole] = useState(false);
  const [updatingReport, setUpdatingReport] = useState<string | null>(null);
  const [managingUser, setManagingUser] = useState<string | null>(null);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      // Load statistics
      const [usersCount, matchesCount, messagesCount, reportsCount, verifiedCount] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('matches').select('*', { count: 'exact', head: true }).eq('is_mutual', true),
        supabase.from('messages').select('*', { count: 'exact', head: true }),
        supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('user_verifications').select('*', { count: 'exact', head: true }).gte('verification_score', 80)
      ]);

      setStats({
        totalUsers: usersCount.count || 0,
        activeMatches: matchesCount.count || 0,
        totalMessages: messagesCount.count || 0,
        pendingReports: reportsCount.count || 0,
        verifiedUsers: verifiedCount.count || 0
      });

      // Load users with profiles (separate from roles and status)
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (usersError) throw usersError;

      // Load user roles separately
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Load user status separately
      const { data: statusData, error: statusError } = await supabase
        .from('user_status')
        .select('user_id, status, reason, expires_at');

      if (statusError) throw statusError;

      // Combine users with their roles and status
      const usersWithRoles = (usersData || []).map(user => {
        const userRole = rolesData?.find(role => role.user_id === user.user_id);
        const userStatus = statusData?.find(status => status.user_id === user.user_id);
        return {
          ...user,
          user_roles: userRole ? [{ role: userRole.role }] : [{ role: 'user' }],
          user_status: userStatus || { status: 'active' }
        };
      });

      setUsers(usersWithRoles as any);

      // Load reports with manual profile lookups
      const { data: reportsData, error: reportsError } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (reportsError) throw reportsError;

      // Get profile names for reporters and reported users
      const reportsWithProfiles = await Promise.all(
        (reportsData || []).map(async (report) => {
          const [reporterProfile, reportedProfile] = await Promise.all([
            supabase.from('profiles').select('full_name').eq('user_id', report.reporter_id).maybeSingle(),
            supabase.from('profiles').select('full_name').eq('user_id', report.reported_user_id).maybeSingle()
          ]);

          return {
            ...report,
            reporter: reporterProfile.data,
            reported_user: reportedProfile.data
          };
        })
      );

      setReports(reportsWithProfiles as any);

    } catch (error) {
      console.error('Error loading admin data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données administrateur",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const assignRole = async () => {
    if (!selectedUser || !selectedRole) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un utilisateur et un rôle",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: selectedUser,
          role: selectedRole as 'super_admin' | 'admin' | 'moderator' | 'user',
          assigned_by: user?.id
        });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Rôle attribué avec succès"
      });

      loadAdminData();
      setSelectedUser('');
      setSelectedRole('');
    } catch (error) {
      console.error('Error assigning role:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'attribuer le rôle",
        variant: "destructive"
      });
    }
  };

  const updateReportStatus = async (reportId: string, status: string) => {
    if (updatingReport === reportId) return; // Prevent double-click
    setUpdatingReport(reportId);

    try {
      const { error } = await supabase
        .from('reports')
        .update({ 
          status,
          resolved_at: new Date().toISOString(),
          resolved_by: user?.id
        })
        .eq('id', reportId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: `Rapport ${status === 'resolved' ? 'résolu' : 'rejeté'}`
      });

      loadAdminData();
    } catch (error) {
      console.error('Error updating report:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le rapport",
        variant: "destructive"
      });
    } finally {
      setUpdatingReport(null);
    }
  };

  const updateUserStatus = async (userId: string, status: 'active' | 'suspended' | 'blocked' | 'banned' | 'deleted', reason?: string, expiresAt?: string) => {
    if (managingUser === userId) return; // Prevent double-click
    setManagingUser(userId);

    try {
      const { error } = await supabase
        .from('user_status')
        .upsert({
          user_id: userId,
          status,
          reason: reason || `Statut modifié par l'administrateur`,
          admin_notes: `Action effectuée par ${user?.email} le ${new Date().toLocaleDateString('fr-FR')}`,
          created_by: user?.id,
          expires_at: expiresAt || null
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      const statusLabels = {
        active: 'activé',
        suspended: 'suspendu',
        blocked: 'bloqué',
        banned: 'banni',
        deleted: 'supprimé'
      };

      toast({
        title: "Succès",
        description: `Utilisateur ${statusLabels[status]} avec succès`
      });

      loadAdminData();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut utilisateur",
        variant: "destructive"
      });
    } finally {
      setManagingUser(null);
    }
  };

  const deleteUserPermanently = async (userId: string, userName: string) => {
    if (managingUser === userId) return; // Prevent double-click
    setManagingUser(userId);

    try {
      // Delete user profile (this will cascade to related tables due to foreign key constraints)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Suppression définitive",
        description: `L'utilisateur ${userName} a été définitivement supprimé de la base de données`
      });

      loadAdminData();
    } catch (error) {
      console.error('Error permanently deleting user:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer définitivement l'utilisateur. Certaines données peuvent être liées à cet utilisateur.",
        variant: "destructive"
      });
    } finally {
      setManagingUser(null);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'super_admin': return 'default';
      case 'admin': return 'secondary';
      case 'moderator': return 'outline';
      default: return 'outline';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin': return Crown;
      case 'admin': return Shield;
      case 'moderator': return Eye;
      default: return Users;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'suspended': return 'secondary';
      case 'blocked': return 'destructive';
      case 'banned': return 'outline';
      case 'deleted': return 'outline';
      default: return 'outline';
    }
  };

  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.user_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tableau de Bord Admin</h1>
          <p className="text-muted-foreground">Gérez votre plateforme matrimoniale islamique</p>
        </div>
        <Badge variant="default" className="text-lg px-4 py-2">
          <Crown className="h-4 w-4 mr-2" />
          {userRole?.replace('_', ' ').toUpperCase()}
        </Badge>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Utilisateurs</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-emerald" />
              <div>
                <p className="text-sm text-muted-foreground">Matches actifs</p>
                <p className="text-2xl font-bold">{stats.activeMatches}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-gold" />
              <div>
                <p className="text-sm text-muted-foreground">Messages</p>
                <p className="text-2xl font-bold">{stats.totalMessages}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-sm text-muted-foreground">Rapports</p>
                <p className="text-2xl font-bold">{stats.pendingReports}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald" />
              <div>
                <p className="text-sm text-muted-foreground">Vérifiés</p>
                <p className="text-2xl font-bold">{stats.verifiedUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Tabs */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="subscriptions">Abonnements</TabsTrigger>
          <TabsTrigger value="roles">Rôles</TabsTrigger>
          <TabsTrigger value="reports">Rapports</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des Utilisateurs</CardTitle>
              <CardDescription>Gérez les comptes utilisateurs de la plateforme</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Rechercher par nom ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
                <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>Âge</TableHead>
                    <TableHead>Localisation</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Inscrit le</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => {
                    const role = user.user_roles?.[0]?.role || 'user';
                    const status = user.user_status?.status || 'active';
                    const RoleIcon = getRoleIcon(role);
                    const isManaging = managingUser === user.user_id;
                    
                    return (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.full_name || 'N/A'}
                        </TableCell>
                        <TableCell className="font-mono text-xs">{user.user_id || 'N/A'}</TableCell>
                        <TableCell>{user.age || 'N/A'}</TableCell>
                        <TableCell>{user.location || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(role)} className="capitalize">
                            <RoleIcon className="h-3 w-3 mr-1" />
                            {role.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(status)} className="capitalize">
                            {status === 'active' && <CheckCircle className="h-3 w-3 mr-1" />}
                            {status === 'suspended' && <AlertTriangle className="h-3 w-3 mr-1" />}
                            {status === 'blocked' && <Ban className="h-3 w-3 mr-1" />}
                            {status === 'banned' && <XCircle className="h-3 w-3 mr-1" />}
                            {status === 'deleted' && <Trash2 className="h-3 w-3 mr-1" />}
                            {status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(user.created_at).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {status !== 'active' && status !== 'deleted' && (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={isManaging}
                                onClick={() => updateUserStatus(user.user_id, 'active')}
                                title="Réactiver"
                              >
                                <CheckCircle className="h-3 w-3" />
                              </Button>
                            )}
                            {status === 'deleted' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={isManaging}
                                  onClick={() => {
                                    if (window.confirm('Êtes-vous sûr de vouloir restaurer cet utilisateur ?')) {
                                      updateUserStatus(user.user_id, 'active', 'Utilisateur restauré par l\'administrateur');
                                    }
                                  }}
                                  title="Restaurer l'utilisateur"
                                >
                                  <CheckCircle className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  disabled={isManaging}
                                  onClick={() => {
                                    if (window.confirm(`⚠️ ATTENTION ⚠️\n\nVoulez-vous DÉFINITIVEMENT supprimer ${user.full_name || 'cet utilisateur'} ?\n\nCette action est IRRÉVERSIBLE et supprimera :\n- Le profil utilisateur\n- Toutes ses données\n- Son historique\n\nTapez "SUPPRIMER" pour confirmer.`)) {
                                      const confirmation = prompt('Pour confirmer la suppression définitive, tapez exactement "SUPPRIMER" (en majuscules) :');
                                      if (confirmation === 'SUPPRIMER') {
                                        deleteUserPermanently(user.user_id, user.full_name || 'Utilisateur');
                                      } else {
                                        toast({
                                          title: "Suppression annulée",
                                          description: "La confirmation n'était pas correcte."
                                        });
                                      }
                                    }
                                  }}
                                  title="Supprimer définitivement (IRRÉVERSIBLE)"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </>
                            )}
                            {status === 'active' && (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={isManaging}
                                onClick={() => updateUserStatus(user.user_id, 'suspended', 'Suspendu par l\'administrateur')}
                                title="Suspendre"
                              >
                                <AlertTriangle className="h-3 w-3" />
                              </Button>
                            )}
                            {status === 'active' && (
                              <Button
                                size="sm"
                                variant="destructive"
                                disabled={isManaging}
                                onClick={() => updateUserStatus(user.user_id, 'blocked', 'Bloqué par l\'administrateur')}
                                title="Bloquer"
                              >
                                <Ban className="h-3 w-3" />
                              </Button>
                            )}
                            {status !== 'deleted' && (
                              <Button
                                size="sm"
                                variant="destructive"
                                disabled={isManaging}
                                onClick={() => {
                                  if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action ne peut pas être annulée.')) {
                                    updateUserStatus(user.user_id, 'deleted', 'Utilisateur supprimé par l\'administrateur');
                                  }
                                }}
                                title="Supprimer définitivement"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions" className="space-y-4">
          <SubscriptionManagement />
        </TabsContent>

        {/* Roles Tab */}
        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Attribution des Rôles</CardTitle>
              <CardDescription>Attribuez des rôles administratifs aux utilisateurs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="user-select">Utilisateur</Label>
                  <Select value={selectedUser} onValueChange={setSelectedUser}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un utilisateur" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.user_id}>
                          {user.full_name || user.user_id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="role-select">Rôle</Label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      {userRole === 'super_admin' && (
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                      )}
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="moderator">Modérateur</SelectItem>
                      <SelectItem value="user">Utilisateur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={assignRole} 
                    disabled={assigningRole || !selectedUser || !selectedRole}
                    className="w-full"
                  >
                    {assigningRole ? "Attribution..." : "Attribuer le rôle"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des Rapports</CardTitle>
              <CardDescription>Traitez les rapports et signalements d'utilisateurs</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Rapporteur</TableHead>
                    <TableHead>Utilisateur signalé</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="capitalize">{report.report_type}</TableCell>
                      <TableCell>{report.reporter?.full_name || 'N/A'}</TableCell>
                      <TableCell>{report.reported_user?.full_name || 'N/A'}</TableCell>
                      <TableCell className="max-w-xs truncate">{report.description}</TableCell>
                      <TableCell>
                        <Badge variant={report.status === 'pending' ? 'destructive' : 'default'}>
                          {report.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {report.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateReportStatus(report.id, 'resolved')}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateReportStatus(report.id, 'rejected')}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security & Privacy Tab */}
        <TabsContent value="security" className="space-y-4">
          <SecurityPrivacyPanel />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <AnalyticsDashboard />
        </TabsContent>

        {/* Moderation Tab */}
        <TabsContent value="moderation" className="space-y-4">
          <IslamicModerationPanel />
        </TabsContent>
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres Système</CardTitle>
              <CardDescription>Configuration avancée de la plateforme</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Rôle actuel</h4>
                  <div className="flex items-center gap-2">
                    {userRole === 'super_admin' && <Crown className="h-5 w-5 text-gold" />}
                    {userRole === 'admin' && <Shield className="h-5 w-5 text-emerald" />}
                    {userRole === 'moderator' && <Eye className="h-5 w-5 text-blue-500" />}
                    <span className="capitalize font-medium">
                      {userRole?.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Privilèges</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>✅ Gestion complète des utilisateurs</li>
                    <li>✅ Attribution des rôles administratifs</li>
                    <li>✅ Modération des rapports</li>
                    <li>✅ Accès aux statistiques avancées</li>
                    <li>✅ Configuration système</li>
                    {userRole === 'super_admin' && (
                      <li>✅ Privilèges Super Administrateur</li>
                    )}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
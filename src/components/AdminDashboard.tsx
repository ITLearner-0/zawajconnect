import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
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
  Lock
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

      // Load users with profiles (separate from roles)
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

      // Combine users with their roles
      const usersWithRoles = (usersData || []).map(user => {
        const userRole = rolesData?.find(role => role.user_id === user.user_id);
        return {
          ...user,
          user_roles: userRole ? [{ role: userRole.role }] : [{ role: 'user' }]
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
            supabase.from('profiles').select('full_name').eq('user_id', report.reporter_id).single(),
            supabase.from('profiles').select('full_name').eq('user_id', report.reported_user_id).single()
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
                    <TableHead>Inscrit le</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => {
                    const role = user.user_roles?.[0]?.role || 'user';
                    const RoleIcon = getRoleIcon(role);
                    
                    return (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.full_name || 'N/A'}
                        </TableCell>
                        <TableCell>{user.user_id || 'N/A'}</TableCell>
                        <TableCell>{user.age || 'N/A'}</TableCell>
                        <TableCell>{user.location || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(role)} className="capitalize">
                            <RoleIcon className="h-3 w-3 mr-1" />
                            {role.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(user.created_at).toLocaleDateString('fr-FR')}
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
                  <Button onClick={assignRole} className="w-full">
                    Attribuer le rôle
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

        {/* Settings Tab */}
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
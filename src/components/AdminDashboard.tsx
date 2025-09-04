import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Users, Flag, CheckCircle, XCircle, Shield, BarChart3, UserCheck, MessageSquare, Eye, Ban, Search } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  created_at: string;
  profiles: {
    full_name: string;
    age: number;
    location: string;
  } | null;
  user_verifications: {
    verification_score: number;
    email_verified: boolean;
    phone_verified: boolean;
    id_verified: boolean;
  } | null;
}

interface Report {
  id: string;
  report_type: string;
  description: string;
  status: string;
  created_at: string;
  reporter_id: string;
  reported_user_id: string;
  admin_notes?: string;
  profiles: {
    full_name: string;
  };
}

interface Stats {
  totalUsers: number;
  verifiedUsers: number;
  activeMatches: number;
  pendingReports: number;
  todayRegistrations: number;
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    verifiedUsers: 0,
    activeMatches: 0,
    pendingReports: 0,
    todayRegistrations: 0
  });
  const [users, setUsers] = useState<User[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch stats
      const { data: allProfiles } = await supabase
        .from('profiles')
        .select('id, created_at');

      const { data: verificationsData } = await supabase
        .from('user_verifications')
        .select('verification_score')
        .gte('verification_score', 50);

      const { data: matchesData } = await supabase
        .from('matches')
        .select('id')
        .eq('is_mutual', true);

      const { data: pendingReportsData } = await supabase
        .from('reports')
        .select('id')
        .eq('status', 'pending');

      const today = new Date().toISOString().split('T')[0];
      const todayProfiles = allProfiles?.filter(p => 
        p.created_at.startsWith(today)
      ).length || 0;

      setStats({
        totalUsers: allProfiles?.length || 0,
        verifiedUsers: verificationsData?.length || 0,
        activeMatches: matchesData?.length || 0,
        pendingReports: pendingReportsData?.length || 0,
        todayRegistrations: todayProfiles
      });

      // Fetch users with profiles and verifications
      const { data: usersData } = await supabase
        .from('profiles')
        .select(`
          user_id,
          full_name,
          age,
          location,
          created_at
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      // Fetch verification data separately
      const userIds = usersData?.map(u => u.user_id) || [];
      const { data: verificationsMap } = await supabase
        .from('user_verifications')
        .select('user_id, verification_score, email_verified, phone_verified, id_verified')
        .in('user_id', userIds);

      const verificationsByUserId = new Map(
        verificationsMap?.map(v => [v.user_id, v]) || []
      );

      setUsers(usersData?.map(profile => ({
        id: profile.user_id,
        email: '', // Would need to fetch from auth.users in a real app
        created_at: profile.created_at,
        profiles: {
          full_name: profile.full_name || '',
          age: profile.age || 0,
          location: profile.location || ''
        },
        user_verifications: verificationsByUserId.get(profile.user_id) ? {
          verification_score: verificationsByUserId.get(profile.user_id)!.verification_score || 0,
          email_verified: verificationsByUserId.get(profile.user_id)!.email_verified || false,
          phone_verified: verificationsByUserId.get(profile.user_id)!.phone_verified || false,
          id_verified: verificationsByUserId.get(profile.user_id)!.id_verified || false
        } : null
      })) || []);

      // Fetch reports
      const { data: reportsData } = await supabase
        .from('reports')
        .select(`
          id,
          report_type,
          description,
          status,
          created_at,
          reporter_id,
          reported_user_id,
          admin_notes
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      // Fetch profile names for reported users
      const reportedUserIds = reportsData?.map(r => r.reported_user_id) || [];
      const { data: reportedUserProfiles } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', reportedUserIds);

      const reportedProfilesMap = new Map(reportedUserProfiles?.map(p => [p.user_id, p.full_name]) || []);

      setReports(reportsData?.map(report => ({
        ...report,
        profiles: {
          full_name: reportedProfilesMap.get(report.reported_user_id) || 'Utilisateur inconnu'
        }
      })) || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du tableau de bord",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReportAction = async (reportId: string, action: 'approve' | 'reject', notes?: string) => {
    try {
      const { error } = await supabase
        .from('reports')
        .update({
          status: action === 'approve' ? 'resolved' : 'dismissed',
          admin_notes: notes,
          resolved_by: user?.id,
          resolved_at: new Date().toISOString()
        })
        .eq('id', reportId);

      if (error) throw error;

      toast({
        title: "Signalement traité",
        description: `Le signalement a été ${action === 'approve' ? 'approuvé' : 'rejeté'}`,
      });

      fetchDashboardData();
    } catch (error) {
      console.error('Error handling report:', error);
      toast({
        title: "Erreur",
        description: "Impossible de traiter le signalement",
        variant: "destructive"
      });
    }
  };

  const filteredUsers = users.filter(user =>
    user.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getVerificationBadge = (verification: User['user_verifications']) => {
    if (!verification) return <Badge variant="secondary">Non vérifié</Badge>;
    
    const score = verification.verification_score;
    if (score >= 80) return <Badge className="bg-emerald text-white">Vérifié</Badge>;
    if (score >= 50) return <Badge className="bg-gold text-foreground">Partiellement</Badge>;
    return <Badge variant="secondary">En cours</Badge>;
  };

  const getReportStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">En attente</Badge>;
      case 'resolved':
        return <Badge className="bg-emerald text-white">Résolu</Badge>;
      case 'dismissed':
        return <Badge variant="outline">Rejeté</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-4 bg-muted animate-pulse rounded mb-2"></div>
                <div className="h-8 bg-muted animate-pulse rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Tableau de Bord Admin</h1>
        <Badge className="bg-emerald text-white px-3 py-1">
          <Shield className="h-4 w-4 mr-1" />
          Administrateur
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Utilisateurs</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-emerald" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Vérifiés</p>
                <p className="text-2xl font-bold">{stats.verifiedUsers}</p>
              </div>
              <UserCheck className="h-8 w-8 text-gold" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Matches Actifs</p>
                <p className="text-2xl font-bold">{stats.activeMatches}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-sage-dark" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Signalements</p>
                <p className="text-2xl font-bold">{stats.pendingReports}</p>
              </div>
              <Flag className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Aujourd'hui</p>
                <p className="text-2xl font-bold">{stats.todayRegistrations}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-emerald-light" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="reports">Signalements</TabsTrigger>
          <TabsTrigger value="analytics">Statistiques</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des Utilisateurs</CardTitle>
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un utilisateur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Âge</TableHead>
                    <TableHead>Localisation</TableHead>
                    <TableHead>Vérification</TableHead>
                    <TableHead>Inscription</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.profiles?.full_name || 'Nom non renseigné'}
                      </TableCell>
                      <TableCell>{user.profiles?.age || '-'}</TableCell>
                      <TableCell>{user.profiles?.location || '-'}</TableCell>
                      <TableCell>
                        {getVerificationBadge(user.user_verifications)}
                      </TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Ban className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Suspendre l'utilisateur</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Êtes-vous sûr de vouloir suspendre cet utilisateur ? Cette action peut être annulée.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction className="bg-red-500 hover:bg-red-600">
                                  Suspendre
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Signalements en Attente</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur Signalé</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">
                        {report.profiles.full_name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{report.report_type}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {report.description}
                      </TableCell>
                      <TableCell>
                        {getReportStatusBadge(report.status)}
                      </TableCell>
                      <TableCell>
                        {new Date(report.created_at).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>
                        {report.status === 'pending' && (
                          <div className="flex items-center space-x-2">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-emerald border-emerald hover:bg-emerald hover:text-white">
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Approuver le signalement</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Voulez-vous approuver ce signalement et prendre des mesures ?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="py-4">
                                  <Textarea placeholder="Notes administratives (optionnel)" />
                                </div>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleReportAction(report.id, 'approve')}
                                    className="bg-emerald hover:bg-emerald-dark"
                                  >
                                    Approuver
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white">
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Rejeter le signalement</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Voulez-vous rejeter ce signalement ?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleReportAction(report.id, 'reject')}
                                    className="bg-red-500 hover:bg-red-600"
                                  >
                                    Rejeter
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
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

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Statistiques d'Utilisation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Taux de vérification</span>
                    <span className="font-semibold">
                      {stats.totalUsers > 0 ? Math.round((stats.verifiedUsers / stats.totalUsers) * 100) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Matches par utilisateur</span>
                    <span className="font-semibold">
                      {stats.totalUsers > 0 ? (stats.activeMatches / stats.totalUsers).toFixed(1) : 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Inscriptions aujourd'hui</span>
                    <span className="font-semibold">{stats.todayRegistrations}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Modération</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Signalements en attente</span>
                    <Badge variant={stats.pendingReports > 5 ? "destructive" : "secondary"}>
                      {stats.pendingReports}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Taux de signalement</span>
                    <span className="font-semibold">
                      {stats.totalUsers > 0 ? ((reports.length / stats.totalUsers) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
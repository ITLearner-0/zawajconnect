import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Heart, 
  MessageSquare, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Search,
  Filter,
  MoreVertical,
  Ban,
  UserCheck,
  Eye,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  verifiedUsers: number;
  newUsersToday: number;
}

interface MatchStats {
  totalMatches: number;
  mutualMatches: number;
  todaysMatches: number;
}

interface ReportData {
  id: string;
  reporter_name: string;
  reported_name: string;
  type: string;
  description: string;
  status: string;
  created_at: string;
}

const AdminDashboard = () => {
  const { toast } = useToast();
  const [userStats, setUserStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    verifiedUsers: 0,
    newUsersToday: 0
  });
  
  const [matchStats, setMatchStats] = useState<MatchStats>({
    totalMatches: 0,
    mutualMatches: 0,
    todaysMatches: 0
  });

  const [reports, setReports] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load user statistics
      const { data: profiles } = await supabase
        .from('profiles')
        .select('created_at, user_id');
      
      const { data: verifications } = await supabase
        .from('user_verifications')
        .select('user_id, email_verified, phone_verified, id_verified');

      // Load match statistics
      const { data: matches } = await supabase
        .from('matches')
        .select('created_at, is_mutual');

      // Load reports with manual joins
      const { data: reportsData } = await supabase
        .from('reports')
        .select(`
          id,
          report_type,
          description,
          status,
          created_at,
          reporter_id,
          reported_user_id
        `);

      // Get reporter and reported user names separately
      const reporterIds = reportsData?.map(r => r.reporter_id).filter(Boolean) || [];
      const reportedIds = reportsData?.map(r => r.reported_user_id).filter(Boolean) || [];
      const allUserIds = [...new Set([...reporterIds, ...reportedIds])];

      const { data: reportProfiles } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', allUserIds);

      // Calculate user stats
      const today = new Date().toDateString();
      const newUsersToday = profiles?.filter(p => 
        new Date(p.created_at).toDateString() === today
      ).length || 0;

      const verifiedCount = verifications?.filter(v => 
        v.email_verified || v.phone_verified || v.id_verified
      ).length || 0;

      setUserStats({
        totalUsers: profiles?.length || 0,
        activeUsers: profiles?.length || 0, // Simplified - would need last_seen data
        verifiedUsers: verifiedCount,
        newUsersToday
      });

      // Calculate match stats
      const todaysMatches = matches?.filter(m => 
        new Date(m.created_at).toDateString() === today
      ).length || 0;

      const mutualMatches = matches?.filter(m => m.is_mutual).length || 0;

      setMatchStats({
        totalMatches: matches?.length || 0,
        mutualMatches,
        todaysMatches
      });

      // Format reports
      const formattedReports: ReportData[] = reportsData?.map(r => {
        const reporter = reportProfiles?.find(p => p.user_id === r.reporter_id);
        const reported = reportProfiles?.find(p => p.user_id === r.reported_user_id);
        
        return {
          id: r.id,
          reporter_name: reporter?.full_name || 'Utilisateur supprimé',
          reported_name: reported?.full_name || 'Utilisateur supprimé',
          type: r.report_type,
          description: r.description,
          status: r.status,
          created_at: r.created_at
        };
      }) || [];

      setReports(formattedReports);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du tableau de bord",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReportAction = async (reportId: string, action: 'approve' | 'reject') => {
    try {
      const status = action === 'approve' ? 'resolved' : 'dismissed';
      
      const { error } = await supabase
        .from('reports')
        .update({ 
          status,
          resolved_at: new Date().toISOString(),
          resolved_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', reportId);

      if (error) throw error;

      setReports(prev => 
        prev.map(r => r.id === reportId ? { ...r, status } : r)
      );

      toast({
        title: "Action effectuée",
        description: `Signalement ${action === 'approve' ? 'approuvé' : 'rejeté'}`
      });

    } catch (error) {
      console.error('Error handling report:', error);
      toast({
        title: "Erreur",
        description: "Impossible de traiter le signalement",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">En attente</Badge>;
      case 'resolved':
        return <Badge className="bg-green-100 text-green-800">Résolu</Badge>;
      case 'dismissed':
        return <Badge variant="destructive">Rejeté</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getReportTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'inappropriate_content': 'Contenu inapproprié',
      'fake_profile': 'Faux profil',
      'harassment': 'Harcèlement',
      'spam': 'Spam',
      'other': 'Autre'
    };
    return types[type] || type;
  };

  const filteredReports = reports.filter(report => 
    report.reporter_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.reported_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center h-96">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Tableau de Bord Admin</h1>
        <p className="text-muted-foreground">
          Gérez la plateforme matrimoniale islamique
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              +{userStats.newUsersToday} aujourd'hui
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs Vérifiés</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.verifiedUsers}</div>
            <p className="text-xs text-muted-foreground">
              {((userStats.verifiedUsers / userStats.totalUsers) * 100).toFixed(1)}% du total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Matches Mutuels</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{matchStats.mutualMatches}</div>
            <p className="text-xs text-muted-foreground">
              +{matchStats.todaysMatches} aujourd'hui
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Signalements</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports.filter(r => r.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">
              En attente de traitement
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="reports" className="space-y-4">
        <TabsList>
          <TabsTrigger value="reports">Signalements</TabsTrigger>
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="analytics">Analyses</TabsTrigger>
        </TabsList>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Signalements
                </span>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Rechercher signalement..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredReports.map((report) => (
                  <div 
                    key={report.id} 
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {getReportTypeLabel(report.type)}
                        </Badge>
                        {getStatusBadge(report.status)}
                      </div>
                      <p className="text-sm font-medium">
                        <span className="text-red-600">{report.reported_name}</span> signalé par{' '}
                        <span className="text-blue-600">{report.reporter_name}</span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {report.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(report.created_at).toLocaleString('fr-FR')}
                      </p>
                    </div>

                    {report.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReportAction(report.id, 'approve')}
                          className="text-green-600 hover:text-green-700"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Approuver
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReportAction(report.id, 'reject')}
                          className="text-red-600 hover:text-red-700"
                        >
                          <XCircle className="h-4 w-4" />
                          Rejeter
                        </Button>
                      </div>
                    )}
                  </div>
                ))}

                {filteredReports.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Aucun signalement trouvé
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Gestion des Utilisateurs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Interface de gestion des utilisateurs en cours de développement
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Analyses et Statistiques
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Tableau de bord analytique en cours de développement
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
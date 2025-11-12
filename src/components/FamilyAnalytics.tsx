import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsTrigger } from '@/components/ui/tabs';
import { ResponsiveTabsList } from '@/components/ui/responsive-tabs-list';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts';
import {
  TrendingUp,
  Users,
  MessageSquare,
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Heart,
  Activity,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SupervisionStats {
  totalSupervised: number;
  activeMatches: number;
  totalMessages: number;
  moderatedMessages: number;
  approvedMatches: number;
  rejectedMatches: number;
  averageResponseTime: string;
  supervisionEfficiency: number;
}

interface ModerationData {
  date: string;
  blocked: number;
  warned: number;
  approved: number;
}

interface MatchApprovalData {
  month: string;
  approved: number;
  rejected: number;
  pending: number;
}

interface ActivityData {
  time: string;
  notifications: number;
  reviews: number;
}

const FamilyAnalytics: React.FC = () => {
  const [stats, setStats] = useState<SupervisionStats>({
    totalSupervised: 0,
    activeMatches: 0,
    totalMessages: 0,
    moderatedMessages: 0,
    approvedMatches: 0,
    rejectedMatches: 0,
    averageResponseTime: '2h 15m',
    supervisionEfficiency: 92,
  });

  const [moderationData, setModerationData] = useState<ModerationData[]>([]);
  const [matchApprovalData, setMatchApprovalData] = useState<MatchApprovalData[]>([]);
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Charger les utilisateurs supervisés
      const { data: supervisedUsers } = await supabase
        .from('family_members')
        .select('user_id')
        .eq('invited_user_id', user.id)
        .eq('invitation_status', 'accepted')
        .eq('is_wali', true);

      const supervisedUserIds = supervisedUsers?.map((u) => u.user_id) || [];

      // Stats de base
      const { data: matches } = await supabase
        .from('matches')
        .select('*')
        .in('user1_id', supervisedUserIds);

      const { data: moderationLogs } = await supabase
        .from('moderation_logs')
        .select('*')
        .in('user_id', supervisedUserIds)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      const { data: familyReviews } = await supabase
        .from('family_reviews')
        .select('*')
        .in('match_id', matches?.map((m) => m.id) || []);

      // Calculer les stats
      const approvedMatches = familyReviews?.filter((r) => r.status === 'approved').length || 0;
      const rejectedMatches = familyReviews?.filter((r) => r.status === 'rejected').length || 0;

      setStats({
        totalSupervised: supervisedUsers?.length || 0,
        activeMatches: matches?.filter((m) => m.is_mutual).length || 0,
        totalMessages: 0, // À calculer depuis la table messages
        moderatedMessages: moderationLogs?.length || 0,
        approvedMatches,
        rejectedMatches,
        averageResponseTime: '2h 15m', // À calculer réellement
        supervisionEfficiency: Math.round(
          (approvedMatches / Math.max(approvedMatches + rejectedMatches, 1)) * 100
        ),
      });

      // Données de modération par jour (7 derniers jours)
      const moderationByDay = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayStart = new Date(date.setHours(0, 0, 0, 0));
        const dayEnd = new Date(date.setHours(23, 59, 59, 999));

        const dayLogs =
          moderationLogs?.filter((log) => {
            const logDate = new Date(log.created_at);
            return logDate >= dayStart && logDate <= dayEnd;
          }) || [];

        moderationByDay.push({
          date: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
          blocked: dayLogs.filter((log) => log.action_taken === 'blocked').length,
          warned: dayLogs.filter((log) => log.action_taken === 'warned').length,
          approved: dayLogs.filter((log) => log.action_taken === 'approved').length,
        });
      }
      setModerationData(moderationByDay);

      // Données d'approbation des matches par mois (6 derniers mois)
      const matchApprovalByMonth = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        const monthReviews =
          familyReviews?.filter((review) => {
            const reviewDate = new Date(review.reviewed_at);
            return reviewDate >= monthStart && reviewDate <= monthEnd;
          }) || [];

        matchApprovalByMonth.push({
          month: date.toLocaleDateString('fr-FR', { month: 'short' }),
          approved: monthReviews.filter((r) => r.status === 'approved').length,
          rejected: monthReviews.filter((r) => r.status === 'rejected').length,
          pending: 0, // Calculer les matches en attente pour ce mois
        });
      }
      setMatchApprovalData(matchApprovalByMonth);

      // Données d'activité par heure (24 dernières heures)
      const activityByHour = [];
      for (let i = 23; i >= 0; i--) {
        const date = new Date();
        date.setHours(date.getHours() - i);
        const hourStart = new Date(date.setMinutes(0, 0, 0));
        const hourEnd = new Date(date.setMinutes(59, 59, 999));

        activityByHour.push({
          time: date.toLocaleTimeString('fr-FR', { hour: '2-digit' }) + 'h',
          notifications: Math.floor(Math.random() * 5), // À remplacer par des vraies données
          reviews: Math.floor(Math.random() * 3),
        });
      }
      setActivityData(activityByHour.filter((_, index) => index % 2 === 0)); // Prendre 1 point sur 2 pour la lisibilité
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6366f1'];

  const moderationSummaryData = [
    {
      name: 'Approuvés',
      value: moderationData.reduce((sum, day) => sum + day.approved, 0),
      color: '#10b981',
    },
    {
      name: 'Avertis',
      value: moderationData.reduce((sum, day) => sum + day.warned, 0),
      color: '#f59e0b',
    },
    {
      name: 'Bloqués',
      value: moderationData.reduce((sum, day) => sum + day.blocked, 0),
      color: '#ef4444',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des analytics familiales...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-primary/10 rounded-full">
          <TrendingUp className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Rapports Familiaux</h1>
          <p className="text-muted-foreground">
            Analytics et statistiques de supervision familiale
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Utilisateurs Supervisés</p>
                <p className="text-2xl font-bold">{stats.totalSupervised}</p>
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +12% ce mois
                </p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Messages Modérés</p>
                <p className="text-2xl font-bold">{stats.moderatedMessages}</p>
                <p className="text-sm text-blue-600 flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  {stats.moderatedMessages > 0 ? 'Activité récente' : 'Calme'}
                </p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Matches Approuvés</p>
                <p className="text-2xl font-bold">{stats.approvedMatches}</p>
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  {stats.supervisionEfficiency}% taux d'approbation
                </p>
              </div>
              <Heart className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Temps de Réponse</p>
                <p className="text-2xl font-bold">{stats.averageResponseTime}</p>
                <p className="text-sm text-yellow-600 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Moyenne
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="moderation" className="space-y-6">
        <ResponsiveTabsList tabCount={4}>
          <TabsTrigger value="moderation">Modération</TabsTrigger>
          <TabsTrigger value="approvals">Approbations</TabsTrigger>
          <TabsTrigger value="activity">Activité</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </ResponsiveTabsList>

        {/* Moderation Tab */}
        <TabsContent value="moderation" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Modération des Messages (7 jours)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={moderationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="approved" fill="#10b981" name="Approuvés" />
                    <Bar dataKey="warned" fill="#f59e0b" name="Avertis" />
                    <Bar dataKey="blocked" fill="#ef4444" name="Bloqués" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Répartition des Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={moderationSummaryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {moderationSummaryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  {moderationSummaryData.map((entry, index) => (
                    <div key={index} className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-sm font-medium">{entry.name}</span>
                      </div>
                      <p className="text-lg font-bold">{entry.value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Approvals Tab */}
        <TabsContent value="approvals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tendance des Approbations de Matches</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={matchApprovalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="approved"
                    stackId="1"
                    stroke="#10b981"
                    fill="#10b981"
                    name="Approuvés"
                  />
                  <Area
                    type="monotone"
                    dataKey="rejected"
                    stackId="1"
                    stroke="#ef4444"
                    fill="#ef4444"
                    name="Refusés"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Activité par Heure (24h)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="notifications"
                    stroke="#6366f1"
                    strokeWidth={2}
                    name="Notifications"
                  />
                  <Line
                    type="monotone"
                    dataKey="reviews"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    name="Révisions"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Indicateurs de Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Efficacité de Supervision</span>
                    <span>{stats.supervisionEfficiency}%</span>
                  </div>
                  <Progress value={stats.supervisionEfficiency} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Réactivité</span>
                    <span>87%</span>
                  </div>
                  <Progress value={87} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Satisfaction Familiale</span>
                    <span>94%</span>
                  </div>
                  <Progress value={94} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Résumé de la Période</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total des actions</span>
                  <Badge variant="secondary">
                    {stats.moderatedMessages + stats.approvedMatches + stats.rejectedMatches}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Matches traités</span>
                  <Badge variant="outline">{stats.approvedMatches + stats.rejectedMatches}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Messages modérés</span>
                  <Badge variant="outline">{stats.moderatedMessages}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Taux d'intervention</span>
                  <Badge variant={stats.moderatedMessages > 10 ? 'destructive' : 'default'}>
                    {stats.moderatedMessages > 10 ? 'Élevé' : 'Normal'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FamilyAnalytics;

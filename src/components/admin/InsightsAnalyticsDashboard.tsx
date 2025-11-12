import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Users, Eye, Share2, Download, Trophy, Calendar, Activity } from 'lucide-react';
import { toast } from 'sonner';

type TimePeriod = 'day' | 'week' | 'month';

interface TimeSeriesData {
  date: string;
  views: number;
  shares: number;
  exports: number;
}

interface TopUser {
  user_id: string;
  full_name: string;
  total_views: number;
  total_shares: number;
  total_exports: number;
  total_actions: number;
  engagement_score: number;
}

interface AnalyticsOverview {
  total_users: number;
  total_views: number;
  total_shares: number;
  total_exports: number;
  avg_views_per_user: number;
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--accent))',
  'hsl(var(--secondary))',
  'hsl(var(--muted))',
];

export function InsightsAnalyticsDashboard() {
  const [period, setPeriod] = useState<TimePeriod>('week');
  const [loading, setLoading] = useState(true);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Calculate date range based on period
      const now = new Date();
      const startDate = new Date();

      switch (period) {
        case 'day':
          startDate.setDate(now.getDate() - 7); // Last 7 days
          break;
        case 'week':
          startDate.setDate(now.getDate() - 28); // Last 4 weeks
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 6); // Last 6 months
          break;
      }

      // Fetch overview stats
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('insights_analytics')
        .select('*');

      if (analyticsError) throw analyticsError;

      // Calculate overview
      const totalViews = analyticsData?.reduce((sum, a) => sum + (a.view_count || 0), 0) || 0;
      const totalShares = analyticsData?.reduce((sum, a) => sum + (a.share_count || 0), 0) || 0;
      const totalExports = analyticsData?.reduce((sum, a) => sum + (a.export_count || 0), 0) || 0;
      const totalUsers = analyticsData?.length || 0;

      setOverview({
        total_users: totalUsers,
        total_views: totalViews,
        total_shares: totalShares,
        total_exports: totalExports,
        avg_views_per_user: totalUsers > 0 ? Math.round(totalViews / totalUsers) : 0,
      });

      // Fetch time series data (actions grouped by date)
      const startDateISO = startDate.toISOString();
      const { data: actionsData, error: actionsError } = await supabase
        .from('insight_actions')
        .select('action_type, created_at')
        .gte('created_at', startDateISO as string)
        .order('created_at', { ascending: true });

      if (actionsError) throw actionsError;

      // Group actions by date
      const groupedData: Record<string, { views: number; shares: number; exports: number }> = {};

      actionsData?.forEach((action) => {
        if (!action.created_at) return;

        const date = new Date(action.created_at);
        let dateKey: string;

        if (period === 'day') {
          dateKey = date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });
        } else if (period === 'week') {
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          dateKey = weekStart.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });
        } else {
          dateKey = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
        }

        if (!groupedData[dateKey]) {
          groupedData[dateKey] = { views: 0, shares: 0, exports: 0 };
        }

        const group = groupedData[dateKey];
        if (group) {
          if (action.action_type === 'view_insights') group.views++;
          if (action.action_type === 'share_insights') group.shares++;
          if (action.action_type === 'export_pdf') group.exports++;
        }
      });

      const timeSeries = Object.entries(groupedData).map(([date, data]) => ({
        date,
        ...data,
      }));

      setTimeSeriesData(timeSeries);

      // Fetch top users with profiles
      const { data: usersData, error: usersError } = await supabase
        .from('insights_analytics')
        .select(
          `
          user_id,
          view_count,
          share_count,
          export_count
        `
        )
        .order('view_count', { ascending: false })
        .limit(10);

      if (usersError) throw usersError;

      // Fetch user profiles
      const userIds = usersData?.map((u) => u.user_id) || [];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      // Fetch action counts per user
      const { data: actionsCountData } = await supabase
        .from('insight_actions')
        .select('user_id')
        .in('user_id', userIds);

      const actionCountsByUser =
        actionsCountData?.reduce(
          (acc, action) => {
            acc[action.user_id] = (acc[action.user_id] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        ) || {};

      const topUsersData =
        usersData
          ?.map((user) => {
            const profile = profilesData?.find((p) => p.id === user.user_id);
            const totalActions = actionCountsByUser[user.user_id] || 0;
            const engagementScore =
              (user.view_count || 0) * 1 +
              (user.share_count || 0) * 3 +
              (user.export_count || 0) * 2 +
              totalActions * 0.5;

            return {
              user_id: user.user_id,
              full_name: profile?.full_name || 'Utilisateur inconnu',
              total_views: user.view_count || 0,
              total_shares: user.share_count || 0,
              total_exports: user.export_count || 0,
              total_actions: totalActions,
              engagement_score: Math.round(engagementScore),
            };
          })
          .sort((a, b) => b.engagement_score - a.engagement_score) || [];

      setTopUsers(topUsersData);
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Erreur lors du chargement des analytics');
    } finally {
      setLoading(false);
    }
  };

  const actionTypeData = overview
    ? [
        { name: 'Vues', value: overview.total_views, color: COLORS[0] },
        { name: 'Partages', value: overview.total_shares, color: COLORS[1] },
        { name: 'Exports', value: overview.total_exports, color: COLORS[2] },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            Analytics des Insights
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Suivi de l'engagement utilisateur sur les insights de compatibilité
          </p>
        </div>
        <Select value={period} onValueChange={(value) => setPeriod(value as TimePeriod)}>
          <SelectTrigger className="w-[180px]">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Par jour (7j)</SelectItem>
            <SelectItem value="week">Par semaine (4s)</SelectItem>
            <SelectItem value="month">Par mois (6m)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Cards */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Utilisateurs actifs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{overview.total_users}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Vues totales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{overview.total_views}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Moy: {overview.avg_views_per_user}/user
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Share2 className="h-4 w-4" />
                Partages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{overview.total_shares}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Exports PDF
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{overview.total_exports}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Taux d'engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {overview.total_users > 0
                  ? Math.round(
                      ((overview.total_shares + overview.total_exports) / overview.total_users) *
                        100
                    )
                  : 0}
                %
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList>
          <TabsTrigger value="timeline">Évolution temporelle</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="leaderboard">Classement</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Évolution de l'engagement</CardTitle>
              <CardDescription>
                Nombre d'actions par{' '}
                {period === 'day' ? 'jour' : period === 'week' ? 'semaine' : 'mois'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="views"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    name="Vues"
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="shares"
                    stroke="hsl(var(--accent))"
                    strokeWidth={2}
                    name="Partages"
                    dot={{ fill: 'hsl(var(--accent))' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="exports"
                    stroke="hsl(var(--secondary))"
                    strokeWidth={2}
                    name="Exports"
                    dot={{ fill: 'hsl(var(--secondary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Comparaison par type d'action</CardTitle>
              <CardDescription>Volume d'actions par catégorie</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="views" fill="hsl(var(--primary))" name="Vues" />
                  <Bar dataKey="shares" fill="hsl(var(--accent))" name="Partages" />
                  <Bar dataKey="exports" fill="hsl(var(--secondary))" name="Exports" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution">
          <Card>
            <CardHeader>
              <CardTitle>Distribution des actions</CardTitle>
              <CardDescription>Répartition des différents types d'engagement</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={actionTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {actionTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Top 10 Utilisateurs les plus engagés
              </CardTitle>
              <CardDescription>
                Classement basé sur le score d'engagement (vues × 1 + partages × 3 + exports × 2)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topUsers.map((user, index) => (
                  <div
                    key={user.user_id}
                    className="flex items-center justify-between p-4 rounded-lg bg-accent/5 border border-border hover:bg-accent/10 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Badge
                        variant={index < 3 ? 'default' : 'outline'}
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          index === 0
                            ? 'bg-amber-500 text-white'
                            : index === 1
                              ? 'bg-gray-400 text-white'
                              : index === 2
                                ? 'bg-orange-600 text-white'
                                : ''
                        }`}
                      >
                        {index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium text-foreground">{user.full_name}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {user.total_views}
                          </span>
                          <span className="flex items-center gap-1">
                            <Share2 className="h-3 w-3" />
                            {user.total_shares}
                          </span>
                          <span className="flex items-center gap-1">
                            <Download className="h-3 w-3" />
                            {user.total_exports}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{user.engagement_score}</p>
                      <p className="text-xs text-muted-foreground">Score d'engagement</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

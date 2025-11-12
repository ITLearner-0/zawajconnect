import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  BarChart, 
  Bar, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { 
  Phone, 
  Video, 
  TrendingUp, 
  Clock,
  CheckCircle2,
  XCircle,
  Users,
  Calendar,
  BarChart3,
  Globe,
  Download,
  FileSpreadsheet
} from 'lucide-react';
import { exportToExcel, exportToPDF } from '@/utils/callAnalyticsExport';

interface CallStats {
  totalCalls: number;
  avgDuration: number;
  successRate: number;
  audioCallsCount: number;
  videoCallsCount: number;
  callsByDay: { date: string; count: number }[];
  callsByStatus: { status: string; count: number }[];
  avgDurationByType: { type: string; duration: number }[];
  callsByHour: { hour: number; count: number }[];
  qualityMetrics: {
    avgRating: number;
    totalFeedbacks: number;
    excellentCount: number;
    goodCount: number;
    fairCount: number;
    poorCount: number;
  };
}

const COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  secondary: '#6366f1',
  accent: '#8b5cf6'
};

const STATUS_COLORS: { [key: string]: string } = {
  connected: COLORS.success,
  ended: COLORS.primary,
  rejected: COLORS.warning,
  failed: COLORS.danger,
  missed: COLORS.secondary
};

const CallAnalyticsDashboard = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<CallStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchCallStats();
  }, [timeRange]);

  const fetchCallStats = async () => {
    setLoading(true);
    try {
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Fetch calls data
      const { data: calls, error: callsError } = await supabase
        .from('webrtc_calls')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (callsError) throw callsError;

      // Fetch feedback data
      const { data: feedbacks, error: feedbackError } = await supabase
        .from('call_feedback')
        .select('rating')
        .gte('created_at', startDate.toISOString());

      if (feedbackError) throw feedbackError;

      if (!calls) {
        setStats(null);
        return;
      }

      // Calculate statistics
      const totalCalls = calls.length;
      const successfulCalls = calls.filter(c => c.status === 'ended' && c.duration_seconds && c.duration_seconds > 0);
      const successRate = totalCalls > 0 ? (successfulCalls.length / totalCalls) * 100 : 0;

      const avgDuration = successfulCalls.length > 0
        ? successfulCalls.reduce((sum, c) => sum + (c.duration_seconds || 0), 0) / successfulCalls.length
        : 0;

      const audioCallsCount = calls.filter(c => c.call_type === 'audio').length;
      const videoCallsCount = calls.filter(c => c.call_type === 'video').length;

      // Calls by day
      const callsByDayMap = new Map<string, number>();
      calls.forEach(call => {
        const date = new Date(call.created_at).toLocaleDateString('fr-FR');
        callsByDayMap.set(date, (callsByDayMap.get(date) || 0) + 1);
      });
      const callsByDay = Array.from(callsByDayMap.entries())
        .map(([date, count]) => ({ date, count }))
        .slice(-14); // Last 14 days

      // Calls by status
      const callsByStatusMap = new Map<string, number>();
      calls.forEach(call => {
        const status = call.status || 'unknown';
        callsByStatusMap.set(status, (callsByStatusMap.get(status) || 0) + 1);
      });
      const callsByStatus = Array.from(callsByStatusMap.entries())
        .map(([status, count]) => ({ status, count }));

      // Average duration by type
      const audioSuccessful = calls.filter(c => c.call_type === 'audio' && c.duration_seconds && c.duration_seconds > 0);
      const videoSuccessful = calls.filter(c => c.call_type === 'video' && c.duration_seconds && c.duration_seconds > 0);
      
      const avgDurationByType = [
        {
          type: 'Audio',
          duration: audioSuccessful.length > 0
            ? Math.round(audioSuccessful.reduce((sum, c) => sum + (c.duration_seconds || 0), 0) / audioSuccessful.length)
            : 0
        },
        {
          type: 'Vidéo',
          duration: videoSuccessful.length > 0
            ? Math.round(videoSuccessful.reduce((sum, c) => sum + (c.duration_seconds || 0), 0) / videoSuccessful.length)
            : 0
        }
      ];

      // Calls by hour of day
      const callsByHourMap = new Map<number, number>();
      for (let i = 0; i < 24; i++) {
        callsByHourMap.set(i, 0);
      }
      calls.forEach(call => {
        const hour = new Date(call.created_at).getHours();
        callsByHourMap.set(hour, (callsByHourMap.get(hour) || 0) + 1);
      });
      const callsByHour = Array.from(callsByHourMap.entries())
        .map(([hour, count]) => ({ hour, count }));

      // Quality metrics from feedbacks
      const totalFeedbacks = feedbacks?.length || 0;
      const avgRating = totalFeedbacks > 0
        ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / totalFeedbacks
        : 0;

      const excellentCount = feedbacks?.filter(f => f.rating === 5).length || 0;
      const goodCount = feedbacks?.filter(f => f.rating === 4).length || 0;
      const fairCount = feedbacks?.filter(f => f.rating === 3).length || 0;
      const poorCount = feedbacks?.filter(f => f.rating <= 2).length || 0;

      setStats({
        totalCalls,
        avgDuration: Math.round(avgDuration),
        successRate: Math.round(successRate),
        audioCallsCount,
        videoCallsCount,
        callsByDay,
        callsByStatus,
        avgDurationByType,
        callsByHour,
        qualityMetrics: {
          avgRating,
          totalFeedbacks,
          excellentCount,
          goodCount,
          fairCount,
          poorCount
        }
      });
    } catch (error) {
      console.error('Error fetching call stats:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les statistiques d'appels",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getStatusLabel = (status: string): string => {
    const labels: { [key: string]: string } = {
      initiated: 'Initié',
      ringing: 'Sonnerie',
      connected: 'Connecté',
      ended: 'Terminé',
      rejected: 'Rejeté',
      failed: 'Échoué',
      missed: 'Manqué'
    };
    return labels[status] || status;
  };

  const handleExportExcel = () => {
    if (!stats) return;
    
    try {
      setExporting(true);
      const timeRangeLabel = timeRange === '7d' ? '7 jours' : timeRange === '30d' ? '30 jours' : '90 jours';
      exportToExcel(stats, timeRangeLabel);
      toast({
        title: "Export réussi",
        description: "Le fichier Excel a été téléchargé avec succès",
      });
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast({
        title: "Erreur d'export",
        description: "Impossible d'exporter les données en Excel",
        variant: "destructive"
      });
    } finally {
      setExporting(false);
    }
  };

  const handleExportPDF = async () => {
    if (!stats) return;
    
    try {
      setExporting(true);
      const timeRangeLabel = timeRange === '7d' ? '7 jours' : timeRange === '30d' ? '30 jours' : '90 jours';
      await exportToPDF(stats, timeRangeLabel, 'charts-container');
      toast({
        title: "Export réussi",
        description: "Le fichier PDF a été téléchargé avec succès",
      });
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      toast({
        title: "Erreur d'export",
        description: "Impossible d'exporter les données en PDF",
        variant: "destructive"
      });
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Phone className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Aucune donnée d'appels disponible</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold">Analytics des Appels</h2>
          <p className="text-muted-foreground mt-1">
            Statistiques globales et métriques de performance
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="flex gap-2">
            <Button
              variant={timeRange === '7d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('7d')}
            >
              7 jours
            </Button>
            <Button
              variant={timeRange === '30d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('30d')}
            >
              30 jours
            </Button>
            <Button
              variant={timeRange === '90d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('90d')}
            >
              90 jours
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportExcel}
              disabled={exporting || !stats}
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Excel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPDF}
              disabled={exporting || !stats}
            >
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Appels</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCalls}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.audioCallsCount} audio, {stats.videoCallsCount} vidéo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Durée Moyenne</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(stats.avgDuration)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Par appel réussi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de Réussite</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Appels terminés normalement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Note Qualité</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.qualityMetrics.avgRating.toFixed(2)}/5</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.qualityMetrics.totalFeedbacks} feedbacks
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div id="charts-container">
        <Tabs defaultValue="trends" className="space-y-4">
          <TabsList>
            <TabsTrigger value="trends">Tendances</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="quality">Qualité</TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-4">
            <Card className="chart-capture">
              <CardHeader>
                <CardTitle data-chart-title>Appels par jour</CardTitle>
                <CardDescription>Volume quotidien sur les 14 derniers jours</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={stats.callsByDay}>
                  <defs>
                    <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke={COLORS.primary} 
                    fillOpacity={1} 
                    fill="url(#colorCalls)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="chart-capture">
            <CardHeader>
              <CardTitle data-chart-title>Appels par heure de la journée</CardTitle>
              <CardDescription>Distribution des appels sur 24h</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.callsByHour}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="hour" 
                    label={{ value: 'Heure', position: 'insideBottom', offset: -5 }} 
                  />
                  <YAxis label={{ value: 'Nombre', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke={COLORS.secondary} 
                    strokeWidth={2}
                    dot={{ fill: COLORS.secondary, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="chart-capture">
              <CardHeader>
                <CardTitle data-chart-title>Types d'appels</CardTitle>
                <CardDescription>Audio vs Vidéo</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Audio', value: stats.audioCallsCount },
                        { name: 'Vidéo', value: stats.videoCallsCount }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill={COLORS.primary} />
                      <Cell fill={COLORS.success} />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="chart-capture">
              <CardHeader>
                <CardTitle data-chart-title>Statut des appels</CardTitle>
                <CardDescription>Répartition par état final</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.callsByStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ status, percent }) => 
                        `${getStatusLabel(status)}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {stats.callsByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || COLORS.secondary} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card className="chart-capture">
            <CardHeader>
              <CardTitle data-chart-title>Durée moyenne par type</CardTitle>
              <CardDescription>Comparaison Audio vs Vidéo</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.avgDurationByType}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis label={{ value: 'Secondes', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value) => formatDuration(Number(value))} />
                  <Bar dataKey="duration" fill={COLORS.accent} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            {stats.callsByStatus.map(({ status, count }) => (
              <Card key={status}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {getStatusLabel(status)}
                  </CardTitle>
                  {status === 'ended' ? (
                    <CheckCircle2 className="h-4 w-4" style={{ color: STATUS_COLORS[status] }} />
                  ) : status === 'failed' || status === 'rejected' ? (
                    <XCircle className="h-4 w-4" style={{ color: STATUS_COLORS[status] }} />
                  ) : (
                    <Phone className="h-4 w-4" style={{ color: STATUS_COLORS[status] }} />
                  )}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{count}</div>
                  <Badge 
                    variant="secondary" 
                    className="mt-2"
                    style={{ backgroundColor: STATUS_COLORS[status] + '20', color: STATUS_COLORS[status] }}
                  >
                    {((count / stats.totalCalls) * 100).toFixed(1)}%
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Distribution des notes</CardTitle>
                <CardDescription>Feedback utilisateurs</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      { rating: '⭐⭐⭐⭐⭐', count: stats.qualityMetrics.excellentCount },
                      { rating: '⭐⭐⭐⭐', count: stats.qualityMetrics.goodCount },
                      { rating: '⭐⭐⭐', count: stats.qualityMetrics.fairCount },
                      { rating: '⭐⭐ & ⭐', count: stats.qualityMetrics.poorCount }
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="rating" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count">
                      <Cell fill={COLORS.success} />
                      <Cell fill={COLORS.primary} />
                      <Cell fill={COLORS.warning} />
                      <Cell fill={COLORS.danger} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métriques de qualité</CardTitle>
                <CardDescription>Résumé des feedbacks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Excellent (5⭐)</span>
                    <Badge style={{ backgroundColor: COLORS.success + '20', color: COLORS.success }}>
                      {stats.qualityMetrics.excellentCount} ({((stats.qualityMetrics.excellentCount / stats.qualityMetrics.totalFeedbacks) * 100).toFixed(1)}%)
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Bon (4⭐)</span>
                    <Badge style={{ backgroundColor: COLORS.primary + '20', color: COLORS.primary }}>
                      {stats.qualityMetrics.goodCount} ({((stats.qualityMetrics.goodCount / stats.qualityMetrics.totalFeedbacks) * 100).toFixed(1)}%)
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Moyen (3⭐)</span>
                    <Badge style={{ backgroundColor: COLORS.warning + '20', color: COLORS.warning }}>
                      {stats.qualityMetrics.fairCount} ({((stats.qualityMetrics.fairCount / stats.qualityMetrics.totalFeedbacks) * 100).toFixed(1)}%)
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Mauvais (≤2⭐)</span>
                    <Badge style={{ backgroundColor: COLORS.danger + '20', color: COLORS.danger }}>
                      {stats.qualityMetrics.poorCount} ({((stats.qualityMetrics.poorCount / stats.qualityMetrics.totalFeedbacks) * 100).toFixed(1)}%)
                    </Badge>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">Note moyenne globale</span>
                    <div className="text-2xl font-bold">
                      {stats.qualityMetrics.avgRating.toFixed(2)}/5
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Basé sur {stats.qualityMetrics.totalFeedbacks} évaluations
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
};

export default CallAnalyticsDashboard;
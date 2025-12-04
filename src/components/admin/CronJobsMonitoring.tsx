import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Activity,
  TrendingUp,
  Calendar,
  RefreshCw,
  PlayCircle,
  StopCircle,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface CronJobLog {
  id: string;
  job_name: string;
  job_type: string;
  status: 'running' | 'success' | 'error' | 'timeout' | 'cancelled';
  started_at: string;
  completed_at: string | null;
  duration_ms: number | null;
  metadata: any;
  error_message: string | null;
  created_at: string;
}

interface CronJobSchedule {
  id: string;
  job_name: string;
  job_type: string;
  description: string;
  schedule_cron: string;
  is_active: boolean;
  next_run_at: string | null;
  last_run_at: string | null;
  last_status: string | null;
  config: any;
}

interface CronJobStats {
  job_name: string;
  total_executions: number;
  success_count: number;
  error_count: number;
  avg_duration_ms: number;
  last_run_at: string;
  last_status: string;
  success_rate: number;
}

const CronJobsMonitoring = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState<CronJobSchedule[]>([]);
  const [recentLogs, setRecentLogs] = useState<CronJobLog[]>([]);
  const [stats, setStats] = useState<CronJobStats[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState<7 | 30 | 90>(30);

  useEffect(() => {
    loadData();
    setupRealtimeSubscription();
  }, [timeRange]);

  const setupRealtimeSubscription = () => {
    // Subscribe to real-time updates on cron_job_logs
    const channel = supabase
      .channel('cron-logs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cron_job_logs',
        },
        (payload) => {
          console.log('Cron log changed:', payload);
          loadData();

          // Show alert if error
          if (payload.new && (payload.new as any).status === 'error') {
            toast({
              title: '⚠️ Cron Job Failed',
              description: `${(payload.new as any).job_name} failed: ${(payload.new as any).error_message}`,
              variant: 'destructive',
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const loadData = async () => {
    try {
      setLoading(true);

      // Load schedules
      const { data: schedulesData, error: schedulesError } = await supabase
        .from('cron_job_schedules')
        .select('*')
        .order('job_name');

      if (schedulesError) throw schedulesError;
      setSchedules(schedulesData || []);

      // Load recent logs (last 50)
      const { data: logsData, error: logsError } = await supabase
        .from('cron_job_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (logsError) throw logsError;
      setRecentLogs(logsData || []);

      // Load stats using RPC function
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_cron_job_stats', { p_days: timeRange });

      if (statsError) throw statsError;
      setStats(statsData || []);

      // Prepare chart data - executions over time
      const { data: chartLogsData, error: chartError } = await supabase
        .from('cron_job_logs')
        .select('created_at, status, job_name')
        .gte('created_at', new Date(Date.now() - timeRange * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at');

      if (chartError) throw chartError;

      // Group by date
      const groupedByDate = (chartLogsData || []).reduce((acc: any, log) => {
        const date = new Date(log.created_at).toLocaleDateString('fr-FR');
        if (!acc[date]) {
          acc[date] = { date, success: 0, error: 0, total: 0 };
        }
        acc[date].total++;
        if (log.status === 'success') acc[date].success++;
        if (log.status === 'error') acc[date].error++;
        return acc;
      }, {});

      setChartData(Object.values(groupedByDate));
    } catch (error) {
      console.error('Error loading cron monitoring data:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données de monitoring',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleJobStatus = async (scheduleId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('cron_job_schedules')
        .update({ is_active: !currentStatus, updated_at: new Date().toISOString() })
        .eq('id', scheduleId);

      if (error) throw error;

      toast({
        title: 'Succès',
        description: `Job ${!currentStatus ? 'activé' : 'désactivé'}`,
      });

      loadData();
    } catch (error) {
      console.error('Error toggling job status:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier le statut du job',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Succès</Badge>;
      case 'error':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Erreur</Badge>;
      case 'running':
        return <Badge variant="secondary"><Activity className="h-3 w-3 mr-1 animate-pulse" />En cours</Badge>;
      case 'timeout':
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Timeout</Badge>;
      case 'cancelled':
        return <Badge variant="outline"><StopCircle className="h-3 w-3 mr-1" />Annulé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDuration = (ms: number | null) => {
    if (!ms) return 'N/A';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatRelativeTime = (dateString: string | null) => {
    if (!dateString) return 'Jamais';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-FR');
  };

  // Calculate overall stats
  const totalExecutions = stats.reduce((sum, s) => sum + s.total_executions, 0);
  const totalErrors = stats.reduce((sum, s) => sum + s.error_count, 0);
  const avgSuccessRate = stats.length > 0
    ? stats.reduce((sum, s) => sum + s.success_rate, 0) / stats.length
    : 0;
  const activeJobsCount = schedules.filter(s => s.is_active).length;

  // Pie chart data
  const pieData = [
    { name: 'Succès', value: totalExecutions - totalErrors, color: '#10b981' },
    { name: 'Erreurs', value: totalErrors, color: '#ef4444' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des données de monitoring...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Monitoring des Cron Jobs</h2>
          <p className="text-muted-foreground">Surveillance en temps réel des tâches planifiées</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <div className="flex gap-1 border rounded-lg p-1">
            <Button
              size="sm"
              variant={timeRange === 7 ? 'default' : 'ghost'}
              onClick={() => setTimeRange(7)}
            >
              7j
            </Button>
            <Button
              size="sm"
              variant={timeRange === 30 ? 'default' : 'ghost'}
              onClick={() => setTimeRange(30)}
            >
              30j
            </Button>
            <Button
              size="sm"
              variant={timeRange === 90 ? 'default' : 'ghost'}
              onClick={() => setTimeRange(90)}
            >
              90j
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Jobs Actifs</p>
                <p className="text-2xl font-bold">{activeJobsCount}/{schedules.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Taux de Succès</p>
                <p className="text-2xl font-bold">{avgSuccessRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <PlayCircle className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Exécutions ({timeRange}j)</p>
                <p className="text-2xl font-bold">{totalExecutions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Erreurs ({timeRange}j)</p>
                <p className="text-2xl font-bold">{totalErrors}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Execution Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Historique d'Exécution</CardTitle>
            <CardDescription>Succès vs Erreurs sur {timeRange} jours</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="success" name="Succès" fill="#10b981" />
                <Bar dataKey="error" name="Erreurs" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Success Rate Pie */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition Succès/Erreurs</CardTitle>
            <CardDescription>Distribution globale sur {timeRange} jours</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Scheduled Jobs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Jobs Planifiés</CardTitle>
          <CardDescription>Configuration et statut des tâches automatiques</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom du Job</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Planning (Cron)</TableHead>
                <TableHead>Dernier Run</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Taux de Succès</TableHead>
                <TableHead>État</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules.map((schedule) => {
                const jobStats = stats.find(s => s.job_name === schedule.job_name);
                return (
                  <TableRow key={schedule.id}>
                    <TableCell className="font-medium">
                      {schedule.job_name}
                      <p className="text-xs text-muted-foreground">{schedule.description}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {schedule.job_type.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{schedule.schedule_cron}</TableCell>
                    <TableCell>{formatRelativeTime(schedule.last_run_at)}</TableCell>
                    <TableCell>
                      {schedule.last_status ? getStatusBadge(schedule.last_status) : '-'}
                    </TableCell>
                    <TableCell>
                      {jobStats ? (
                        <span className={jobStats.success_rate >= 90 ? 'text-green-600 font-semibold' : jobStats.success_rate >= 70 ? 'text-yellow-600 font-semibold' : 'text-red-600 font-semibold'}>
                          {jobStats.success_rate.toFixed(1)}%
                        </span>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={schedule.is_active ? 'default' : 'secondary'}>
                        {schedule.is_active ? 'Actif' : 'Inactif'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleJobStatus(schedule.id, schedule.is_active)}
                      >
                        {schedule.is_active ? <StopCircle className="h-3 w-3" /> : <PlayCircle className="h-3 w-3" />}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Execution Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Logs d'Exécution Récents</CardTitle>
          <CardDescription>50 dernières exécutions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Début</TableHead>
                <TableHead>Durée</TableHead>
                <TableHead>Message d'Erreur</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.job_name}</TableCell>
                  <TableCell>{getStatusBadge(log.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3" />
                      {new Date(log.started_at).toLocaleString('fr-FR')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Clock className="h-3 w-3" />
                      {formatDuration(log.duration_ms)}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-md">
                    {log.error_message ? (
                      <div className="text-xs text-red-600 truncate" title={log.error_message}>
                        {log.error_message}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Job Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Statistiques par Job</CardTitle>
          <CardDescription>Performance détaillée sur {timeRange} jours</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job</TableHead>
                <TableHead>Total Exécutions</TableHead>
                <TableHead>Succès</TableHead>
                <TableHead>Erreurs</TableHead>
                <TableHead>Taux de Succès</TableHead>
                <TableHead>Durée Moyenne</TableHead>
                <TableHead>Dernier Run</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.map((stat) => (
                <TableRow key={stat.job_name}>
                  <TableCell className="font-medium">{stat.job_name}</TableCell>
                  <TableCell>{stat.total_executions}</TableCell>
                  <TableCell className="text-green-600">{stat.success_count}</TableCell>
                  <TableCell className="text-red-600">{stat.error_count}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            stat.success_rate >= 90 ? 'bg-green-500' :
                            stat.success_rate >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${stat.success_rate}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold">{stat.success_rate.toFixed(1)}%</span>
                    </div>
                  </TableCell>
                  <TableCell>{formatDuration(stat.avg_duration_ms)}</TableCell>
                  <TableCell>{formatRelativeTime(stat.last_run_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default CronJobsMonitoring;

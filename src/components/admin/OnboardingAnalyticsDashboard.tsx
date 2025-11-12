import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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
import {
  TrendingDown,
  TrendingUp,
  Users,
  Clock,
  AlertCircle,
  CheckCircle2,
  Activity,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FunnelData {
  step_number: number;
  step_name: string;
  users_started: number;
  users_completed: number;
  completion_rate: number;
  avg_time_seconds: number;
}

interface ValidationError {
  field_name: string;
  error_count: number;
  error_percentage: number;
}

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

export const OnboardingAnalyticsDashboard: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');
  const [funnelData, setFunnelData] = useState<FunnelData[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [summary, setSummary] = useState({
    totalUsers: 0,
    completionRate: 0,
    avgTimeMinutes: 0,
    abandonmentRate: 0,
  });

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Load funnel data
      const { data: funnelResult, error: funnelError } = await supabase.rpc(
        'get_onboarding_funnel',
        { days_back: parseInt(timeRange) }
      );

      if (funnelError) throw funnelError;

      setFunnelData(funnelResult || []);

      // Load validation errors
      const { data: errorsResult, error: errorsError } = await supabase.rpc(
        'get_validation_error_stats',
        { days_back: parseInt(timeRange) }
      );

      if (errorsError) throw errorsError;

      setValidationErrors(errorsResult || []);

      // Calculate summary stats
      if (funnelResult && funnelResult.length > 0) {
        const totalStarted = funnelResult[0]?.users_started || 0;
        const totalCompleted = funnelResult[funnelResult.length - 1]?.users_completed || 0;
        const avgTime =
          funnelResult.reduce((acc, step) => acc + (step.avg_time_seconds || 0), 0) /
          funnelResult.length;
        const completionRate = totalStarted > 0 ? (totalCompleted / totalStarted) * 100 : 0;

        setSummary({
          totalUsers: totalStarted,
          completionRate: Math.round(completionRate),
          avgTimeMinutes: Math.round(avgTime / 60),
          abandonmentRate: Math.round(100 - completionRate),
        });
      }
    } catch (error: any) {
      console.error('Error loading analytics:', error);
      toast({
        title: 'Erreur de chargement',
        description: 'Impossible de charger les analytics',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${minutes}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Analytics Onboarding</h2>
          <p className="text-muted-foreground">Analyse détaillée du parcours d'inscription</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 derniers jours</SelectItem>
            <SelectItem value="30">30 derniers jours</SelectItem>
            <SelectItem value="90">90 derniers jours</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs démarrés</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Ont commencé l'inscription</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de complétion</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.completionRate}%</div>
            <p className="text-xs text-muted-foreground">Ont terminé l'inscription</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temps moyen</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.avgTimeMinutes} min</div>
            <p className="text-xs text-muted-foreground">Par utilisateur</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux d'abandon</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.abandonmentRate}%</div>
            <p className="text-xs text-muted-foreground">N'ont pas terminé</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="funnel" className="space-y-4">
        <TabsList>
          <TabsTrigger value="funnel">Funnel de conversion</TabsTrigger>
          <TabsTrigger value="time">Temps par étape</TabsTrigger>
          <TabsTrigger value="errors">Erreurs de validation</TabsTrigger>
        </TabsList>

        <TabsContent value="funnel" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Funnel de conversion par étape</CardTitle>
              <CardDescription>
                Nombre d'utilisateurs à chaque étape de l'inscription
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={funnelData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="step_name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="users_started" fill="#3b82f6" name="Démarrés" />
                  <Bar dataKey="users_completed" fill="#10b981" name="Complétés" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Taux de complétion par étape</CardTitle>
              <CardDescription>Pourcentage d'utilisateurs complétant chaque étape</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={funnelData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="step_name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="completion_rate"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    name="Taux de complétion (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="time" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Temps moyen par étape</CardTitle>
              <CardDescription>Durée moyenne passée sur chaque section</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={funnelData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="step_name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => formatTime(value)}
                    labelFormatter={(label) => `Étape: ${label}`}
                  />
                  <Legend />
                  <Bar dataKey="avg_time_seconds" fill="#f59e0b" name="Temps moyen" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {funnelData.map((step, index) => (
              <Card key={step.step_number}>
                <CardHeader>
                  <CardTitle className="text-lg">{step.step_name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Temps moyen:</span>
                      <span className="font-semibold">{formatTime(step.avg_time_seconds)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Complétion:</span>
                      <span className="font-semibold">{step.completion_rate}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Erreurs de validation les plus fréquentes</CardTitle>
              <CardDescription>
                Champs causant le plus d'erreurs lors de l'inscription
              </CardDescription>
            </CardHeader>
            <CardContent>
              {validationErrors.length > 0 ? (
                <div className="space-y-4">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={validationErrors.slice(0, 5)}
                        dataKey="error_count"
                        nameKey="field_name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={(entry) => `${entry.field_name}: ${entry.error_percentage}%`}
                      >
                        {validationErrors.slice(0, 5).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="space-y-2">
                    {validationErrors.map((error, index) => (
                      <div
                        key={error.field_name}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="h-4 w-4 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="font-medium">{error.field_name}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-muted-foreground">
                            {error.error_count} erreurs
                          </span>
                          <span className="font-semibold">{error.error_percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune erreur de validation enregistrée</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

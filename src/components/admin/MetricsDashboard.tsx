
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Users, 
  AlertTriangle, 
  Download,
  RefreshCw,
  BarChart3
} from 'lucide-react';
import { metricsService, useMetrics } from '@/services/analytics/metricsService';
import { performanceOptimizer } from '@/utils/performance/performanceOptimizer';
import { documentationService } from '@/services/documentation/documentationService';

const MetricsDashboard = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [insights, setInsights] = useState<any>(null);
  const [performanceReport, setPerformanceReport] = useState<any>(null);
  const [docStats, setDocStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const metrics = useMetrics();

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [dashboard, insightsData, perfReport, docData] = await Promise.all([
        Promise.resolve(metrics.getDashboard()),
        Promise.resolve(metrics.getInsights()),
        Promise.resolve(performanceOptimizer.getPerformanceReport()),
        Promise.resolve(documentationService.getDocumentationStats())
      ]);

      setDashboardData(dashboard);
      setInsights(insightsData);
      setPerformanceReport(perfReport);
      setDocStats(docData);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setLoading(false);
    }
  };

  const handleExport = () => {
    const data = metricsService.exportMetrics();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `metrics-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportDoc = () => {
    const markdown = documentationService.exportAsMarkdown();
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `documentation-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tableau de Bord Métriques</h1>
          <p className="text-muted-foreground">
            Analyse complète des performances et de l'engagement
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exporter Métriques
          </Button>
          <Button onClick={handleExportDoc} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exporter Doc
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {insights?.alerts && insights.alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Alertes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {insights.alerts.map((alert: any, index: number) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    alert.level === 'error' ? 'bg-red-50 border-red-200' :
                    alert.level === 'warning' ? 'bg-orange-50 border-orange-200' :
                    'bg-blue-50 border-blue-200'
                  }`}
                >
                  <Badge 
                    variant={alert.level === 'error' ? 'destructive' : 'secondary'}
                    className="mb-1"
                  >
                    {alert.level.toUpperCase()}
                  </Badge>
                  <p className="text-sm">{alert.message}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="errors">Erreurs</TabsTrigger>
          <TabsTrigger value="documentation">Documentation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Utilisateurs Actifs</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardData?.userEngagement?.uniqueUsers || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  +12% par rapport au mois dernier
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Actions Totales</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardData?.userEngagement?.totalActions || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  +8% par rapport à la semaine dernière
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Score Performance</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardData?.performance?.performanceScore || 0}
                </div>
                <Progress 
                  value={dashboardData?.performance?.performanceScore || 0} 
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taux d'Erreur</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardData?.errors?.errorRate?.toFixed(1) || 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {dashboardData?.errors?.criticalErrors || 0} erreurs critiques
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Actions Populaires</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dashboardData?.userEngagement?.topActions || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="action" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tendances Business</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData?.business?.trends?.map((trend: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">{trend.type}</span>
                      <div className="flex items-center gap-2">
                        {trend.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                        {trend.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
                        {trend.trend === 'stable' && <span className="text-gray-500">—</span>}
                        <Badge variant="outline">{trend.trend}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Temps de Chargement Moyen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {dashboardData?.performance?.averageLoadTime?.toFixed(0) || 0}ms
                </div>
                <Progress 
                  value={Math.min((dashboardData?.performance?.averageLoadTime || 0) / 10, 100)} 
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Composants les Plus Lents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {dashboardData?.performance?.slowestComponents?.slice(0, 5).map((comp: any, index: number) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{comp.name}</span>
                      <Badge variant="outline">{comp.avgTime.toFixed(0)}ms</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Taux de Conversion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {dashboardData?.business?.conversionRate || 0}%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Taux d'Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {dashboardData?.business?.engagementRate || 0}%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Taux de Rétention</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {dashboardData?.business?.retentionRate || 0}%
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Erreurs les Plus Fréquentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData?.errors?.topErrors?.map((error: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded">
                    <span className="text-sm font-medium">{error.error}</span>
                    <Badge variant="destructive">{error.count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documentation" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle>Composants Documentés</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {docStats?.componentsDocumented || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>APIs Documentées</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {docStats?.apisDocumented || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hooks Documentés</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {docStats?.hooksDocumented || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Couverture</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {docStats?.coveragePercentage || 0}%
                </div>
                <Progress 
                  value={docStats?.coveragePercentage || 0} 
                  className="mt-2"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Insights */}
      {insights && (
        <Card>
          <CardHeader>
            <CardTitle>Insights et Recommandations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium mb-2">Insights</h4>
                <ul className="space-y-1">
                  {insights.insights?.map((insight: string, index: number) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      • {insight}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Recommandations</h4>
                <ul className="space-y-1">
                  {insights.recommendations?.map((rec: string, index: number) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      • {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MetricsDashboard;

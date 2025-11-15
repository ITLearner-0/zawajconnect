import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, BarChart3, Calendar } from 'lucide-react';
import { usePredictiveAnalytics } from '@/hooks/wali/usePredictiveAnalytics';
import { AnomalyAlerts } from './AnomalyAlerts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface PredictiveDashboardProps {
  userId: string;
}

export const PredictiveDashboard: React.FC<PredictiveDashboardProps> = ({ userId }) => {
  const [timeRange, setTimeRange] = useState<number>(3);
  const { analytics, loading, error } = usePredictiveAnalytics(timeRange);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analyse prédictive & Détection d'anomalies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <p className="text-muted-foreground">Chargement des données prédictives...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !analytics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analyse prédictive & Détection d'anomalies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <p className="text-destructive">Erreur lors du chargement des données</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Combine historical and predicted data for charts
  const combineData = (historical: any[], predictions: any[]) => {
    const historicalData = historical.map(point => ({
      date: new Date(point.date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }),
      actual: point.value,
      predicted: null,
      lower: null,
      upper: null
    }));

    const predictedData = predictions.map(pred => ({
      date: new Date(pred.date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }),
      actual: null,
      predicted: pred.predicted,
      lower: pred.lower_bound,
      upper: pred.upper_bound
    }));

    return [...historicalData, ...predictedData];
  };

  const registrationsChart = combineData(
    analytics.registrations.historical,
    analytics.registrations.predictions
  );

  const alertsChart = combineData(
    analytics.alerts.historical,
    analytics.alerts.predictions
  );

  const getTrendIcon = (direction: string) => {
    if (direction === 'up') return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (direction === 'down') return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getTrendColor = (direction: string) => {
    if (direction === 'up') return 'text-green-600';
    if (direction === 'down') return 'text-red-600';
    return 'text-muted-foreground';
  };

  // Collect all anomalies
  const allAnomalies = [
    ...analytics.registrations.anomalies,
    ...analytics.alerts.anomalies,
    ...analytics.processingTime.anomalies
  ];

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Analyse prédictive & Détection d'anomalies
              </CardTitle>
              <CardDescription className="mt-2">
                Anticipation des tendances et identification automatique des variations inhabituelles
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Select value={timeRange.toString()} onValueChange={(v) => setTimeRange(Number(v))}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 mois</SelectItem>
                  <SelectItem value="3">3 mois</SelectItem>
                  <SelectItem value="6">6 mois</SelectItem>
                  <SelectItem value="12">12 mois</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Trend Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Tendance Inscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getTrendIcon(analytics.registrations.trend.direction)}
                <span className={`text-2xl font-bold ${getTrendColor(analytics.registrations.trend.direction)}`}>
                  {analytics.registrations.trend.changePercent > 0 ? '+' : ''}
                  {analytics.registrations.trend.changePercent}%
                </span>
              </div>
              <Badge variant={analytics.registrations.trend.direction === 'up' ? 'default' : 'secondary'}>
                {analytics.registrations.trend.direction === 'up' ? 'Hausse' : 
                 analytics.registrations.trend.direction === 'down' ? 'Baisse' : 'Stable'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Prévision 30j: {analytics.registrations.predictions[29]?.predicted || 'N/A'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Tendance Alertes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getTrendIcon(analytics.alerts.trend.direction)}
                <span className={`text-2xl font-bold ${getTrendColor(analytics.alerts.trend.direction)}`}>
                  {analytics.alerts.trend.changePercent > 0 ? '+' : ''}
                  {analytics.alerts.trend.changePercent}%
                </span>
              </div>
              <Badge variant={analytics.alerts.trend.direction === 'down' ? 'default' : 'destructive'}>
                {analytics.alerts.trend.direction === 'up' ? 'Hausse' : 
                 analytics.alerts.trend.direction === 'down' ? 'Baisse' : 'Stable'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Prévision 30j: {analytics.alerts.predictions[29]?.predicted || 'N/A'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Temps de traitement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getTrendIcon(analytics.processingTime.trend.direction)}
                <span className={`text-2xl font-bold ${getTrendColor(analytics.processingTime.trend.direction === 'down' ? 'up' : 'down')}`}>
                  {analytics.processingTime.trend.changePercent > 0 ? '+' : ''}
                  {analytics.processingTime.trend.changePercent}%
                </span>
              </div>
              <Badge variant={analytics.processingTime.trend.direction === 'down' ? 'default' : 'secondary'}>
                {analytics.processingTime.trend.direction === 'down' ? 'Amélioration' : 
                 analytics.processingTime.trend.direction === 'up' ? 'Dégradation' : 'Stable'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Prévision 30j: {analytics.processingTime.predictions[29]?.predicted || 'N/A'}h
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Anomaly Alerts */}
      <AnomalyAlerts anomalies={allAnomalies} />

      {/* Predictive Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Registrations Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Prédiction Inscriptions</CardTitle>
            <CardDescription>
              Données historiques et prévisions pour les 30 prochains jours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={registrationsChart}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                  />
                  <Legend />
                  <ReferenceLine 
                    x={registrationsChart[analytics.registrations.historical.length - 1]?.date} 
                    stroke="hsl(var(--muted-foreground))" 
                    strokeDasharray="3 3" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="actual" 
                    stroke="hsl(var(--primary))" 
                    fill="hsl(var(--primary))"
                    fillOpacity={0.6}
                    name="Réel"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="predicted" 
                    stroke="hsl(142 76% 36%)" 
                    fill="hsl(142 76% 36%)"
                    fillOpacity={0.3}
                    strokeDasharray="5 5"
                    name="Prévu"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="upper" 
                    stroke="transparent" 
                    fill="hsl(142 76% 36%)"
                    fillOpacity={0.1}
                    name="Limite haute"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Alerts Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Prédiction Alertes</CardTitle>
            <CardDescription>
              Évolution et anticipation du volume d'alertes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={alertsChart}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                  />
                  <Legend />
                  <ReferenceLine 
                    x={alertsChart[analytics.alerts.historical.length - 1]?.date} 
                    stroke="hsl(var(--muted-foreground))" 
                    strokeDasharray="3 3" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="actual" 
                    stroke="hsl(0 84% 60%)" 
                    strokeWidth={2}
                    name="Réel"
                    dot={{ r: 3 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="predicted" 
                    stroke="hsl(0 72% 51%)" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Prévu"
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

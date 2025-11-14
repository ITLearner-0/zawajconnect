import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useWaliKPIs, KPIPeriod } from '@/hooks/wali/useWaliKPIs';
import { PeriodSelector } from './PeriodSelector';
import { KPIDetailDialog } from './KPIDetailDialog';

interface KPITrendChartProps {
  userId: string;
}

export const KPITrendChart: React.FC<KPITrendChartProps> = ({ userId }) => {
  const [period, setPeriod] = useState<KPIPeriod>('30days');
  const [selectedKPI, setSelectedKPI] = useState<string | null>(null);
  const { kpis, loading } = useWaliKPIs(period);

  // Generate trend data from KPI comparison
  const generateTrendData = () => {
    if (!kpis) return [];

    const current = kpis.current;
    const previous = kpis.previous;
    
    // Create data points for the chart
    return [
      {
        name: 'Période précédente',
        inscriptions: previous.total_registrations,
        approuvees: previous.approved_count,
        rejets: previous.rejected_count,
        alertes: previous.total_alerts,
        critiques: previous.critical_alerts,
      },
      {
        name: 'Période actuelle',
        inscriptions: current.total_registrations,
        approuvees: current.approved_count,
        rejets: current.rejected_count,
        alertes: current.total_alerts,
        critiques: current.critical_alerts,
      },
    ];
  };

  const trendData = generateTrendData();

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-muted-foreground';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Évolution des KPIs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Évolution des KPIs</CardTitle>
          <PeriodSelector value={period} onChange={setPeriod} />
        </CardHeader>
        <CardContent>
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            {kpis && [
              { 
                key: 'registrations', 
                label: 'Inscriptions', 
                value: kpis.current.total_registrations, 
                change: kpis.comparison.registrations_change 
              },
              { 
                key: 'approved', 
                label: 'Approuvées', 
                value: kpis.current.approved_count, 
                change: kpis.comparison.approval_rate_change 
              },
              { 
                key: 'rejected', 
                label: 'Rejetées', 
                value: kpis.current.rejected_count, 
                change: 0 
              },
              { 
                key: 'alerts', 
                label: 'Alertes', 
                value: kpis.current.total_alerts, 
                change: kpis.comparison.alerts_change 
              },
              { 
                key: 'critical', 
                label: 'Critiques', 
                value: kpis.current.critical_alerts, 
                change: 0 
              },
            ].map((kpi) => (
              <div
                key={kpi.key}
                className="p-3 border rounded-lg hover:border-primary transition-colors cursor-pointer"
                onClick={() => setSelectedKPI(kpi.key)}
              >
                <p className="text-xs text-muted-foreground mb-1">{kpi.label}</p>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold">{kpi.value}</p>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(kpi.change)}
                    <span className={`text-xs font-medium ${getTrendColor(kpi.change)}`}>
                      {kpi.change > 0 ? '+' : ''}{kpi.change}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Main Trend Chart */}
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="name" 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="inscriptions" 
                  stackId="1"
                  stroke="hsl(var(--primary))" 
                  fill="hsl(var(--primary))" 
                  fillOpacity={0.6}
                  name="Inscriptions"
                />
                <Area 
                  type="monotone" 
                  dataKey="approuvees" 
                  stackId="2"
                  stroke="hsl(142 76% 36%)" 
                  fill="hsl(142 76% 36%)" 
                  fillOpacity={0.6}
                  name="Approuvées"
                />
                <Area 
                  type="monotone" 
                  dataKey="alertes" 
                  stackId="3"
                  stroke="hsl(0 84% 60%)" 
                  fill="hsl(0 84% 60%)" 
                  fillOpacity={0.6}
                  name="Alertes"
                />
                <Area 
                  type="monotone" 
                  dataKey="critiques" 
                  stackId="4"
                  stroke="hsl(0 72% 51%)" 
                  fill="hsl(0 72% 51%)" 
                  fillOpacity={0.6}
                  name="Critiques"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <p className="text-xs text-muted-foreground mt-4 text-center">
            Cliquez sur une carte KPI pour voir les détails et l'historique
          </p>
        </CardContent>
      </Card>

      {selectedKPI && (
        <KPIDetailDialog
          kpiKey={selectedKPI}
          userId={userId}
          period={period}
          open={!!selectedKPI}
          onClose={() => setSelectedKPI(null)}
        />
      )}
    </>
  );
};

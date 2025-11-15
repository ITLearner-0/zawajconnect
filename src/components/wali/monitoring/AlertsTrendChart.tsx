import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
} from 'recharts';
import type { MonthlyTrend } from '@/hooks/wali/useWaliTrends';

interface AlertsTrendChartProps {
  data: MonthlyTrend[];
  loading?: boolean;
}

export const AlertsTrendChart = ({ data, loading }: AlertsTrendChartProps) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Évolution des Alertes</CardTitle>
          <CardDescription>Tendance des alertes par niveau de risque</CardDescription>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <p className="text-muted-foreground">Chargement des données...</p>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Évolution des Alertes</CardTitle>
          <CardDescription>Tendance des alertes par niveau de risque</CardDescription>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <p className="text-muted-foreground">Aucune donnée disponible</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Évolution des Alertes</CardTitle>
        <CardDescription>
          Tendance des alertes par niveau de risque sur les {data.length} derniers mois
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.8} />
                <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(25, 95%, 53%)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="hsl(25, 95%, 53%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorMedium" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(48, 96%, 53%)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="hsl(48, 96%, 53%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorLow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--muted))" stopOpacity={0.8} />
                <stop offset="95%" stopColor="hsl(var(--muted))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="monthLabel" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--card-foreground))',
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="critical"
              stackId="1"
              stroke="hsl(var(--destructive))"
              fillOpacity={1}
              fill="url(#colorCritical)"
              name="Critique"
            />
            <Area
              type="monotone"
              dataKey="high"
              stackId="1"
              stroke="hsl(25, 95%, 53%)"
              fillOpacity={1}
              fill="url(#colorHigh)"
              name="Élevé"
            />
            <Area
              type="monotone"
              dataKey="medium"
              stackId="1"
              stroke="hsl(48, 96%, 53%)"
              fillOpacity={1}
              fill="url(#colorMedium)"
              name="Moyen"
            />
            <Area
              type="monotone"
              dataKey="low"
              stackId="1"
              stroke="hsl(var(--muted))"
              fillOpacity={1}
              fill="url(#colorLow)"
              name="Faible"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

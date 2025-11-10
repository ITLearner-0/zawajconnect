import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AlertTrend } from '@/hooks/useAdminWaliAlerts';

interface AdminAlertsTrendChartProps {
  trends: AlertTrend[];
  loading?: boolean;
}

export const AdminAlertsTrendChart = ({ trends, loading }: AdminAlertsTrendChartProps) => {
  if (loading) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Tendance des Alertes</CardTitle>
          <CardDescription>Évolution sur 30 jours</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] animate-pulse bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  const chartData = trends.map(trend => ({
    date: format(new Date(trend.date), 'dd MMM', { locale: fr }),
    Critique: trend.critical_count,
    Élevé: trend.high_count,
    Moyen: trend.medium_count,
    Faible: trend.low_count,
    Total: trend.total_count
  }));

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Tendance des Alertes</CardTitle>
        <CardDescription>Évolution sur les 30 derniers jours</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="date" 
              className="text-xs"
              stroke="hsl(var(--muted-foreground))"
            />
            <YAxis 
              className="text-xs"
              stroke="hsl(var(--muted-foreground))"
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="Critique" 
              stroke="hsl(var(--destructive))" 
              strokeWidth={2}
              dot={{ r: 3 }}
            />
            <Line 
              type="monotone" 
              dataKey="Élevé" 
              stroke="hsl(20, 100%, 50%)" 
              strokeWidth={2}
              dot={{ r: 3 }}
            />
            <Line 
              type="monotone" 
              dataKey="Moyen" 
              stroke="hsl(45, 100%, 50%)" 
              strokeWidth={2}
              dot={{ r: 3 }}
            />
            <Line 
              type="monotone" 
              dataKey="Faible" 
              stroke="hsl(210, 100%, 50%)" 
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
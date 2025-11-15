import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { ActivityTrend } from '@/hooks/wali/useWaliTrends';

interface ActivityTrendChartProps {
  data: ActivityTrend[];
  loading?: boolean;
}

export const ActivityTrendChart = ({ data, loading }: ActivityTrendChartProps) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activités des Walis</CardTitle>
          <CardDescription>Évolution des inscriptions et actions</CardDescription>
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
          <CardTitle>Activités des Walis</CardTitle>
          <CardDescription>Évolution des inscriptions et actions</CardDescription>
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
        <CardTitle>Activités des Walis</CardTitle>
        <CardDescription>
          Évolution des inscriptions, approbations, rejets et suspensions sur les {data.length}{' '}
          derniers mois
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
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
            <Bar
              dataKey="registrations"
              fill="hsl(var(--primary))"
              name="Inscriptions"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="approvals"
              fill="hsl(var(--chart-2))"
              name="Approbations"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="rejections"
              fill="hsl(var(--destructive))"
              name="Rejets"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="suspensions"
              fill="hsl(25, 95%, 53%)"
              name="Suspensions"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

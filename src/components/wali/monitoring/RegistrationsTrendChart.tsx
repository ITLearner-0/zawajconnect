import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { RegistrationStatusTrend } from '@/hooks/wali/useWaliTrends';

interface RegistrationsTrendChartProps {
  data: RegistrationStatusTrend[];
  loading?: boolean;
}

export const RegistrationsTrendChart = ({ data, loading }: RegistrationsTrendChartProps) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Statuts des Inscriptions</CardTitle>
          <CardDescription>Répartition par statut au fil du temps</CardDescription>
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
          <CardTitle>Statuts des Inscriptions</CardTitle>
          <CardDescription>Répartition par statut au fil du temps</CardDescription>
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
        <CardTitle>Statuts des Inscriptions</CardTitle>
        <CardDescription>
          Répartition des inscriptions par statut sur les {data.length} derniers mois
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="monthLabel" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--card-foreground))'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="pending" 
              stroke="hsl(48, 96%, 53%)" 
              strokeWidth={2}
              dot={{ fill: 'hsl(48, 96%, 53%)', r: 4 }}
              activeDot={{ r: 6 }}
              name="En attente"
            />
            <Line 
              type="monotone" 
              dataKey="approved" 
              stroke="hsl(var(--chart-2))" 
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--chart-2))', r: 4 }}
              activeDot={{ r: 6 }}
              name="Approuvées"
            />
            <Line 
              type="monotone" 
              dataKey="rejected" 
              stroke="hsl(var(--destructive))" 
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--destructive))', r: 4 }}
              activeDot={{ r: 6 }}
              name="Rejetées"
            />
            <Line 
              type="monotone" 
              dataKey="verified" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--primary))', r: 4 }}
              activeDot={{ r: 6 }}
              name="Vérifiées"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

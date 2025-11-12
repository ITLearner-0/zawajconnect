import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';

interface WaliActivityChartProps {
  auditLog: Array<{
    action_type: string;
    created_at: string;
    success: boolean;
  }>;
  loading?: boolean;
}

export const WaliActivityChart = ({ auditLog, loading }: WaliActivityChartProps) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activité des 7 derniers jours</CardTitle>
          <CardDescription>Répartition des actions par jour</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] animate-pulse bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  // Grouper les actions par jour
  const last7Days = [...Array(7)].map((_, i) => {
    const date = startOfDay(subDays(new Date(), 6 - i));
    return {
      date: format(date, 'EEE dd', { locale: fr }),
      fullDate: date,
      approbations: 0,
      rejets: 0,
      vues: 0,
      discussions: 0
    };
  });

  auditLog.forEach(action => {
    const actionDate = startOfDay(new Date(action.created_at));
    const dayData = last7Days.find(day => 
      day.fullDate.getTime() === actionDate.getTime()
    );

    if (dayData) {
      switch (action.action_type) {
        case 'match_approved':
          dayData.approbations++;
          break;
        case 'match_rejected':
          dayData.rejets++;
          break;
        case 'profile_viewed':
          dayData.vues++;
          break;
        case 'match_needs_discussion':
          dayData.discussions++;
          break;
      }
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activité des 7 derniers jours</CardTitle>
        <CardDescription>Répartition des actions par jour</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={last7Days}>
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
            <Bar 
              dataKey="approbations" 
              fill="hsl(var(--chart-1))" 
              name="Approbations"
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="rejets" 
              fill="hsl(var(--chart-2))" 
              name="Rejets"
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="vues" 
              fill="hsl(var(--chart-3))" 
              name="Vues"
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="discussions" 
              fill="hsl(var(--chart-4))" 
              name="Discussions"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

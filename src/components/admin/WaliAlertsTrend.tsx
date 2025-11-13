import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertTrend } from '@/hooks/useAdminWaliAlerts';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface WaliAlertsTrendProps {
  trends: AlertTrend[];
}

const WaliAlertsTrend: React.FC<WaliAlertsTrendProps> = ({ trends }) => {
  const chartData = trends.map(trend => ({
    date: format(new Date(trend.date), 'dd MMM', { locale: fr }),
    'Critique': trend.critical_count,
    'Élevé': trend.high_count,
    'Moyen': trend.medium_count,
    'Faible': trend.low_count,
    'Total': trend.total_count
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tendance des Alertes (30 derniers jours)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="date" 
              className="text-xs text-muted-foreground"
            />
            <YAxis className="text-xs text-muted-foreground" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
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
              dot={{ r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="Élevé" 
              stroke="#fb923c" 
              strokeWidth={2}
              dot={{ r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="Moyen" 
              stroke="#fbbf24" 
              strokeWidth={2}
              dot={{ r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="Faible" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="Total" 
              stroke="hsl(var(--primary))" 
              strokeWidth={3}
              dot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default WaliAlertsTrend;

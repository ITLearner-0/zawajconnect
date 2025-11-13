import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Shield, TrendingUp, Clock } from 'lucide-react';
import type { WaliStatistics } from '@/hooks/wali/useWaliMonitoring';

interface StatisticsCardsProps {
  statistics: WaliStatistics | null;
}

export const StatisticsCards = ({ statistics }: StatisticsCardsProps) => {
  if (!statistics) {
    return null;
  }

  const cards = [
    {
      title: 'Alertes Critiques',
      value: statistics.critical_alerts,
      icon: AlertTriangle,
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-950',
    },
    {
      title: 'Non Confirmées',
      value: statistics.unacknowledged_alerts,
      icon: Shield,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-950',
    },
    {
      title: 'Cette Semaine',
      value: statistics.alerts_this_week,
      icon: TrendingUp,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      title: "Aujourd'hui",
      value: statistics.alerts_today,
      icon: Clock,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Total: {statistics.total_alerts} alertes
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

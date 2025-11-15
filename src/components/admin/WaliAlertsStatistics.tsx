import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { AlertsStatistics } from '@/hooks/useAdminWaliAlerts';

interface WaliAlertsStatisticsProps {
  statistics: AlertsStatistics;
}

const WaliAlertsStatistics: React.FC<WaliAlertsStatisticsProps> = ({ statistics }) => {
  const stats = [
    {
      title: 'Total Alertes',
      value: statistics.total_alerts,
      icon: AlertTriangle,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: 'Critiques',
      value: statistics.critical_alerts,
      icon: AlertTriangle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10'
    },
    {
      title: 'Non Traitées',
      value: statistics.unacknowledged_alerts,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20'
    },
    {
      title: 'Aujourd\'hui',
      value: statistics.alerts_today,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20'
    },
    {
      title: 'Cette Semaine',
      value: statistics.alerts_this_week,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20'
    },
    {
      title: 'Ce Mois',
      value: statistics.alerts_this_month,
      icon: CheckCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="transition-all hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default WaliAlertsStatistics;

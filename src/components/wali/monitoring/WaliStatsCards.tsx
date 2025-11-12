import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Eye, MessageSquare } from 'lucide-react';

interface WaliStatsCardsProps {
  statistics: Array<{
    action_type: string;
    action_count: number;
    success_count: number;
    failure_count: number;
  }>;
  loading?: boolean;
}

const actionTypeLabels: Record<string, { label: string; icon: any; color: string }> = {
  match_approved: { 
    label: 'Approbations', 
    icon: CheckCircle, 
    color: 'text-green-600 dark:text-green-400' 
  },
  match_rejected: { 
    label: 'Rejets', 
    icon: XCircle, 
    color: 'text-red-600 dark:text-red-400' 
  },
  profile_viewed: { 
    label: 'Vues de profil', 
    icon: Eye, 
    color: 'text-blue-600 dark:text-blue-400' 
  },
  match_needs_discussion: { 
    label: 'Discussions', 
    icon: MessageSquare, 
    color: 'text-orange-600 dark:text-orange-400' 
  }
};

export const WaliStatsCards = ({ statistics, loading }: WaliStatsCardsProps) => {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="h-4 w-4 bg-muted rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted rounded mb-2" />
              <div className="h-3 w-32 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statsMap = statistics.reduce((acc, stat) => {
    acc[stat.action_type] = stat;
    return acc;
  }, {} as Record<string, typeof statistics[0]>);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Object.entries(actionTypeLabels).map(([actionType, config]) => {
        const stat = statsMap[actionType];
        const Icon = config.icon;
        const count = stat?.action_count || 0;
        const successRate = stat ? Math.round((stat.success_count / stat.action_count) * 100) : 100;

        return (
          <Card key={actionType}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {config.label}
              </CardTitle>
              <Icon className={`h-4 w-4 ${config.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{count}</div>
              <p className="text-xs text-muted-foreground">
                {successRate}% de succès
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

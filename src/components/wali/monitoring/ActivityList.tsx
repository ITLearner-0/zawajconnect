import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { WaliActivity } from '@/hooks/wali/useWaliMonitoring';

interface ActivityListProps {
  activities: WaliActivity[];
  onSuspend: (waliUserId: string, fullName: string) => void;
}

const getRiskColor = (score: number) => {
  if (score >= 20) return 'bg-red-500 text-white';
  if (score >= 10) return 'bg-orange-500 text-white';
  if (score >= 5) return 'bg-yellow-500 text-white';
  return 'bg-green-500 text-white';
};

const getRiskLabel = (score: number) => {
  if (score >= 20) return 'Risque Élevé';
  if (score >= 10) return 'Risque Moyen';
  if (score >= 5) return 'Risque Faible';
  return 'Normal';
};

export const ActivityList = ({ activities, onSuspend }: ActivityListProps) => {
  // Sort by risk score descending
  const sortedActivities = [...activities].sort((a, b) => b.risk_score - a.risk_score);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Activité des Walis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedActivities.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">Aucune activité récente</p>
          ) : (
            sortedActivities.map((activity) => (
              <div
                key={activity.wali_user_id}
                className="flex items-start justify-between gap-4 p-3 border rounded-lg"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{activity.full_name}</span>
                    <Badge className={getRiskColor(activity.risk_score)}>
                      {getRiskLabel(activity.risk_score)}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium">Actions:</span> {activity.total_actions}
                    </div>
                    <div>
                      <span className="font-medium">Suspectes:</span>{' '}
                      <span
                        className={
                          activity.suspicious_actions > 0 ? 'text-red-500 font-semibold' : ''
                        }
                      >
                        {activity.suspicious_actions}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Score:</span> {activity.risk_score}
                    </div>
                    <div>
                      <span className="font-medium">Dernière activité:</span>{' '}
                      {formatDistanceToNow(new Date(activity.last_activity), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </div>
                  </div>
                </div>
                {activity.risk_score >= 10 && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onSuspend(activity.wali_user_id, activity.full_name)}
                  >
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Suspendre
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

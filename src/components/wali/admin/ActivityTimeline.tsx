import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { History, CheckCircle, XCircle, FileText, User } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { WaliActivityLog } from '@/hooks/wali/useWaliRegistrationComments';

interface ActivityTimelineProps {
  activities: WaliActivityLog[];
}

const getActionIcon = (actionType: string) => {
  switch (actionType) {
    case 'status_change':
      return CheckCircle;
    case 'notes_update':
      return FileText;
    case 'comment_added':
      return User;
    default:
      return History;
  }
};

const getActionColor = (actionType: string) => {
  switch (actionType) {
    case 'status_change':
      return 'text-green-500';
    case 'notes_update':
      return 'text-blue-500';
    case 'comment_added':
      return 'text-purple-500';
    default:
      return 'text-muted-foreground';
  }
};

export const ActivityTimeline = ({ activities }: ActivityTimelineProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5" />
          Historique des Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Aucune activité enregistrée
            </p>
          ) : (
            <div className="relative space-y-4">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

              {activities.map((activity, index) => {
                const Icon = getActionIcon(activity.action_type);
                const iconColor = getActionColor(activity.action_type);

                return (
                  <div key={activity.id} className="relative pl-10">
                    {/* Timeline dot */}
                    <div
                      className={`absolute left-0 w-8 h-8 rounded-full bg-background border-2 border-border flex items-center justify-center ${
                        index === 0 ? 'ring-2 ring-primary ring-offset-2' : ''
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${iconColor}`} />
                    </div>

                    {/* Activity content */}
                    <div className="space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium">{activity.action_description}</p>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {format(new Date(activity.created_at), 'dd MMM HH:mm', {
                            locale: fr,
                          })}
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground">par {activity.admin_name}</p>

                      {/* Show old/new values for certain actions */}
                      {(activity.old_value || activity.new_value) && (
                        <div className="flex gap-2 mt-2 text-xs">
                          {activity.old_value && (
                            <Badge variant="outline" className="font-mono">
                              Avant: {JSON.stringify(activity.old_value)}
                            </Badge>
                          )}
                          {activity.new_value && (
                            <Badge variant="outline" className="font-mono">
                              Après: {JSON.stringify(activity.new_value)}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bell, Shield, AlertTriangle, Clock, CheckCircle, Eye } from 'lucide-react';
import { useFamilySupervision } from '@/hooks/useFamilySupervision';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface FamilyNotification {
  id: string;
  notification_type: string;
  content: string;
  original_message?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  is_read: boolean;
  action_required: boolean;
  created_at: string;
}

const FamilyNotificationCenter: React.FC = () => {
  const {
    notifications,
    loading,
    markNotificationAsRead,
    getUnreadNotifications,
    getCriticalNotifications,
  } = useFamilySupervision();

  const unreadNotifications = getUnreadNotifications();
  const criticalNotifications = getCriticalNotifications();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800';
    }
  };

  const getNotificationIcon = (type: string, severity: string) => {
    if (severity === 'critical') {
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }

    switch (type) {
      case 'inappropriate_content':
        return <Shield className="h-4 w-4 text-red-500" />;
      case 'match_started':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'content_warning':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald border-t-transparent mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement des notifications...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Critical Alerts Banner */}
      {criticalNotifications.length > 0 && (
        <Alert className="border-red-500 bg-red-50 dark:bg-red-900/10">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <AlertDescription>
            <strong>🚨 {criticalNotifications.length} alerte(s) critique(s)</strong> nécessitent
            votre attention immédiate !
          </AlertDescription>
        </Alert>
      )}

      {/* Notification Center */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-emerald" />
              Centre de Notifications Familiales
              {unreadNotifications.length > 0 && (
                <Badge variant="destructive">{unreadNotifications.length}</Badge>
              )}
            </CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            Surveillance et notifications pour la supervision islamique des communications
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Aucune notification</h3>
              <p className="text-muted-foreground">
                Vous serez notifié(e) de toute activité nécessitant votre attention.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`
                    ${notification.is_read ? 'opacity-75' : 'border-l-4 border-l-emerald'}
                    ${getSeverityColor(notification.severity)}
                  `}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getNotificationIcon(notification.notification_type, notification.severity)}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge
                              variant={
                                notification.severity === 'critical' ? 'destructive' : 'secondary'
                              }
                              className="text-xs"
                            >
                              {notification.severity.toUpperCase()}
                            </Badge>

                            {notification.action_required && (
                              <Badge
                                variant="outline"
                                className="text-xs border-red-500 text-red-600"
                              >
                                ACTION REQUISE
                              </Badge>
                            )}

                            {!notification.is_read && (
                              <div className="h-2 w-2 bg-emerald rounded-full"></div>
                            )}
                          </div>

                          <p className="text-sm font-medium mb-1">{notification.content}</p>

                          {notification.original_message && (
                            <div className="mt-2 p-2 bg-background/50 rounded text-xs border border-border/50">
                              <strong>Message concerné :</strong> "{notification.original_message}"
                            </div>
                          )}

                          <p className="text-xs text-muted-foreground mt-2">
                            {format(new Date(notification.created_at), "d MMM yyyy 'à' HH:mm", {
                              locale: fr,
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        {!notification.is_read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markNotificationAsRead(notification.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}

                        {notification.is_read && <CheckCircle className="h-4 w-4 text-emerald" />}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {unreadNotifications.length > 0 && (
        <Card className="bg-emerald/5 border-emerald/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-emerald-800 dark:text-emerald-200">
                  Actions Rapides
                </h4>
                <p className="text-sm text-emerald-600 dark:text-emerald-300">
                  {unreadNotifications.length} notification(s) non lue(s)
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  unreadNotifications.forEach((notif) => markNotificationAsRead(notif.id));
                }}
                className="border-emerald text-emerald hover:bg-emerald/10"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Tout marquer comme lu
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FamilyNotificationCenter;

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bell, 
  Shield, 
  AlertTriangle, 
  MessageSquare, 
  CheckCircle,
  Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  notification_type: string;
  content: string;
  original_message?: string;
  severity: string;
  action_required: boolean;
  created_at: string;
  is_read: boolean;
}

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead
}) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      default: return <MessageSquare className="h-4 w-4 text-blue-600" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `Il y a ${Math.floor(diffInMinutes / 60)} h`;
    return `Il y a ${Math.floor(diffInMinutes / 1440)} j`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Centre de Notifications
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {notifications.filter(n => !n.is_read).length} non lues
            </Badge>
            {notifications.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onMarkAllAsRead}
                className="text-xs"
              >
                Tout marquer comme lu
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Aucune notification pour le moment</p>
              <p className="text-sm text-muted-foreground">
                Vous serez alerté en cas de contenu inapproprié
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <Alert 
                key={notification.id}
                className={`cursor-pointer transition-all ${
                  !notification.is_read 
                    ? 'border-primary bg-primary/5 hover:bg-primary/10' 
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => onMarkAsRead(notification.id)}
              >
                <div className="flex items-start gap-3">
                  {getSeverityIcon(notification.severity)}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant={getSeverityColor(notification.severity)} className="text-xs">
                        {notification.severity.toUpperCase()}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(notification.created_at)}
                        </span>
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                        )}
                      </div>
                    </div>
                    
                    <AlertDescription className="text-sm">
                      {notification.content}
                    </AlertDescription>
                    
                    {notification.original_message && (
                      <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                        <strong>Message original:</strong> {notification.original_message}
                      </div>
                    )}
                    
                    {notification.action_required && (
                      <Badge variant="outline" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        Action requise
                      </Badge>
                    )}
                  </div>
                </div>
              </Alert>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationCenter;
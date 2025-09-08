import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, Shield, AlertTriangle, MessageSquare, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WaliNotification {
  id: string;
  content: string;
  severity: string;
  created_at: string;
  is_read: boolean;
  action_required: boolean;
  notification_type: string;
}

const WaliNotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<WaliNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    loadNotifications();
    setupRealtimeSubscription();
  }, []);

  const loadNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: familyMembers } = await supabase
        .from('family_members')
        .select('id')
        .eq('invited_user_id', user.id)
        .eq('invitation_status', 'accepted')
        .eq('is_wali', true);

      if (!familyMembers?.length) return;

      const { data: notifications } = await supabase
        .from('family_notifications')
        .select('*')
        .in('family_member_id', familyMembers.map(fm => fm.id))
        .order('created_at', { ascending: false })
        .limit(20);

      if (notifications) {
        setNotifications(notifications);
        setUnreadCount(notifications.filter(n => !n.is_read).length);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('wali-realtime-notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'family_notifications'
      }, (payload) => {
        const newNotification = payload.new as WaliNotification;
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Notification push immédiate pour les alertes critiques
        if (newNotification.severity === 'critical') {
          // Notification push browser si supporté
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('🚨 Alerte Critique Wali', {
              body: newNotification.content,
              icon: '/favicon.ico'
            });
          }
          
          toast({
            title: "🚨 Alerte Critique",
            description: newNotification.content,
            variant: "destructive"
          });
        }
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  };

  const markAsRead = async (id: string) => {
    try {
      await supabase
        .from('family_notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', id);

      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, is_read: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

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

  // Demander permission pour les notifications push
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast({
          title: "Notifications activées",
          description: "Vous recevrez des alertes en temps réel"
        });
      }
    }
  };

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50">
      <Card className="w-80 max-h-96 overflow-hidden shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications Wali
            </div>
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <Shield className="h-8 w-8 mx-auto mb-2" />
                <p>Aucune notification</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 border-b cursor-pointer hover:bg-muted/50 ${
                    !notification.is_read ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-2">
                    {getSeverityIcon(notification.severity)}
                    <div className="flex-1 text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={getSeverityColor(notification.severity)} className="text-xs">
                          {notification.severity.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(notification.created_at).toLocaleTimeString('fr-FR')}
                        </span>
                      </div>
                      <p className="text-sm">{notification.content}</p>
                      {notification.action_required && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          Action requise
                        </Badge>
                      )}
                    </div>
                    {!notification.is_read && (
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WaliNotificationCenter;
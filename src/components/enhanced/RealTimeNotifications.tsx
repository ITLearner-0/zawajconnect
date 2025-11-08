import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsTrigger } from '@/components/ui/tabs';
import { ResponsiveTabsList } from '@/components/ui/responsive-tabs-list';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bell, 
  AlertTriangle, 
  Shield, 
  MessageSquare, 
  CheckCircle, 
  Eye, 
  Search,
  Filter,
  Archive,
  Trash2,
  Settings
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface FamilyNotification {
  id: string;
  notification_type: string;
  content: string;
  original_message?: string;
  severity: string;
  action_required: boolean;
  created_at: string;
  match_id: string;
  is_read: boolean;
}

interface RealTimeNotificationsProps {
  notifications: FamilyNotification[];
  onNotificationUpdate: (notifications: FamilyNotification[]) => void;
}

const RealTimeNotifications: React.FC<RealTimeNotificationsProps> = ({
  notifications,
  onNotificationUpdate
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'critical'>('all');
  const { toast } = useToast();

  // Real-time subscription for notifications
  useEffect(() => {
    const channel = supabase
      .channel('notifications-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'family_notifications'
      }, (payload) => {
        const newNotification = payload.new as FamilyNotification;
        onNotificationUpdate([newNotification, ...notifications]);
        
        // Show real-time toast
        if (newNotification.severity === 'critical') {
          toast({
            title: "🚨 Nouvelle Alerte Critique",
            description: newNotification.content,
            variant: "destructive"
          });
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'family_notifications'
      }, (payload) => {
        const updatedNotification = payload.new as FamilyNotification;
        const updatedNotifications = notifications.map(notif => 
          notif.id === updatedNotification.id ? updatedNotification : notif
        );
        onNotificationUpdate(updatedNotifications);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [notifications, onNotificationUpdate, toast]);

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = !searchTerm || 
      notification.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.original_message?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSeverity = filterSeverity === 'all' || notification.severity === filterSeverity;
    const matchesType = filterType === 'all' || notification.notification_type === filterType;
    
    const matchesActiveFilter = 
      activeFilter === 'all' || 
      (activeFilter === 'unread' && !notification.is_read) ||
      (activeFilter === 'critical' && notification.severity === 'critical');

    return matchesSearch && matchesSeverity && matchesType && matchesActiveFilter;
  });

  const markAsRead = async (id: string) => {
    try {
      await supabase
        .from('family_notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', id);

      const updatedNotifications = notifications.map(notif => 
        notif.id === id ? { ...notif, is_read: true } : notif
      );
      onNotificationUpdate(updatedNotifications);
      
      toast({
        title: "Notification marquée comme lue",
        description: "La notification a été marquée comme lue"
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: "Erreur",
        description: "Impossible de marquer la notification comme lue",
        variant: "destructive"
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
      
      if (unreadIds.length > 0) {
        await supabase
          .from('family_notifications')
          .update({ is_read: true, read_at: new Date().toISOString() })
          .in('id', unreadIds);

        const updatedNotifications = notifications.map(notif => ({ ...notif, is_read: true }));
        onNotificationUpdate(updatedNotifications);
        
        toast({
          title: "Toutes les notifications marquées comme lues",
          description: `${unreadIds.length} notifications marquées`
        });
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: "Erreur",
        description: "Impossible de marquer toutes les notifications",
        variant: "destructive"
      });
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await supabase
        .from('family_notifications')
        .delete()
        .eq('id', id);

      const updatedNotifications = notifications.filter(notif => notif.id !== id);
      onNotificationUpdate(updatedNotifications);
      
      toast({
        title: "Notification supprimée",
        description: "La notification a été supprimée"
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la notification",
        variant: "destructive"
      });
    }
  };

  const getSeverityIcon = (severity: string, type: string) => {
    if (severity === 'critical') return <AlertTriangle className="h-4 w-4 text-red-500" />;
    
    switch (type) {
      case 'inappropriate_content':
        return <Shield className="h-4 w-4 text-red-500" />;
      case 'new_message':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'match_approval':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
      case 'high':
        return 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
      default:
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const criticalCount = notifications.filter(n => n.severity === 'critical' && !n.is_read).length;

  return (
    <div className="space-y-6">
      {/* Critical Alerts Banner */}
      {criticalCount > 0 && (
        <Alert className="border-red-500 bg-red-50 dark:bg-red-900/10">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>
                <strong>🚨 {criticalCount} alerte(s) critique(s) non lue(s)</strong> nécessitent votre attention immédiate !
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setActiveFilter('critical')}
                className="border-red-500 text-red-600 hover:bg-red-50"
              >
                Voir les alertes critiques
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Notification Center */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Centre de Notifications en Temps Réel
              {unreadCount > 0 && (
                <Badge variant="destructive" className="animate-pulse">
                  {unreadCount} non lues
                </Badge>
              )}
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Tout marquer lu
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher dans les notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Gravité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="critical">Critique</SelectItem>
                  <SelectItem value="high">Haute</SelectItem>
                  <SelectItem value="medium">Moyenne</SelectItem>
                  <SelectItem value="low">Basse</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous types</SelectItem>
                  <SelectItem value="inappropriate_content">Contenu inapproprié</SelectItem>
                  <SelectItem value="new_message">Nouveau message</SelectItem>
                  <SelectItem value="match_approval">Approbation match</SelectItem>
                  <SelectItem value="content_warning">Avertissement</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filter Tabs */}
          <Tabs value={activeFilter} onValueChange={(value) => setActiveFilter(value as any)} className="w-full">
            <ResponsiveTabsList tabCount={3}>
              <TabsTrigger value="all">
                Toutes ({notifications.length})
              </TabsTrigger>
              <TabsTrigger value="unread">
                Non lues ({unreadCount})
                {unreadCount > 0 && <div className="ml-2 h-2 w-2 bg-red-500 rounded-full"></div>}
              </TabsTrigger>
              <TabsTrigger value="critical">
                Critiques ({criticalCount})
                {criticalCount > 0 && <div className="ml-2 h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>}
              </TabsTrigger>
            </ResponsiveTabsList>

            <TabsContent value={activeFilter} className="space-y-3 mt-4">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">
                    {activeFilter === 'unread' ? 'Aucune notification non lue' :
                     activeFilter === 'critical' ? 'Aucune alerte critique' :
                     'Aucune notification'}
                  </h3>
                  <p className="text-muted-foreground">
                    {searchTerm ? 'Aucun résultat pour votre recherche.' :
                     'Vous serez notifié(e) de toute activité nécessitant votre attention.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredNotifications.map((notification) => (
                    <Card 
                      key={notification.id} 
                      className={`
                        ${!notification.is_read ? 'border-l-4 border-l-primary shadow-md' : 'opacity-75'}
                        ${getSeverityColor(notification.severity)}
                        transition-all duration-200 hover:shadow-lg
                      `}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            {getSeverityIcon(notification.severity, notification.notification_type)}
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge 
                                  variant={notification.severity === 'critical' ? 'destructive' : 
                                          notification.severity === 'high' ? 'default' : 'secondary'}
                                  className="text-xs animate-pulse"
                                >
                                  {notification.severity.toUpperCase()}
                                </Badge>
                                
                                {notification.action_required && (
                                  <Badge variant="outline" className="text-xs border-red-500 text-red-600 animate-bounce">
                                    ACTION REQUISE
                                  </Badge>
                                )}
                                
                                {!notification.is_read && (
                                  <div className="h-2 w-2 bg-primary rounded-full animate-pulse"></div>
                                )}

                                <Badge variant="outline" className="text-xs">
                                  {notification.notification_type.replace('_', ' ')}
                                </Badge>
                              </div>
                              
                              <p className="font-medium mb-2">
                                {notification.content}
                              </p>
                              
                              {notification.original_message && (
                                <div className="mt-2 p-3 bg-background/80 rounded border border-border/50">
                                  <p className="text-xs font-medium text-muted-foreground mb-1">Message concerné :</p>
                                  <p className="text-sm italic">"{notification.original_message}"</p>
                                </div>
                              )}
                              
                              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
                                <span>{format(new Date(notification.created_at), "d MMM yyyy 'à' HH:mm", { locale: fr })}</span>
                                {Date.now() - new Date(notification.created_at).getTime() < 300000 && (
                                  <Badge variant="outline" className="text-xs animate-pulse">NOUVEAU</Badge>
                                )}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1 ml-4">
                            {!notification.is_read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead(notification.id)}
                                className="h-8 w-8 p-0 hover:bg-primary/10"
                                title="Marquer comme lu"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteNotification(notification.id)}
                              className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600"
                              title="Supprimer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            
                            {notification.is_read && (
                              <CheckCircle className="h-4 w-4 text-emerald ml-1" />
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Quick Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{notifications.length}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{criticalCount}</div>
            <div className="text-xs text-muted-foreground">Critiques</div>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-amber-600">{unreadCount}</div>
            <div className="text-xs text-muted-foreground">Non lues</div>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-emerald-600">
              {notifications.filter(n => n.action_required && !n.is_read).length}
            </div>
            <div className="text-xs text-muted-foreground">Actions requises</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RealTimeNotifications;
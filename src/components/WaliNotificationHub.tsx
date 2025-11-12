// @ts-nocheck
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  Heart, 
  MessageCircle, 
  UserCheck, 
  AlertTriangle,
  Clock,
  CheckCircle,
  Eye,
  Users,
  Shield,
  Star
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsTrigger } from '@/components/ui/tabs';
import { ResponsiveTabsList } from '@/components/ui/responsive-tabs-list';

interface Notification {
  id: string;
  notification_type: string;
  content: string;
  is_read: boolean;
  action_required: boolean;
  severity: string;
  match_id: string;
  original_message?: string;
  created_at: string;
  read_at?: string;
  match: {
    id: string;
    user1_id: string;
    user2_id: string;
    match_score: number;
    is_mutual: boolean;
    user1: {
      full_name: string;
      age: number;
      avatar_url?: string;
    };
    user2: {
      full_name: string;
      age: number;
      avatar_url?: string;
    };
  };
}

interface SupervisionSummary {
  total_supervised: number;
  active_matches: number;
  pending_approvals: number;
  unread_notifications: number;
  recent_activities: number;
}

const WaliNotificationHub = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [summary, setSummary] = useState<SupervisionSummary>({
    total_supervised: 0,
    active_matches: 0,
    pending_approvals: 0,
    unread_notifications: 0,
    recent_activities: 0
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'urgent'>('all');

  useEffect(() => {
    fetchNotifications();
    fetchSupervisionSummary();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('wali-notifications')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'family_notifications',
          filter: `family_member_id=eq.${user?.id}`
        }, 
        () => {
          fetchNotifications();
          fetchSupervisionSummary();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      // Get family member records where user is the invited family member
      const { data: familyMembers } = await supabase
        .from('family_members')
        .select('id')
        .eq('invited_user_id', user.id)
        .eq('invitation_status', 'accepted');

      if (!familyMembers || familyMembers.length === 0) {
        setNotifications([]);
        setLoading(false);
        return;
      }

      const familyMemberIds = familyMembers.map(fm => fm.id);

      // Get notifications for this family member
      const { data: notificationsData, error } = await supabase
        .from('family_notifications')
        .select(`
          *,
          match:matches(
            id,
            user1_id,
            user2_id,
            match_score,
            is_mutual,
            user1:profiles!matches_user1_id_fkey(full_name, age, avatar_url),
            user2:profiles!matches_user2_id_fkey(full_name, age, avatar_url)
          )
        `)
        .in('family_member_id', familyMemberIds)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setNotifications((notificationsData || []).map(n => ({
        ...n,
        match: n.match ? {
          ...n.match,
          user1: n.match.user1 || { full_name: 'User 1', age: 25, avatar_url: '' },
          user2: n.match.user2 || { full_name: 'User 2', age: 25, avatar_url: '' }
        } : null
      })) as Notification[]);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les notifications",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSupervisionSummary = async () => {
    if (!user) return;

    try {
      // Get supervised users count
      const { data: supervisedUsers } = await supabase
        .from('family_members')
        .select('user_id')
        .eq('invited_user_id', user.id)
        .eq('invitation_status', 'accepted');

      const supervisedUserIds = supervisedUsers?.map(fm => fm.user_id) || [];

      if (supervisedUserIds.length === 0) {
        setSummary({
          total_supervised: 0,
          active_matches: 0,
          pending_approvals: 0,
          unread_notifications: 0,
          recent_activities: 0
        });
        return;
      }

      // Get active matches for supervised users
      const { data: activeMatches } = await supabase
        .from('matches')
        .select('id')
        .or(supervisedUserIds.map(id => `user1_id.eq.${id},user2_id.eq.${id}`).join(','))
        .eq('is_mutual', true);

      // Get pending approvals
      const { data: pendingApprovals } = await supabase
        .from('matches')
        .select('id')
        .or(supervisedUserIds.map(id => `user1_id.eq.${id},user2_id.eq.${id}`).join(','))
        .eq('family_supervision_required', true)
        .is('family_approved', null);

      // Count unread notifications
      const unreadCount = notifications.filter(n => !n.is_read).length;

      // Get recent activities (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data: recentActivities } = await supabase
        .from('family_notifications')
        .select('id')
        .gte('created_at', sevenDaysAgo.toISOString());

      setSummary({
        total_supervised: supervisedUserIds.length,
        active_matches: activeMatches?.length || 0,
        pending_approvals: pendingApprovals?.length || 0,
        unread_notifications: unreadCount,
        recent_activities: recentActivities?.length || 0
      });
    } catch (error) {
      console.error('Error fetching supervision summary:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('family_notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, is_read: true, read_at: new Date().toISOString() }
            : n
        )
      );

      fetchSupervisionSummary();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.is_read);
      const notificationIds = unreadNotifications.map(n => n.id);

      if (notificationIds.length === 0) return;

      const { error } = await supabase
        .from('family_notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .in('id', notificationIds);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
      );

      fetchSupervisionSummary();
      
      toast({
        title: "Notifications marquées comme lues",
        description: `${notificationIds.length} notification(s) marquée(s) comme lue(s)`,
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast({
        title: "Erreur",
        description: "Impossible de marquer les notifications comme lues",
        variant: "destructive"
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_match':
        return <Heart className="h-4 w-4 text-pink-500" />;
      case 'message_alert':
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'approval_request':
        return <UserCheck className="h-4 w-4 text-green-500" />;
      case 'content_warning':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return <Badge variant="destructive">Urgent</Badge>;
      case 'medium':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Important</Badge>;
      default:
        return <Badge variant="outline">Info</Badge>;
    }
  };

  const getFilteredNotifications = () => {
    switch (filter) {
      case 'unread':
        return notifications.filter(n => !n.is_read);
      case 'urgent':
        return notifications.filter(n => n.severity === 'high' || n.action_required);
      default:
        return notifications;
    }
  };

  const filteredNotifications = getFilteredNotifications();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald border-t-transparent mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement du centre de notifications...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Summary */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-emerald" />
                Centre de Supervision Wali
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Surveillez et guidez les relations de vos proches selon les principes islamiques
              </p>
            </div>
            <div className="flex items-center gap-2">
              {summary.unread_notifications > 0 && (
                <Button variant="outline" size="sm" onClick={markAllAsRead}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Tout marquer comme lu
                </Button>
              )}
              <Badge variant="outline" className="px-3 py-1">
                <Bell className="h-3 w-3 mr-1" />
                {summary.unread_notifications} non lues
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald">{summary.total_supervised}</div>
              <div className="text-xs text-muted-foreground">Personnes supervisées</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{summary.active_matches}</div>
              <div className="text-xs text-muted-foreground">Matches actifs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">{summary.pending_approvals}</div>
              <div className="text-xs text-muted-foreground">Approbations en attente</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{summary.unread_notifications}</div>
              <div className="text-xs text-muted-foreground">Non lues</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{summary.recent_activities}</div>
              <div className="text-xs text-muted-foreground">Activités récentes</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <Tabs value={filter} onValueChange={(value) => setFilter(value as any)}>
            <ResponsiveTabsList tabCount={3}>
              <TabsTrigger value="all">
                Toutes ({notifications.length})
              </TabsTrigger>
              <TabsTrigger value="unread">
                Non lues ({notifications.filter(n => !n.is_read).length})
              </TabsTrigger>
              <TabsTrigger value="urgent">
                Urgentes ({notifications.filter(n => n.severity === 'high' || n.action_required).length})
              </TabsTrigger>
            </ResponsiveTabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {filter === 'all' ? 'Aucune notification' : 
                 filter === 'unread' ? 'Aucune notification non lue' : 'Aucune notification urgente'}
              </h3>
              <p className="text-muted-foreground">
                {filter === 'all' ? 'Vous êtes à jour avec toutes les activités de supervision' :
                 filter === 'unread' ? 'Toutes vos notifications ont été lues' :
                 'Aucune action urgente requise pour le moment'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`transition-all hover:shadow-md cursor-pointer ${
                !notification.is_read ? 'ring-1 ring-emerald/20 bg-emerald/5' : ''
              }`}
              onClick={() => !notification.is_read && markAsRead(notification.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.notification_type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        {getSeverityBadge(notification.severity)}
                        {notification.action_required && (
                          <Badge className="bg-red-100 text-red-800 border-red-200">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Action requise
                          </Badge>
                        )}
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-emerald rounded-full"></div>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(notification.created_at), { 
                          addSuffix: true, 
                          locale: fr 
                        })}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm">{notification.content}</p>
                      
                      {notification.match && (
                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 bg-gradient-to-br from-emerald to-sage rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-primary-foreground">
                                {notification.match.user1.full_name.charAt(0)}
                              </span>
                            </div>
                            <span className="text-sm font-medium">
                              {notification.match.user1.full_name}
                            </span>
                          </div>
                          <Heart className="h-4 w-4 text-pink-500" />
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-white">
                                {notification.match.user2.full_name.charAt(0)}
                              </span>
                            </div>
                            <span className="text-sm font-medium">
                              {notification.match.user2.full_name}
                            </span>
                          </div>
                          <Badge variant="outline" className="ml-auto">
                            <Star className="h-3 w-3 mr-1" />
                            {notification.match.match_score}%
                          </Badge>
                        </div>
                      )}

                      {notification.original_message && (
                        <details className="text-xs">
                          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                            Voir le message original
                          </summary>
                          <div className="mt-2 p-2 bg-muted/30 rounded border-l-2 border-orange-300">
                            <p className="italic">"{notification.original_message}"</p>
                          </div>
                        </details>
                      )}
                    </div>

                    {notification.action_required && (
                      <div className="flex gap-2 mt-3 pt-3 border-t">
                        <Button size="sm" variant="outline" className="text-xs">
                          <Eye className="h-3 w-3 mr-1" />
                          Examiner
                        </Button>
                        <Button size="sm" className="text-xs bg-emerald hover:bg-emerald-dark">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Approuver
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default WaliNotificationHub;
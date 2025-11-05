// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Shield, 
  Users, 
  MessageSquare, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock,
  Eye,
  Heart,
  Calendar,
  TrendingUp,
  Activity,
  Bell,
  Video,
  Settings
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Import enhanced notification components
import RealTimeNotifications from './RealTimeNotifications';
import FamilyMeetingScheduler from './FamilyMeetingScheduler';
import SupervisionAnalytics from './SupervisionAnalytics';

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

interface SupervisedUser {
  id: string;
  full_name: string;
  user_id: string;
  relationship: string;
  avatar_url?: string;
  last_seen?: string;
  active_conversations: number;
  unread_messages: number;
  recent_activity?: string;
}

interface MatchForApproval {
  id: string;
  user1_id: string;
  user2_id: string;
  match_score: number;
  created_at: string;
  can_communicate: boolean;
  candidate_name?: string;
  candidate_id?: string;
  supervised_user_name?: string;
  supervised_user_id?: string;
}

interface WaliStats {
  totalSupervised: number;
  criticalAlerts: number;
  pendingApprovals: number;
  approvalRate: number;
  activeConversations: number;
  recentActivity: number;
}

interface RealtimeActivity {
  id: string;
  type: 'message' | 'match' | 'alert';
  user_name: string;
  content: string;
  timestamp: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

const EnhancedWaliDashboard: React.FC = () => {
  const [supervisedUsers, setSupervisedUsers] = useState<SupervisedUser[]>([]);
  const [notifications, setNotifications] = useState<FamilyNotification[]>([]);
  const [matchesForApproval, setMatchesForApproval] = useState<MatchForApproval[]>([]);
  const [realtimeActivities, setRealtimeActivities] = useState<RealtimeActivity[]>([]);
  const [stats, setStats] = useState<WaliStats>({
    totalSupervised: 0,
    criticalAlerts: 0,
    pendingApprovals: 0,
    approvalRate: 85,
    activeConversations: 0,
    recentActivity: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();
  const navigate = useNavigate();

  // Real-time subscriptions
  useEffect(() => {
    loadWaliData();
    const channels = setupRealtimeSubscriptions();
    
    return () => {
      // Cleanup specific subscriptions only
      channels.forEach(channel => {
        if (channel) {
          supabase.removeChannel(channel);
        }
      });
    };
  }, []);

  const setupRealtimeSubscriptions = () => {
    const channels: unknown[] = [];
    
    // Subscribe to family notifications
    const notificationChannel = supabase
      .channel('wali-notifications-enhanced')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'family_notifications'
      }, (payload) => {
        const newNotification = payload.new as FamilyNotification;
        handleNewNotification(newNotification);
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, (payload) => {
        handleNewMessage(payload.new);
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'matches'
      }, (payload) => {
        handleNewMatch(payload.new);
      })
      .subscribe();

    channels.push(notificationChannel);

    // Subscribe to supervision logs for real-time activity
    const activityChannel = supabase
      .channel('supervision-activity')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'supervision_logs'
      }, (payload) => {
        handleSupervisionActivity(payload.new);
      })
      .subscribe();

    channels.push(activityChannel);
      
    return channels;
  };

  const handleNewNotification = (notification: FamilyNotification) => {
    setNotifications(prev => [notification, ...prev]);
    
    // Add to real-time activity feed
    const activity: RealtimeActivity = {
      id: notification.id,
      type: 'alert',
      user_name: 'Système',
      content: notification.content,
      timestamp: notification.created_at,
      severity: notification.severity as any
    };
    
    setRealtimeActivities(prev => [activity, ...prev.slice(0, 19)]);
    
    // Show toast for critical alerts
    if (notification.severity === 'critical') {
      toast({
        title: "🚨 Alerte Critique",
        description: notification.content,
        variant: "destructive"
      });
    }
    
    // Update stats
    setStats(prev => ({
      ...prev,
      criticalAlerts: notification.severity === 'critical' ? prev.criticalAlerts + 1 : prev.criticalAlerts,
      recentActivity: prev.recentActivity + 1
    }));
  };

  const handleNewMessage = (message: any) => {
    // Add message to real-time activity feed
    const activity: RealtimeActivity = {
      id: message.id,
      type: 'message',
      user_name: 'Utilisateur Supervisé',
      content: `Nouveau message: ${message.content.substring(0, 50)}...`,
      timestamp: message.created_at
    };
    
    setRealtimeActivities(prev => [activity, ...prev.slice(0, 19)]);
    
    // Update supervised users unread count
    setSupervisedUsers(prev => prev.map(user => ({
      ...user,
      unread_messages: user.unread_messages + 1,
      recent_activity: 'Message reçu'
    })));
  };

  const handleNewMatch = (match: any) => {
    // Add match to real-time activity feed
    const activity: RealtimeActivity = {
      id: match.id,
      type: 'match',
      user_name: 'Système de Match',
      content: 'Nouveau match nécessitant approbation familiale',
      timestamp: match.created_at
    };
    
    setRealtimeActivities(prev => [activity, ...prev.slice(0, 19)]);
    
    // Reload match data
    loadMatchesForApproval();
  };

  const handleSupervisionActivity = (log: any) => {
    // Update activity based on supervision log
    const activity: RealtimeActivity = {
      id: log.id,
      type: 'alert',
      user_name: 'Supervision',
      content: `Activité: ${log.action_type}`,
      timestamp: log.created_at
    };
    
    setRealtimeActivities(prev => [activity, ...prev.slice(0, 19)]);
  };

  const loadWaliData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load supervised users with enhanced data
      const { data: familyMembers } = await supabase
        .from('family_members')
        .select(`
          id,
          full_name,
          user_id,
          relationship
        `)
        .eq('invited_user_id', user.id)
        .eq('invitation_status', 'accepted')
        .eq('is_wali', true);

      if (familyMembers && familyMembers.length > 0) {
        const enhancedUsers = await Promise.all(
          familyMembers.map(async (member) => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name, avatar_url')
              .eq('user_id', member.user_id)
              .maybeSingle();

            // Get conversation stats
            const { data: matches } = await supabase
              .from('matches')
              .select('id')
              .or(`user1_id.eq.${member.user_id},user2_id.eq.${member.user_id}`)
              .eq('is_mutual', true);

            // Get unread messages count
            const { count: unreadCount } = await supabase
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .in('match_id', matches?.map(m => m.id) || [])
              .eq('is_read', false);

            return {
              id: member.id,
              full_name: profile?.full_name || 'Utilisateur',
              user_id: member.user_id,
              relationship: member.relationship,
              avatar_url: profile?.avatar_url,
              active_conversations: matches?.length || 0,
              unread_messages: unreadCount || 0,
              recent_activity: 'En ligne'
            };
          })
        );
        setSupervisedUsers(enhancedUsers);

        // Calculate enhanced stats
        const totalActiveConversations = enhancedUsers.reduce((sum, user) => sum + user.active_conversations, 0);
        
        setStats(prev => ({
          ...prev,
          totalSupervised: enhancedUsers.length,
          activeConversations: totalActiveConversations
        }));
      }

      await loadNotifications(familyMembers);
      await loadMatchesForApproval();

    } catch (error) {
      console.error('Error loading wali data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadNotifications = async (familyMembers: unknown[]) => {
    const { data: notificationData } = await supabase
      .from('family_notifications')
      .select('*')
      .in('family_member_id', familyMembers?.map(fm => fm.id) || [])
      .order('created_at', { ascending: false })
      .limit(50);

    if (notificationData) {
      setNotifications(notificationData);
      const criticalCount = notificationData.filter(n => n.severity === 'critical' && !n.is_read).length;
      setStats(prev => ({ ...prev, criticalAlerts: criticalCount }));
    }
  };

  const loadMatchesForApproval = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: familyMembers } = await supabase
        .from('family_members')
        .select('user_id')
        .eq('invited_user_id', user.id)
        .eq('invitation_status', 'accepted')
        .eq('is_wali', true);

      const userIds = familyMembers?.map(fm => fm.user_id) || [];
      
      if (userIds.length > 0) {
        const { data: matches } = await supabase
          .from('matches')
          .select('*')
          .or(`user1_id.in.(${userIds.join(',')}),user2_id.in.(${userIds.join(',')})`)
          .eq('family_supervision_required', true)
          .or(`and(user1_id.in.(${userIds.join(',')}),family1_approved.is.null),and(user2_id.in.(${userIds.join(',')}),family2_approved.is.null)`);

        if (matches) {
          const enrichedMatches = await Promise.all(
            matches.map(async (match) => {
              const supervisedUserId = userIds.find(id => id === match.user1_id || id === match.user2_id);
              const candidateId = supervisedUserId === match.user1_id ? match.user2_id : match.user1_id;
              
              const [candidateProfile, supervisedProfile] = await Promise.all([
                supabase.from('profiles').select('full_name').eq('user_id', candidateId).maybeSingle(),
                supabase.from('profiles').select('full_name').eq('user_id', supervisedUserId).maybeSingle()
              ]);

              return {
                ...match,
                candidate_name: candidateProfile.data?.full_name || 'Candidat inconnu',
                candidate_id: candidateId,
                supervised_user_name: supervisedProfile.data?.full_name || 'Utilisateur supervisé',
                supervised_user_id: supervisedUserId
              };
            })
          );
          
          setMatchesForApproval(enrichedMatches);
          setStats(prev => ({ ...prev, pendingApprovals: enrichedMatches.length }));
        }
      }
    } catch (error) {
      console.error('Error loading matches for approval:', error);
    }
  };

  const approveMatch = async (matchId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const match = matchesForApproval.find(m => m.id === matchId);
      if (!match) return;

      const { data: familyMembers } = await supabase
        .from('family_members')
        .select('user_id')
        .eq('invited_user_id', user.id)
        .eq('invitation_status', 'accepted')
        .eq('is_wali', true);

      const supervisedUserIds = familyMembers?.map(fm => fm.user_id) || [];
      const isFamily1 = supervisedUserIds.includes(match.user1_id);
      const updateField = isFamily1 ? 'family1_approved' : 'family2_approved';
      
      await supabase
        .from('matches')
        .update({ 
          [updateField]: true,
          can_communicate: true,
          family_reviewed_at: new Date().toISOString()
        })
        .eq('id', matchId);

      setMatchesForApproval(prev => prev.filter(m => m.id !== matchId));
      setStats(prev => ({
        ...prev,
        pendingApprovals: prev.pendingApprovals - 1
      }));
      
      toast({
        title: "Match approuvé",
        description: "Le match a été approuvé avec succès"
      });

      // Add to activity feed
      const activity: RealtimeActivity = {
        id: Date.now().toString(),
        type: 'match',
        user_name: 'Vous',
        content: `Match approuvé: ${match.candidate_name} ↔ ${match.supervised_user_name}`,
        timestamp: new Date().toISOString()
      };
      setRealtimeActivities(prev => [activity, ...prev.slice(0, 19)]);

    } catch (error) {
      console.error('Error approving match:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'approuver le match",
        variant: "destructive"
      });
    }
  };

  const rejectMatch = async (matchId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const match = matchesForApproval.find(m => m.id === matchId);
      if (!match) return;

      const { data: familyMembers } = await supabase
        .from('family_members')
        .select('user_id')
        .eq('invited_user_id', user.id)
        .eq('invitation_status', 'accepted')
        .eq('is_wali', true);

      const supervisedUserIds = familyMembers?.map(fm => fm.user_id) || [];
      const isFamily1 = supervisedUserIds.includes(match.user1_id);
      const updateField = isFamily1 ? 'family1_approved' : 'family2_approved';
      
      await supabase
        .from('matches')
        .update({ 
          [updateField]: false,
          family_reviewed_at: new Date().toISOString()
        })
        .eq('id', matchId);

      setMatchesForApproval(prev => prev.filter(m => m.id !== matchId));
      setStats(prev => ({
        ...prev,
        pendingApprovals: prev.pendingApprovals - 1
      }));
      
      toast({
        title: "Match rejeté",
        description: "Le match a été rejeté"
      });

      // Add to activity feed
      const activity: RealtimeActivity = {
        id: Date.now().toString(),
        type: 'alert',
        user_name: 'Vous',
        content: `Match rejeté: ${match.candidate_name} ↔ ${match.supervised_user_name}`,
        timestamp: new Date().toISOString(),
        severity: 'medium'
      };
      setRealtimeActivities(prev => [activity, ...prev.slice(0, 19)]);

    } catch (error) {
      console.error('Error rejecting match:', error);
      toast({
        title: "Erreur",
        description: "Impossible de rejeter le match",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement du tableau de bord Wali...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Tableau de Bord Wali Avancé</h1>
            <p className="text-muted-foreground">
              Supervision familiale en temps réel selon les principes islamiques
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald" />
            <span className="text-sm text-muted-foreground">En ligne</span>
          </div>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Paramètres
          </Button>
        </div>
      </div>

      {/* Critical Alerts Banner */}
      {stats.criticalAlerts > 0 && (
        <Alert className="border-red-500 bg-red-50 dark:bg-red-900/10">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>
                <strong>🚨 {stats.criticalAlerts} alerte(s) critique(s)</strong> nécessitent votre attention immédiate !
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setActiveTab('notifications')}
                className="border-red-500 text-red-600 hover:bg-red-50"
              >
                Voir les alertes
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary/70">Supervisés</p>
                <p className="text-3xl font-bold text-primary">{stats.totalSupervised}</p>
              </div>
              <Users className="h-8 w-8 text-primary/60" />
            </div>
            <div className="mt-4 flex items-center text-xs text-primary/60">
              <TrendingUp className="h-3 w-3 mr-1" />
              {stats.activeConversations} conversations actives
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 dark:from-red-900/20 dark:to-red-800/20 dark:border-red-800/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600 dark:text-red-400">Alertes Critiques</p>
                <p className="text-3xl font-bold text-red-700 dark:text-red-300">{stats.criticalAlerts}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <div className="mt-4 flex items-center text-xs text-red-600 dark:text-red-400">
              <Clock className="h-3 w-3 mr-1" />
              Nécessitent une action
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 dark:from-amber-900/20 dark:to-amber-800/20 dark:border-amber-800/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-600 dark:text-amber-400">En Attente</p>
                <p className="text-3xl font-bold text-amber-700 dark:text-amber-300">{stats.pendingApprovals}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-500" />
            </div>
            <div className="mt-4 flex items-center text-xs text-amber-600 dark:text-amber-400">
              <Heart className="h-3 w-3 mr-1" />
              Matches à approuver
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 dark:from-emerald-900/20 dark:to-emerald-800/20 dark:border-emerald-800/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Taux Approbation</p>
                <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">{stats.approvalRate}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-emerald-500" />
            </div>
            <div className="mt-4">
              <Progress value={stats.approvalRate} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="notifications">
            Notifications
            {stats.criticalAlerts > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs flex items-center justify-center">
                {stats.criticalAlerts}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approvals">
            Approbations
            {stats.pendingApprovals > 0 && (
              <Badge variant="secondary" className="ml-2">
                {stats.pendingApprovals}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="supervised">Supervisés</TabsTrigger>
          <TabsTrigger value="meetings">Réunions</TabsTrigger>
          <TabsTrigger value="analytics">Analyses</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Real-time Activity Feed */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-emerald" />
                  Activité en Temps Réel
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {realtimeActivities.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Aucune activité récente</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {realtimeActivities.map((activity, index) => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border">
                        <div className={`p-1 rounded-full ${
                          activity.type === 'alert' ? 'bg-red-100 text-red-600' :
                          activity.type === 'message' ? 'bg-blue-100 text-blue-600' :
                          'bg-green-100 text-green-600'
                        }`}>
                          {activity.type === 'alert' ? <AlertTriangle className="h-3 w-3" /> :
                           activity.type === 'message' ? <MessageSquare className="h-3 w-3" /> :
                           <Heart className="h-3 w-3" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{activity.user_name}</p>
                            {activity.severity && (
                              <Badge variant={activity.severity === 'critical' ? 'destructive' : 'secondary'} className="text-xs">
                                {activity.severity}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{activity.content}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(activity.timestamp), "HH:mm", { locale: fr })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Supervised Users Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Utilisateurs Supervisés
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {supervisedUsers.map((user) => (
                  <div key={user.id} className="flex items-center gap-3 p-3 rounded-lg border bg-background/50">
                    <Avatar>
                      <AvatarImage src={user.avatar_url} />
                      <AvatarFallback>{user.full_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{user.full_name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {user.relationship}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span>{user.active_conversations} conversations</span>
                        {user.unread_messages > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {user.unread_messages} non lus
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/family-supervision?supervised_user=${user.user_id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Enhanced Notifications Tab */}
        <TabsContent value="notifications">
          <RealTimeNotifications 
            notifications={notifications}
            onNotificationUpdate={setNotifications}
          />
        </TabsContent>

        {/* Approvals Tab */}
        <TabsContent value="approvals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Matches en Attente d'Approbation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {matchesForApproval.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-16 w-16 text-emerald mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">Aucun match en attente</h3>
                    <p className="text-muted-foreground">
                      Tous les matches ont été traités.
                    </p>
                  </div>
                ) : (
                  matchesForApproval.map((match) => (
                    <Card key={match.id} className="border-l-4 border-l-amber-500">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg mb-2">
                              {match.supervised_user_name} ↔ {match.candidate_name}
                            </h4>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                              <span className="flex items-center gap-1">
                                <Heart className="h-4 w-4" />
                                Compatibilité: {match.match_score}%
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {format(new Date(match.created_at), "d MMM yyyy", { locale: fr })}
                              </span>
                            </div>
                            <Progress value={match.match_score} className="h-2 mb-3" />
                          </div>
                          
                          <div className="flex gap-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/profile/${match.candidate_id}`)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Voir Profil
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => rejectMatch(match.id)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Rejeter
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => approveMatch(match.id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approuver
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Supervised Users Tab */}
        <TabsContent value="supervised" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {supervisedUsers.map((user) => (
              <Card key={user.id}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.avatar_url} />
                      <AvatarFallback>{user.full_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{user.full_name}</h3>
                        <Badge variant="outline">{user.relationship}</Badge>
                        {user.unread_messages > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {user.unread_messages}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center p-3 bg-background/50 rounded">
                          <p className="text-2xl font-bold text-primary">{user.active_conversations}</p>
                          <p className="text-xs text-muted-foreground">Conversations</p>
                        </div>
                        <div className="text-center p-3 bg-background/50 rounded">
                          <p className="text-2xl font-bold text-emerald">{user.unread_messages}</p>
                          <p className="text-xs text-muted-foreground">Non lus</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/profile/${user.user_id}`)}
                          className="flex-1"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Profil
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => navigate(`/family-supervision?supervised_user=${user.user_id}`)}
                          className="flex-1"
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Messages
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Family Meeting Scheduler Tab */}
        <TabsContent value="meetings">
          <FamilyMeetingScheduler supervisedUsers={supervisedUsers} />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <SupervisionAnalytics 
            supervisedUsers={supervisedUsers}
            notifications={notifications}
            stats={stats}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedWaliDashboard;
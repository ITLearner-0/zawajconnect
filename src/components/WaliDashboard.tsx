import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
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
  TrendingUp,
  Calendar
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
}

interface MatchForApproval {
  id: string;
  user1_id: string;
  user2_id: string;
  match_score: number;
  created_at: string;
  can_communicate: boolean;
  family_approved?: boolean;
  other_user: {
    full_name: string;
    age?: number;
    profession?: string;
    location?: string;
  };
}

interface WaliStats {
  totalSupervised: number;
  activeMatches: number;
  pendingApprovals: number;
  criticalAlerts: number;
  messagesModerated: number;
  approvalRate: number;
}

const WaliDashboard: React.FC = () => {
  const [notifications, setNotifications] = useState<FamilyNotification[]>([]);
  const [supervisedUsers, setSupervisedUsers] = useState<SupervisedUser[]>([]);
  const [matchesForApproval, setMatchesForApproval] = useState<MatchForApproval[]>([]);
  const [stats, setStats] = useState<WaliStats>({
    totalSupervised: 0,
    activeMatches: 0,
    pendingApprovals: 0,
    criticalAlerts: 0,
    messagesModerated: 0,
    approvalRate: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadWaliData();
    subscribeToNotifications();
  }, []);

  const loadWaliData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Charger les utilisateurs supervisés
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

      if (familyMembers) {
        const supervised = familyMembers.map(member => ({
          id: member.id,
          full_name: member.full_name,
          user_id: member.user_id,
          relationship: member.relationship,
          avatar_url: undefined
        }));
        setSupervisedUsers(supervised);
      }

      // Charger les notifications
      const { data: notificationData } = await supabase
        .from('family_notifications')
        .select('*')
        .in('family_member_id', familyMembers?.map(fm => fm.id) || [])
        .order('created_at', { ascending: false })
        .limit(20);

      if (notificationData) {
        setNotifications(notificationData);
      }

      // Charger les matches en attente d'approbation
      if (familyMembers && familyMembers.length > 0) {
        const userIds = familyMembers.map(fm => fm.user_id);
        const { data: matches } = await supabase
          .from('matches')
          .select(`
            id,
            user1_id,
            user2_id,
            match_score,
            created_at,
            can_communicate,
            family_approved
          `)
          .in('user1_id', userIds)
          .eq('is_mutual', true)
          .is('family_approved', null);

        if (matches) {
          const formattedMatches = matches.map(match => ({
            ...match,
            other_user: {
              full_name: 'Utilisateur',
              age: undefined,
              profession: undefined,
              location: undefined
            }
          }));
          setMatchesForApproval(formattedMatches);
        }
      }

      // Calculer les statistiques
      const criticalAlerts = notificationData?.filter(n => n.severity === 'critical' && !n.is_read).length || 0;
      const pendingApprovals = matchesForApproval.length;
      
      setStats({
        totalSupervised: familyMembers?.length || 0,
        activeMatches: 0, // À calculer
        pendingApprovals,
        criticalAlerts,
        messagesModerated: 0, // À calculer depuis moderation_logs
        approvalRate: 85 // À calculer réellement
      });

    } catch (error) {
      console.error('Error loading Wali data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données de supervision",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const subscribeToNotifications = () => {
    const channel = supabase
      .channel('wali-notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'family_notifications'
      }, (payload) => {
        setNotifications(prev => [payload.new as FamilyNotification, ...prev]);
        
        if (payload.new.severity === 'critical') {
          toast({
            title: "🚨 Alerte Critique",
            description: payload.new.content,
            variant: "destructive"
          });
        }
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  };

  const handleApproveMatch = async (matchId: string, approved: boolean) => {
    try {
      const { error } = await supabase
        .from('matches')
        .update({ 
          family_approved: approved,
          can_communicate: approved,
          family_reviewed_at: new Date().toISOString()
        })
        .eq('id', matchId);

      if (error) throw error;

      setMatchesForApproval(prev => prev.filter(match => match.id !== matchId));
      
      toast({
        title: approved ? "Match approuvé" : "Match refusé",
        description: approved 
          ? "La communication est maintenant autorisée" 
          : "Le match a été refusé selon vos directives",
        variant: approved ? "default" : "destructive"
      });
    } catch (error) {
      console.error('Error approving match:', error);
      toast({
        title: "Erreur",
        description: "Impossible de traiter l'approbation",
        variant: "destructive"
      });
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('family_notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId);

      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, is_read: true }
            : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
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
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-primary/10 rounded-full">
          <Shield className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Tableau de Bord Wali</h1>
          <p className="text-muted-foreground">
            Supervision familiale selon les principes islamiques
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Supervisés</p>
                <p className="text-2xl font-bold">{stats.totalSupervised}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Alertes Critiques</p>
                <p className="text-2xl font-bold text-red-600">{stats.criticalAlerts}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">En Attente</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingApprovals}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taux Approbation</p>
                <p className="text-2xl font-bold text-green-600">{stats.approvalRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="notifications">
            Notifications
            {stats.criticalAlerts > 0 && (
              <Badge variant="destructive" className="ml-2">
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
          <TabsTrigger value="reports">Rapports</TabsTrigger>
        </TabsList>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notifications Récentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
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
                      className={`${!notification.is_read ? 'border-primary bg-primary/5' : ''}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {getSeverityIcon(notification.severity)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant={getSeverityColor(notification.severity)}>
                                {notification.severity.toUpperCase()}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {new Date(notification.created_at).toLocaleString('fr-FR')}
                              </span>
                            </div>
                            <AlertDescription className="text-sm">
                              {notification.content}
                            </AlertDescription>
                            {notification.original_message && (
                              <div className="mt-2 p-2 bg-muted rounded text-sm">
                                <strong>Message original:</strong> {notification.original_message}
                              </div>
                            )}
                          </div>
                        </div>
                        {!notification.is_read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markNotificationAsRead(notification.id)}
                          >
                            Marquer lu
                          </Button>
                        )}
                      </div>
                    </Alert>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
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
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-muted-foreground">Aucune approbation en attente</p>
                    <p className="text-sm text-muted-foreground">
                      Tous les matches ont été traités
                    </p>
                  </div>
                ) : (
                  matchesForApproval.map((match) => (
                    <Card key={match.id} className="border-l-4 border-l-yellow-500">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-primary/10 rounded-full">
                              <Heart className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-semibold">{match.other_user.full_name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {match.other_user.profession && `${match.other_user.profession} • `}
                                {match.other_user.location}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline">
                                  Compatibilité: {match.match_score}%
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  {new Date(match.created_at).toLocaleDateString('fr-FR')}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              onClick={() => handleApproveMatch(match.id, false)}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Refuser
                            </Button>
                            <Button
                              onClick={() => handleApproveMatch(match.id, true)}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
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
          <Card>
            <CardHeader>
              <CardTitle>Utilisateurs Supervisés</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {supervisedUsers.map((user) => (
                  <Card key={user.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{user.full_name}</h4>
                          <p className="text-sm text-muted-foreground capitalize">
                            {user.relationship}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Activité Cette Semaine</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Messages modérés</span>
                      <span>12/20</span>
                    </div>
                    <Progress value={60} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Matches approuvés</span>
                      <span>3/5</span>
                    </div>
                    <Progress value={60} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Alertes traitées</span>
                      <span>8/8</span>
                    </div>
                    <Progress value={100} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Résumé Mensuel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total matches supervisés</span>
                    <Badge variant="secondary">15</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Taux d'approbation</span>
                    <Badge variant="outline">85%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Contenus modérés</span>
                    <Badge variant="destructive">23</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Temps de réponse moyen</span>
                    <Badge variant="outline">2h 15m</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WaliDashboard;
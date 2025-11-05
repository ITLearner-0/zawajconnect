import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import SupervisionMetrics from '@/components/SupervisionMetrics';
import NotificationCenter from '@/components/NotificationCenter';
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
  TrendingUp
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCompatibility } from '@/hooks/useCompatibility';

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
  candidate_name?: string;
  candidate_id?: string;
  supervised_user_name?: string;
}

interface WaliStats {
  totalSupervised: number;
  criticalAlerts: number;
  pendingApprovals: number;
  approvalRate: number;
}

const WaliDashboard: React.FC = () => {
  const [supervisedUsers, setSupervisedUsers] = useState<SupervisedUser[]>([]);
  const [notifications, setNotifications] = useState<FamilyNotification[]>([]);
  const [matchesForApproval, setMatchesForApproval] = useState<MatchForApproval[]>([]);
  const [stats, setStats] = useState<WaliStats>({
    totalSupervised: 0,
    criticalAlerts: 0,
    pendingApprovals: 0,
    approvalRate: 85
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fonction helper pour calculer la compatibilité entre deux utilisateurs spécifiques
  const calculateCompatibilityBetweenUsers = async (user1Id: string, user2Id: string): Promise<number> => {
    try {
      // Récupérer les réponses des deux utilisateurs
      const { data: user1Responses } = await supabase
        .from('user_compatibility_responses')
        .select('question_key, response_value')
        .eq('user_id', user1Id);

      const { data: user2Responses } = await supabase
        .from('user_compatibility_responses')
        .select('question_key, response_value')
        .eq('user_id', user2Id);

      const { data: questions } = await supabase
        .from('compatibility_questions')
        .select('question_key, weight')
        .eq('is_active', true);

      if (!user1Responses || !user2Responses || !questions) {
        return 0;
      }

      let totalWeight = 0;
      let matchedWeight = 0;

      questions.forEach(question => {
        const user1Response = user1Responses.find(r => r.question_key === question.question_key);
        const user2Response = user2Responses.find(r => r.question_key === question.question_key);

        if (user1Response && user2Response) {
          const weight = question.weight ?? 1;
          totalWeight += weight;
          
          // Simple matching - exact match scores full weight
          if (user1Response.response_value === user2Response.response_value) {
            matchedWeight += weight;
          }
        }
      });

      return totalWeight > 0 ? (matchedWeight / totalWeight) * 100 : 0;

    } catch (error) {
      console.error('Error calculating compatibility score:', error);
      return 0;
    }
  };

  const handleViewProfile = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  const handleViewConversations = (userId: string) => {
    navigate(`/family-supervision?supervised_user=${userId}`);
  };

  useEffect(() => {
    loadWaliData();
    subscribeToNotifications();
  }, []);

  const loadWaliData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Charger les utilisateurs supervisés (ceux que ce wali supervise)
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
        // Pour chaque membre de famille, récupérer le profil de la personne supervisée
        const supervisedProfiles = await Promise.all(
          familyMembers.map(async (member) => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name, avatar_url')
              .eq('user_id', member.user_id)
              .maybeSingle();

            return {
              id: member.id,
              full_name: profile?.full_name || 'Utilisateur',
              user_id: member.user_id, // L'ID de la personne supervisée (Sarah)
              relationship: member.relationship,
              avatar_url: profile?.avatar_url ?? undefined
            };
          })
        );
        setSupervisedUsers(supervisedProfiles);
      }

      // Charger les notifications
      const { data: notificationData } = await supabase
        .from('family_notifications')
        .select('*')
        .in('family_member_id', familyMembers?.map(fm => fm.id) || [])
        .order('created_at', { ascending: false })
        .limit(20);

      if (notificationData) {
        setNotifications(notificationData.map(n => ({
          ...n,
          original_message: n.original_message ?? undefined,
          read_at: n.read_at ?? undefined
        })));
      }

      // Charger les matches en attente d'approbation
      const userIds = familyMembers?.map(fm => fm.user_id) || [];
      let matchData = null;
      if (userIds.length > 0) {
        const { data } = await supabase
          .from('matches')
          .select('*')
          .or(`user1_id.in.(${userIds.join(',')}),user2_id.in.(${userIds.join(',')})`)
          .eq('family_supervision_required', true)
          .or(`and(user1_id.in.(${userIds.join(',')}),family1_approved.is.null),and(user2_id.in.(${userIds.join(',')}),family2_approved.is.null)`);

        matchData = data;
        if (matchData) {
          // Récupérer les profils des candidats et utilisateurs supervisés
          const enrichedMatches = await Promise.all(
            matchData.map(async (match) => {
              const supervisedUserId = userIds.find(id => id === match.user1_id || id === match.user2_id);
              const candidateId = supervisedUserId === match.user1_id ? match.user2_id : match.user1_id;
              
              // Récupérer le profil du candidat
              const { data: candidateProfile } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('user_id', candidateId)
                .maybeSingle();

              // Récupérer le profil de l'utilisateur supervisé
              const supervisedUserId = familyMembers?.find(fm => fm.user_id)?.user_id;
              if (!supervisedUserId) continue;

              const { data: supervisedProfile } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('user_id', supervisedUserId)
                .maybeSingle();

              // Calculer le score de compatibilité réel
              const compatibilityScore = await calculateCompatibilityBetweenUsers(supervisedUserId, candidateId);

              return {
                ...match,
                candidate_name: candidateProfile?.full_name || 'Candidat inconnu',
                candidate_id: candidateId,
                supervised_user_name: supervisedProfile?.full_name || 'Utilisateur supervisé',
                match_score: Math.round(compatibilityScore)
              };
            })
          );
          setMatchesForApproval(enrichedMatches);
        }
      }

      // Calculer les stats
      const criticalCount = notificationData?.filter(n => n.severity === 'critical').length || 0;
      const pendingCount = matchData?.length || 0;

      setStats({
        totalSupervised: familyMembers?.length || 0,
        criticalAlerts: criticalCount,
        pendingApprovals: pendingCount,
        approvalRate: 85
      });

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

  const subscribeToNotifications = () => {
    const channel = supabase
      .channel('wali-notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'family_notifications'
      }, (payload) => {
        const newNotification = payload.new as FamilyNotification;
        setNotifications(prev => [newNotification, ...prev]);
        
        if (newNotification.severity === 'critical') {
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

  const markNotificationAsRead = async (id: string) => {
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
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
      
      if (unreadIds.length > 0) {
        await supabase
          .from('family_notifications')
          .update({ is_read: true, read_at: new Date().toISOString() })
          .in('id', unreadIds);

        setNotifications(prev => 
          prev.map(notif => ({ ...notif, is_read: true }))
        );
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const approveMatch = async (matchId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Trouver le match pour déterminer quelle famille approuve
      const match = matchesForApproval.find(m => m.id === matchId);
      if (!match) return;

      // Déterminer si ce wali supervise user1 ou user2
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

      // Trouver le match pour déterminer quelle famille rejette
      const match = matchesForApproval.find(m => m.id === matchId);
      if (!match) return;

      // Déterminer si ce wali supervise user1 ou user2
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

      {/* Métriques de supervision avec le nouveau composant */}
      <SupervisionMetrics
        activeSupervisions={stats.totalSupervised}
        totalMessages={notifications.filter(n => n.notification_type === 'inappropriate_content').length}
        moderationAlerts={stats.criticalAlerts}
        approvalsPending={stats.pendingApprovals}
      />

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
          <NotificationCenter
            notifications={notifications}
            onMarkAsRead={markNotificationAsRead}
            onMarkAllAsRead={markAllNotificationsAsRead}
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
                    <CheckCircle className="h-12 w-12 text-emerald mx-auto mb-4" />
                    <p className="text-muted-foreground">Aucune approbation en attente</p>
                    <p className="text-sm text-muted-foreground">
                      Tous les matches ont été traités
                    </p>
                  </div>
                ) : (
                  matchesForApproval.map((match) => (
                    <Card key={match.id} className="border-l-4 border-l-gold">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-4">
                             <div className="p-2 bg-gold-light rounded-full">
                               <Heart className="h-6 w-6 text-gold-dark" />
                             </div>
                             <div>
                               <p className="font-medium">{match.candidate_name}</p>
                                <p className="text-sm text-muted-foreground">
                                  Match avec {match.supervised_user_name} • Score: {match.match_score || 0}%
                                </p>
                               <p className="text-xs text-muted-foreground">
                                 {new Date(match.created_at).toLocaleDateString('fr-FR')}
                               </p>
                             </div>
                           </div>
                           <div className="flex gap-2">
                             <Button
                               variant="outline"
                               size="sm"
                               onClick={() => handleViewProfile(match.candidate_id!)}
                             >
                               <Eye className="h-4 w-4 mr-1" />
                               Voir Profil
                             </Button>
                             <Button
                               variant="outline"
                               size="sm"
                               onClick={() => rejectMatch(match.id)}
                               className="border-destructive/30 text-destructive hover:bg-destructive/10"
                             >
                               <XCircle className="h-4 w-4 mr-1" />
                               Rejeter
                             </Button>
                             <Button
                               size="sm"
                               onClick={() => approveMatch(match.id)}
                               className="bg-emerald hover:bg-emerald-dark text-primary-foreground"
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
          <Card>
            <CardHeader>
              <CardTitle>Utilisateurs Supervisés</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {supervisedUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Aucun utilisateur supervisé</p>
                    <p className="text-sm text-muted-foreground">
                      Les invitations en attente apparaîtront ici
                    </p>
                  </div>
                ) : (
                  supervisedUsers.map((user) => (
                    <Card key={user.id} className="border">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-emerald/10 rounded-full">
                              <Users className="h-6 w-6 text-emerald" />
                            </div>
                            <div>
                              <p className="font-medium">{user.full_name}</p>
                              <p className="text-sm text-muted-foreground">
                                Relation: {user.relationship}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleViewProfile(user.user_id)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Voir Profil
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewConversations(user.user_id)}
                            >
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Conversations
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

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rapports de Supervision</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Activité cette semaine</p>
                        <p className="text-2xl font-bold text-emerald">
                          {notifications.filter(n => 
                            new Date(n.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                          ).length}
                        </p>
                        <p className="text-xs text-muted-foreground">Nouvelles notifications</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Taux d'intervention</p>
                        <p className="text-2xl font-bold text-primary">
                          {stats.criticalAlerts > 0 ? Math.round((stats.criticalAlerts / notifications.length) * 100) : 0}%
                        </p>
                        <p className="text-xs text-muted-foreground">Messages modérés</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Tendances de Modération</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Contenu Inapproprié</span>
                      <span className="text-sm font-medium">
                        {notifications.filter(n => n.notification_type === 'inappropriate_content').length}
                      </span>
                    </div>
                    <Progress 
                      value={notifications.length > 0 ? 
                        (notifications.filter(n => n.notification_type === 'inappropriate_content').length / notifications.length) * 100 
                        : 0
                      } 
                      className="h-2" 
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Alertes Critiques</span>
                      <span className="text-sm font-medium">
                        {notifications.filter(n => n.severity === 'critical').length}
                      </span>
                    </div>
                    <Progress 
                      value={notifications.length > 0 ? 
                        (notifications.filter(n => n.severity === 'critical').length / notifications.length) * 100 
                        : 0
                      } 
                      className="h-2" 
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WaliDashboard;
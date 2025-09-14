import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Heart, 
  Shield, 
  Users, 
  MessageSquare,
  AlertCircle,
  Bell
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface FamilyNotification {
  id: string;
  match_id: string;
  notification_type: string;
  content: string;
  severity: string;
  action_required: boolean;
  is_read: boolean;
  created_at: string;
  family_member_id: string;
  match?: {
    id: string;
    user1_id: string;
    user2_id: string;
    match_score: number;
    user1_profile?: {
      full_name: string;
      age: number;
      location: string;
      profession: string;
      avatar_url: string;
    } | null;
    user2_profile?: {
      full_name: string;
      age: number;
      location: string;
      profession: string;
      avatar_url: string;
    } | null;
  } | null;
}

const FamilyApprovalDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<FamilyNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    
    loadNotifications();
  }, [user]);

  const loadNotifications = async () => {
    try {
      // Get family member record
      const { data: familyMember } = await supabase
        .from('family_members')
        .select('id')
        .eq('invited_user_id', user?.id)
        .eq('invitation_status', 'accepted')
        .maybeSingle();

      if (!familyMember) {
        setLoading(false);
        return;
      }

      // Get notifications with match details
      const { data, error } = await supabase
        .from('family_notifications')
        .select(`
          *,
          match:matches(
            id,
            user1_id,
            user2_id,
            match_score,
            user1_profile:profiles!matches_user1_id_fkey(
              full_name,
              age,
              location,
              profession,
              avatar_url
            ),
            user2_profile:profiles!matches_user2_id_fkey(
              full_name,
              age,
              location,
              profession,
              avatar_url
            )
          )
        `)
        .eq('family_member_id', familyMember.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setNotifications((data || []).map(item => ({
        ...item,
        match: item.match ? {
          ...item.match,
          user1_profile: Array.isArray(item.match.user1_profile) ? item.match.user1_profile[0] : item.match.user1_profile,
          user2_profile: Array.isArray(item.match.user2_profile) ? item.match.user2_profile[0] : item.match.user2_profile
        } : null
      })));
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les notifications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalDecision = async (
    notificationId: string, 
    matchId: string, 
    decision: 'approved' | 'rejected' | 'needs_discussion',
    notes?: string
  ) => {
    setProcessingIds(prev => new Set([...prev, notificationId]));
    
    try {
      // Get family member record
      const { data: familyMember } = await supabase
        .from('family_members')
        .select('id')
        .eq('invited_user_id', user?.id)
        .maybeSingle();

      if (!familyMember) throw new Error('Membre de famille non trouvé');

      // Create family review
      const { error: reviewError } = await supabase
        .from('family_reviews')
        .insert({
          family_member_id: familyMember.id,
          match_id: matchId,
          status: decision,
          notes: notes || null
        });

      if (reviewError) throw reviewError;

      // Mark notification as read
      const { error: notifError } = await supabase
        .from('family_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (notifError) throw notifError;

      // Update match status if approved
      if (decision === 'approved') {
        const { error: matchError } = await supabase
          .from('matches')
          .update({ 
            family_approved: true,
            can_communicate: true,
            family_reviewed_at: new Date().toISOString()
          })
          .eq('id', matchId);

        if (matchError) throw matchError;
      }

      toast({
        title: "Décision enregistrée",
        description: `Votre ${decision === 'approved' ? 'approbation' : decision === 'rejected' ? 'refus' : 'demande de discussion'} a été prise en compte`,
      });

      // Reload notifications
      loadNotifications();
      
    } catch (error) {
      console.error('Error processing decision:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer votre décision",
        variant: "destructive",
      });
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-l-red-500 bg-red-50';
      case 'high': return 'border-l-orange-500 bg-orange-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      default: return 'border-l-blue-500 bg-blue-50';
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMM yyyy à HH:mm', { locale: fr });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Demandes d'Approbation Familiale
          </CardTitle>
        </CardHeader>
      </Card>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Aucune demande en attente</h3>
            <p className="text-muted-foreground">
              Vous serez notifié lorsque votre famille aura besoin de votre approbation pour un match
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card key={notification.id} className={`border-l-4 ${getSeverityColor(notification.severity)}`}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-orange-600" />
                      <span className="font-semibold">
                        {notification.notification_type === 'approval_request' ? 'Demande d\'approbation' : 'Notification famille'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={notification.is_read ? 'secondary' : 'default'}>
                        {notification.is_read ? 'Lu' : 'Non lu'}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(notification.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Match Profiles */}
                  {notification.match && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white rounded-lg border">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={notification.match.user1_profile?.avatar_url} />
                          <AvatarFallback>
                            {notification.match.user1_profile?.full_name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{notification.match.user1_profile?.full_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {notification.match.user1_profile?.age} ans • {notification.match.user1_profile?.location}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {notification.match.user1_profile?.profession}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={notification.match.user2_profile?.avatar_url} />
                          <AvatarFallback>
                            {notification.match.user2_profile?.full_name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{notification.match.user2_profile?.full_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {notification.match.user2_profile?.age} ans • {notification.match.user2_profile?.location}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {notification.match.user2_profile?.profession}
                          </p>
                        </div>
                      </div>

                      {notification.match.match_score && (
                        <div className="col-span-full">
                          <div className="flex items-center gap-2 mb-2">
                            <Heart className="h-4 w-4 text-primary" />
                            <span className="font-medium">Score de compatibilité: {notification.match.match_score}%</span>
                          </div>
                          <Progress value={notification.match.match_score} className="h-2" />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Notification Content */}
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="whitespace-pre-wrap text-sm">{notification.content}</p>
                  </div>

                  {/* Action Buttons */}
                  {notification.action_required && !notification.is_read && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Notes additionnelles (optionnel)
                        </label>
                        <Textarea 
                          id={`notes-${notification.id}`}
                          placeholder="Ajoutez vos commentaires ou questions..."
                          className="min-h-[80px]"
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700"
                          disabled={processingIds.has(notification.id)}
                          onClick={() => {
                            const notes = (document.getElementById(`notes-${notification.id}`) as HTMLTextAreaElement)?.value;
                            handleApprovalDecision(notification.id, notification.match_id, 'approved', notes);
                          }}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approuver
                        </Button>
                        <Button 
                          size="sm"
                          variant="destructive"
                          disabled={processingIds.has(notification.id)}
                          onClick={() => {
                            const notes = (document.getElementById(`notes-${notification.id}`) as HTMLTextAreaElement)?.value;
                            handleApprovalDecision(notification.id, notification.match_id, 'rejected', notes);
                          }}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Refuser
                        </Button>
                        <Button 
                          size="sm"
                          variant="outline"
                          disabled={processingIds.has(notification.id)}
                          onClick={() => {
                            const notes = (document.getElementById(`notes-${notification.id}`) as HTMLTextAreaElement)?.value;
                            handleApprovalDecision(notification.id, notification.match_id, 'needs_discussion', notes);
                          }}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Demander Discussion
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FamilyApprovalDashboard;
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, Users, Eye, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface SupervisedConversation {
  id: string;
  match_id: string;
  user1_profile: { full_name: string; avatar_url?: string };
  user2_profile: { full_name: string; avatar_url?: string };
  last_message: { content: string; created_at: string };
  unread_count: number;
  is_active: boolean;
}

interface FamilyMember {
  id: string;
  user_id: string;
  full_name: string;
  relationship: string;
  can_communicate: boolean;
  can_view_profile: boolean;
}

const FamilySupervisionDashboard = () => {
  console.log('🎯 Component render started');
  const { user } = useAuth();
  console.log('👤 User from auth:', user);
  const [conversations, setConversations] = useState<SupervisedConversation[]>([]);
  const [familyRole, setFamilyRole] = useState<FamilyMember | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🚀 FamilySupervisionDashboard mounted, user:', user);
    if (user) {
      loadSupervisionData();
    }
  }, [user]);

  const loadSupervisionData = async () => {
    try {
      console.log('🔍 Checking supervision for user:', user?.id);
      
      // First, check if current user is a family member (invited as wali)
      const { data: familyMemberData, error: familyError } = await supabase
        .from('family_members')
        .select('*')
        .eq('invited_user_id', user?.id)
        .eq('invitation_status', 'accepted')
        .maybeSingle();

      console.log('👨‍👩‍👧‍👦 Family member query result:', { familyMemberData, familyError });

      if (familyError || !familyMemberData) {
        console.error('❌ Family member error:', familyError);
        console.log('❌ No family member data found for user:', user?.id);
        toast({
          title: "Erreur",
          description: 'Vous n\'êtes pas autorisé à superviser les conversations',
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      console.log('✅ Family role set:', familyMemberData);
      setFamilyRole(familyMemberData);

      console.log('🔍 Looking for matches for supervised user:', familyMemberData.user_id);

      // Get matches for the supervised user (person that this wali supervises)
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select(`
          id,
          user1_id,
          user2_id,
          is_mutual,
          can_communicate,
          created_at
        `)
        .or(`user1_id.eq.${familyMemberData.user_id},user2_id.eq.${familyMemberData.user_id}`)
        .eq('is_mutual', true);

      console.log('💕 Matches query result:', { matchesData, matchesError });

      if (matchesError) {
        console.error('❌ Matches error:', matchesError);
        setLoading(false);
        return;
      }

      console.log('📊 Processing conversations for', (matchesData || []).length, 'matches');

      // If no matches, set empty conversations but don't show error
      if (!matchesData || matchesData.length === 0) {
        console.log('ℹ️ No matches found for supervised user');
        setConversations([]);
        setLoading(false);
        return;
      }

      // Get conversation details for each match
      const conversationsWithMessages = await Promise.all(
        (matchesData || []).map(async (match) => {
          console.log('🔄 Processing match:', match.id, 'between users:', match.user1_id, 'and', match.user2_id);
          
          // Get profiles for both users
          const { data: user1Profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('user_id', match.user1_id)
            .maybeSingle();

          const { data: user2Profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('user_id', match.user2_id)
            .maybeSingle();

          console.log('👥 Profile data:', { user1Profile, user2Profile });

          const { data: lastMessage } = await supabase
            .from('messages')
            .select('content, created_at')
            .eq('match_id', match.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('match_id', match.id)
            .eq('is_read', false);

          console.log('💬 Message data for match', match.id, ':', { lastMessage, unreadCount });

          return {
            id: match.id,
            match_id: match.id,
            user1_profile: user1Profile || { full_name: 'Utilisateur inconnu', avatar_url: undefined },
            user2_profile: user2Profile || { full_name: 'Utilisateur inconnu', avatar_url: undefined },
            last_message: lastMessage || { content: 'Aucun message', created_at: new Date().toISOString() },
            unread_count: unreadCount || 0,
            is_active: match.can_communicate
          };
        }) || []
      );

      console.log('📋 Final conversations:', conversationsWithMessages);
      setConversations(conversationsWithMessages);
    } catch (error) {
      console.error('Error loading supervision data:', error);
      toast({
        title: "Erreur",
        description: 'Erreur lors du chargement des données',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const joinConversation = async (matchId: string) => {
    try {
      console.log('🔄 Joining conversation for match:', matchId);
      console.log('👨‍👩‍👧‍👦 Family role:', familyRole);
      
      // Add family member as participant if not already added
      const participantData = {
        match_id: matchId,
        participant_id: familyRole!.id,
        participant_type: 'family_member',
        family_member_id: familyRole!.id,
        user_id: user?.id, // Use the current authenticated user's ID (the wali)
        can_send_messages: familyRole!.can_communicate,
        can_read_messages: familyRole!.can_view_profile
      };
      
      console.log('📋 Participant data to insert:', participantData);
      
      const { error } = await supabase
        .from('conversation_participants')
        .upsert(participantData);

      if (error) {
        console.error('❌ Database error:', error);
        throw error;
      }

      console.log('✅ Successfully joined conversation');
      
      // Navigate to chat with supervision
      window.location.href = `/chat?matchId=${matchId}&supervision=true`;
    } catch (error) {
      console.error('💥 Error joining conversation:', error);
      toast({
        title: "Erreur",
        description: `Erreur lors de la participation à la conversation: ${error?.message || 'Erreur inconnue'}`,
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!familyRole) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Accès non autorisé</h3>
          <p className="text-muted-foreground">
            Vous devez être un membre de famille autorisé pour accéder à cette section.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Supervision Familiale</h1>
          <p className="text-muted-foreground">
            Supervisez les conversations en tant que {familyRole.relationship}
          </p>
        </div>
        <Badge variant="secondary">
          {familyRole.full_name}
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Conversations</p>
                <p className="text-2xl font-bold">{conversations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-gold" />
              <div>
                <p className="text-sm text-muted-foreground">Messages non lus</p>
                <p className="text-2xl font-bold">
                  {conversations.reduce((sum, conv) => sum + conv.unread_count, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-emerald" />
              <div>
                <p className="text-sm text-muted-foreground">Actives</p>
                <p className="text-2xl font-bold">
                  {conversations.filter(conv => conv.is_active).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conversations */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Conversations Actives</TabsTrigger>
          <TabsTrigger value="all">Toutes les Conversations</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {conversations.filter(conv => conv.is_active).map(conversation => (
            <Card key={conversation.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">
                        {conversation.user1_profile.full_name} ↔ {conversation.user2_profile.full_name}
                      </h3>
                      {conversation.unread_count > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {conversation.unread_count} nouveau{conversation.unread_count > 1 ? 'x' : ''}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Dernier message: {conversation.last_message.content.substring(0, 50)}...
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(conversation.last_message.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        console.log('🖱️ Voir button clicked for match:', conversation.match_id);
                        joinConversation(conversation.match_id);
                      }}
                      disabled={!familyRole.can_view_profile}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Voir
                    </Button>
                    {familyRole.can_communicate && (
                      <Button
                        size="sm"
                        onClick={() => {
                          console.log('🖱️ Participer button clicked for match:', conversation.match_id);
                          joinConversation(conversation.match_id);
                        }}
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Participer
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {conversations.map(conversation => (
            <Card key={conversation.id} className={!conversation.is_active ? 'opacity-60' : ''}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">
                        {conversation.user1_profile.full_name} ↔ {conversation.user2_profile.full_name}
                      </h3>
                      {!conversation.is_active && (
                        <Badge variant="secondary">Inactif</Badge>
                      )}
                      {conversation.unread_count > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {conversation.unread_count} nouveau{conversation.unread_count > 1 ? 'x' : ''}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Dernier message: {conversation.last_message.content.substring(0, 50)}...
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(conversation.last_message.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        console.log('🖱️ Voir button clicked (all tab) for match:', conversation.match_id);
                        joinConversation(conversation.match_id);
                      }}
                      disabled={!familyRole.can_view_profile}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Voir
                    </Button>
                    {familyRole.can_communicate && conversation.is_active && (
                      <Button
                        size="sm"
                        onClick={() => {
                          console.log('🖱️ Participer button clicked (all tab) for match:', conversation.match_id);
                          joinConversation(conversation.match_id);
                        }}
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Participer
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FamilySupervisionDashboard;
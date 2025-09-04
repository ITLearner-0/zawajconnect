import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  ArrowLeft, 
  MessageCircle, 
  Heart,
  Video,
  Phone,
  MoreVertical,
  Shield
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import VerificationBadge from '@/components/VerificationBadge';
import VideoCall from '@/components/VideoCall';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  is_read: boolean;
}

interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  match_score: number;
  is_mutual: boolean;
  other_user: {
    id: string;
    full_name: string;
    avatar_url: string;
    verification_score: number;
  };
}

interface ChatPartner {
  id: string;
  full_name: string;
  avatar_url: string;
  verification_score: number;
  last_message?: Message;
  unread_count: number;
}

const Chat = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [matches, setMatches] = useState<Match[]>([]);
  const [chatPartners, setChatPartners] = useState<ChatPartner[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [selectedPartner, setSelectedPartner] = useState<ChatPartner | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    fetchMatches();
    
    // Check if we have a specific user to chat with from URL params
    const userId = searchParams.get('userId');
    const matchId = searchParams.get('matchId');
    
    if (matchId) {
      setSelectedMatchId(matchId);
    } else if (userId) {
      // Find match with this user
      findMatchWithUser(userId);
    }
  }, [user, searchParams]);

  useEffect(() => {
    if (selectedMatchId) {
      fetchMessages();
      markMessagesAsRead();
      
      // Set up real-time subscription for messages
      const subscription = supabase
        .channel(`messages:${selectedMatchId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${selectedMatchId}`
        }, (payload) => {
          const newMessage = payload.new as Message;
          setMessages(prev => [...prev, newMessage]);
          scrollToBottom();
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [selectedMatchId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const findMatchWithUser = async (userId: string) => {
    if (!user) return;

    try {
      const { data: match } = await supabase
        .from('matches')
        .select('*')
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${userId}),and(user1_id.eq.${userId},user2_id.eq.${user.id})`)
        .eq('is_mutual', true)
        .single();

      if (match) {
        setSelectedMatchId(match.id);
      } else {
        toast({
          title: "Conversation non disponible",
          description: "Vous devez avoir un match mutuel pour discuter",
          variant: "destructive"
        });
        navigate('/matches');
      }
    } catch (error) {
      console.error('Error finding match:', error);
    }
  };

  const fetchMatches = async () => {
    if (!user) return;

    try {
      const { data: matchesData } = await supabase
        .from('matches')
        .select('*')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .eq('is_mutual', true)
        .order('created_at', { ascending: false });

      if (matchesData) {
        const processedMatches = await Promise.all(
          matchesData.map(async (match) => {
            const otherUserId = match.user1_id === user.id ? match.user2_id : match.user1_id;
            
            const { data: otherUserProfile } = await supabase
              .from('profiles')
              .select('id, full_name, avatar_url, user_id')
              .eq('user_id', otherUserId)
              .single();

            const { data: verificationData } = await supabase
              .from('user_verifications')
              .select('verification_score')
              .eq('user_id', otherUserId)
              .single();

            return {
              ...match,
              other_user: {
                id: otherUserId,
                full_name: otherUserProfile?.full_name || 'Utilisateur inconnu',
                avatar_url: otherUserProfile?.avatar_url || '',
                verification_score: verificationData?.verification_score || 0
              }
            };
          })
        );

        setMatches(processedMatches);
        await buildChatPartnersList(processedMatches);
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const buildChatPartnersList = async (matchesData: Match[]) => {
    const partners = await Promise.all(
      matchesData.map(async (match) => {
        // Get last message for this match
        const { data: lastMessage } = await supabase
          .from('messages')
          .select('*')
          .eq('match_id', match.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        // Get unread message count
        const { count: unreadCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('match_id', match.id)
          .eq('is_read', false)
          .neq('sender_id', user?.id);

        return {
          id: match.other_user.id,
          full_name: match.other_user.full_name,
          avatar_url: match.other_user.avatar_url,
          verification_score: match.other_user.verification_score,
          matchId: match.id,
          last_message: lastMessage,
          unread_count: unreadCount || 0
        };
      })
    );

    setChatPartners(partners);
  };

  const fetchMessages = async () => {
    if (!selectedMatchId) return;

    try {
      const { data: messagesData } = await supabase
        .from('messages')
        .select('*')
        .eq('match_id', selectedMatchId)
        .order('created_at', { ascending: true });

      if (messagesData) {
        setMessages(messagesData);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const markMessagesAsRead = async () => {
    if (!selectedMatchId || !user) return;

    try {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('match_id', selectedMatchId)
        .neq('sender_id', user.id);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };


  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedMatchId || !user || sending) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          match_id: selectedMatchId,
          sender_id: user.id,
          content: newMessage.trim()
        });

      if (error) throw error;

      setNewMessage('');
      
      toast({
        title: "Message envoyé",
        description: "Votre message a été envoyé avec succès",
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const selectChat = (partner: ChatPartner & { matchId: string }) => {
    setSelectedMatchId(partner.matchId);
    setSelectedPartner(partner);
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (days === 1) {
      return 'Hier';
    } else if (days < 7) {
      return date.toLocaleDateString('fr-FR', { weekday: 'long' });
    } else {
      return date.toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'short' 
      });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-sage/10 to-emerald/5 p-4">
        <div className="container mx-auto max-w-6xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="h-96 bg-muted rounded"></div>
              <div className="lg:col-span-2 h-96 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-sage/10 to-emerald/5 p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/matches')}
            className="hover:bg-accent"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux matches
          </Button>
          <div className="flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-emerald" />
            <h1 className="text-2xl font-bold text-foreground">
              Messages
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
          {/* Chat List */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Conversations</span>
                <Badge variant="secondary">
                  {chatPartners.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-full">
                {chatPartners.length > 0 ? (
                  <div className="space-y-1 p-4">
                    {chatPartners.map((partner: any) => (
                      <div
                        key={partner.matchId}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-accent ${
                          selectedMatchId === partner.matchId ? 'bg-accent' : ''
                        }`}
                        onClick={() => selectChat(partner)}
                      >
                        <div className="relative">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={partner.avatar_url} alt={partner.full_name} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {partner.full_name?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -top-1 -right-1">
                            <VerificationBadge 
                              verificationScore={partner.verification_score} 
                            />
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-sm truncate">
                              {partner.full_name}
                            </h3>
                            {partner.last_message && (
                              <span className="text-xs text-muted-foreground">
                                {formatMessageTime(partner.last_message.created_at)}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground truncate">
                              {partner.last_message?.content || 'Aucun message'}
                            </p>
                            {partner.unread_count > 0 && (
                              <Badge className="ml-2 bg-emerald text-white text-xs">
                                {partner.unread_count}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                    <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-2">Aucune conversation</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Commencez par matcher avec quelqu'un
                    </p>
                    <Button
                      variant="gradient"
                      onClick={() => navigate('/browse')}
                    >
                      Découvrir des profils
                    </Button>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Window */}
          <Card className="lg:col-span-2 flex flex-col">
            {selectedPartner ? (
              <>
                {/* Chat Header */}
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={selectedPartner.avatar_url} alt={selectedPartner.full_name} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {selectedPartner.full_name?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{selectedPartner.full_name}</h3>
                        <div className="flex items-center gap-2">
                          <VerificationBadge 
                            verificationScore={selectedPartner.verification_score} 
                          />
                          <span className="text-xs text-muted-foreground">
                            En ligne
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setShowVideoCall(true)}
                      >
                        <Video className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages or Video Call */}
                {showVideoCall ? (
                  <div className="flex-1 p-4">
                    <VideoCall 
                      matchId={selectedMatchId || ''}
                      onCallEnd={() => setShowVideoCall(false)}
                    />
                  </div>
                ) : (
                  <CardContent className="flex-1 p-0">
                    <ScrollArea className="h-full p-4">
                      <div className="space-y-4">
                        {messages.map((message, index) => (
                          <div
                            key={message.id}
                            className={`flex ${
                              message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <div
                              className={`max-w-[70%] rounded-lg p-3 ${
                                message.sender_id === user?.id
                                  ? 'bg-emerald text-white'
                                  : 'bg-muted'
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <p 
                                className={`text-xs mt-1 ${
                                  message.sender_id === user?.id 
                                    ? 'text-emerald-100' 
                                    : 'text-muted-foreground'
                                }`}
                              >
                                {formatMessageTime(message.created_at)}
                              </p>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>
                  </CardContent>
                )}

                {/* Message Input */}
                {!showVideoCall && (
                  <div className="border-t p-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Tapez votre message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="flex-1"
                      />
                      <Button
                        onClick={sendMessage}
                        disabled={!newMessage.trim() || sending}
                        variant="gradient"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <Shield className="h-3 w-3" />
                      <span>
                        Respectez les valeurs islamiques dans vos conversations
                      </span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-6">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Sélectionnez une conversation
                  </h3>
                  <p className="text-muted-foreground">
                    Choisissez une conversation dans la liste pour commencer à discuter
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Chat;
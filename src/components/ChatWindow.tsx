import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Send, Paperclip, MoreVertical, Phone, Video, Heart, User, Shield, MessageCircle, X } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import VideoCall from '@/components/VideoCall';
import MessageModerationWrapper from '@/components/MessageModerationWrapper';

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
    last_seen?: string;
  };
  isFamilySupervisor?: boolean;
  user1Profile?: any;
  user2Profile?: any;
  supervisorProfile?: any;
}

interface ChatWindowProps {
  matchId: string;
  onClose?: () => void;
}

const ChatWindow = ({ matchId, onClose }: ChatWindowProps) => {
  console.log('🎬 ChatWindow mounting for matchId:', matchId);
  const { user } = useAuth();
  console.log('👤 ChatWindow - user:', user?.id);
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [isAudioCallActive, setIsAudioCallActive] = useState(false);
  const [canCommunicate, setCanCommunicate] = useState(true);
  const [isCheckingPermissions, setIsCheckingPermissions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Listen for suggested messages
  useEffect(() => {
    const handleSuggestedMessage = (event: CustomEvent) => {
      setNewMessage(event.detail.message);
    };

    window.addEventListener('useSuggestedMessage', handleSuggestedMessage as EventListener);
    return () => {
      window.removeEventListener('useSuggestedMessage', handleSuggestedMessage as EventListener);
    };
  }, []);

  useEffect(() => {
    if (!user || !matchId) return;
    
    Promise.all([
      fetchMatchData(),
      fetchMessages(),
      checkCommunicationPermissions()
    ]).then(() => {
      setupRealtimeSubscription();
      markMessagesAsRead();
    }).catch(error => {
      console.error('Error initializing chat:', error);
      setLoading(false);
    });

    return () => {
      // Cleanup subscription if needed
    };
  }, [user, matchId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const checkCommunicationPermissions = async () => {
    if (!user) return;
    
    setIsCheckingPermissions(true);
    try {
      // Get user profile to check gender
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('gender')
        .eq('user_id', user.id)
        .maybeSingle();

      // Men can always communicate
      if (userProfile?.gender !== 'female') {
        setCanCommunicate(true);
        return;
      }

      // For women, check if they have wali setup
      const { data: familyMembers } = await supabase
        .from('family_members')
        .select('*')
        .eq('user_id', user.id)
        .or('invited_user_id.eq.' + user.id)
        .eq('is_wali', true)
        .eq('invitation_status', 'accepted');

      setCanCommunicate((familyMembers && familyMembers.length > 0) || false);
    } catch (error) {
      console.error('Error checking communication permissions:', error);
      setCanCommunicate(false);
    } finally {
      setIsCheckingPermissions(false);
    }
  };

  const fetchMatchData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('id', matchId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const isParticipant = data.user1_id === user.id || data.user2_id === user.id;
        
        if (!isParticipant) {
          // Check if user is a family supervisor
          const { data: familyData } = await supabase
            .from('family_members')
            .select('*')
            .eq('invited_user_id', user.id)
            .eq('invitation_status', 'accepted')
            .eq('can_communicate', true)
            .eq('is_wali', true)
            .or(`user_id.eq.${data.user1_id},user_id.eq.${data.user2_id}`)
            .maybeSingle();
            
          if (!familyData) {
            toast({
              title: "Accès refusé", 
              description: "Vous n'avez pas accès à cette conversation",
              variant: "destructive"
            });
            if (onClose) onClose();
            return;
          }
        }

        // Get the other user's profile
        const otherUserId = data.user1_id === user.id ? data.user2_id : data.user1_id;
        
        const { data: otherUserProfile } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, user_id')
          .eq('user_id', otherUserId)
          .maybeSingle();

        setMatch({
          ...data,
          other_user: otherUserProfile ? {
            id: otherUserProfile.user_id,
            full_name: otherUserProfile.full_name || 'Utilisateur',
            avatar_url: otherUserProfile.avatar_url || ''
          } : {
            id: otherUserId,
            full_name: 'Utilisateur inconnu',
            avatar_url: ''
          }
        });
      }
    } catch (error) {
      console.error('Error fetching match data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les informations du match",
        variant: "destructive"
      });
    }
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('match_id', matchId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel(`messages-${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages(prev => [...prev, newMessage]);
          
          // Mark as read if it's not from current user
          if (newMessage.sender_id !== user?.id) {
            markMessageAsRead(newMessage.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markMessagesAsRead = async () => {
    if (!user) return;

    try {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('match_id', matchId)
        .neq('sender_id', user.id)
        .eq('is_read', false);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const markMessageAsRead = async (messageId: string) => {
    try {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', messageId);
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !match || !canCommunicate) return;

    setSending(true);
    
    try {
      // Basic content validation
      const trimmedMessage = newMessage.trim();
      
      // Simple Islamic content moderation (client-side)
      const inappropriateWords = ['haram', 'alcohol', 'dating'];
      const hasInappropriate = inappropriateWords.some(word => 
        trimmedMessage.toLowerCase().includes(word)
      );
      
      if (hasInappropriate) {
        toast({
          title: "Message modéré",
          description: "Votre message contient du contenu qui peut ne pas être approprié selon les valeurs islamiques",
          variant: "destructive"
        });
        setSending(false);
        return;
      }

      const { error } = await supabase
        .from('messages')
        .insert({
          match_id: matchId,
          sender_id: user.id,
          content: trimmedMessage
        });

      if (error) throw error;

      setNewMessage('');
      toast({
        title: "Message envoyé",
        description: "Votre message a été envoyé avec succès"
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

  const handleVideoCall = () => {
    if (!canCommunicate) {
      toast({
        title: "Communication non autorisée",
        description: "Vous devez configurer votre supervision familiale pour passer des appels",
        variant: "destructive"
      });
      return;
    }
    
    setIsVideoCallActive(true);
    toast({
      title: "Appel vidéo",
      description: `Démarrage de l'appel vidéo avec ${match?.other_user.full_name}...`
    });
  };

  const handleAudioCall = () => {
    if (!canCommunicate) {
      toast({
        title: "Communication non autorisée", 
        description: "Vous devez configurer votre supervision familiale pour passer des appels",
        variant: "destructive"
      });
      return;
    }
    
    setIsAudioCallActive(true);
    toast({
      title: "Appel audio",
      description: `Démarrage de l'appel audio avec ${match?.other_user.full_name}...`
    });
  };

  const handleCallEnd = () => {
    setIsVideoCallActive(false);
    setIsAudioCallActive(false);
    toast({
      title: "Appel terminé",
      description: "L'appel a été terminé"
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if ((isVideoCallActive || isAudioCallActive) && match) {
    return (
      <VideoCall
        matchId={matchId}
        partnerId={match.other_user.id}
        partnerName={match.other_user.full_name}
        onCallEnd={handleCallEnd}
        isVideoCall={isVideoCallActive}
        autoStart={true}
      />
    );
  }

  if (loading || isCheckingPermissions) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {isCheckingPermissions ? 'Vérification des permissions...' : 'Chargement de la conversation...'}
          </p>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Match introuvable</p>
        </div>
      </div>
    );
  }

  return (
    <MessageModerationWrapper matchId={matchId}>
      <div className="flex flex-col h-full max-h-[600px] bg-background rounded-lg border shadow-lg">
        {/* Communication permission check */}
        {!canCommunicate ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-md">
              <Shield className="h-16 w-16 text-amber-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Configuration Familiale Requise</h3>
              <p className="text-muted-foreground mb-4">
                Selon les principes islamiques, vous devez configurer un Wali pour communiquer.
              </p>
              <Button onClick={() => window.location.href = '/family'}>
                Configurer ma Famille
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="border-b bg-gradient-to-r from-emerald/5 to-gold/5">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {match.other_user.avatar_url ? (
                      <img 
                        src={match.other_user.avatar_url} 
                        alt={match.other_user.full_name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 bg-gradient-to-br from-emerald to-emerald-light rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-primary-foreground" />
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-emerald rounded-full border-2 border-background"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{match.other_user.full_name}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs bg-emerald/10 text-emerald">
                        {match.match_score}% compatible
                      </Badge>
                      <span className="text-xs text-muted-foreground">En ligne</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-emerald hover:bg-emerald/10"
                    onClick={handleAudioCall}
                    title="Appel audio"
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-emerald hover:bg-emerald/10"
                    onClick={handleVideoCall}
                    title="Appel vidéo"
                  >
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                  {onClose && (
                    <Button variant="ghost" size="sm" onClick={onClose}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <Heart className="h-12 w-12 mx-auto text-emerald/50 mb-4" />
                  <p className="text-muted-foreground">
                    C'est le début de votre conversation ! 
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Présentez-vous et commencez à faire connaissance de manière respectueuse.
                  </p>
                </div>
              ) : (
                messages.map((message) => {
                  const isMyMessage = message.sender_id === user?.id;
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          isMyMessage
                            ? 'bg-emerald text-primary-foreground'
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          isMyMessage ? 'text-emerald-light' : 'text-muted-foreground'
                        }`}>
                          {format(new Date(message.created_at), 'HH:mm', { locale: fr })}
                          {isMyMessage && (
                            <span className="ml-2">
                              {message.is_read ? '✓✓' : '✓'}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Islamic Reminder */}
            <div className="px-4 py-2 bg-gradient-to-r from-gold/10 to-emerald/10 border-t border-border/50">
              <p className="text-xs text-center text-muted-foreground">
                💝 Rappel : Communiquez avec respect et selon les valeurs islamiques
              </p>
            </div>

            {/* Message Input */}
            <div className="border-t p-4">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={canCommunicate ? "Écrivez votre message..." : "Configuration familiale requise"}
                  disabled={sending || !canCommunicate}
                  className="flex-1"
                />
                <Button 
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sending || !canCommunicate}
                  className="bg-emerald hover:bg-emerald-dark text-primary-foreground"
                >
                  {sending ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </MessageModerationWrapper>
  );
};

export default ChatWindow;
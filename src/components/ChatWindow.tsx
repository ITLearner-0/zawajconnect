import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Send, Phone, Video, User, Shield, Heart, X } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

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
  };
}

interface ChatWindowProps {
  matchId: string;
  onClose?: () => void;
}

const ChatWindow = ({ matchId, onClose }: ChatWindowProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [canCommunicate, setCanCommunicate] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || !matchId) return;
    initializeChat();
  }, [user, matchId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeChat = async () => {
    try {
      await Promise.all([
        fetchMatchData(),
        fetchMessages(),
        checkCommunicationPermissions()
      ]);
      
      setupRealtimeSubscription();
      markMessagesAsRead();
    } catch (error) {
      console.error('Error initializing chat:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la conversation",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const checkCommunicationPermissions = async () => {
    if (!user) return;
    
    try {
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('gender')
        .eq('user_id', user.id)
        .maybeSingle();

      if (userProfile?.gender !== 'female') {
        setCanCommunicate(true);
        return;
      }

      const { data: familyMembers } = await supabase
        .from('family_members')
        .select('*')
        .eq('user_id', user.id)
        .or('invited_user_id.eq.' + user.id)
        .eq('is_wali', true)
        .eq('invitation_status', 'accepted');

      setCanCommunicate((familyMembers && familyMembers.length > 0));
    } catch (error) {
      console.error('Error checking communication permissions:', error);
      setCanCommunicate(false);
    }
  };

  const fetchMatchData = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .maybeSingle();

    if (error) throw error;

    if (data) {
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
  };

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('match_id', matchId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    setMessages(data || []);
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
      const { error } = await supabase
        .from('messages')
        .insert({
          match_id: matchId,
          sender_id: user.id,
          content: newMessage.trim()
        });

      if (error) throw error;
      setNewMessage('');
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

  const handleCall = (isVideo: boolean) => {
    if (!canCommunicate) {
      toast({
        title: "Communication non autorisée",
        description: "Vous devez configurer votre supervision familiale pour passer des appels",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: isVideo ? "Appel vidéo" : "Appel audio",
      description: `Démarrage de l'${isVideo ? 'appel vidéo' : 'appel audio'} avec ${match?.other_user.full_name}...`,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement de la conversation...</p>
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
    <div className="flex flex-col h-full max-h-[600px] bg-background rounded-lg border shadow-lg">
      {!canCommunicate ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <Shield className="h-16 w-16 text-warning mx-auto mb-4" />
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
          <div className="border-b bg-gradient-to-r from-primary/5 to-secondary/5">
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
                    <div className="h-10 w-10 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-primary-foreground" />
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-success rounded-full border-2 border-background"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{match.other_user.full_name}</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
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
                  className="text-primary hover:bg-primary/10"
                  onClick={() => handleCall(false)}
                  title="Appel audio"
                >
                  <Phone className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary hover:bg-primary/10"
                  onClick={() => handleCall(true)}
                  title="Appel vidéo"
                >
                  <Video className="h-4 w-4" />
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
                <Heart className="h-12 w-12 mx-auto text-primary/50 mb-4" />
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
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        isMyMessage ? 'text-primary-foreground/70' : 'text-muted-foreground'
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
          <div className="px-4 py-2 bg-gradient-to-r from-secondary/10 to-primary/10 border-t border-border/50">
            <p className="text-xs text-center text-muted-foreground">
              💝 Rappel : Communiquez avec respect et selon les valeurs islamiques
            </p>
          </div>

          {/* Message Input */}
          <div className="border-t p-4">
            <div className="flex items-center gap-2">
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
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
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
  );
};

export default ChatWindow;
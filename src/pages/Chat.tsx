import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, ArrowLeft, Phone, Video, MoreVertical } from 'lucide-react';
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
  is_mutual: boolean;
  other_user: {
    id: string;
    full_name: string;
    age: number;
    location: string;
  };
}

const Chat = () => {
  const { matchId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [match, setMatch] = useState<Match | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (!matchId) {
      navigate('/matches');
      return;
    }
    fetchMatchAndMessages();
    setupRealTimeSubscription();
  }, [user, matchId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMatchAndMessages = async () => {
    if (!user || !matchId) return;

    try {
      // Fetch match details
      const { data: matchData } = await supabase
        .from('matches')
        .select('*')
        .eq('id', matchId)
        .single();

      if (matchData) {
        const otherUserId = matchData.user1_id === user.id ? matchData.user2_id : matchData.user1_id;
        
        const { data: otherUserProfile } = await supabase
          .from('profiles')
          .select('id, full_name, age, location, user_id')
          .eq('user_id', otherUserId)
          .single();

        const processedMatch = {
          ...matchData,
          other_user: otherUserProfile || {
            id: otherUserId,
            full_name: 'Utilisateur inconnu',
            age: 0,
            location: 'Non spécifié'
          }
        };
        
        setMatch(processedMatch);

        // Only allow messaging if it's a mutual match
        if (!matchData.is_mutual) {
          navigate('/matches');
          return;
        }
      }

      // Fetch messages
      const { data: messagesData } = await supabase
        .from('messages')
        .select('*')
        .eq('match_id', matchId)
        .order('created_at', { ascending: true });

      setMessages(messagesData || []);

      // Mark messages as read
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('match_id', matchId)
        .neq('sender_id', user.id);

    } catch (error) {
      console.error('Error fetching match and messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealTimeSubscription = () => {
    if (!matchId) return;

    const channel = supabase
      .channel('messages')
      .on('postgres_changes', 
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${matchId}`
        }, 
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !matchId || sending) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          match_id: matchId,
          sender_id: user.id,
          content: newMessage.trim()
        });

      if (!error) {
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-emerald/5 flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement de la conversation...</p>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-emerald/5 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground mb-2">Conversation introuvable</h2>
          <Button onClick={() => navigate('/matches')} className="bg-emerald hover:bg-emerald-dark text-primary-foreground">
            Retour aux matches
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-emerald/5">
      <div className="container mx-auto h-screen flex flex-col">
        {/* Header */}
        <div className="bg-card/95 backdrop-blur-sm border-b border-border/40 px-4 py-4">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/matches')}
                className="p-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="h-10 w-10 bg-gradient-to-br from-emerald to-emerald-light rounded-full flex items-center justify-center">
                <span className="text-sm text-primary-foreground font-bold">
                  {match.other_user?.full_name?.charAt(0) || '?'}
                </span>
              </div>
              <div>
                <h2 className="font-bold text-foreground">{match.other_user?.full_name}</h2>
                <p className="text-sm text-muted-foreground">
                  {match.other_user?.age} ans • {match.other_user?.location}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" disabled>
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" disabled>
                <Video className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" disabled>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">Commencez la conversation</h3>
                <p className="text-muted-foreground">Envoyez votre premier message pour briser la glace</p>
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
                          : 'bg-card border border-border'
                      } animate-fade-in`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isMyMessage ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        }`}
                      >
                        {format(new Date(message.created_at), 'HH:mm', { locale: fr })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Message Input */}
        <div className="bg-card/95 backdrop-blur-sm border-t border-border/40 px-4 py-4">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={sendMessage} className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Tapez votre message..."
                className="flex-1"
                disabled={sending}
              />
              <Button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="bg-emerald hover:bg-emerald-dark text-primary-foreground"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
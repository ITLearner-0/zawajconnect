// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useIslamicModeration } from '@/hooks/useIslamicModeration';
import { useFamilySupervision } from '@/hooks/useFamilySupervision';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import {
  Send,
  Mic,
  MicOff,
  Phone,
  Video,
  MoreVertical,
  Clock,
  Check,
  CheckCheck,
  User,
  Heart,
  BookOpen,
  Moon,
  Sun,
  MessageCircle,
  Users,
  Shield,
  AlertTriangle,
} from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  is_read: boolean;
  message_type: 'text' | 'audio' | 'system';
  audio_url?: string;
  family_supervised?: boolean;
}

interface TypingUser {
  user_id: string;
  user_name: string;
  timestamp: string;
}

interface OnlineUser {
  user_id: string;
  last_seen: string;
  status: 'online' | 'away' | 'offline';
}

interface IslamicReminder {
  id: string;
  type: 'prayer_time' | 'verse' | 'hadith' | 'guidance';
  content: string;
  reference?: string;
  timing?: string;
}

interface RealTimeChatProps {
  matchId: string;
  onClose?: () => void;
}

const RealTimeChat: React.FC<RealTimeChatProps> = ({ matchId, onClose }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { moderateContent } = useIslamicModeration();
  const { supervisionStatus, familyMembers } = useFamilySupervision();

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [islamicReminders, setIslamicReminders] = useState<IslamicReminder[]>([]);
  const [showReminders, setShowReminders] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const presenceChannelRef = useRef<any>();

  useEffect(() => {
    if (!user || !matchId) return;

    fetchMatchData();
    fetchMessages();
    setupRealtimeSubscription();
    setupPresenceTracking();
    fetchIslamicReminders();

    return () => {
      if (presenceChannelRef.current) {
        supabase.removeChannel(presenceChannelRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [user, matchId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    // Use requestAnimationFrame to avoid forced reflow
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
  };

  const fetchMatchData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('matches')
        .select(
          `
          *,
          user1_profile:profiles!matches_user1_id_fkey(full_name, avatar_url),
          user2_profile:profiles!matches_user2_id_fkey(full_name, avatar_url)
        `
        )
        .eq('id', matchId)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        const otherUserId = data.user1_id === user.id ? data.user2_id : data.user1_id;
        const otherProfile =
          data.user1_id === user.id ? (data.user2_profile as any) : (data.user1_profile as any);

        setMatch({
          ...data,
          other_user: {
            id: otherUserId,
            full_name: otherProfile?.full_name || 'Utilisateur',
            avatar_url: otherProfile?.avatar_url || '',
          },
        });
      }
    } catch (error) {
      console.error('Error fetching match data:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les informations du match',
        variant: 'destructive',
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
      setMessages((data || []).map((msg) => ({ ...msg, message_type: 'text' as const })));
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    // Messages subscription
    const messagesChannel = supabase
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
          setMessages((prev) => [...prev, newMessage]);

          if (newMessage.sender_id !== user?.id) {
            markMessageAsRead(newMessage.id);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          const updatedMessage = payload.new as Message;
          setMessages((prev) =>
            prev.map((msg) => (msg.id === updatedMessage.id ? updatedMessage : msg))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
    };
  };

  const setupPresenceTracking = () => {
    if (!user || !match) return;

    const channel = supabase.channel(`presence-${matchId}`, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState();
        const users = Object.keys(newState).map((userId) => ({
          user_id: userId,
          last_seen: new Date().toISOString(),
          status: 'online' as const,
        }));
        setOnlineUsers(users);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      // Typing indicators
      .on('broadcast', { event: 'typing' }, (payload) => {
        if (payload.user_id !== user.id) {
          setTypingUsers((prev) => {
            const filtered = prev.filter((u) => u.user_id !== payload.user_id);
            if (payload.typing) {
              return [
                ...filtered,
                {
                  user_id: payload.user_id,
                  user_name: payload.user_name,
                  timestamp: new Date().toISOString(),
                },
              ];
            }
            return filtered;
          });
        }
      })
      .subscribe(async (status) => {
        if (status !== 'SUBSCRIBED') return;

        await channel.track({
          user_id: user.id,
          user_name: user.email || 'Utilisateur',
          online_at: new Date().toISOString(),
        });
      });

    presenceChannelRef.current = channel;

    // Clean up old typing indicators
    const typingCleanup = setInterval(() => {
      setTypingUsers((prev) =>
        prev.filter((u) => {
          const timeDiff = Date.now() - new Date(u.timestamp).getTime();
          return timeDiff < 3000; // Remove after 3 seconds
        })
      );
    }, 1000);

    return () => {
      clearInterval(typingCleanup);
      supabase.removeChannel(channel);
    };
  };

  const fetchIslamicReminders = async () => {
    const now = new Date();
    const currentHour = now.getHours();

    const reminders: IslamicReminder[] = [];

    // Prayer time reminders
    if (currentHour === 5) {
      reminders.push({
        id: 'fajr',
        type: 'prayer_time',
        content: 'Il est temps de prier Fajr. Que votre conversation soit bénie.',
        timing: 'Fajr',
      });
    }

    // Random Islamic verses or hadiths
    const verses = [
      {
        id: 'verse1',
        type: 'verse' as const,
        content:
          "Et parmi Ses signes Il a créé de vous, pour vous, des épouses pour que vous viviez en tranquillité avec elles et Il a mis entre vous de l'affection et de la bonté.",
        reference: 'Coran 30:21',
      },
      {
        id: 'hadith1',
        type: 'hadith' as const,
        content:
          "Les croyants les plus parfaits en matière de foi sont ceux d'entre eux qui ont le meilleur caractère.",
        reference: 'Abu Dawud',
      },
    ];

    const randomReminder = verses[Math.floor(Math.random() * verses.length)];
    reminders.push(randomReminder);

    setIslamicReminders(reminders);
  };

  const handleTyping = (typing: boolean) => {
    if (!presenceChannelRef.current || !user || !match) return;

    presenceChannelRef.current.send({
      type: 'broadcast',
      event: 'typing',
      payload: {
        user_id: user.id,
        user_name: user.email || 'Utilisateur',
        typing,
      },
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    handleTyping(true);

    typingTimeoutRef.current = setTimeout(() => {
      handleTyping(false);
    }, 1000);
  };

  const markMessageAsRead = async (messageId: string) => {
    try {
      await supabase.from('messages').update({ is_read: true }).eq('id', messageId);
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !match) return;

    setSending(true);

    try {
      const moderationResult = await moderateContent(newMessage.trim(), 'chat', matchId);

      if (!moderationResult.approved) {
        if (moderationResult.action === 'blocked') {
          setSending(false);
          return;
        }
      }

      const messageData = {
        match_id: matchId,
        sender_id: user.id,
        content: newMessage.trim(),
        message_type: 'text' as const,
        family_supervised: supervisionStatus.supervisionRequired,
      };

      const { error } = await supabase.from('messages').insert(messageData);

      if (error) throw error;

      setNewMessage('');
      handleTyping(false);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Erreur',
        description: "Impossible d'envoyer le message",
        variant: 'destructive',
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

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return `Hier ${format(date, 'HH:mm')}`;
    } else {
      return format(date, 'dd/MM HH:mm');
    }
  };

  const getMessageStatus = (message: Message) => {
    if (message.sender_id !== user?.id) return null;

    if (message.is_read) {
      return <CheckCheck className="h-3 w-3 text-blue-500" />;
    } else {
      return <Check className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const isUserOnline = (userId: string) => {
    return onlineUsers.some((u) => u.user_id === userId && u.status === 'online');
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
      {/* Chat Header */}
      <div className="border-b bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarImage src={match.other_user.avatar_url} />
                <AvatarFallback>
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              {isUserOnline(match.other_user.id) && (
                <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-background"></div>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{match.other_user.full_name}</h3>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                  {match.match_score}% compatible
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {isUserOnline(match.other_user.id) ? 'En ligne' : 'Hors ligne'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Popover open={showReminders} onOpenChange={setShowReminders}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                  <BookOpen className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm">Rappels Islamiques</h4>
                  {islamicReminders.map((reminder) => (
                    <div key={reminder.id} className="p-3 bg-secondary/20 rounded-lg">
                      <div className="flex items-start gap-2">
                        {reminder.type === 'prayer_time' && (
                          <Moon className="h-4 w-4 text-primary mt-0.5" />
                        )}
                        {reminder.type === 'verse' && (
                          <BookOpen className="h-4 w-4 text-primary mt-0.5" />
                        )}
                        {reminder.type === 'hadith' && (
                          <Heart className="h-4 w-4 text-primary mt-0.5" />
                        )}
                        <div>
                          <p className="text-sm">{reminder.content}</p>
                          {reminder.reference && (
                            <p className="text-xs text-muted-foreground mt-1">
                              - {reminder.reference}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {supervisionStatus.supervisionRequired && (
              <Badge variant="outline" className="text-xs">
                <Shield className="h-3 w-3 mr-1" />
                Supervisé
              </Badge>
            )}

            <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
              <Video className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                ×
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Family Supervision Notice */}
      {supervisionStatus.supervisionRequired && (
        <div className="px-4 py-2 bg-amber-50 border-b border-amber-200">
          <div className="flex items-center gap-2 text-sm text-amber-700">
            <Users className="h-4 w-4" />
            <span>
              Cette conversation est supervisée par votre famille selon les principes islamiques
            </span>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <Heart className="h-12 w-12 mx-auto text-primary/50 mb-4" />
            <p className="text-muted-foreground">C'est le début de votre conversation !</p>
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
                    isMyMessage ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                  }`}
                >
                  <p className="text-sm break-words">{message.content}</p>
                  <div
                    className={`flex items-center justify-between mt-1 gap-2 ${
                      isMyMessage ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    }`}
                  >
                    <span className="text-xs">{formatMessageTime(message.created_at)}</span>
                    {getMessageStatus(message)}
                  </div>
                  {message.family_supervised && (
                    <div className="flex items-center gap-1 mt-1">
                      <Shield className="h-3 w-3" />
                      <span className="text-xs">Supervisé</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Typing Indicators */}
        {typingUsers.length > 0 && (
          <div className="flex justify-start">
            <div className="bg-muted px-4 py-2 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                    style={{ animationDelay: '0.1s' }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  ></div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {typingUsers[0].user_name} est en train d'écrire...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t p-4">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Input
              value={newMessage}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Tapez votre message respectueux..."
              className="pr-12"
              disabled={sending}
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setIsRecording(!isRecording)}
            >
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
          </div>
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim() || sending}
            className="bg-primary hover:bg-primary/90"
          >
            {sending ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RealTimeChat;

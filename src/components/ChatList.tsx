import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle, Search, User, Heart } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ChatPreview {
  match_id: string;
  other_user: {
    id: string;
    full_name: string;
    avatar_url: string;
  };
  last_message?: {
    content: string;
    created_at: string;
    sender_id: string;
  };
  unread_count: number;
  match_score: number;
}

interface ChatListProps {
  onChatSelect: (matchId: string) => void;
  selectedChatId?: string;
}

const ChatList = ({ onChatSelect, selectedChatId }: ChatListProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    fetchChats();
    setupRealtimeSubscription();
  }, [user]);

  const fetchChats = async () => {
    if (!user) return;

    try {
      // Get mutual matches with messages
      const { data: matches, error } = await supabase
        .from('matches')
        .select('*')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .eq('is_mutual', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const chatPreviews = await Promise.all(
        (matches || []).map(async (match) => {
          const otherUserId = match.user1_id === user.id ? match.user2_id : match.user1_id;

          // Get other user profile
          const { data: otherProfile } = await supabase
            .from('profiles')
            .select('user_id, full_name, avatar_url')
            .eq('user_id', otherUserId)
            .maybeSingle();

          // Get last message
          const { data: lastMessage } = await supabase
            .from('messages')
            .select('*')
            .eq('match_id', match.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          // Get unread count
          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact' })
            .eq('match_id', match.id)
            .neq('sender_id', user.id)
            .eq('is_read', false);

          return {
            match_id: match.id,
            other_user: {
              id: otherProfile?.user_id || otherUserId,
              full_name: otherProfile?.full_name || 'Utilisateur inconnu',
              avatar_url: otherProfile?.avatar_url || '',
            },
            last_message: lastMessage || undefined,
            unread_count: unreadCount || 0,
            match_score: match.match_score || 0,
          };
        })
      );

      // Sort by last message time
      chatPreviews.sort((a, b) => {
        const aTime = a.last_message?.created_at || '0';
        const bTime = b.last_message?.created_at || '0';
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      });

      setChats(chatPreviews);
    } catch (error) {
      console.error('Error fetching chats:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger vos conversations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('chat-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        () => {
          // Refresh chat list when new message comes
          fetchChats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const filteredChats = chats.filter((chat) =>
    chat.other_user.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="border-b p-3 animate-pulse">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-muted rounded w-3/4"></div>
                <div className="h-2 bg-muted rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm font-medium mb-1">Aucune conversation</p>
            <p className="text-xs text-muted-foreground">Créez des matches pour démarrer</p>
          </div>
        ) : (
          <div>
            {filteredChats.map((chat) => (
              <div
                key={chat.match_id}
                className="p-3 cursor-pointer transition-colors"
                style={{
                  borderBottom: '1px solid var(--color-border-default)',
                  ...(selectedChatId === chat.match_id
                    ? { backgroundColor: 'var(--color-primary-light)', borderLeft: '3px solid var(--color-primary)' }
                    : {}),
                }}
                onMouseEnter={(e) => {
                  if (selectedChatId !== chat.match_id) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-bg-hover)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedChatId !== chat.match_id) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = '';
                  }
                }}
                onClick={() => onChatSelect(chat.match_id)}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    {chat.other_user.avatar_url ? (
                      <img
                        src={chat.other_user.avatar_url}
                        alt={chat.other_user.full_name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-primary-foreground" />
                      </div>
                    )}
                    {chat.unread_count > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-semibold">
                        {chat.unread_count > 9 ? '9+' : chat.unread_count}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-semibold text-foreground truncate">
                        {chat.other_user.full_name}
                      </h4>
                      {chat.last_message && (
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(chat.last_message.created_at), {
                            addSuffix: true,
                            locale: fr,
                          })}
                        </span>
                      )}
                    </div>

                    {chat.last_message ? (
                      <p className="text-xs text-muted-foreground truncate">
                        {chat.last_message.sender_id === user?.id ? 'Vous: ' : ''}
                        {chat.last_message.content}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">Nouvelle conversation</p>
                    )}
                  </div>

                  <span className="text-xs bg-muted px-2 py-1 rounded">{chat.match_score}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;

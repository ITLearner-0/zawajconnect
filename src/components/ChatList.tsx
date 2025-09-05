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
            .single();

          // Get last message
          const { data: lastMessage } = await supabase
            .from('messages')
            .select('*')
            .eq('match_id', match.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

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
              avatar_url: otherProfile?.avatar_url || ''
            },
            last_message: lastMessage || undefined,
            unread_count: unreadCount || 0,
            match_score: match.match_score || 0
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
        title: "Erreur",
        description: "Impossible de charger vos conversations",
        variant: "destructive"
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

  const filteredChats = chats.filter(chat =>
    chat.other_user.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Mes Conversations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher une conversation..."
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {filteredChats.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <MessageCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune conversation</h3>
            <p className="text-muted-foreground mb-4">
              Vous n'avez pas encore de conversations actives. 
              Commencez par découvrir des profils et créer des matches mutuels.
            </p>
            <Button className="bg-emerald hover:bg-emerald-dark">
              Découvrir des profils
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredChats.map((chat) => (
            <Card
              key={chat.match_id}
              className={`cursor-pointer transition-colors hover:bg-accent/50 ${
                selectedChatId === chat.match_id ? 'ring-2 ring-emerald' : ''
              }`}
              onClick={() => onChatSelect(chat.match_id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    {chat.other_user.avatar_url ? (
                      <img 
                        src={chat.other_user.avatar_url}
                        alt={chat.other_user.full_name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 bg-gradient-to-br from-emerald to-emerald-light rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-primary-foreground" />
                      </div>
                    )}
                    {chat.unread_count > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                        {chat.unread_count > 9 ? '9+' : chat.unread_count}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-foreground truncate">
                        {chat.other_user.full_name}
                      </h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs bg-emerald/10 text-emerald">
                          {chat.match_score}%
                        </Badge>
                        {chat.last_message && (
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(chat.last_message.created_at), { 
                              addSuffix: true,
                              locale: fr 
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {chat.last_message ? (
                      <p className="text-sm text-muted-foreground truncate">
                        {chat.last_message.sender_id === user?.id ? 'Vous: ' : ''}
                        {chat.last_message.content}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        Commencez la conversation...
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatList;
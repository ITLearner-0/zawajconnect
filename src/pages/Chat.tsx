import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  is_mutual: boolean;
  created_at: string;
  profiles: {
    full_name: string;
    avatar_url?: string;
  };
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  sender: {
    full_name: string;
    avatar_url?: string;
  };
}

const Chat = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchMatches();
    }
  }, [user]);

  useEffect(() => {
    if (selectedMatch) {
      fetchMessages();
      subscribeToMessages();
    }
  }, [selectedMatch]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMatches = async () => {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .or(`user1_id.eq.${user?.id},user2_id.eq.${user?.id}`)
      .eq('is_mutual', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching matches:', error);
      return;
    }

    // Fetch profiles separately
    const formattedMatches = [];
    for (const match of data || []) {
      const otherUserId = match.user1_id === user?.id ? match.user2_id : match.user1_id;
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('user_id', otherUserId)
        .single();

      formattedMatches.push({
        ...match,
        profiles: profile || { full_name: 'Unknown User', avatar_url: null }
      });
    }

    setMatches(formattedMatches);
    setLoading(false);
  };

  const fetchMessages = async () => {
    if (!selectedMatch) return;

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('match_id', selectedMatch.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return;
    }

    // Format messages with sender info
    const formattedMessages = (data || []).map(message => ({
      ...message,
      sender: { full_name: 'User', avatar_url: null }
    }));

    setMessages(formattedMessages);
  };

  const subscribeToMessages = () => {
    if (!selectedMatch) return;

    const subscription = supabase
      .channel(`messages_${selectedMatch.id}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `match_id=eq.${selectedMatch.id}`
        }, 
        (payload) => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedMatch) return;

    const { error } = await supabase
      .from('messages')
      .insert({
        match_id: selectedMatch.id,
        sender_id: user?.id,
        content: newMessage.trim()
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
      return;
    }

    setNewMessage('');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Please log in to access chat.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading conversations...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Matches List */}
      <div className="w-1/3 border-r border-border">
        <div className="p-4 border-b border-border">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            Your Matches
          </h2>
        </div>
        <ScrollArea className="h-full">
          {matches.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No matches yet. Keep browsing!
            </div>
          ) : (
            matches.map((match) => (
              <div
                key={match.id}
                className={`p-4 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors ${
                  selectedMatch?.id === match.id ? 'bg-muted' : ''
                }`}
                onClick={() => setSelectedMatch(match)}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={match.profiles.avatar_url} />
                    <AvatarFallback>
                      {match.profiles.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{match.profiles.full_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Matched on {new Date(match.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedMatch ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border bg-card">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={selectedMatch.profiles.avatar_url} />
                  <AvatarFallback>
                    {selectedMatch.profiles.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{selectedMatch.profiles.full_name}</h3>
                  <p className="text-sm text-muted-foreground">Online</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender_id === user?.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p>{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender_id === user?.id
                          ? 'text-primary-foreground/70'
                          : 'text-muted-foreground'
                      }`}>
                        {new Date(message.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <Button onClick={sendMessage} size="icon">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select a match to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
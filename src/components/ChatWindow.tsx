import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useChatMessages } from '@/hooks/useChatMessages';
import { useChatMatch } from '@/hooks/useChatMatch';
import { useChatPresence } from '@/hooks/useChatPresence';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { Send, Shield, Heart } from 'lucide-react';

interface ChatWindowProps {
  matchId: string;
  onClose?: () => void;
}

const ChatWindow = ({ matchId, onClose }: ChatWindowProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const { messages, loading: messagesLoading, sending, sendMessage } = useChatMessages(matchId);
  const { match, loading: matchLoading, canCommunicate } = useChatMatch(matchId);
  const { typingUsers, isUserOnline, startTyping, stopTyping } = useChatPresence(matchId);
  
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const loading = messagesLoading || matchLoading;

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    // Use requestAnimationFrame to avoid forced reflow
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
  };

  const handleSendMessage = async () => {
    if (!canCommunicate || !newMessage.trim()) return;

    const success = await sendMessage(newMessage);
    if (success) {
      setNewMessage('');
      stopTyping();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    startTyping();
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
      handleSendMessage();
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
          <ChatHeader
            match={match}
            isOnline={isUserOnline(match.other_user.id)}
            onClose={onClose}
            onCall={handleCall}
          />

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
              <>
                {messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isMyMessage={message.sender_id === user?.id}
                  />
                ))}
                <TypingIndicator typingUsers={typingUsers} />
              </>
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
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder={canCommunicate ? "Écrivez votre message..." : "Configuration familiale requise"}
                disabled={sending || !canCommunicate}
                className="flex-1"
              />
              <Button 
                onClick={handleSendMessage}
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
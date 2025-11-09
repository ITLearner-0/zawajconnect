import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useChatMessages } from '@/hooks/useChatMessages';
import { useChatMatch } from '@/hooks/useChatMatch';
import { useChatPresence } from '@/hooks/useChatPresence';
import { useConversationStatus } from '@/hooks/useConversationStatus';
import { useWebRTCCall } from '@/hooks/useWebRTCCall';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { EndConversationDialog } from '@/components/chat/EndConversationDialog';
import { IncomingCallNotification } from '@/components/IncomingCallNotification';
import { ActiveCallWindow } from '@/components/ActiveCallWindow';
import { CallHistory } from '@/components/chat/CallHistory';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Send, Shield, Heart, X } from 'lucide-react';

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
  const { endConversation, loading: endingConversation } = useConversationStatus();

  // WebRTC Call Management
  const {
    callState,
    localStream,
    remoteStream,
    incomingCall,
    callDuration,
    isAudioEnabled,
    isVideoEnabled,
    qualityMetrics,
    initiateCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleAudio,
    toggleVideo,
    isCallActive,
    isIncomingCall
  } = useWebRTCCall({ matchId });

  const [newMessage, setNewMessage] = useState('');
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [currentCallType, setCurrentCallType] = useState<'audio' | 'video'>('audio');
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

  const handleCall = async (isVideo: boolean) => {
    if (!canCommunicate) {
      toast({
        title: "Communication non autorisée",
        description: "Vous devez configurer votre supervision familiale pour passer des appels",
        variant: "destructive"
      });
      return;
    }

    if (!match || !user) {
      toast({
        title: "Erreur",
        description: "Impossible d'initier l'appel",
        variant: "destructive"
      });
      return;
    }

    try {
      setCurrentCallType(isVideo ? 'video' : 'audio');
      await initiateCall(isVideo ? 'video' : 'audio', user.user_metadata?.full_name || 'Utilisateur');
      console.log(`✅ ${isVideo ? 'Video' : 'Audio'} call initiated`);
    } catch (error) {
      console.error('❌ Failed to initiate call:', error);
      toast({
        title: "Erreur d'appel",
        description: "Impossible de démarrer l'appel. Vérifiez vos permissions micro/caméra.",
        variant: "destructive"
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEndConversation = async (
    reason: string,
    details: string,
    courtesyMessage: string
  ) => {
    const success = await endConversation(matchId, reason, details, courtesyMessage);
    if (success && onClose) {
      onClose();
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
    <div className="flex flex-col h-full bg-background rounded-lg border">
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
          {/* Header */}
          <div className="flex items-center justify-between border-b p-3 bg-muted/30">
            <ChatHeader
              match={match}
              isOnline={isUserOnline(match.other_user.id)}
              onClose={onClose}
              onCall={handleCall}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEndDialog(true)}
              className="text-destructive hover:bg-destructive/10"
            >
              Mettre fin
            </Button>
          </div>

          {/* Messages Area */}
          <Tabs defaultValue="messages" className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="w-full justify-start px-4 border-b rounded-none bg-background h-12 shrink-0">
              <TabsTrigger value="messages">Messages</TabsTrigger>
              <TabsTrigger value="calls">Historique des appels</TabsTrigger>
            </TabsList>

            <TabsContent value="messages" className="flex-1 overflow-y-auto p-4 bg-background mt-0 data-[state=inactive]:hidden">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Début de conversation
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Présentez-vous de manière respectueuse
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
            </TabsContent>

            <TabsContent value="calls" className="flex-1 overflow-y-auto p-4 bg-background mt-0 data-[state=inactive]:hidden">
              <CallHistory matchId={matchId} />
            </TabsContent>
          </Tabs>

          {/* Islamic Reminder */}
          <div className="px-4 py-2 bg-muted/50 border-t">
            <p className="text-xs text-center text-muted-foreground">
              💝 Rappel : Communiquez avec respect et selon les valeurs islamiques
            </p>
          </div>

          {/* Message Input */}
          <div className="border-t p-3 bg-background">
            <div className="flex items-center gap-2">
              <Input
                value={newMessage}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Écrivez votre message..."
                disabled={sending || !canCommunicate}
                className="flex-1"
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || sending || !canCommunicate}
                size="icon"
              >
                {sending ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <EndConversationDialog
            open={showEndDialog}
            onOpenChange={setShowEndDialog}
            onConfirm={handleEndConversation}
            loading={endingConversation}
          />
        </>
      )}

      {/* Incoming Call Notification */}
      {isIncomingCall && incomingCall && (
        <IncomingCallNotification
          incomingCall={incomingCall}
          onAccept={acceptCall}
          onReject={rejectCall}
          callerAvatar={match?.other_user.avatar_url}
        />
      )}

      {/* Active Call Window */}
      {isCallActive && (callState === 'calling' || callState === 'connecting' || callState === 'connected') && match && (
        <ActiveCallWindow
          localStream={localStream}
          remoteStream={remoteStream}
          callState={callState}
          isAudioEnabled={isAudioEnabled}
          isVideoEnabled={isVideoEnabled}
          callDuration={callDuration}
          partnerName={match.other_user.full_name}
          partnerAvatar={match.other_user.avatar_url}
          isVideoCall={currentCallType === 'video'}
          qualityMetrics={qualityMetrics}
          onToggleAudio={toggleAudio}
          onToggleVideo={toggleVideo}
          onEndCall={endCall}
        />
      )}
    </div>
  );
};

export default ChatWindow;
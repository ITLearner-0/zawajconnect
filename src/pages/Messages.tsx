
import { useParams, useNavigate } from 'react-router-dom';
import { useProfileData } from '@/hooks/useProfileData';
import { useMessages } from '@/hooks/useMessages';
import MessagesContainer from '@/components/messaging/MessagesContainer';
import ChatWindow from '@/components/messaging/ChatWindow';
import VideoCallManager from '@/components/messaging/VideoCallManager';
import { Toaster } from '@/components/ui/toaster';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { dummyProfiles } from '@/data/profiles';
import { dummyMessages } from '@/data/messages';

const Messages = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isDemoConversation, setIsDemoConversation] = useState(false);
  const [demoMessages, setDemoMessages] = useState<any[]>([]);
  
  // Séparer l'effet de détection d'utilisateur et de démo pour éviter les dépendances circulaires
  useEffect(() => {
    const getUserId = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        setCurrentUserId(session.user.id);
      } else {
        // Si pas connecté, utiliser un ID temporaire pour la démo
        setCurrentUserId('current-user');
      }
    };
    
    getUserId();
  }, []);

  // Effet séparé pour la détection de conversation démo
  useEffect(() => {
    // Check if this is a demo conversation (user-X format)
    if (conversationId && conversationId.startsWith('user-')) {
      setIsDemoConversation(true);
      console.log('Demo conversation detected:', conversationId);
      
      // Load demo messages
      if (conversationId === 'user-1') {
        setDemoMessages(dummyMessages['conv-1'] || []);
      } else if (conversationId === 'user-2') {
        setDemoMessages(dummyMessages['conv-2'] || []);
      } else if (conversationId === 'user-3') {
        setDemoMessages(dummyMessages['conv-3'] || []);
      } else if (conversationId === 'user-4') {
        setDemoMessages(dummyMessages['conv-4'] || []);
      }
    } else {
      setIsDemoConversation(false);
      setDemoMessages([]);
    }
  }, [conversationId]);
  
  const { profileData: userData } = useProfileData(currentUserId);
  
  // Use conversationId directly from useParams
  const {
    conversations,
    currentConversation,
    messages,
    loading,
    sendingMessage,
    errors,
    messageInput,
    setMessageInput,
    videoCallStatus,
    sendMessage,
    startVideoCall,
    endVideoCall,
    // AI monitoring states
    violations,
    latestReport,
    monitoringEnabled,
    toggleMonitoring,
    monitoringLoading,
    // Encryption and retention states
    encryptionEnabled,
    toggleEncryption,
    retentionPolicy,
    updateRetentionPolicy
  } = useMessages(conversationId, currentUserId);

  // Debug logs
  useEffect(() => {
    console.log("Current conversation ID:", conversationId);
    console.log("Current user ID:", currentUserId);
    console.log("Is demo conversation:", isDemoConversation);
    console.log("Demo messages:", demoMessages);
    
    if (errors?.messages) {
      console.error("Message error:", errors.messages);
      toast({
        variant: "destructive",
        title: "Error loading messages",
        description: errors.messages
      });
    }
  }, [conversationId, currentUserId, isDemoConversation, demoMessages, errors?.messages]);

  // Handle demo conversation for profiles with user-X IDs
  const [demoMessageInput, setDemoMessageInput] = useState('');
  
  const handleDemoSendMessage = (content: string) => {
    if (isDemoConversation && currentUserId) {
      const newMessage = {
        id: `msg-${Date.now()}`,
        conversation_id: conversationId || '',
        sender_id: currentUserId,
        content: content,
        created_at: new Date().toISOString(),
        is_read: true,
        is_wali_visible: true
      };
      
      setDemoMessages(prev => [...prev, newMessage]);
      console.log("Demo message sent:", newMessage);
    }
  };

  // Select a conversation
  const selectConversation = (conversation: { id: string }) => {
    navigate(`/messages/${conversation.id}`);
  };

  if (!currentUserId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Please sign in to view messages</p>
      </div>
    );
  }

  // Handle special case for demo profiles
  if (isDemoConversation && conversationId) {
    const demoProfileId = conversationId;
    const demoProfile = dummyProfiles.find(p => p.id === demoProfileId);
    
    if (demoProfile) {
      // For demo profiles, show a working chat interface with dummy messages
      return (
        <div className="flex flex-col h-screen">
          <div className="bg-primary text-white p-4">
            <h1 className="text-xl font-bold">Messages</h1>
          </div>
          
          <MessagesContainer
            loading={false}
            conversations={conversations || []}
            conversationId={conversationId}
            currentConversation={{
              id: conversationId,
              created_at: new Date().toISOString(),
              participants: [currentUserId, conversationId],
              profile: {
                first_name: demoProfile.first_name,
                last_name: demoProfile.last_name
              },
              wali_supervised: demoProfile.gender === 'Female'
            }}
            onSelectConversation={selectConversation}
            errors={{
              conversations: null,
              messages: null,
              videoCall: null
            }}
          >
            <ChatWindow
              conversation={{
                id: conversationId,
                created_at: new Date().toISOString(),
                participants: [currentUserId, conversationId],
                profile: {
                  first_name: demoProfile.first_name,
                  last_name: demoProfile.last_name
                },
                wali_supervised: demoProfile.gender === 'Female'
              }}
              messages={demoMessages}
              currentUserId={currentUserId}
              messageInput={demoMessageInput}
              setMessageInput={setDemoMessageInput}
              sendMessage={() => {
                if (demoMessageInput.trim()) {
                  handleDemoSendMessage(demoMessageInput);
                  setDemoMessageInput('');
                }
              }}
              loading={false}
              sendingMessage={false}
              error={null}
              onStartVideoCall={() => {}}
              backToList={() => navigate('/messages')}
              isWaliSupervised={demoProfile.gender === 'Female'}
            />
          </MessagesContainer>
          
          <Toaster />
        </div>
      );
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="bg-primary text-white p-4">
        <h1 className="text-xl font-bold">Messages</h1>
      </div>
      
      <MessagesContainer
        loading={loading}
        conversations={conversations || []}
        conversationId={conversationId}
        currentConversation={currentConversation}
        onSelectConversation={selectConversation}
        errors={{
          conversations: errors?.conversations || null,
          messages: errors?.messages || null,
          videoCall: errors?.videoCall || null,
          monitoring: errors?.monitoring || null
        }}
      >
        {videoCallStatus?.isActive ? (
          <VideoCallManager
            videoCallStatus={videoCallStatus}
            onEndCall={endVideoCall}
            conversationId={conversationId}
          />
        ) : (
          currentConversation && (
            <ChatWindow
              conversation={currentConversation}
              messages={messages}
              currentUserId={currentUserId}
              messageInput={messageInput}
              setMessageInput={setMessageInput}
              sendMessage={sendMessage}
              loading={loading}
              sendingMessage={sendingMessage}
              error={errors?.messages || null}
              onStartVideoCall={() => {
                const otherUserId = currentConversation.participants.find(id => id !== currentUserId);
                if (otherUserId) {
                  startVideoCall(otherUserId);
                }
              }}
              backToList={() => navigate('/messages')}
              isWaliSupervised={currentConversation.wali_supervised}
              report={latestReport}
              monitoringEnabled={monitoringEnabled}
              toggleMonitoring={toggleMonitoring}
              monitoringLoading={monitoringLoading}
              // Encryption and retention props
              encryptionEnabled={encryptionEnabled}
              toggleEncryption={toggleEncryption}
              retentionPolicy={retentionPolicy}
              updateRetentionPolicy={updateRetentionPolicy}
            />
          )
        )}
      </MessagesContainer>
      
      <Toaster />
    </div>
  );
};

export default Messages;

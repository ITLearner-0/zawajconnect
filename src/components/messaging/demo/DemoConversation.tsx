
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { dummyProfiles } from '@/data/profiles';
import MessagesContainer from '@/components/messaging/MessagesContainer';
import ChatWindow from '@/components/messaging/ChatWindow';
import { Toaster } from '@/components/ui/toaster';

interface DemoConversationProps {
  conversationId: string;
  currentUserId: string;
  demoMessages: any[];
  setDemoMessages: React.Dispatch<React.SetStateAction<any[]>>;
}

const DemoConversation: React.FC<DemoConversationProps> = ({
  conversationId,
  currentUserId,
  demoMessages,
  setDemoMessages
}) => {
  const navigate = useNavigate();
  const [demoMessageInput, setDemoMessageInput] = useState('');
  
  // Find the demo profile
  const demoProfile = dummyProfiles.find(p => p.id === conversationId);
  
  if (!demoProfile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Demo profile not found</p>
      </div>
    );
  }
  
  // Memoize the demo send message function to prevent recreation on each render
  const handleDemoSendMessage = useCallback((content: string) => {
    if (!content.trim()) return;
    
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
  }, [conversationId, currentUserId, setDemoMessages]);

  // Handle sending demo messages
  const sendDemoMessage = useCallback(() => {
    if (demoMessageInput.trim()) {
      handleDemoSendMessage(demoMessageInput);
      setDemoMessageInput('');
    }
  }, [demoMessageInput, handleDemoSendMessage]);

  // Select a conversation
  const selectConversation = useCallback((conversation: { id: string }) => {
    navigate(`/messages/${conversation.id}`);
  }, [navigate]);
  
  // For demo profiles, show a working chat interface with dummy messages
  return (
    <div className="flex flex-col h-screen">
      <div className="bg-primary text-white p-4">
        <h1 className="text-xl font-bold">Messages</h1>
      </div>
      
      <MessagesContainer
        loading={false}
        conversations={[]}
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
          sendMessage={sendDemoMessage}
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
};

export default DemoConversation;

import React, { useState, useCallback, useMemo, useRef } from 'react';
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
  setDemoMessages,
}) => {
  const navigate = useNavigate();
  const [demoMessageInput, setDemoMessageInput] = useState('');
  const renderCount = useRef(0);

  // Find the demo profile - memoize to prevent recalculation
  const demoProfile = useMemo(() => {
    const profileId = conversationId.startsWith('user-') ? conversationId : null;
    return (
      dummyProfiles.find((p) => p.id === profileId) || {
        id: conversationId,
        first_name: 'Demo',
        last_name: 'User',
        gender: 'Other',
      }
    );
  }, [conversationId]);

  // Memoize the demo send message function to prevent recreation on each render
  const handleDemoSendMessage = useCallback(() => {
    if (!demoMessageInput.trim()) return;

    const newMessage = {
      id: `msg-${Date.now()}`,
      conversation_id: conversationId || '',
      sender_id: currentUserId,
      content: demoMessageInput,
      created_at: new Date().toISOString(),
      is_read: true,
      is_wali_visible: true,
    };

    setDemoMessages((prev) => [...prev, newMessage]);
    setDemoMessageInput('');
  }, [conversationId, currentUserId, demoMessageInput, setDemoMessages]);

  // Memoize conversation selection to prevent recreating function on each render
  const selectConversation = useCallback(
    (conversation: { id: string }) => {
      navigate(`/messages/${conversation.id}`);
    },
    [navigate]
  );

  // Generate a simulated last active time (5-30 minutes ago)
  const lastActive = useMemo(() => {
    const now = new Date();
    const minutesAgo = Math.floor(Math.random() * 25) + 5; // 5-30 minutes ago
    now.setMinutes(now.getMinutes() - minutesAgo);
    return now.toISOString();
  }, []);

  // Get a simulated status for demo users - memoize to prevent recreation on each render
  const demoStatus = useMemo(() => {
    const statuses = ['online', 'offline', 'away', 'busy'];
    // For female profiles, higher chance of being online (for demo purposes)
    if (demoProfile.gender === 'Female') {
      return Math.random() > 0.3 ? 'online' : statuses[Math.floor(Math.random() * statuses.length)];
    }
    return statuses[Math.floor(Math.random() * statuses.length)];
  }, [demoProfile.gender]);

  // Memoize the demo conversation data to prevent recreation on each render
  const demoConversation = useMemo(
    () => ({
      id: conversationId,
      created_at: new Date().toISOString(),
      participants: [currentUserId, conversationId],
      profile: {
        first_name: demoProfile.first_name,
        last_name: demoProfile.last_name,
      },
      wali_supervised: demoProfile.gender === 'Female',
    }),
    [
      conversationId,
      currentUserId,
      demoProfile.first_name,
      demoProfile.last_name,
      demoProfile.gender,
    ]
  );

  renderCount.current += 1;
  console.log(`DemoConversation render #${renderCount.current} for ${conversationId}`);

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
        currentConversation={demoConversation}
        onSelectConversation={selectConversation}
        errors={{
          conversations: null,
          messages: null,
          videoCall: null,
        }}
      >
        <ChatWindow
          conversation={demoConversation}
          messages={demoMessages}
          currentUserId={currentUserId}
          messageInput={demoMessageInput}
          setMessageInput={setDemoMessageInput}
          sendMessage={handleDemoSendMessage}
          loading={false}
          sendingMessage={false}
          error={null}
          onStartVideoCall={() => {}}
          backToList={() => navigate('/messages')}
          isWaliSupervised={demoProfile.gender === 'Female'}
          userStatus={demoStatus as 'online' | 'offline' | 'away' | 'busy'}
          lastActive={lastActive}
        />
      </MessagesContainer>

      <Toaster />
    </div>
  );
};

export default DemoConversation;

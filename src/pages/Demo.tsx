
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ChatWindow from '@/components/messaging/ChatWindow';
import MessagesContainer from '@/components/messaging/MessagesContainer';
import VideoCallManager from '@/components/messaging/VideoCallManager';
import { Toaster } from '@/components/ui/toaster';

import { dummyProfiles, dummyConversations, dummyMessages } from '@/data/dummyProfiles';
import { VideoCallStatus, Message, Conversation, RetentionPolicy } from '@/types/profile';

const Demo = () => {
  // State for current user and selected conversation
  const [currentUserId] = useState<string>('current-user');
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>(undefined);
  const [conversations, setConversations] = useState<Conversation[]>(dummyConversations);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  
  // Video call state
  const [videoCallStatus, setVideoCallStatus] = useState<VideoCallStatus>({
    isActive: false,
    waliPresent: false
  });
  
  // Simulated security features
  const [encryptionEnabled, setEncryptionEnabled] = useState(true);
  const [monitoringEnabled, setMonitoringEnabled] = useState(true);
  const [retentionPolicy, setRetentionPolicy] = useState<RetentionPolicy>({
    type: 'temporary',
    duration_days: 30,
    auto_delete: true
  });
  
  // Set current conversation when selected
  useEffect(() => {
    if (selectedConversationId) {
      const conversation = conversations.find(c => c.id === selectedConversationId) || null;
      setCurrentConversation(conversation);
      
      // Load messages for this conversation
      setMessages(dummyMessages[selectedConversationId] || []);
    } else {
      setCurrentConversation(null);
      setMessages([]);
    }
  }, [selectedConversationId, conversations]);
  
  // Select a conversation
  const selectConversation = (conversation: Conversation) => {
    setSelectedConversationId(conversation.id);
  };
  
  // Send a message
  const sendMessage = () => {
    if (!messageInput.trim() || !currentConversation) return;
    
    setSendingMessage(true);
    
    // Simulate network delay
    setTimeout(() => {
      const newMessage: Message = {
        id: `msg-new-${Date.now()}`,
        conversation_id: currentConversation.id,
        sender_id: currentUserId,
        content: messageInput,
        created_at: new Date().toISOString(),
        is_read: true,
        encrypted: encryptionEnabled,
        is_wali_visible: currentConversation.wali_supervised
      };
      
      // Add message to the conversation
      setMessages((prev) => [...prev, newMessage]);
      
      // Update last message in conversation list
      setConversations((prev) => 
        prev.map(c => 
          c.id === currentConversation.id 
            ? { ...c, last_message: newMessage } 
            : c
        )
      );
      
      // Clear input
      setMessageInput('');
      setSendingMessage(false);
    }, 800);
  };
  
  // Video call functions
  const startVideoCall = (participantId: string) => {
    // Get other participant gender to determine wali presence
    const participant = dummyProfiles.find(p => p.id === participantId);
    const waliPresent = participant?.gender === 'Female';
    
    setVideoCallStatus({
      isActive: true,
      participantId,
      waliPresent,
      startTime: new Date()
    });
  };
  
  const endVideoCall = () => {
    setVideoCallStatus({
      isActive: false,
      waliPresent: false
    });
  };
  
  // Toggle encryption
  const toggleEncryption = (enabled: boolean) => {
    setEncryptionEnabled(enabled);
  };
  
  // Update retention policy
  const updateRetentionPolicy = (policy: RetentionPolicy) => {
    setRetentionPolicy(policy);
  };
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Demo: Messaging and Video Chat</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This page demonstrates the messaging and video chat capabilities of the app using dummy profiles.
              You can select different conversations, send messages, and simulate video calls.
            </p>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Available Profiles</h3>
                <div className="space-y-3">
                  {dummyProfiles.map(profile => (
                    <div key={profile.id} className="flex items-center p-3 border rounded-lg">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarFallback>{profile.first_name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{profile.first_name} {profile.last_name}</div>
                        <div className="text-sm text-muted-foreground">{profile.occupation}</div>
                      </div>
                      <Badge variant={profile.gender === 'Male' ? 'default' : 'secondary'} className="ml-auto">
                        {profile.gender}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Features</h3>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Real-time messaging (simulated)</li>
                  <li>Video calls with WebRTC (simulated)</li>
                  <li>Wali supervision for female profiles</li>
                  <li>End-to-end encryption</li>
                  <li>Message retention policies</li>
                  <li>Content monitoring and moderation</li>
                </ul>
                
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Settings</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Encryption:</span>
                      <Badge variant={encryptionEnabled ? 'default' : 'outline'}>
                        {encryptionEnabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Retention:</span>
                      <Badge variant="outline">
                        {retentionPolicy.type === 'temporary' 
                          ? `${retentionPolicy.duration_days} days` 
                          : 'Permanent'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>AI Monitoring:</span>
                      <Badge variant={monitoringEnabled ? 'default' : 'outline'}>
                        {monitoringEnabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="h-[600px] border rounded-lg overflow-hidden">
          <MessagesContainer
            loading={loading}
            conversations={conversations}
            conversationId={selectedConversationId}
            currentConversation={currentConversation}
            onSelectConversation={selectConversation}
            errors={{
              conversations: null,
              messages: null,
              videoCall: null
            }}
          >
            {videoCallStatus.isActive ? (
              <VideoCallManager
                videoCallStatus={videoCallStatus}
                onEndCall={endVideoCall}
                conversationId={selectedConversationId}
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
                  error={null}
                  onStartVideoCall={() => {
                    const otherUserId = currentConversation.participants.find(id => id !== currentUserId);
                    if (otherUserId) {
                      startVideoCall(otherUserId);
                    }
                  }}
                  backToList={() => setSelectedConversationId(undefined)}
                  isWaliSupervised={currentConversation.wali_supervised}
                  monitoringEnabled={monitoringEnabled}
                  toggleMonitoring={() => setMonitoringEnabled(!monitoringEnabled)}
                  encryptionEnabled={encryptionEnabled}
                  toggleEncryption={toggleEncryption}
                  retentionPolicy={retentionPolicy}
                  updateRetentionPolicy={updateRetentionPolicy}
                />
              )
            )}
          </MessagesContainer>
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default Demo;

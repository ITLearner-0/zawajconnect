
import { useState, useEffect } from 'react';
import { dummyProfiles, dummyConversations, dummyMessages } from '@/data/dummyData';
import { VideoCallStatus, Message, Conversation, RetentionPolicy } from '@/types/profile';

export const useMessagingDemo = () => {
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

  return {
    currentUserId,
    selectedConversationId,
    conversations,
    currentConversation,
    messages,
    loading,
    messageInput,
    setMessageInput,
    sendingMessage,
    videoCallStatus,
    encryptionEnabled,
    monitoringEnabled,
    retentionPolicy,
    selectConversation,
    sendMessage,
    startVideoCall,
    endVideoCall,
    toggleEncryption,
    setMonitoringEnabled,
    updateRetentionPolicy
  };
};

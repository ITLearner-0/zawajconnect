import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useProfileData } from '@/hooks/useProfileData';
import { Conversation, Message } from '@/types/profile';
import { useToast } from '@/hooks/use-toast';
import ConversationList from '@/components/messaging/ConversationList';
import ChatWindow from '@/components/messaging/ChatWindow';
import VideoChat from '@/components/messaging/VideoChat';
import WaliSupervisor from '@/components/messaging/WaliSupervisor';
import { Loader } from 'lucide-react';
import CustomButton from '@/components/CustomButton';

const Messages = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userId, formData } = useProfileData();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageInput, setMessageInput] = useState('');
  const [videoCallStatus, setVideoCallStatus] = useState<{
    isActive: boolean; 
    participantId?: string;
    waliPresent: boolean;
    startTime?: Date;
  }>({
    isActive: false,
    waliPresent: false
  });

  // Fetch all conversations for the current user
  useEffect(() => {
    if (!userId) return;

    const fetchConversations = async () => {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id,
          created_at,
          participants,
          wali_supervised,
          messages!messages(
            id,
            content,
            created_at,
            sender_id,
            is_read
          )
        `)
        .contains('participants', [userId])
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Error loading conversations",
          description: error.message,
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Process data to get conversations with last message
      const processedConversations: Conversation[] = [];
      
      for (const conv of data || []) {
        const otherParticipantId = conv.participants.find(p => p !== userId);
        
        // Get other participant's profile details
        if (otherParticipantId) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', otherParticipantId)
            .single();
          
          // Find the last message
          let lastMessage = null;
          if (conv.messages && conv.messages.length > 0) {
            const sortedMessages = [...conv.messages].sort(
              (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
            lastMessage = sortedMessages[0];
          }
          
          processedConversations.push({
            id: conv.id,
            created_at: conv.created_at,
            participants: conv.participants,
            last_message: lastMessage,
            profile: profileData || undefined,
            wali_supervised: conv.wali_supervised
          });
        }
      }
      
      setConversations(processedConversations);
      setLoading(false);
    };

    fetchConversations();
  }, [userId, toast]);

  // Load messages when conversation is selected
  useEffect(() => {
    if (!conversationId || !userId) return;

    const fetchMessages = async () => {
      setLoading(true);
      
      // Get conversation details first
      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .select('*, profiles!conversations_profiles_fkey(first_name, last_name)')
        .eq('id', conversationId)
        .single();

      if (convError) {
        toast({
          title: "Error loading conversation",
          description: convError.message,
          variant: "destructive"
        });
        navigate('/messages');
        setLoading(false);
        return;
      }

      // Set current conversation
      const otherParticipantId = convData.participants.find(p => p !== userId);
      if (otherParticipantId) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', otherParticipantId)
          .single();
          
        setCurrentConversation({
          id: convData.id,
          created_at: convData.created_at,
          participants: convData.participants,
          profile: profileData || undefined,
          wali_supervised: convData.wali_supervised
        });
      }

      // Get messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (messagesError) {
        toast({
          title: "Error loading messages",
          description: messagesError.message,
          variant: "destructive"
        });
      } else {
        setMessages(messagesData as Message[]);
        
        // Mark unread messages as read
        const unreadMessages = messagesData
          .filter(msg => !msg.is_read && msg.sender_id !== userId)
          .map(msg => msg.id);
          
        if (unreadMessages.length > 0) {
          await supabase
            .from('messages')
            .update({ is_read: true })
            .in('id', unreadMessages);
        }
      }
      
      setLoading(false);
    };

    fetchMessages();
    
    // Set up real-time subscription for new messages
    const channel = supabase
      .channel('new_messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, (payload) => {
        // Add the new message to the list
        const newMessage = payload.new as Message;
        setMessages(prev => [...prev, newMessage]);
        
        // If message is not from current user, mark as read
        if (newMessage.sender_id !== userId) {
          supabase
            .from('messages')
            .update({ is_read: true })
            .eq('id', newMessage.id);
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, userId, navigate, toast]);

  const sendMessage = async () => {
    if (!messageInput.trim() || !conversationId || !userId) return;
    
    // Check if wali supervision is required for female users
    const needsWaliSupervision = formData.gender === 'Female' && !formData.waliName;
    
    const newMessage = {
      conversation_id: conversationId,
      sender_id: userId,
      content: messageInput,
      is_wali_visible: currentConversation?.wali_supervised || needsWaliSupervision
    };
    
    const { error } = await supabase
      .from('messages')
      .insert(newMessage);
      
    if (error) {
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive"
      });
    } else {
      setMessageInput('');
    }
  };

  const startVideoCall = async (participantId: string) => {
    if (!userId || !conversationId) return;
    
    // Check if wali supervision is required
    const isUserFemale = formData.gender === 'Female';
    const waliPresent = isUserFemale;
    
    setVideoCallStatus({
      isActive: true,
      participantId,
      waliPresent,
      startTime: new Date()
    });
    
    // Log video call start in database
    await supabase
      .from('video_calls')
      .insert({
        conversation_id: conversationId,
        initiator_id: userId,
        receiver_id: participantId,
        wali_present: waliPresent
      });
  };

  const endVideoCall = async () => {
    if (!videoCallStatus.startTime || !userId) return;
    
    // Calculate duration
    const duration = Math.round(
      (new Date().getTime() - videoCallStatus.startTime.getTime()) / 1000
    );
    
    // Update video call record
    if (conversationId && videoCallStatus.participantId) {
      await supabase
        .from('video_calls')
        .update({
          ended_at: new Date().toISOString(),
          duration_seconds: duration
        })
        .eq('conversation_id', conversationId)
        .eq('initiator_id', userId)
        .is('ended_at', null);
    }
    
    setVideoCallStatus({
      isActive: false,
      waliPresent: false
    });
  };

  // Select a conversation
  const selectConversation = (conversation: Conversation) => {
    navigate(`/messages/${conversation.id}`);
  };

  if (!userId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Please sign in to view messages</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="bg-primary text-white p-4">
        <h1 className="text-xl font-bold">Messages</h1>
      </div>
      
      {loading && !conversationId ? (
        <div className="flex items-center justify-center flex-grow">
          <Loader className="animate-spin mr-2" />
          <p>Loading conversations...</p>
        </div>
      ) : (
        <div className="flex flex-row h-full">
          {/* Conversation list */}
          <div className={`w-full md:w-1/3 border-r ${conversationId ? 'hidden md:block' : 'block'}`}>
            <ConversationList 
              conversations={conversations} 
              onSelectConversation={selectConversation}
              selectedConversationId={conversationId}
            />
          </div>
          
          {/* Chat window or placeholder */}
          <div className={`w-full md:w-2/3 ${!conversationId ? 'hidden md:flex' : 'flex'} flex-col`}>
            {conversationId && currentConversation ? (
              <>
                {videoCallStatus.isActive ? (
                  <div className="flex flex-col h-full">
                    <VideoChat 
                      participantId={videoCallStatus.participantId || ''} 
                      onEndCall={endVideoCall}
                    />
                    {videoCallStatus.waliPresent && (
                      <WaliSupervisor conversationId={conversationId} />
                    )}
                  </div>
                ) : (
                  <ChatWindow
                    conversation={currentConversation}
                    messages={messages}
                    currentUserId={userId}
                    messageInput={messageInput}
                    setMessageInput={setMessageInput}
                    sendMessage={sendMessage}
                    onStartVideoCall={() => {
                      const otherUserId = currentConversation.participants.find(id => id !== userId);
                      if (otherUserId) {
                        startVideoCall(otherUserId);
                      }
                    }}
                    backToList={() => navigate('/messages')}
                    isWaliSupervised={currentConversation.wali_supervised}
                  />
                )}
              </>
            ) : (
              <div className="flex items-center justify-center flex-grow text-gray-500">
                <div className="text-center">
                  <p className="mb-4">Select a conversation or start a new one</p>
                  <CustomButton 
                    onClick={() => navigate('/nearby')} 
                    variant="outline"
                  >
                    Find People Nearby
                  </CustomButton>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;

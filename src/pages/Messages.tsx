
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Conversation, Message, VideoCallStatus } from "@/types/profile";
import ConversationList from "@/components/messaging/ConversationList";
import ChatWindow from "@/components/messaging/ChatWindow";
import VideoChat from "@/components/messaging/VideoChat";
import WaliSupervisor from "@/components/messaging/WaliSupervisor";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useProfileData } from "@/hooks/useProfileData";

const Messages = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { userId, formData } = useProfileData();
  const [videoCall, setVideoCall] = useState<VideoCallStatus>({
    isActive: false,
    waliPresent: false,
  });

  // Fetch conversations
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery({
    queryKey: ["conversations", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from("conversations")
        .select(`
          id, 
          created_at, 
          participants,
          wali_supervised,
          last_message:messages(
            content, 
            created_at, 
            is_read
          )
        `)
        .contains('participants', [userId])
        .order("created_at", { ascending: false });
        
      if (error) {
        toast({
          title: "Error fetching conversations",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }
      
      return data as Conversation[];
    },
    enabled: !!userId,
  });

  // Fetch messages for the current conversation
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });
        
      if (error) {
        toast({
          title: "Error fetching messages",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }
      
      return data as Message[];
    },
    enabled: !!conversationId,
  });

  // Get current conversation details
  const currentConversation = conversations.find(
    (conv) => conv.id === conversationId
  );

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (newMessage: Omit<Message, "id" | "created_at" | "is_read">) => {
      const { data, error } = await supabase
        .from("messages")
        .insert([{
          ...newMessage,
          is_read: false,
        }])
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations", userId] });
    },
    onError: (error) => {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle sending a new message
  const handleSendMessage = (content: string, isWaliVisible: boolean = true) => {
    if (!userId || !conversationId) return;
    
    sendMessageMutation.mutate({
      conversation_id: conversationId,
      sender_id: userId,
      content,
      is_wali_visible: isWaliVisible,
    });
  };

  // Handle starting a video call
  const handleStartVideoCall = () => {
    if (!currentConversation) return;
    
    // Check if wali supervision is required and wali is verified
    const isFemaleSender = formData.gender === "female";
    const waliRequired = isFemaleSender && !formData.waliVerified;
    
    if (waliRequired) {
      toast({
        title: "Wali Supervision Required",
        description: "As a female user, you need your wali to be present for video calls.",
        variant: "default",
      });
      
      setVideoCall({
        isActive: true,
        participantId: currentConversation.participants.find(p => p !== userId),
        waliPresent: false,
        startTime: new Date(),
      });
    } else {
      setVideoCall({
        isActive: true,
        participantId: currentConversation.participants.find(p => p !== userId),
        waliPresent: !isFemaleSender,
        startTime: new Date(),
      });
    }
  };

  // Handle ending a video call
  const handleEndVideoCall = () => {
    setVideoCall({
      isActive: false,
      waliPresent: false,
    });
  };

  // Confirm wali is present
  const confirmWaliPresent = () => {
    setVideoCall(prev => ({
      ...prev,
      waliPresent: true,
    }));
    
    toast({
      title: "Wali Confirmed",
      description: "Your wali's supervision has been confirmed for this video call.",
      variant: "default",
    });
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar with conversation list */}
      <div className="w-1/4 bg-white border-r">
        <div className="p-4 border-b">
          <h1 className="text-xl font-semibold">Messages</h1>
        </div>
        
        {conversationsLoading ? (
          <div className="p-4 text-center">Loading conversations...</div>
        ) : (
          <ConversationList 
            conversations={conversations} 
            currentConversationId={conversationId}
            onSelectConversation={(id) => navigate(`/messages/${id}`)}
          />
        )}
      </div>
      
      {/* Main chat area */}
      <div className="flex flex-col flex-1">
        {!conversationId ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <p>Select a conversation to start messaging</p>
            </div>
          </div>
        ) : (
          <>
            {videoCall.isActive ? (
              <div className="flex-1 flex flex-col">
                <VideoChat
                  participantId={videoCall.participantId || ""}
                  waliPresent={videoCall.waliPresent}
                  onEndCall={handleEndVideoCall}
                />
                
                {formData.gender === "female" && !videoCall.waliPresent && (
                  <WaliSupervisor
                    waliName={formData.waliName || ""}
                    onConfirmPresent={confirmWaliPresent}
                  />
                )}
              </div>
            ) : (
              <ChatWindow
                messages={messages}
                isLoading={messagesLoading}
                currentUserId={userId || ""}
                onSendMessage={handleSendMessage}
                onStartVideoCall={handleStartVideoCall}
                waliSupervisionRequired={currentConversation?.wali_supervised || false}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Messages;

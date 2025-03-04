
import { useState } from "react";
import { Conversation } from "@/types/profile";
import { formatDistanceToNow } from "date-fns";
import { Search, Loader } from "lucide-react";
import { Input } from "../ui/input";
import { Skeleton } from "../ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { dummyProfiles } from "@/data/dummyProfiles";

interface ConversationListProps {
  conversations: Conversation[];
  onSelectConversation: (conversation: Conversation) => void;
  selectedConversationId?: string;
  loading?: boolean;
  error?: string | null;
}

const ConversationList = ({ 
  conversations, 
  onSelectConversation,
  selectedConversationId,
  loading = false,
  error = null
}: ConversationListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filter conversations based on search term
  const filteredConversations = conversations.filter(conv => {
    const fullName = `${conv.profile?.first_name} ${conv.profile?.last_name}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  // Find profile picture for a participant in a conversation
  const getProfilePicture = (conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (!conversation) return null;
    
    const participantId = conversation.participants.find(id => id !== 'current-user');
    if (!participantId) return null;
    
    const profile = dummyProfiles.find(p => p.id === participantId);
    return profile?.profile_picture || null;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search bar */}
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search messages"
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>
      
      {/* Conversations list */}
      <div className="overflow-y-auto flex-grow">
        {loading ? (
          // Show skeleton loaders when loading
          Array(5).fill(0).map((_, index) => (
            <div key={index} className="p-3 border-b">
              <div className="flex items-center space-x-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            </div>
          ))
        ) : error ? (
          <div className="text-center p-6 text-red-500">
            <p>Error loading conversations</p>
            <p className="text-sm">{error}</p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-center p-6 text-gray-500">
            <p>No conversations found</p>
            <p className="text-sm">Start a conversation from the Nearby page</p>
          </div>
        ) : (
          filteredConversations.map(conversation => {
            const profilePicture = getProfilePicture(conversation.id);
            
            return (
              <div 
                key={conversation.id}
                className={`p-3 border-b cursor-pointer transition-colors hover:bg-gray-50 ${
                  selectedConversationId === conversation.id ? 'bg-gray-100' : ''
                }`}
                onClick={() => onSelectConversation(conversation)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10 rounded-full">
                      {profilePicture ? (
                        <AvatarImage 
                          src={profilePicture} 
                          alt={`${conversation.profile?.first_name || 'User'}'s profile`} 
                        />
                      ) : null}
                      <AvatarFallback className="bg-primary text-white">
                        {conversation.profile?.first_name?.[0] || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {conversation.profile?.first_name} {conversation.profile?.last_name}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {conversation.last_message?.content || "No messages yet"}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">
                    {conversation.last_message ? 
                      formatDistanceToNow(new Date(conversation.last_message.created_at), { addSuffix: true }) : 
                      formatDistanceToNow(new Date(conversation.created_at), { addSuffix: true })}
                  </div>
                </div>
                
                {/* Wali supervision indicator */}
                {conversation.wali_supervised && (
                  <div className="mt-1 text-xs text-primary-foreground bg-primary/20 px-2 py-0.5 rounded-full inline-block">
                    Wali Supervised
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ConversationList;

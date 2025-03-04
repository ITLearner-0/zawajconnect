
import { useState } from "react";
import { Conversation } from "@/types/profile";
import { formatDistanceToNow } from "date-fns";
import { Search } from "lucide-react";
import { Input } from "../ui/input";

interface ConversationListProps {
  conversations: Conversation[];
  onSelectConversation: (conversation: Conversation) => void;
  selectedConversationId?: string;
}

const ConversationList = ({ 
  conversations, 
  onSelectConversation,
  selectedConversationId
}: ConversationListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filter conversations based on search term
  const filteredConversations = conversations.filter(conv => {
    const fullName = `${conv.profile?.first_name} ${conv.profile?.last_name}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

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
          />
        </div>
      </div>
      
      {/* Conversations list */}
      <div className="overflow-y-auto flex-grow">
        {filteredConversations.length === 0 ? (
          <div className="text-center p-6 text-gray-500">
            <p>No conversations found</p>
            <p className="text-sm">Start a conversation from the Nearby page</p>
          </div>
        ) : (
          filteredConversations.map(conversation => (
            <div 
              key={conversation.id}
              className={`p-3 border-b cursor-pointer transition-colors hover:bg-gray-50 ${
                selectedConversationId === conversation.id ? 'bg-gray-100' : ''
              }`}
              onClick={() => onSelectConversation(conversation)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white">
                    {conversation.profile?.first_name?.[0] || '?'}
                  </div>
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
          ))
        )}
      </div>
    </div>
  );
};

export default ConversationList;

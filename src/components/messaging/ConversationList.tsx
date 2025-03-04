
import React from "react";
import { Conversation } from "@/types/profile";
import { format } from "date-fns";
import { VideoIcon, ShieldCheckIcon } from "lucide-react";

interface ConversationListProps {
  conversations: Conversation[];
  currentConversationId?: string;
  onSelectConversation: (id: string) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  currentConversationId,
  onSelectConversation,
}) => {
  if (conversations.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>No conversations yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto">
      {conversations.map((conversation) => (
        <div
          key={conversation.id}
          className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
            conversation.id === currentConversationId ? "bg-gray-100" : ""
          }`}
          onClick={() => onSelectConversation(conversation.id)}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-medium">
                {conversation.profile
                  ? `${conversation.profile.first_name} ${conversation.profile.last_name}`
                  : "Unknown User"}
              </h3>
              
              {conversation.last_message && (
                <p className="text-sm text-gray-600 truncate mt-1">
                  {conversation.last_message.content}
                </p>
              )}
            </div>
            
            <div className="text-xs text-gray-500">
              {conversation.last_message
                ? format(new Date(conversation.last_message.created_at), "MMM d")
                : format(new Date(conversation.created_at), "MMM d")}
            </div>
          </div>
          
          <div className="flex items-center mt-2 text-xs text-gray-500">
            {conversation.wali_supervised && (
              <div className="flex items-center mr-3" title="Wali supervised">
                <ShieldCheckIcon className="h-3 w-3 mr-1 text-green-500" />
                <span>Wali</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ConversationList;

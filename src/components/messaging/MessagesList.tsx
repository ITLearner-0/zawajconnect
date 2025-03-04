
import React from 'react';
import { Message } from '@/types/profile';
import MessageItem from './MessageItem';
import WaliSupervisor from './WaliSupervisor';

interface MessagesListProps {
  messages: Message[];
  currentUserId: string;
  onReportMessage: (message: Message) => void;
  isWaliSupervised: boolean;
  conversationId: string;
  loading: boolean;
  error: string | null;
}

const MessagesList: React.FC<MessagesListProps> = ({
  messages,
  currentUserId,
  onReportMessage,
  isWaliSupervised,
  conversationId,
  loading,
  error
}) => {
  return (
    <div className="flex-grow overflow-y-auto p-4 space-y-4">
      {loading ? (
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center text-gray-500 mt-8">
          <p>No messages yet</p>
          <p className="text-sm mt-2">Start the conversation!</p>
        </div>
      ) : (
        messages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            isOwn={message.sender_id === currentUserId}
            onReport={() => onReportMessage(message)}
          />
        ))
      )}
      {error && (
        <div className="bg-red-50 text-red-500 p-2 rounded text-sm mt-2">
          {error}
        </div>
      )}
      
      {/* Show this when wali is supervising */}
      {isWaliSupervised && <WaliSupervisor conversationId={conversationId} />}
    </div>
  );
};

export default MessagesList;

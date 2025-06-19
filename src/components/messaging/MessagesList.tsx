
import React from 'react';
import { Message } from '@/types/profile';
import MessageItem from './MessageItem';
import WaliSupervisor from './WaliSupervisor';
import StandardLoadingState from '@/components/ui/StandardLoadingState';

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
      <StandardLoadingState
        loading={loading}
        error={error}
        loadingText="Loading messages..."
        emptyState={{
          title: "No messages yet",
          description: "Start the conversation!"
        }}
      >
        {messages.length > 0 && (
          <>
            {messages.map((message) => (
              <MessageItem
                key={message.id}
                message={message}
                isOwn={message.sender_id === currentUserId}
                onReport={() => onReportMessage(message)}
              />
            ))}
            
            {/* Show this when wali is supervising */}
            {isWaliSupervised && <WaliSupervisor conversationId={conversationId} />}
          </>
        )}
      </StandardLoadingState>
    </div>
  );
};

export default MessagesList;

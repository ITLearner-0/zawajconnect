
import React from 'react';
import { Message } from '@/types/profile';
import { format } from 'date-fns';

interface MessageItemProps {
  message: Message;
  isOwn: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, isOwn }) => {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`max-w-[75%] rounded-lg p-3 ${
          isOwn 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-muted text-muted-foreground'
        }`}
      >
        <div className="flex justify-between items-center gap-2 mb-1">
          <span className="text-xs opacity-70">
            {format(new Date(message.created_at), 'MMM d, h:mm a')}
          </span>
        </div>
        <p className={`${isOwn ? 'text-primary-foreground' : 'text-foreground'}`}>{message.content}</p>
      </div>
    </div>
  );
};

export default MessageItem;

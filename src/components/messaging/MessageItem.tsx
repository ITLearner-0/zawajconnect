
import React from 'react';
import { Message } from '@/types/profile';
import { format } from 'date-fns';
import { Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MessageItemProps {
  message: Message;
  isOwn: boolean;
  onReport?: () => void;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, isOwn, onReport }) => {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`max-w-[75%] rounded-lg p-3 relative group ${
          isOwn 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-muted text-muted-foreground'
        }`}
      >
        <div className="flex justify-between items-center gap-2 mb-1">
          <span className="text-xs opacity-70">
            {format(new Date(message.created_at), 'MMM d, h:mm a')}
          </span>
          
          {/* Show filtered tag if message was filtered */}
          {message.is_filtered && (
            <span className="text-xs bg-amber-200 text-amber-800 px-1 rounded">
              filtered
            </span>
          )}
        </div>
        
        <p className={`${isOwn ? 'text-primary-foreground' : 'text-foreground'}`}>
          {message.content}
        </p>
        
        {/* Report button - only show for messages that aren't yours */}
        {!isOwn && onReport && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReport}
            className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
          >
            <Flag className="h-3 w-3 text-red-500" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default MessageItem;

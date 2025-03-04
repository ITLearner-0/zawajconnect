
import React from 'react';
import { Message } from '@/types/profile';
import { format } from 'date-fns';
import { Flag, Lock, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface MessageItemProps {
  message: Message;
  isOwn: boolean;
  onReport?: () => void;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, isOwn, onReport }) => {
  // Format deletion date for display
  const formattedDeletionDate = message.scheduled_deletion 
    ? format(new Date(message.scheduled_deletion), 'MMM d, yyyy')
    : null;
    
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
          <div className="flex items-center gap-1">
            <span className="text-xs opacity-70">
              {format(new Date(message.created_at), 'MMM d, h:mm a')}
            </span>
            
            {/* Encryption indicator */}
            {message.encrypted && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Lock className="h-3 w-3 opacity-70" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">End-to-end encrypted</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            {/* Expiration indicator */}
            {formattedDeletionDate && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Clock className="h-3 w-3 opacity-70" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Expires on {formattedDeletionDate}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          
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

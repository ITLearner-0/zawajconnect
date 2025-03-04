
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Lock } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface MessageInputProps {
  messageInput: string;
  setMessageInput: (value: string) => void;
  sendMessage: () => void;
  sendingMessage: boolean;
  encryptionEnabled: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
  messageInput,
  setMessageInput,
  sendMessage,
  sendingMessage,
  encryptionEnabled
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="p-3 border-t">
      <div className="flex items-center">
        {encryptionEnabled && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="mr-2">
                  <Lock className="h-4 w-4 text-green-600" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">End-to-end encrypted</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        <Input
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Type a message${encryptionEnabled ? ' (encrypted)' : ''}`}
          className="flex-grow"
          disabled={sendingMessage}
        />
        <Button 
          onClick={sendMessage} 
          disabled={sendingMessage || !messageInput.trim()} 
          className="ml-2"
        >
          {sendingMessage ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default MessageInput;

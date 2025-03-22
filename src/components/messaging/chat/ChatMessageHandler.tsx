
import React from 'react';
import { useToast } from '@/hooks/use-toast';

interface ChatMessageHandlerProps {
  conversationId: string;
  onSendMessage: (content: string) => void;
  moderateMessageContent: (content: string) => {
    flags: any[];
    filteredContent: string;
    isFiltered: boolean;
  };
  processContentFlags: (
    conversationId: string, 
    contentType: 'message',
    flagType: any,
    severity: any
  ) => void;
}

const ChatMessageHandler: React.FC<ChatMessageHandlerProps> = ({
  conversationId,
  onSendMessage,
  moderateMessageContent,
  processContentFlags
}) => {
  const { toast } = useToast();

  const handleSendMessage = (content: string) => {
    // Apply content moderation
    const { flags, filteredContent, isFiltered } = moderateMessageContent(content);
    
    // If the content was filtered, show a toast
    if (isFiltered) {
      toast({
        title: "Message Modified",
        description: "Your message contained inappropriate content and was modified before sending.",
        variant: "default"
      });
      
      // Process content flags
      flags.forEach(flag => {
        if (flag.flag_type && flag.severity) {
          processContentFlags(
            conversationId, 
            'message',
            flag.flag_type as any,
            flag.severity as any
          );
        }
      });
      
      // Send the filtered content
      onSendMessage(filteredContent);
    } else {
      // Send the original content
      onSendMessage(content);
    }
  };

  return { handleSendMessage };
};

export default ChatMessageHandler;

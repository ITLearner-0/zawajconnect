
import { useState, useEffect } from 'react';
import { dummyMessages } from '@/data/messages';

export const useDemoMessages = (conversationId: string | undefined) => {
  const [isDemoConversation, setIsDemoConversation] = useState(false);
  const [demoMessages, setDemoMessages] = useState<any[]>([]);

  useEffect(() => {
    if (!conversationId) {
      setIsDemoConversation(false);
      setDemoMessages([]);
      return;
    }

    // Check if this is a demo conversation (user-X format)
    if (conversationId.startsWith('user-')) {
      setIsDemoConversation(true);
      console.log('Demo conversation detected:', conversationId);
      
      // Load demo messages based on the conversation ID
      const conversationMap: Record<string, string> = {
        'user-1': 'conv-1',
        'user-2': 'conv-2',
        'user-3': 'conv-3',
        'user-4': 'conv-4'
      };
      
      const demoConvId = conversationMap[conversationId];
      if (demoConvId && dummyMessages[demoConvId]) {
        setDemoMessages(dummyMessages[demoConvId]);
      } else {
        // Default to empty array if no messages found
        setDemoMessages([]);
      }
    } else {
      setIsDemoConversation(false);
      setDemoMessages([]);
    }
  }, [conversationId]);

  return {
    isDemoConversation,
    demoMessages,
    setDemoMessages
  };
};

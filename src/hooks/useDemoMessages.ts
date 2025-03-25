
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

    // Check if this is a demo conversation (starts with 'user-' or is in the conv-X format)
    if (conversationId.startsWith('user-') || conversationId.startsWith('conv-')) {
      setIsDemoConversation(true);
      console.log('Demo conversation detected:', conversationId);
      
      // Map user-X to conv-X if needed
      let demoConvId = conversationId;
      if (conversationId.startsWith('user-')) {
        const userNumber = conversationId.split('-')[1];
        demoConvId = `conv-${userNumber}`;
      }
      
      if (dummyMessages[demoConvId]) {
        console.log(`Loading demo messages for ${demoConvId}`);
        setDemoMessages(dummyMessages[demoConvId]);
      } else {
        console.log(`No demo messages found for ${demoConvId}, available conversations:`, Object.keys(dummyMessages));
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

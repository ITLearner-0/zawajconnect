
import { useState, useEffect, useCallback } from 'react';
import { dummyMessages } from '@/data/messages';

export const useDemoMessages = (conversationId: string | undefined) => {
  const [isDemoConversation, setIsDemoConversation] = useState(false);
  const [demoMessages, setDemoMessages] = useState<any[]>([]);

  // Use a callback to determine if this is a demo conversation to prevent
  // this function from being recreated on each render
  const checkIsDemoConversation = useCallback((convId: string | undefined) => {
    if (!convId) return false;
    return convId.startsWith('user-') || convId.startsWith('conv-');
  }, []);

  // Load demo messages only once when the conversation ID changes
  useEffect(() => {
    if (!conversationId) {
      setIsDemoConversation(false);
      setDemoMessages([]);
      return;
    }

    // Check if this is a demo conversation
    const isDemo = checkIsDemoConversation(conversationId);
    setIsDemoConversation(isDemo);
    
    if (isDemo) {
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
      setDemoMessages([]);
    }
  }, [conversationId, checkIsDemoConversation]);

  return {
    isDemoConversation,
    demoMessages,
    setDemoMessages
  };
};

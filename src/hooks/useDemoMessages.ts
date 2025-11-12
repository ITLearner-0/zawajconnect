import { useState, useEffect, useCallback, useRef } from 'react';
import { dummyMessages } from '@/data/messages';

export const useDemoMessages = (conversationId: string | undefined) => {
  const [isDemoConversation, setIsDemoConversation] = useState(false);
  const [demoMessages, setDemoMessages] = useState<any[]>([]);
  const initialLoadComplete = useRef(false);

  // Use a callback to determine if this is a demo conversation to prevent
  // this function from being recreated on each render
  const checkIsDemoConversation = useCallback((convId: string | undefined) => {
    if (!convId) return false;
    return convId.startsWith('user-') || convId.startsWith('conv-');
  }, []);

  // Load demo messages only once when the conversation ID changes
  useEffect(() => {
    if (!conversationId) {
      if (!initialLoadComplete.current) {
        setIsDemoConversation(false);
        setDemoMessages([]);
      }
      return;
    }

    // Check if this is a demo conversation
    const isDemo = checkIsDemoConversation(conversationId);

    if (isDemo && !initialLoadComplete.current) {
      initialLoadComplete.current = true;
      setIsDemoConversation(true);

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
        console.log(
          `No demo messages found for ${demoConvId}, available conversations:`,
          Object.keys(dummyMessages)
        );
        // Default to empty array if no messages found
        setDemoMessages([]);
      }
    } else if (!isDemo) {
      setIsDemoConversation(false);
      setDemoMessages([]);
      initialLoadComplete.current = false;
    }
  }, [conversationId, checkIsDemoConversation]);

  return {
    isDemoConversation,
    demoMessages,
    setDemoMessages,
  };
};

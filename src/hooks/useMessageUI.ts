
import { useState } from 'react';

export const useMessageUI = () => {
  const [messageInput, setMessageInput] = useState<string>('');
  const [sendingMessage, setSendingMessage] = useState<boolean>(false);
  
  return {
    messageInput,
    setMessageInput,
    sendingMessage,
    setSendingMessage
  };
};

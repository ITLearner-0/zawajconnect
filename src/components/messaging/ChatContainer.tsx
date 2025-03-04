
import React from 'react';

interface ChatContainerProps {
  children: React.ReactNode;
}

const ChatContainer = ({ children }: ChatContainerProps) => {
  return (
    <div className="flex flex-col h-full">
      {children}
    </div>
  );
};

export default ChatContainer;

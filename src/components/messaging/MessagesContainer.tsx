
import { Conversation } from '@/types/profile';
import { Loader } from 'lucide-react';
import ConversationList from './ConversationList';
import EmptyConversation from './EmptyConversation';
import ChatContainer from './ChatContainer';

interface MessagesContainerProps {
  loading: boolean;
  conversations: Conversation[];
  conversationId?: string;
  currentConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
  children: React.ReactNode;
}

const MessagesContainer = ({ 
  loading, 
  conversations, 
  conversationId, 
  currentConversation,
  onSelectConversation,
  children 
}: MessagesContainerProps) => {
  if (loading && !conversationId) {
    return (
      <div className="flex items-center justify-center flex-grow">
        <Loader className="animate-spin mr-2" />
        <p>Loading conversations...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-row h-full">
      {/* Conversation list */}
      <div className={`w-full md:w-1/3 border-r ${conversationId ? 'hidden md:block' : 'block'}`}>
        <ConversationList 
          conversations={conversations} 
          onSelectConversation={onSelectConversation}
          selectedConversationId={conversationId}
        />
      </div>
      
      {/* Chat window or placeholder */}
      <div className={`w-full md:w-2/3 ${!conversationId ? 'hidden md:flex' : 'flex'} flex-col`}>
        {conversationId && currentConversation ? (
          <ChatContainer>{children}</ChatContainer>
        ) : (
          <EmptyConversation />
        )}
      </div>
    </div>
  );
};

export default MessagesContainer;

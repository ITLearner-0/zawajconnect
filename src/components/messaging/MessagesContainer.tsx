
import { Conversation } from '@/types/profile';
import { Loader, AlertTriangle } from 'lucide-react';
import ConversationList from './ConversationList';
import EmptyConversation from './EmptyConversation';
import ChatContainer from './ChatContainer';
import { Alert, AlertDescription } from '../ui/alert';

interface MessagesContainerProps {
  loading: boolean;
  conversations: Conversation[];
  conversationId?: string;
  currentConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
  children: React.ReactNode;
  errors?: {
    conversations: string | null;
    messages: string | null;
    videoCall: string | null;
  };
}

const MessagesContainer = ({ 
  loading, 
  conversations, 
  conversationId, 
  currentConversation,
  onSelectConversation,
  children,
  errors
}: MessagesContainerProps) => {
  const hasErrors = errors && (errors.conversations || errors.messages || errors.videoCall);

  return (
    <div className="flex flex-col h-full">
      {/* Error alert */}
      {hasErrors && (
        <Alert variant="destructive" className="m-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {errors?.conversations || errors?.messages || errors?.videoCall}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Main content */}
      <div className="flex flex-row h-full flex-grow">
        {/* Conversation list */}
        <div className={`w-full md:w-1/3 border-r ${conversationId ? 'hidden md:block' : 'block'}`}>
          <ConversationList 
            conversations={conversations} 
            onSelectConversation={onSelectConversation}
            selectedConversationId={conversationId}
            loading={loading}
            error={errors?.conversations}
          />
        </div>
        
        {/* Chat window or placeholder */}
        <div className={`w-full md:w-2/3 ${!conversationId ? 'hidden md:flex' : 'flex'} flex-col`}>
          {loading && conversationId ? (
            <div className="flex items-center justify-center h-full">
              <Loader className="animate-spin mr-2" />
              <p>Loading conversation...</p>
            </div>
          ) : conversationId && currentConversation ? (
            <ChatContainer>{children}</ChatContainer>
          ) : (
            <EmptyConversation />
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesContainer;

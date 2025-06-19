
import { Conversation } from '@/types/profile';
import { AlertTriangle } from 'lucide-react';
import ConversationList from './ConversationList';
import EmptyConversation from './EmptyConversation';
import StandardLoadingState from '@/components/ui/StandardLoadingState';
import { Alert, AlertDescription } from '../ui/alert';
import MessageSearch from './MessageSearch';

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
    monitoring?: string | null;
  };
}

const MessagesContainer = ({ 
  loading = false, 
  conversations = [], 
  conversationId, 
  currentConversation = null,
  onSelectConversation,
  children,
  errors = { conversations: null, messages: null, videoCall: null, monitoring: null }
}: MessagesContainerProps) => {
  const hasErrors = errors && (errors.conversations || errors.messages || errors.videoCall || errors.monitoring);

  // Get other user ID for search - add null checks
  let otherUserId = null;
  if (currentConversation && 
      currentConversation.participants && 
      Array.isArray(currentConversation.participants)) {
    otherUserId = currentConversation.participants.find(id => id !== conversationId) || null;
  }

  // Function to handle search result selection
  const handleSearchResultSelect = (selectedConversationId: string) => {
    if (!selectedConversationId) return;
    
    const conversation = conversations.find(conv => conv.id === selectedConversationId);
    if (conversation) {
      onSelectConversation(conversation);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Error alert */}
      {hasErrors && (
        <Alert variant="destructive" className="m-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {errors?.conversations || errors?.messages || errors?.videoCall || errors?.monitoring}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Main content */}
      <div className="flex flex-row h-full flex-grow">
        {/* Conversation list */}
        <div className={`w-full md:w-1/3 border-r ${conversationId ? 'hidden md:flex md:flex-col' : 'flex flex-col'}`}>
          <div className="flex items-center justify-between p-3 border-b">
            <h2 className="font-medium">Messages</h2>
            <MessageSearch 
              userId={otherUserId}
              onSelectResult={handleSearchResultSelect}
            />
          </div>
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
          <StandardLoadingState
            loading={loading && !!conversationId}
            loadingText="Loading conversation..."
            emptyState={!conversationId ? {
              title: "Select a conversation",
              description: "Choose a conversation from the list to start messaging."
            } : undefined}
          >
            {conversationId && currentConversation && (
              <div className="flex flex-col h-full">
                {children}
              </div>
            )}
          </StandardLoadingState>
          
          {!conversationId && (
            <EmptyConversation />
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesContainer;

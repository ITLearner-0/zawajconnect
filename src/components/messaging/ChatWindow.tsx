
import React, { useState } from 'react';
import { Conversation, Message } from '@/types/profile';
import { ArrowLeft, Video, Send, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import MessageItem from '@/components/messaging/MessageItem';
import ChatContainer from '@/components/messaging/ChatContainer';
import WaliSupervisor from '@/components/messaging/WaliSupervisor';
import ReportDialog from '@/components/messaging/ReportDialog';
import { MonitoringReport } from '@/services/aiMonitoringService';

interface ChatWindowProps {
  conversation: Conversation;
  messages: Message[];
  currentUserId: string;
  messageInput: string;
  setMessageInput: (value: string) => void;
  sendMessage: () => void;
  loading: boolean;
  sendingMessage: boolean;
  error: string | null;
  onStartVideoCall: () => void;
  backToList: () => void;
  isWaliSupervised?: boolean;
  report?: MonitoringReport | null;
  monitoringEnabled?: boolean;
  toggleMonitoring?: () => void;
  monitoringLoading?: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  conversation,
  messages,
  currentUserId,
  messageInput,
  setMessageInput,
  sendMessage,
  loading,
  sendingMessage,
  error,
  onStartVideoCall,
  backToList,
  isWaliSupervised = false,
  report = null,
  monitoringEnabled = true,
  toggleMonitoring = () => {},
  monitoringLoading = false
}) => {
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const otherParticipant = conversation.profile || { first_name: 'User', last_name: '' };
  const otherUserId = conversation.participants.find(id => id !== currentUserId) || '';

  return (
    <ChatContainer
      report={report}
      monitoringEnabled={monitoringEnabled}
      toggleMonitoring={toggleMonitoring}
      monitoringLoading={monitoringLoading}
    >
      <div className="flex flex-col h-full">
        {/* Chat header */}
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" onClick={backToList} className="mr-2 md:hidden">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h3 className="font-medium">
                {otherParticipant.first_name} {otherParticipant.last_name}
              </h3>
              {isWaliSupervised && (
                <p className="text-xs text-green-600">Wali supervised</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setSelectedMessage(null);
                setIsReportDialogOpen(true);
              }}
            >
              <Flag className="h-4 w-4 text-red-500 mr-1" />
              <span className="hidden md:inline">Report</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={onStartVideoCall}>
              <Video className="h-5 w-5" />
              <span className="ml-1 hidden md:inline">Video Call</span>
            </Button>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-grow overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <p>No messages yet</p>
              <p className="text-sm mt-2">Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => (
              <MessageItem
                key={message.id}
                message={message}
                isOwn={message.sender_id === currentUserId}
                onReport={() => {
                  setSelectedMessage(message);
                  setIsReportDialogOpen(true);
                }}
              />
            ))
          )}
          {error && (
            <div className="bg-red-50 text-red-500 p-2 rounded text-sm mt-2">
              {error}
            </div>
          )}
          
          {/* Show this when wali is supervising */}
          {isWaliSupervised && <WaliSupervisor conversationId={conversation.id} />}
        </div>

        {/* Message input */}
        <div className="p-3 border-t">
          <div className="flex items-center">
            <Input
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-grow"
              disabled={sendingMessage}
            />
            <Button 
              onClick={sendMessage} 
              disabled={sendingMessage || !messageInput.trim()} 
              className="ml-2"
            >
              {sendingMessage ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Report Dialog */}
      <ReportDialog
        isOpen={isReportDialogOpen}
        onClose={() => setIsReportDialogOpen(false)}
        userId={otherUserId}
        messageId={selectedMessage?.id}
        conversationId={conversation.id}
        currentUserId={currentUserId || ''}
      />
    </ChatContainer>
  );
};

export default ChatWindow;

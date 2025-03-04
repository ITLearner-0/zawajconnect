import { useEffect, useRef } from "react";
import { Conversation, Message } from "@/types/profile";
import { Violation, MonitoringReport } from "@/services/aiMonitoringService";
import { useProfileData } from "@/hooks/useProfileData";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, Send, Video, Shield, Loader } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

interface ChatWindowProps {
  conversation: Conversation;
  messages: Message[];
  currentUserId: string;
  messageInput: string;
  setMessageInput: (value: string) => void;
  sendMessage: () => void;
  onStartVideoCall: () => void;
  backToList: () => void;
  isWaliSupervised: boolean;
  loading?: boolean;
  sendingMessage?: boolean;
  error?: string | null;
  violations?: Violation[];
  report?: MonitoringReport | null;
  monitoringEnabled?: boolean;
  toggleMonitoring?: () => void;
  monitoringLoading?: boolean;
}

const ChatWindow = ({
  conversation,
  messages,
  currentUserId,
  messageInput,
  setMessageInput,
  sendMessage,
  onStartVideoCall,
  backToList,
  isWaliSupervised,
  loading = false,
  sendingMessage = false,
  error = null,
  violations = [],
  report = null,
  monitoringEnabled = true,
  toggleMonitoring = () => {},
  monitoringLoading = false
}: ChatWindowProps) => {
  const { formData } = useProfileData();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center">
          <button 
            onClick={backToList}
            className="md:hidden mr-2 p-1 rounded-full hover:bg-gray-200"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white">
              {conversation.profile?.first_name?.[0] || '?'}
            </div>
            <div>
              <p className="font-medium">
                {conversation.profile?.first_name} {conversation.profile?.last_name}
              </p>
              {isWaliSupervised && (
                <div className="flex items-center text-xs text-green-600">
                  <Shield className="w-3 h-3 mr-1" />
                  <span>Wali supervised</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onStartVideoCall}
          title="Start video call"
          className="flex items-center"
          disabled={loading}
        >
          <Video className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Video Call</span>
        </Button>
      </div>
      
      <div className="flex-grow overflow-auto relative">
        <div className="p-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader className="animate-spin mr-2" />
              <p>Loading messages...</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full text-red-500">
              <p>Error: {error}</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => {
              const isCurrentUser = message.sender_id === currentUserId;
              
              return (
                <div
                  key={message.id}
                  className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-lg px-4 py-2 ${
                      isCurrentUser
                        ? 'bg-primary text-white rounded-br-none'
                        : 'bg-gray-200 text-gray-800 rounded-bl-none'
                    }`}
                  >
                    <p>{message.content}</p>
                    <p className={`text-xs mt-1 ${isCurrentUser ? 'text-primary-foreground/80' : 'text-gray-500'}`}>
                      {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                    </p>
                    
                    {(formData.gender === 'Female' || isWaliSupervised) && message.is_wali_visible && (
                      <div className={`text-xs mt-1 flex items-center ${
                        isCurrentUser ? 'text-primary-foreground/80' : 'text-gray-500'
                      }`}>
                        <Shield className="w-3 h-3 mr-1" />
                        <span>Visible to wali</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 border-t flex items-center space-x-2">
        <Input
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-grow"
          disabled={loading || sendingMessage}
        />
        <Button 
          type="submit" 
          variant="default" 
          size="icon"
          disabled={loading || sendingMessage || !messageInput.trim()}
        >
          {sendingMessage ? (
            <Loader className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
};

export default ChatWindow;

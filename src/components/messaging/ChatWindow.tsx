
import React, { useState, useRef, useEffect } from "react";
import { Message } from "@/types/profile";
import { format } from "date-fns";
import { Send, Video, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  currentUserId: string;
  onSendMessage: (content: string, isWaliVisible: boolean) => void;
  onStartVideoCall: () => void;
  waliSupervisionRequired: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  isLoading,
  currentUserId,
  onSendMessage,
  onStartVideoCall,
  waliSupervisionRequired,
}) => {
  const [messageText, setMessageText] = useState("");
  const [isWaliVisible, setIsWaliVisible] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageText.trim()) {
      onSendMessage(messageText.trim(), isWaliVisible);
      setMessageText("");
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="bg-white p-4 border-b flex justify-between items-center">
        <h2 className="font-semibold">Conversation</h2>
        <div className="flex items-center space-x-2">
          {waliSupervisionRequired && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center text-sm text-green-600">
                    <span className="mr-1">Wali Supervised</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>This conversation is supervised by a wali</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={onStartVideoCall}
            className="flex items-center"
          >
            <Video className="h-4 w-4 mr-1" />
            Video Call
          </Button>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {isLoading ? (
          <div className="text-center text-gray-500">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500">
            <p>No messages yet</p>
            <p className="text-sm mt-1">Start the conversation by sending a message</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender_id === currentUserId ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-3/4 px-4 py-2 rounded-lg ${
                    message.sender_id === currentUserId
                      ? "bg-primary text-primary-foreground"
                      : "bg-white border border-gray-200"
                  }`}
                >
                  <div className="text-sm">{message.content}</div>
                  <div className="text-xs mt-1 flex items-center space-x-1">
                    <span>
                      {format(new Date(message.created_at), "MMM d, h:mm a")}
                    </span>
                    {message.sender_id === currentUserId && (
                      <>
                        {message.is_wali_visible ? (
                          <Eye className="h-3 w-3 ml-1" />
                        ) : (
                          <EyeOff className="h-3 w-3 ml-1" />
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message input area */}
      <form onSubmit={handleSendMessage} className="bg-white p-4 border-t">
        <div className="flex items-center mb-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="wali-visibility"
              checked={isWaliVisible}
              onCheckedChange={setIsWaliVisible}
            />
            <Label htmlFor="wali-visibility" className="text-sm">
              Visible to Wali
            </Label>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="ml-2">
                  {isWaliVisible ? (
                    <Eye className="h-4 w-4 text-green-500" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-amber-500" />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {isWaliVisible
                    ? "This message will be visible to the wali"
                    : "This message will be hidden from the wali"}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-2 border rounded-l-md focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <Button
            type="submit"
            variant="default"
            className="rounded-l-none"
            disabled={!messageText.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;

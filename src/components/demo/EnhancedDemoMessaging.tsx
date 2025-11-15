import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Send,
  Shield,
  Eye,
  Clock,
  CheckCheck,
  Mic,
  Video,
  Phone,
  MoreVertical,
} from 'lucide-react';
import { demoPersonas, demoConversations } from '@/data/demoPersonas';
import DemoStatusBanner from './DemoStatusBanner';

interface EnhancedDemoMessagingProps {
  selectedPersona?: string;
  onPersonaSelect?: (personaId: string) => void;
}

const EnhancedDemoMessaging: React.FC<EnhancedDemoMessagingProps> = ({
  selectedPersona,
  onPersonaSelect,
}) => {
  const [activeConversation, setActiveConversation] = useState<string>(selectedPersona ? `demo-conv-${selectedPersona.split('-')[2]}` : '');
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [typingIndicator, setTypingIndicator] = useState(false);

  const personas = demoPersonas;
  const selectedPersonaData = personas.find((p) => p.id === selectedPersona);

  useEffect(() => {
    if (selectedPersona) {
      const conversationKey = `demo-conv-${selectedPersona.split('-')[2]}` as keyof typeof demoConversations;
      const conversationMessages = demoConversations[conversationKey] || [];
      setMessages(conversationMessages);
      setActiveConversation(conversationKey);
    }
  }, [selectedPersona]);

  const sendDemoMessage = () => {
    if (!messageInput.trim() || !activeConversation) return;

    const newMessage = {
      id: `demo-msg-${Date.now()}`,
      conversation_id: activeConversation || 'demo-conv-1',
      sender_id: 'current-user',
      content: messageInput,
      created_at: new Date().toISOString(),
      is_read: false,
      is_wali_visible: selectedPersonaData?.gender === 'Female',
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessageInput('');

    // Simulate typing indicator
    setTypingIndicator(true);
    setTimeout(() => {
      setTypingIndicator(false);
      // Add an automatic response
      const conversationId = `${activeConversation || 'demo-conv-1'}`;
      const autoResponse = {
        id: `demo-msg-${Date.now() + 1}`,
        conversation_id: conversationId,
        content: getAutoResponse(messageInput),
        created_at: new Date().toISOString(),
        is_read: true,
        is_wali_visible: selectedPersonaData?.gender === 'Female',
      };
      setMessages((prev) => [...prev, autoResponse]);
    }, 2000);
  };

  const getAutoResponse = (userMessage: string): string => {
    const responses = [
      'BarakAllahu feeki pour votre message. Comment puis-je mieux vous connaître ?',
      "SubhanAllah, c'est une perspective intéressante. Qu'est-ce qui vous guide dans cette réflexion ?",
      "Alhamdulillah, je suis content(e) d'apprendre cela. Pouvez-vous m'en dire plus ?",
      'MashaAllah, vos valeurs semblent bien ancrées. Comment les mettez-vous en pratique au quotidien ?',
      "Qu'Allah vous bénisse. Cette conversation me permet de mieux comprendre votre personnalité.",
    ];
    return (responses[Math.floor(Math.random() * responses.length)] || responses[0]) as string;
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="h-full flex flex-col">
      <DemoStatusBanner variant="minimal" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
        {/* Personas List */}
        <Card className="md:col-span-1">
          <CardHeader>
            <h3 className="font-semibold text-rose-800 dark:text-rose-200 flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Profils Démo
            </h3>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {personas.map((persona) => (
                  <div
                    key={persona.id}
                    onClick={() => onPersonaSelect?.(persona.id)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedPersona === persona.id
                        ? 'bg-rose-100 dark:bg-rose-800'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={persona.profile_picture} />
                        <AvatarFallback>
                          {persona.first_name[0]}
                          {persona.last_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {persona.first_name} {persona.last_name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{persona.occupation}</p>
                        {persona.wali_verified && (
                          <Badge variant="outline" className="text-xs mt-1">
                            <Shield className="h-3 w-3 mr-1" />
                            Supervisé Wali
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Interface */}
        <Card className="md:col-span-2 flex flex-col">
          {selectedPersonaData ? (
            <>
              {/* Chat Header */}
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={selectedPersonaData.profile_picture} />
                      <AvatarFallback>
                        {selectedPersonaData.first_name[0]}
                        {selectedPersonaData.last_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">
                        {selectedPersonaData.first_name} {selectedPersonaData.last_name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        En ligne • Démo
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {selectedPersonaData.wali_verified && (
                  <div className="bg-blue-50 dark:bg-blue-950 p-2 rounded-lg text-xs text-blue-700 dark:text-blue-300">
                    <Shield className="h-3 w-3 inline mr-1" />
                    Cette conversation est supervisée par le wali ({selectedPersonaData.wali_name})
                  </div>
                )}
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 p-0">
                <ScrollArea className="h-64 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender_id === 'current-user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            message.sender_id === 'current-user'
                              ? 'bg-rose-500 text-white'
                              : 'bg-gray-100 dark:bg-gray-800'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <div className="flex items-center justify-end gap-1 mt-1">
                            <span className="text-xs opacity-70">
                              {formatTime(message.created_at)}
                            </span>
                            {message.sender_id === 'current-user' && (
                              <CheckCheck className="h-3 w-3 opacity-70" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {typingIndicator && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: '0.1s' }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: '0.2s' }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>

              {/* Message Input */}
              <div className="border-t p-4">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Mic className="h-4 w-4" />
                  </Button>
                  <Input
                    placeholder="Tapez votre message islamiquement respectueux..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendDemoMessage()}
                    className="flex-1"
                  />
                  <Button
                    onClick={sendDemoMessage}
                    disabled={!messageInput.trim()}
                    className="bg-rose-500 hover:bg-rose-600 text-white"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Messages automatiquement supprimés après 30 jours (mode démo)
                </p>
              </div>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center text-center">
              <div>
                <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  Sélectionnez un profil démo
                </h3>
                <p className="text-sm text-gray-500">
                  Choisissez un persona pour commencer une conversation de démonstration
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default EnhancedDemoMessaging;

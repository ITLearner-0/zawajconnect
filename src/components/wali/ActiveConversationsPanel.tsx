
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Conversation } from '@/types/profile';
import { formatDistanceToNow } from 'date-fns';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { SupervisionSession } from '@/types/wali';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface ActiveConversationsPanelProps {
  conversations: (Conversation & { supervision?: SupervisionSession })[];
  onStartSupervision: (conversationId: string, level: SupervisionSession['supervision_level']) => void;
  onEndSupervision: (sessionId: string) => void;
}

const ActiveConversationsPanel: React.FC<ActiveConversationsPanelProps> = ({ 
  conversations, 
  onStartSupervision,
  onEndSupervision
}) => {
  const [supervisionLevel, setSupervisionLevel] = React.useState<SupervisionSession['supervision_level']>('passive');
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Active Conversations</CardTitle>
      </CardHeader>
      <CardContent>
        {conversations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No active conversations to supervise
          </div>
        ) : (
          <div className="space-y-4">
            {conversations.map(conversation => {
              const isSupervising = !!conversation.supervision?.is_active;
              const otherParticipant = conversation.profile;
              
              return (
                <div key={conversation.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <Avatar>
                        <AvatarImage 
                          src={`https://api.dicebear.com/7.x/initials/svg?seed=${otherParticipant?.first_name || ''} ${otherParticipant?.last_name || ''}`} 
                        />
                        <AvatarFallback>
                          {otherParticipant?.first_name?.[0] || ''}
                          {otherParticipant?.last_name?.[0] || ''}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">
                          {otherParticipant?.first_name} {otherParticipant?.last_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Last message {conversation.last_message ? 
                            formatDistanceToNow(new Date(conversation.last_message.created_at), { addSuffix: true }) : 
                            'N/A'}
                        </p>
                        {isSupervising && (
                          <Badge className="mt-1 bg-green-500">
                            Currently Supervising
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {isSupervising ? (
                      <div className="flex flex-col space-y-2 items-end">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => onEndSupervision(conversation.supervision!.id)}
                        >
                          <EyeOff className="h-4 w-4 mr-1" />
                          End Supervision
                        </Button>
                        <Badge variant="outline">
                          Level: {conversation.supervision!.supervision_level}
                        </Badge>
                      </div>
                    ) : (
                      <div className="flex flex-col space-y-2 items-end">
                        <Select 
                          value={supervisionLevel} 
                          onValueChange={(value) => setSupervisionLevel(value as SupervisionSession['supervision_level'])}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Supervision Level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="passive">Passive</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="intervening">Intervening</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          className="mt-2"
                          onClick={() => onStartSupervision(conversation.id, supervisionLevel)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Start Supervising
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end mt-4">
                    <Button variant="outline" size="sm" className="flex items-center">
                      View Conversation
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActiveConversationsPanel;

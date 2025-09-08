import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFamilySupervision } from '@/hooks/useFamilySupervision';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  MessageCircle, 
  Users, 
  BookOpen, 
  Settings, 
  Shield, 
  Heart,
  Bell,
  Eye,
  Mic,
  Video,
  Star,
  Clock
} from 'lucide-react';

import RealTimeChat from './RealTimeChat';
import FamilyChatPanel from './FamilyChatPanel';
import IslamicGuidanceChat from './IslamicGuidanceChat';

interface Match {
  id: string;
  other_user: {
    id: string;
    full_name: string;
    avatar_url: string;
  };
  match_score: number;
  family_supervision_required: boolean;
  can_communicate: boolean;
}

interface ChatEnhancementHubProps {
  matchId: string;
  onClose?: () => void;
}

const ChatEnhancementHub: React.FC<ChatEnhancementHubProps> = ({ matchId, onClose }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { supervisionStatus, familyMembers } = useFamilySupervision();
  
  const [match, setMatch] = useState<Match | null>(null);
  const [activeTab, setActiveTab] = useState('chat');
  const [loading, setLoading] = useState(true);
  const [conversationContext, setConversationContext] = useState<any>(null);
  const [isWaliView, setIsWaliView] = useState(false);

  useEffect(() => {
    if (!user || !matchId) return;
    
    fetchMatchData();
    determineUserRole();
    fetchConversationContext();
  }, [user, matchId]);

  const fetchMatchData = async () => {
    // Implementation would fetch match data from Supabase
    // For now, we'll simulate the data
    setMatch({
      id: matchId,
      other_user: {
        id: 'other-user-id',
        full_name: 'Utilisateur',
        avatar_url: ''
      },
      match_score: 85,
      family_supervision_required: supervisionStatus.supervisionRequired,
      can_communicate: supervisionStatus.canCommunicate
    });
    setLoading(false);
  };

  const determineUserRole = () => {
    // Check if current user is a family supervisor
    const isSupervising = familyMembers.some(fm => 
      fm.user_id === user?.id && 
      fm.is_wali && 
      fm.can_view_profile
    );
    setIsWaliView(isSupervising);
  };

  const fetchConversationContext = () => {
    // Simulate conversation context analysis
    setConversationContext({
      stage: 'getting_to_know',
      duration_days: 5,
      message_count: 23,
      last_topics: ['family', 'values', 'education'],
      relationship_level: 'interested'
    });
  };

  const handleGuidanceApply = (guidance: any) => {
    // This would apply the guidance to the current conversation
    toast({
      title: "Guidance appliquée",
      description: "La guidance islamique a été intégrée à votre conversation"
    });
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement de l'interface de chat...</p>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Match introuvable</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b bg-gradient-to-r from-primary/5 to-secondary/5 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-10 w-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-primary-foreground" />
              </div>
              {match.can_communicate && (
                <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-background"></div>
              )}
            </div>
            <div>
              <h2 className="font-semibold">
                {isWaliView ? 'Supervision Familiale' : `Conversation avec ${match.other_user.full_name}`}
              </h2>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {match.match_score}% compatible
                </Badge>
                {match.family_supervision_required && (
                  <Badge variant="outline" className="text-xs">
                    <Shield className="h-3 w-3 mr-1" />
                    Supervisé
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Quick Actions */}
            <Button variant="ghost" size="sm" title="Notifications">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" title="Paramètres">
              <Settings className="h-4 w-4" />
            </Button>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                ×
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-4 bg-muted/50">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Chat</span>
            </TabsTrigger>
            <TabsTrigger value="guidance" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Guidance</span>
            </TabsTrigger>
            {(isWaliView || supervisionStatus.supervisionRequired) && (
              <TabsTrigger value="family" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Famille</span>
              </TabsTrigger>
            )}
            <TabsTrigger value="tools" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              <span className="hidden sm:inline">Outils</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="chat" className="h-full m-0">
              <RealTimeChat matchId={matchId} onClose={onClose} />
            </TabsContent>

            <TabsContent value="guidance" className="h-full m-0">
              <div className="flex h-full gap-4 p-4">
                <div className="flex-1">
                  <RealTimeChat matchId={matchId} />
                </div>
                <div className="w-1/3">
                  <IslamicGuidanceChat 
                    matchId={matchId}
                    conversationContext={conversationContext}
                    onApplyGuidance={handleGuidanceApply}
                  />
                </div>
              </div>
            </TabsContent>

            {(isWaliView || supervisionStatus.supervisionRequired) && (
              <TabsContent value="family" className="h-full m-0 p-4">
                <FamilyChatPanel matchId={matchId} />
              </TabsContent>
            )}

            <TabsContent value="tools" className="h-full m-0 p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
                {/* Communication Tools */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Video className="h-5 w-5" />
                      Appels Vidéo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Planifiez des appels vidéo supervisés avec approbation familiale
                    </p>
                    <Button size="sm" className="w-full">
                      <Video className="h-4 w-4 mr-2" />
                      Démarrer Appel
                    </Button>
                  </CardContent>
                </Card>

                {/* Audio Messages */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Mic className="h-5 w-5" />
                      Messages Audio
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Envoyez des messages audio respectueux et authentiques
                    </p>
                    <Button size="sm" variant="outline" className="w-full">
                      <Mic className="h-4 w-4 mr-2" />
                      Enregistrer
                    </Button>
                  </CardContent>
                </Card>

                {/* Conversation Analytics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Eye className="h-5 w-5" />
                      Analytiques
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Messages échangés:</span>
                        <span className="font-medium">{conversationContext?.message_count || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Durée:</span>
                        <span className="font-medium">{conversationContext?.duration_days || 0} jours</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Niveau:</span>
                        <Badge variant="secondary" className="text-xs">
                          {conversationContext?.relationship_level}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Meeting Scheduler */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Clock className="h-5 w-5" />
                      Planification
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Planifiez des rencontres avec supervision familiale
                    </p>
                    <Button size="sm" variant="outline" className="w-full">
                      <Clock className="h-4 w-4 mr-2" />
                      Planifier Rencontre
                    </Button>
                  </CardContent>
                </Card>

                {/* Islamic Reminders */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Heart className="h-5 w-5" />
                      Rappels Islamiques
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Recevez des rappels pour les prières et guidances
                    </p>
                    <Button size="sm" variant="outline" className="w-full">
                      <Bell className="h-4 w-4 mr-2" />
                      Configurer
                    </Button>
                  </CardContent>
                </Card>

                {/* Privacy Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Shield className="h-5 w-5" />
                      Confidentialité
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Gérez vos paramètres de confidentialité et supervision
                    </p>
                    <Button size="sm" variant="outline" className="w-full">
                      <Settings className="h-4 w-4 mr-2" />
                      Paramètres
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default ChatEnhancementHub;
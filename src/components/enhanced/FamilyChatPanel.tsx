import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFamilySupervision } from '@/hooks/useFamilySupervision';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  MessageCircle, 
  Shield, 
  Send, 
  Eye, 
  EyeOff, 
  Clock, 
  User, 
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  Settings,
  FileText,
  Heart,
  Star
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface FamilyMember {
  id: string;
  full_name: string;
  relationship: string;
  is_wali: boolean;
  can_communicate: boolean;
  can_view_profile: boolean;
  invitation_status: string;
  avatar_url?: string;
}

interface SupervisedConversation {
  id: string;
  match_id: string;
  supervised_user_name: string;
  candidate_name: string;
  last_message: {
    content: string;
    created_at: string;
    sender_id: string;
  };
  message_count: number;
  requires_attention: boolean;
  family_approved: boolean;
}

interface ConversationNote {
  id: string;
  match_id: string;
  family_member_id: string;
  note_type: 'observation' | 'concern' | 'approval' | 'guidance';
  content: string;
  created_at: string;
  is_private: boolean;
}

interface FamilyChatPanelProps {
  matchId?: string;
}

const FamilyChatPanel: React.FC<FamilyChatPanelProps> = ({ matchId }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { familyMembers, supervisionStatus } = useFamilySupervision();
  
  const [supervisedConversations, setSupervisedConversations] = useState<SupervisedConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(matchId || null);
  const [conversationNotes, setConversationNotes] = useState<ConversationNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [noteType, setNoteType] = useState<'observation' | 'concern' | 'approval' | 'guidance'>('observation');
  const [isPrivateNote, setIsPrivateNote] = useState(false);
  const [familyMessage, setFamilyMessage] = useState('');
  const [showGuidanceDialog, setShowGuidanceDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    fetchSupervisedConversations();
    if (selectedConversation) {
      fetchConversationNotes();
    }
  }, [user, selectedConversation]);

  const fetchSupervisedConversations = async () => {
    if (!user) return;

    try {
      // Get matches where user is a family supervisor
      const { data: matches, error } = await supabase
        .from('matches')
        .select(`
          id,
          user1_id,
          user2_id,
          family_approved,
          user1_profile:profiles!matches_user1_id_fkey(full_name),
          user2_profile:profiles!matches_user2_id_fkey(full_name)
        `)
        .in('user1_id', familyMembers.map(fm => fm.user_id || fm.id))
        .eq('family_supervision_required', true);

      if (error) throw error;

      const conversations = await Promise.all(
        (matches || []).map(async (match) => {
          // Get last message
          const { data: lastMessage } = await supabase
            .from('messages')
            .select('content, created_at, sender_id')
            .eq('match_id', match.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          // Get message count
          const { count: messageCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact' })
            .eq('match_id', match.id);

          // Check if requires attention (recent moderation flags)
          const { data: moderationFlags } = await supabase
            .from('moderation_logs')
            .select('*')
            .eq('match_id', match.id)
            .eq('action_taken', 'flagged')
            .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
            .limit(1);

          return {
            id: match.id,
            match_id: match.id,
            supervised_user_name: (match.user1_profile as any)?.full_name || 'Utilisateur',
            candidate_name: (match.user2_profile as any)?.full_name || 'Candidat',
            last_message: lastMessage || {
              content: 'Aucun message',
              created_at: (match as any).created_at || new Date().toISOString(),
              sender_id: ''
            },
            message_count: messageCount || 0,
            requires_attention: (moderationFlags?.length || 0) > 0,
            family_approved: match.family_approved || false
          };
        })
      );

      setSupervisedConversations(conversations);
    } catch (error) {
      console.error('Error fetching supervised conversations:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les conversations supervisées",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchConversationNotes = async () => {
    if (!selectedConversation) return;

    try {
      const { data, error } = await supabase
        .from('family_reviews')
        .select(`
          *,
          family_member:family_members(full_name, relationship)
        `)
        .eq('match_id', selectedConversation)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const notes: ConversationNote[] = (data || []).map(review => ({
        id: review.id,
        match_id: review.match_id,
        family_member_id: review.family_member_id,
        note_type: review.status === 'approved' ? 'approval' : 
                   review.status === 'rejected' ? 'concern' : 'observation',
        content: review.notes || '',
        created_at: review.created_at,
        is_private: false // For now, all notes are visible to family
      }));

      setConversationNotes(notes);
    } catch (error) {
      console.error('Error fetching conversation notes:', error);
    }
  };

  const addConversationNote = async () => {
    if (!newNote.trim() || !selectedConversation || !user) return;

    try {
      // Find current user's family member record
      const currentFamilyMember = familyMembers.find(fm => fm.invited_user_id === user.id || fm.user_id === user.id);
      if (!currentFamilyMember) {
        toast({
          title: "Erreur",
          description: "Vous n'êtes pas autorisé à ajouter des notes",
          variant: "destructive"
        });
        return;
      }

      const reviewData = {
        match_id: selectedConversation,
        family_member_id: currentFamilyMember.id,
        status: noteType === 'approval' ? 'approved' : 
                noteType === 'concern' ? 'rejected' : 'reviewed',
        notes: newNote.trim()
      };

      const { error } = await supabase
        .from('family_reviews')
        .insert(reviewData);

      if (error) throw error;

      setNewNote('');
      fetchConversationNotes();
      
      toast({
        title: "Note ajoutée",
        description: "Votre note a été ajoutée avec succès"
      });
    } catch (error) {
      console.error('Error adding note:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la note",
        variant: "destructive"
      });
    }
  };

  const sendFamilyMessage = async () => {
    if (!familyMessage.trim() || !selectedConversation || !user) return;

    try {
      const messageData = {
        match_id: selectedConversation,
        sender_id: user.id,
        content: `[Message de la famille] ${familyMessage.trim()}`,
        is_family_supervised: true
      };

      const { error } = await supabase
        .from('messages')
        .insert(messageData);

      if (error) throw error;

      setFamilyMessage('');
      
      toast({
        title: "Message envoyé",
        description: "Votre message de supervision a été envoyé"
      });
    } catch (error) {
      console.error('Error sending family message:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive"
      });
    }
  };

  const updateConversationApproval = async (approved: boolean) => {
    if (!selectedConversation) return;

    try {
      const { error } = await supabase
        .from('matches')
        .update({ family_approved: approved })
        .eq('id', selectedConversation);

      if (error) throw error;

      setSupervisedConversations(prev => prev.map(conv => 
        conv.id === selectedConversation 
          ? { ...conv, family_approved: approved }
          : conv
      ));

      toast({
        title: approved ? "Conversation approuvée" : "Approbation retirée",
        description: approved 
          ? "La conversation a été approuvée par la famille"
          : "L'approbation familiale a été retirée"
      });
    } catch (error) {
      console.error('Error updating approval:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'approbation",
        variant: "destructive"
      });
    }
  };

  const getConversationStatus = (conversation: SupervisedConversation) => {
    if (conversation.requires_attention) {
      return { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50', text: 'Attention requise' };
    }
    if (conversation.family_approved) {
      return { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50', text: 'Approuvée' };
    }
    return { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-50', text: 'En attente' };
  };

  const selectedConv = supervisedConversations.find(c => c.id === selectedConversation);

  if (loading) {
    return (
      <Card className="h-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
              <p className="text-muted-foreground">Chargement des conversations supervisées...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex h-full gap-4">
      {/* Conversations List */}
      <Card className="w-1/3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Conversations Supervisées
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {supervisedConversations.map((conversation) => {
              const status = getConversationStatus(conversation);
              const StatusIcon = status.icon;
              
              return (
                <div
                  key={conversation.id}
                  className={`p-4 cursor-pointer border-b hover:bg-accent/50 ${
                    selectedConversation === conversation.id ? 'bg-accent' : ''
                  }`}
                  onClick={() => setSelectedConversation(conversation.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">
                        {conversation.supervised_user_name} & {conversation.candidate_name}
                      </h4>
                      <p className="text-xs text-muted-foreground truncate">
                        {conversation.last_message.content}
                      </p>
                    </div>
                    <div className={`p-1 rounded-full ${status.bg}`}>
                      <StatusIcon className={`h-3 w-3 ${status.color}`} />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {conversation.message_count} msgs
                      </Badge>
                      {conversation.family_approved && (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(conversation.last_message.created_at), 'dd/MM HH:mm')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Main Panel */}
      <Card className="flex-1">
        {selectedConv ? (
          <>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  {selectedConv.supervised_user_name} & {selectedConv.candidate_name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant={selectedConv.family_approved ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateConversationApproval(!selectedConv.family_approved)}
                    className={selectedConv.family_approved ? "bg-green-600 hover:bg-green-700" : ""}
                  >
                    {selectedConv.family_approved ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approuvée
                      </>
                    ) : (
                      <>
                        <Star className="h-4 w-4 mr-1" />
                        Approuver
                      </>
                    )}
                  </Button>
                  
                  <Dialog open={showGuidanceDialog} onOpenChange={setShowGuidanceDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Heart className="h-4 w-4 mr-1" />
                        Guidance
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Guidance Islamique</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="p-4 bg-secondary/20 rounded-lg">
                          <h4 className="font-semibold mb-2">Conseils pour les conversations:</h4>
                          <ul className="text-sm space-y-1 text-muted-foreground">
                            <li>• Encouragez le respect mutuel et la courtoisie</li>
                            <li>• Rappelez l'importance de la pudeur dans les échanges</li>
                            <li>• Guidez vers des sujets constructifs et enrichissants</li>
                            <li>• Surveillez que les valeurs islamiques sont respectées</li>
                          </ul>
                        </div>
                        <Textarea
                          value={familyMessage}
                          onChange={(e) => setFamilyMessage(e.target.value)}
                          placeholder="Message de guidance à envoyer..."
                          rows={3}
                        />
                        <Button onClick={sendFamilyMessage} className="w-full">
                          <Send className="h-4 w-4 mr-2" />
                          Envoyer la Guidance
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Conversation Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-secondary/20 rounded-lg">
                  <MessageCircle className="h-5 w-5 mx-auto mb-1 text-primary" />
                  <p className="text-2xl font-bold">{selectedConv.message_count}</p>
                  <p className="text-xs text-muted-foreground">Messages</p>
                </div>
                <div className="text-center p-3 bg-secondary/20 rounded-lg">
                  <Clock className="h-5 w-5 mx-auto mb-1 text-primary" />
                  <p className="text-2xl font-bold">{conversationNotes.length}</p>
                  <p className="text-xs text-muted-foreground">Notes</p>
                </div>
                <div className="text-center p-3 bg-secondary/20 rounded-lg">
                  {selectedConv.family_approved ? (
                    <CheckCircle className="h-5 w-5 mx-auto mb-1 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 mx-auto mb-1 text-red-500" />
                  )}
                  <p className="text-sm font-medium">
                    {selectedConv.family_approved ? 'Approuvée' : 'En attente'}
                  </p>
                  <p className="text-xs text-muted-foreground">Statut</p>
                </div>
              </div>

              {/* Add Note Section */}
              <div className="space-y-4">
                <h4 className="font-semibold">Ajouter une note familiale</h4>
                <div className="flex gap-2">
                  <Select value={noteType} onValueChange={(value: any) => setNoteType(value)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="observation">Observation</SelectItem>
                      <SelectItem value="concern">Préoccupation</SelectItem>
                      <SelectItem value="approval">Approbation</SelectItem>
                      <SelectItem value="guidance">Guidance</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex-1 space-y-2">
                    <Textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Ajoutez votre note ou observation..."
                      rows={2}
                    />
                    <Button onClick={addConversationNote} size="sm">
                      <FileText className="h-4 w-4 mr-1" />
                      Ajouter Note
                    </Button>
                  </div>
                </div>
              </div>

              {/* Notes History */}
              <div className="space-y-4">
                <h4 className="font-semibold">Historique des notes</h4>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {conversationNotes.map((note) => (
                    <div key={note.id} className="p-3 border rounded-lg bg-secondary/10">
                      <div className="flex items-start justify-between mb-2">
                        <Badge 
                          variant={note.note_type === 'approval' ? 'default' : 
                                 note.note_type === 'concern' ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {note.note_type === 'observation' && 'Observation'}
                          {note.note_type === 'concern' && 'Préoccupation'}
                          {note.note_type === 'approval' && 'Approbation'}
                          {note.note_type === 'guidance' && 'Guidance'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(note.created_at), 'dd/MM/yyyy HH:mm', { locale: fr })}
                        </span>
                      </div>
                      <p className="text-sm">{note.content}</p>
                    </div>
                  ))}
                  
                  {conversationNotes.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Aucune note familiale pour cette conversation</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </>
        ) : (
          <CardContent className="p-6">
            <div className="text-center py-12">
              <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Aucune conversation sélectionnée</h3>
              <p className="text-muted-foreground">
                Sélectionnez une conversation à superviser dans la liste de gauche
              </p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default FamilyChatPanel;
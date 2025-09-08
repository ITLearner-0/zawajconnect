import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Heart,
  User,
  MapPin,
  Briefcase,
  Calendar,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  Shield
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MatchProfile {
  id: string;
  full_name: string;
  age?: number;
  profession?: string;
  location?: string;
  bio?: string;
  avatar_url?: string;
}

interface MatchApprovalData {
  id: string;
  user1_id: string;
  user2_id: string;
  match_score: number;
  created_at: string;
  can_communicate: boolean;
  family_approved?: boolean;
  family_notes?: string;
  user1_profile: MatchProfile;
  user2_profile: MatchProfile;
  supervised_user_id: string;
}

interface ApprovalDecision {
  approved: boolean;
  notes: string;
  conditions?: string[];
  meetingRequired?: boolean;
}

const MatchApprovalWorkflow: React.FC = () => {
  const [matches, setMatches] = useState<MatchApprovalData[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<MatchApprovalData | null>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [decision, setDecision] = useState<ApprovalDecision>({
    approved: false,
    notes: '',
    conditions: [],
    meetingRequired: false
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadMatchesForApproval();
  }, []);

  const loadMatchesForApproval = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Récupérer les matches nécessitant l'approbation du Wali
      const { data: familyMembers } = await supabase
        .from('family_members')
        .select('user_id')
        .eq('invited_user_id', user.id)
        .eq('invitation_status', 'accepted')
        .eq('is_wali', true);

      if (!familyMembers || familyMembers.length === 0) {
        setLoading(false);
        return;
      }

      const supervisedUserIds = familyMembers.map(fm => fm.user_id);

      const { data: matchesData } = await supabase
        .from('matches')
        .select(`
          id,
          user1_id,
          user2_id,
          match_score,
          created_at,
          can_communicate,
          family_approved,
          family_notes
        `)
        .in('user1_id', supervisedUserIds)
        .eq('is_mutual', true)
        .is('family_approved', null)
        .order('created_at', { ascending: false });

      if (matchesData) {
        const formattedMatches = matchesData.map(match => ({
          ...match,
          supervised_user_id: match.user1_id,
          user1_profile: {
            id: match.user1_id,
            full_name: 'Utilisateur supervisé'
          },
          user2_profile: {
            id: match.user2_id,
            full_name: 'Utilisateur'
          }
        }));
        setMatches(formattedMatches);
      }
    } catch (error) {
      console.error('Error loading matches for approval:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les matches pour approbation",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalDecision = async () => {
    if (!selectedMatch) return;

    try {
      // Créer une révision familiale
      const { error: reviewError } = await supabase
        .from('family_reviews')
        .insert({
          match_id: selectedMatch.id,
          family_member_id: selectedMatch.supervised_user_id, // À ajuster avec le bon ID du family_member
          status: decision.approved ? 'approved' : 'rejected',
          notes: decision.notes,
          reviewed_at: new Date().toISOString()
        });

      if (reviewError) throw reviewError;

      // Mettre à jour le match
      const { error: matchError } = await supabase
        .from('matches')
        .update({
          family_approved: decision.approved,
          can_communicate: decision.approved,
          family_reviewed_at: new Date().toISOString(),
          family_notes: decision.notes
        })
        .eq('id', selectedMatch.id);

      if (matchError) throw matchError;

      // Créer une notification pour l'utilisateur supervisé
      await supabase.functions.invoke('send-family-notification', {
        body: {
          userId: selectedMatch.supervised_user_id,
          type: decision.approved ? 'match_approved' : 'match_rejected',
          title: decision.approved ? 'Match approuvé par votre famille' : 'Match refusé par votre famille',
          content: `Votre famille a ${decision.approved ? 'approuvé' : 'refusé'} le match avec ${selectedMatch.user2_profile.full_name}. ${decision.notes}`,
          matchId: selectedMatch.id
        }
      });

      // Supprimer de la liste locale
      setMatches(prev => prev.filter(match => match.id !== selectedMatch.id));
      setShowApprovalDialog(false);
      setSelectedMatch(null);
      setDecision({ approved: false, notes: '', conditions: [], meetingRequired: false });

      toast({
        title: decision.approved ? "Match approuvé" : "Match refusé",
        description: decision.approved 
          ? "La communication est maintenant autorisée"
          : "Le match a été refusé selon vos directives",
        variant: decision.approved ? "default" : "destructive"
      });

    } catch (error) {
      console.error('Error processing approval decision:', error);
      toast({
        title: "Erreur",
        description: "Impossible de traiter la décision d'approbation",
        variant: "destructive"
      });
    }
  };

  const openApprovalDialog = (match: MatchApprovalData, approved: boolean) => {
    setSelectedMatch(match);
    setDecision({ 
      approved, 
      notes: '', 
      conditions: [], 
      meetingRequired: false 
    });
    setShowApprovalDialog(true);
  };

  const getCompatibilityColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCompatibilityBadge = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des matches à approuver...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-primary/10 rounded-full">
          <Shield className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Approbation des Matches</h1>
          <p className="text-muted-foreground">
            Validez les matches selon les valeurs familiales islamiques
          </p>
        </div>
      </div>

      {/* Matches en attente */}
      <div className="space-y-4">
        {matches.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun match en attente</h3>
              <p className="text-muted-foreground">
                Tous les matches ont été traités ou aucun nouveau match n'a été créé
              </p>
            </CardContent>
          </Card>
        ) : (
          matches.map((match) => (
            <Card key={match.id} className="border-l-4 border-l-yellow-500">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-primary" />
                    Nouveau Match Détecté
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={getCompatibilityBadge(match.match_score)}>
                      Compatibilité: {match.match_score}%
                    </Badge>
                    <Badge variant="outline">
                      {new Date(match.created_at).toLocaleDateString('fr-FR')}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profils */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Utilisateur supervisé */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-primary flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Utilisateur Supervisé
                    </h4>
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium">{match.user1_profile.full_name}</h5>
                        {match.user1_profile.age && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {match.user1_profile.age} ans
                          </p>
                        )}
                        {match.user1_profile.profession && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Briefcase className="h-3 w-3" />
                            {match.user1_profile.profession}
                          </p>
                        )}
                        {match.user1_profile.location && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {match.user1_profile.location}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Match potentiel */}
                  <div className="space-y-3">
                    <h4 className="font-semibold">Match Potentiel</h4>
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-secondary-foreground" />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium">{match.user2_profile.full_name}</h5>
                        {match.user2_profile.age && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {match.user2_profile.age} ans
                          </p>
                        )}
                        {match.user2_profile.profession && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Briefcase className="h-3 w-3" />
                            {match.user2_profile.profession}
                          </p>
                        )}
                        {match.user2_profile.location && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {match.user2_profile.location}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bio du match potentiel */}
                {match.user2_profile.bio && (
                  <Alert>
                    <MessageSquare className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Présentation:</strong> {match.user2_profile.bio}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => openApprovalDialog(match, false)}
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Refuser le Match
                  </Button>
                  <Button
                    onClick={() => openApprovalDialog(match, true)}
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approuver le Match
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Dialog d'approbation/refus */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {decision.approved ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              {decision.approved ? 'Approuver le Match' : 'Refuser le Match'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                {decision.approved ? (
                  'Vous autorisez la communication entre ces deux personnes selon les principes islamiques.'
                ) : (
                  'Vous refusez ce match. Veuillez expliquer les raisons à votre famille.'
                )}
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Notes pour la famille {decision.approved ? '(optionnel)' : '(obligatoire)'}
              </label>
              <Textarea
                value={decision.notes}
                onChange={(e) => setDecision(prev => ({ ...prev, notes: e.target.value }))}
                placeholder={
                  decision.approved 
                    ? "Conditions ou recommandations pour cette communication..."
                    : "Expliquez les raisons de ce refus..."
                }
                rows={4}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowApprovalDialog(false)}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                onClick={handleApprovalDecision}
                className="flex-1"
                disabled={!decision.approved && !decision.notes.trim()}
              >
                <Send className="h-4 w-4 mr-2" />
                Confirmer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MatchApprovalWorkflow;
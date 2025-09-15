import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Shield, Heart, Users, Clock, CheckCircle, XCircle, MessageSquare, Star, MapPin, Calendar } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface PendingMatch {
  id: string;
  user1_id: string;
  user2_id: string;
  match_score: number;
  created_at: string;
  family_supervision_required: boolean;
  family1_approved?: boolean;
  family2_approved?: boolean;
  other_user: {
    user_id: string;
    full_name: string;
    age: number;
    location: string;
    profession: string;
    avatar_url?: string;
    bio?: string;
  };
  compatibility_details: {
    islamic_score: number;
    cultural_score: number;
    personality_score: number;
    shared_values: string[];
  };
}

interface FamilyReview {
  id: string;
  match_id: string;
  family_member_id: string;
  status: 'approved' | 'rejected' | 'needs_discussion';
  notes?: string;
  reviewed_at: string;
  reviewer_name: string;
  reviewer_relationship: string;
}

const FamilyApprovalWorkflow = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [pendingMatches, setPendingMatches] = useState<PendingMatch[]>([]);
  const [approvedMatches, setApprovedMatches] = useState<PendingMatch[]>([]);
  const [familyReviews, setFamilyReviews] = useState<FamilyReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      fetchMatchesForApproval();
      fetchFamilyReviews();
    }
  }, [user]);

  const fetchMatchesForApproval = async () => {
    if (!user) return;
    
    try {
      // Fetch matches that need family approval
      const { data: matchesData } = await supabase
        .from('matches')
        .select(`
          id,
          user1_id,
          user2_id,
          match_score,
          created_at,
          family_supervision_required,
          family1_approved,
          family2_approved,
          is_mutual
        `)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .eq('is_mutual', true)
        .eq('family_supervision_required', true);

      if (matchesData) {
        // Get other user profiles for each match
        const matchesWithProfiles = await Promise.all(
          matchesData.map(async (match) => {
            const otherUserId = match.user1_id === user.id ? match.user2_id : match.user1_id;
            
            const { data: profileData } = await supabase
              .from('profiles')
              .select('user_id, full_name, age, location, profession, avatar_url, bio')
              .eq('user_id', otherUserId)
              .maybeSingle();

            // Simulate compatibility details (in real app, this would come from stored analysis)
            const compatibility_details = {
              islamic_score: Math.floor(Math.random() * 20) + 80,
              cultural_score: Math.floor(Math.random() * 25) + 75,
              personality_score: Math.floor(Math.random() * 30) + 70,
              shared_values: ['Pratique religieuse', 'Valeurs familiales', 'Éducation']
            };

            return {
              ...match,
              other_user: profileData,
              compatibility_details
            };
          })
        );

        // Separate pending and approved matches
        const pending = matchesWithProfiles.filter(match => 
          match.user1_id === user.id ? !match.family1_approved : !match.family2_approved
        );
        const approved = matchesWithProfiles.filter(match => 
          match.user1_id === user.id ? match.family1_approved : match.family2_approved
        );

        setPendingMatches(pending);
        setApprovedMatches(approved);
      }
    } catch (error) {
      console.error('Error fetching matches for approval:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les matches en attente",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFamilyReviews = async () => {
    if (!user) return;

    try {
      const { data: reviewsData } = await supabase
        .from('family_reviews')
        .select(`
          id,
          match_id,
          family_member_id,
          status,
          notes,
          reviewed_at,
          family_members!inner(
            full_name,
            relationship
          )
        `)
        .in('match_id', pendingMatches.map(m => m.id));

      if (reviewsData) {
        const reviews: FamilyReview[] = reviewsData.map(review => ({
          id: review.id,
          match_id: review.match_id,
          family_member_id: review.family_member_id,
          status: review.status as 'approved' | 'rejected' | 'needs_discussion',
          notes: review.notes || undefined,
          reviewed_at: review.reviewed_at,
          reviewer_name: (review.family_members as any)?.full_name || 'Famille',
          reviewer_relationship: (review.family_members as any)?.relationship || 'Membre'
        }));

        setFamilyReviews(reviews);
      }
    } catch (error) {
      console.error('Error fetching family reviews:', error);
    }
  };

  const handleFamilyDecision = async (
    matchId: string, 
    decision: 'approved' | 'rejected' | 'needs_discussion'
  ) => {
    if (!user) return;

    try {
      // Update match approval status
      const match = pendingMatches.find(m => m.id === matchId);
      if (!match) return;

      const updateField = match.user1_id === user.id ? 'family1_approved' : 'family2_approved';
      const approved = decision === 'approved';

      const { error: matchError } = await supabase
        .from('matches')
        .update({ [updateField]: approved })
        .eq('id', matchId);

      if (matchError) throw matchError;

      // Create family review record
      const { data: familyMember } = await supabase
        .from('family_members')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_wali', true)
        .maybeSingle();

      if (familyMember) {
        const { error: reviewError } = await supabase
          .from('family_reviews')
          .insert({
            match_id: matchId,
            family_member_id: familyMember.id,
            status: decision,
            notes: reviewNotes[matchId] || null
          });

        if (reviewError) throw reviewError;
      }

      // Refresh data
      await fetchMatchesForApproval();
      
      toast({
        title: decision === 'approved' ? "Match approuvé" : "Décision enregistrée",
        description: decision === 'approved' 
          ? "Le match a été approuvé par la famille" 
          : "Votre décision a été enregistrée",
      });

      // Clear notes
      setReviewNotes(prev => {
        const updated = { ...prev };
        delete updated[matchId];
        return updated;
      });

    } catch (error) {
      console.error('Error updating family decision:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer la décision",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'rejected': return 'text-red-600 bg-red-50 border-red-200';
      case 'needs_discussion': return 'text-amber-600 bg-amber-50 border-amber-200';
      default: return 'text-muted-foreground bg-muted border-border';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-600';
    if (score >= 75) return 'text-gold-600';
    if (score >= 65) return 'text-sage-600';
    return 'text-muted-foreground';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-semibold">Workflow d'Approbation Familiale</h2>
        </div>
        <p className="text-muted-foreground">
          Système de validation familiale pour les matches selon les valeurs islamiques
        </p>
      </div>

      {/* Approval Workflow Tabs */}
      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            En Attente ({pendingMatches.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Approuvés ({approvedMatches.length})
          </TabsTrigger>
          <TabsTrigger value="reviews" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Avis Famille ({familyReviews.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingMatches.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucun match en attente</h3>
                <p className="text-muted-foreground">
                  Tous vos matches ont été approuvés ou sont en cours de révision
                </p>
              </CardContent>
            </Card>
          ) : (
            pendingMatches.map((match) => (
              <Card key={match.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5 text-primary" />
                      Nouveau Match - Approbation Requise
                    </CardTitle>
                    <Badge variant="outline" className="text-amber-600 border-amber-300">
                      <Clock className="h-3 w-3 mr-1" />
                      En attente
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* User Profile */}
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={match.other_user.avatar_url} />
                      <AvatarFallback>
                        {match.other_user.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 space-y-2">
                      <div>
                        <h4 className="font-semibold text-lg">{match.other_user.full_name}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{match.other_user.age} ans</span>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {match.other_user.location}
                          </div>
                          <span>{match.other_user.profession}</span>
                        </div>
                      </div>
                      
                      {match.other_user.bio && (
                        <p className="text-sm text-muted-foreground">
                          {match.other_user.bio}
                        </p>
                      )}
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary mb-1">
                        {match.match_score}%
                      </div>
                      <p className="text-sm text-muted-foreground">Compatibilité</p>
                    </div>
                  </div>

                  {/* Compatibility Breakdown */}
                  <div className="bg-sage-50 p-4 rounded-lg border border-sage-200">
                    <h5 className="font-medium mb-3 flex items-center gap-2">
                      <Star className="h-4 w-4 text-gold-600" />
                      Analyse de Compatibilité
                    </h5>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className={`text-lg font-bold ${getScoreColor(match.compatibility_details.islamic_score)}`}>
                          {match.compatibility_details.islamic_score}%
                        </div>
                        <p className="text-muted-foreground">Islamique</p>
                      </div>
                      <div className="text-center">
                        <div className={`text-lg font-bold ${getScoreColor(match.compatibility_details.cultural_score)}`}>
                          {match.compatibility_details.cultural_score}%
                        </div>
                        <p className="text-muted-foreground">Culturel</p>
                      </div>
                      <div className="text-center">
                        <div className={`text-lg font-bold ${getScoreColor(match.compatibility_details.personality_score)}`}>
                          {match.compatibility_details.personality_score}%
                        </div>
                        <p className="text-muted-foreground">Personnalité</p>
                      </div>
                    </div>
                    
                    {match.compatibility_details.shared_values.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium mb-2">Valeurs partagées:</p>
                        <div className="flex flex-wrap gap-2">
                          {match.compatibility_details.shared_values.map((value, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {value}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Family Review Notes */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Notes de la famille (optionnel):
                    </label>
                    <Textarea
                      placeholder="Ajoutez vos commentaires ou préoccupations sur ce match..."
                      value={reviewNotes[match.id] || ''}
                      onChange={(e) => setReviewNotes(prev => ({ ...prev, [match.id]: e.target.value }))}
                      className="min-h-[80px]"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approuver ce Match
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Approuver ce match ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            En approuvant ce match, vous autorisez la communication entre votre proche et cette personne selon les valeurs islamiques de supervision familiale.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleFamilyDecision(match.id, 'approved')}
                            className="bg-emerald-600 hover:bg-emerald-700"
                          >
                            Approuver
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleFamilyDecision(match.id, 'needs_discussion')}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Demander Discussion
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="flex-1">
                          <XCircle className="h-4 w-4 mr-2" />
                          Refuser
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Refuser ce match ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Cette action refusera définitivement ce match. Êtes-vous sûr de votre décision ?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleFamilyDecision(match.id, 'rejected')}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Refuser
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>

                  {/* Match Timeline */}
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    Match créé le {new Date(match.created_at).toLocaleDateString('fr-FR')}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {approvedMatches.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucun match approuvé</h3>
                <p className="text-muted-foreground">
                  Les matches approuvés par la famille apparaîtront ici
                </p>
              </CardContent>
            </Card>
          ) : (
            approvedMatches.map((match) => (
              <Card key={match.id} className="border-emerald-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={match.other_user.avatar_url} />
                      <AvatarFallback>
                        {match.other_user.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <h4 className="font-semibold">{match.other_user.full_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {match.other_user.age} ans • {match.other_user.location}
                      </p>
                    </div>

                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Approuvé par la famille
                    </Badge>

                    <Button>
                      Voir la conversation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          {familyReviews.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucun avis famille</h3>
                <p className="text-muted-foreground">
                  Les avis et commentaires de la famille apparaîtront ici
                </p>
              </CardContent>
            </Card>
          ) : (
            familyReviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{review.reviewer_name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {review.reviewer_relationship}
                        </Badge>
                        <Badge className={getStatusColor(review.status)}>
                          {review.status === 'approved' ? 'Approuvé' :
                           review.status === 'rejected' ? 'Refusé' : 'Discussion nécessaire'}
                        </Badge>
                      </div>
                      
                      {review.notes && (
                        <p className="text-sm text-muted-foreground mb-2">
                          "{review.notes}"
                        </p>
                      )}
                      
                      <p className="text-xs text-muted-foreground">
                        {new Date(review.reviewed_at).toLocaleDateString('fr-FR')} à {new Date(review.reviewed_at).toLocaleTimeString('fr-FR')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FamilyApprovalWorkflow;
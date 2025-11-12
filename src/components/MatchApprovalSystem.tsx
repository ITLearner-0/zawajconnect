import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Heart, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  MessageSquare,
  User,
  MapPin,
  GraduationCap,
  Briefcase,
  Star,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsTrigger } from '@/components/ui/tabs';
import { ResponsiveTabsList } from '@/components/ui/responsive-tabs-list';

interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  match_score: number;
  is_mutual: boolean;
  family_approved: boolean;
  family1_approved: boolean;
  family2_approved: boolean;
  family_supervision_required: boolean;
  created_at: string;
  user1: {
    full_name: string;
    age: number;
    location: string;
    profession: string;
    education: string;
    bio: string;
    avatar_url?: string;
  };
  user2: {
    full_name: string;
    age: number;
    location: string;
    profession: string;
    education: string;
    bio: string;
    avatar_url?: string;
  };
  pending_reviews: FamilyReview[];
}

interface FamilyReview {
  id: string;
  family_member_id: string;
  status: string;
  notes?: string;
  reviewed_at?: string;
  family_member: {
    full_name: string;
    relationship: string;
    is_wali: boolean;
  };
}

const MatchApprovalSystem = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');

  useEffect(() => {
    fetchPendingMatches();
  }, [user]);

  const fetchPendingMatches = async () => {
    if (!user) return;

    try {
      // Get matches where the current user is a family member who can approve
      const { data: familyMembers } = await supabase
        .from('family_members')
        .select('user_id')
        .eq('invited_user_id', user.id)
        .eq('invitation_status', 'accepted')
        .eq('can_view_profile', true);

      if (!familyMembers || familyMembers.length === 0) {
        setMatches([]);
        setLoading(false);
        return;
      }

      const supervisedUserIds = familyMembers.map(fm => fm.user_id);

      // Get matches for supervised users that need family approval
      const { data: matchesData, error } = await supabase
        .from('matches')
        .select('*')
        .or(supervisedUserIds.map(id => `user1_id.eq.${id},user2_id.eq.${id}`).join(','))
        .eq('family_supervision_required', true)
        .or('family1_approved.is.null,family2_approved.is.null,family_approved.is.null')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get family reviews for these matches
      const matchIds = matchesData?.map(m => m.id) || [];
      const { data: reviewsData } = await supabase
        .from('family_reviews')
        .select(`
          *,
          family_member:family_members(full_name, relationship, is_wali)
        `)
        .in('match_id', matchIds);

      // Combine matches with their reviews
      const matchesWithReviews = matchesData?.map(match => ({
        ...match,
        match_score: match.match_score ?? 0,
        is_mutual: match.is_mutual ?? false,
        family_approved: match.family_approved ?? false,
        family1_approved: match.family1_approved ?? false,
        family2_approved: match.family2_approved ?? false,
        can_communicate: match.can_communicate ?? false,
        user1: { full_name: 'User 1', age: 25, location: 'Location', profession: 'Profession', education: 'Education', bio: 'Bio', avatar_url: '' },
        user2: { full_name: 'User 2', age: 25, location: 'Location', profession: 'Profession', education: 'Education', bio: 'Bio', avatar_url: '' },
        pending_reviews: reviewsData?.filter(r => r.match_id === match.id) || []
      })) as Match[];

      setMatches(matchesWithReviews || []);
    } catch (error) {
      console.error('Error fetching pending matches:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les matches en attente",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async (matchId: string, status: 'approved' | 'declined') => {
    if (!user) return;

    try {
      // Get the current user's family member record for this match
      const { data: familyMember } = await supabase
        .from('family_members')
        .select('id')
        .eq('invited_user_id', user.id)
        .eq('invitation_status', 'accepted')
        .maybeSingle();

      if (!familyMember) {
        throw new Error('Family member not found');
      }

      // Submit the review
      const { error: reviewError } = await supabase
        .from('family_reviews')
        .upsert({
          match_id: matchId,
          family_member_id: familyMember.id,
          status,
          notes: reviewNotes,
          reviewed_at: new Date().toISOString()
        });

      if (reviewError) throw reviewError;

      // Check if all required reviews are complete and update match status
      const { data: allReviews } = await supabase
        .from('family_reviews')
        .select('status, family_member:family_members(is_wali)')
        .eq('match_id', matchId);

      const waliReviews = allReviews?.filter(r => r.family_member?.is_wali) || [];
      const allWaliApproved = waliReviews.length > 0 && waliReviews.every(r => r.status === 'approved');
      const anyWaliDeclined = waliReviews.some(r => r.status === 'declined');

      // Update match approval status
      const updateData: any = {};
      if (anyWaliDeclined) {
        updateData.family_approved = false;
      } else if (allWaliApproved) {
        updateData.family_approved = true;
        updateData.can_communicate = true;
      }

      if (Object.keys(updateData).length > 0) {
        await supabase
          .from('matches')
          .update(updateData)
          .eq('id', matchId);
      }

      toast({
        title: status === 'approved' ? "Match approuvé" : "Match refusé",
        description: `Votre décision a été enregistrée${allWaliApproved ? ' et le couple peut maintenant communiquer' : ''}`,
      });

      setReviewNotes('');
      setSelectedMatch(null);
      fetchPendingMatches();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer votre décision",
        variant: "destructive"
      });
    }
  };

  const getMatchStatus = (match: Match) => {
    if (match.family_approved === false) {
      return { status: 'declined', label: 'Refusé', color: 'destructive' };
    }
    if (match.family_approved === true) {
      return { status: 'approved', label: 'Approuvé', color: 'default' };
    }
    return { status: 'pending', label: 'En attente', color: 'outline' };
  };

  const getCurrentUserRole = (match: Match) => {
    // This would be determined by checking family member relationships
    return 'Wali'; // Simplified for now
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald border-t-transparent mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement des matches en attente...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-emerald" />
            Approbation des Matches
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Examinez et approuvez les matches de vos proches selon les principes islamiques
          </p>
        </CardHeader>
      </Card>

      {/* Matches List */}
      <div className="grid gap-4">
        {matches.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-12 w-12 text-emerald mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun match en attente</h3>
              <p className="text-muted-foreground">
                Tous les matches ont été examinés ou il n'y a pas de nouveaux matches à approuver
              </p>
            </CardContent>
          </Card>
        ) : (
          matches.map((match) => {
            const matchStatus = getMatchStatus(match);
            const supervisedUser = match.user1_id !== user?.id ? match.user1 : match.user2;
            const otherUser = match.user1_id !== user?.id ? match.user2 : match.user1;
            
            return (
              <Card key={match.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Badge variant={matchStatus.color as any} className="mb-2">
                        {matchStatus.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                        {matchStatus.status === 'approved' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {matchStatus.status === 'declined' && <XCircle className="h-3 w-3 mr-1" />}
                        {matchStatus.label}
                      </Badge>
                      <Badge variant="outline">
                        <Star className="h-3 w-3 mr-1" />
                        {match.match_score}% compatible
                      </Badge>
                      <Badge variant="secondary">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(match.created_at).toLocaleDateString()}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Supervised User */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-emerald">
                        <Users className="h-4 w-4" />
                        Personne supervisée
                      </div>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={supervisedUser.avatar_url} />
                          <AvatarFallback>{supervisedUser.full_name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{supervisedUser.full_name}</h3>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {supervisedUser.age} ans
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {supervisedUser.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Briefcase className="h-3 w-3" />
                              {supervisedUser.profession}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Potential Partner */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
                        <Heart className="h-4 w-4" />
                        Partenaire potentiel
                      </div>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={otherUser.avatar_url} />
                          <AvatarFallback>{otherUser.full_name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{otherUser.full_name}</h3>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {otherUser.age} ans
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {otherUser.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Briefcase className="h-3 w-3" />
                              {otherUser.profession}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Reviews Status */}
                  {match.pending_reviews.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">Avis de la famille :</h4>
                      <div className="flex flex-wrap gap-2">
                        {match.pending_reviews.map((review) => (
                          <Badge
                            key={review.id}
                            variant={review.status === 'approved' ? 'default' : review.status === 'declined' ? 'destructive' : 'outline'}
                            className="text-xs"
                          >
                            {review.family_member.full_name} ({review.family_member.relationship})
                            {review.family_member.is_wali && ' - Wali'}
                            : {review.status === 'approved' ? 'Approuvé' : review.status === 'declined' ? 'Refusé' : 'En attente'}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <Separator className="my-4" />

                  {/* Actions */}
                  <div className="flex justify-between items-center">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" onClick={() => setSelectedMatch(match)}>
                          Voir les détails
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Évaluation du Match</DialogTitle>
                        </DialogHeader>
                        
                        <Tabs defaultValue="profiles" className="space-y-6">
                          <ResponsiveTabsList tabCount={3}>
                            <TabsTrigger value="profiles">Profils</TabsTrigger>
                            <TabsTrigger value="compatibility">Compatibilité</TabsTrigger>
                            <TabsTrigger value="review">Évaluation</TabsTrigger>
                          </ResponsiveTabsList>

                          <TabsContent value="profiles" className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">{supervisedUser.full_name}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <User className="h-4 w-4" />
                                      <span>{supervisedUser.age} ans</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <MapPin className="h-4 w-4" />
                                      <span>{supervisedUser.location}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <GraduationCap className="h-4 w-4" />
                                      <span>{supervisedUser.education}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Briefcase className="h-4 w-4" />
                                      <span>{supervisedUser.profession}</span>
                                    </div>
                                  </div>
                                  <Separator />
                                  <div>
                                    <h4 className="font-medium mb-2">À propos</h4>
                                    <p className="text-sm text-muted-foreground">{supervisedUser.bio}</p>
                                  </div>
                                </CardContent>
                              </Card>

                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">{otherUser.full_name}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <User className="h-4 w-4" />
                                      <span>{otherUser.age} ans</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <MapPin className="h-4 w-4" />
                                      <span>{otherUser.location}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <GraduationCap className="h-4 w-4" />
                                      <span>{otherUser.education}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Briefcase className="h-4 w-4" />
                                      <span>{otherUser.profession}</span>
                                    </div>
                                  </div>
                                  <Separator />
                                  <div>
                                    <h4 className="font-medium mb-2">À propos</h4>
                                    <p className="text-sm text-muted-foreground">{otherUser.bio}</p>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          </TabsContent>

                          <TabsContent value="compatibility" className="space-y-4">
                            <Card>
                              <CardHeader>
                                <CardTitle>Score de compatibilité : {match.match_score}%</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-4">
                                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-gradient-to-r from-emerald to-gold transition-all"
                                      style={{ width: `${match.match_score}%` }}
                                    />
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    Ce score est basé sur la compatibilité des valeurs islamiques, des objectifs de vie, 
                                    et des préférences personnelles des deux personnes.
                                  </p>
                                </div>
                              </CardContent>
                            </Card>
                          </TabsContent>

                          <TabsContent value="review" className="space-y-4">
                            {matchStatus.status === 'pending' && (
                              <Card>
                                <CardHeader>
                                  <CardTitle>Votre évaluation en tant que {getCurrentUserRole(match)}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                  <div>
                                    <label className="text-sm font-medium mb-2 block">
                                      Notes et commentaires (optionnel)
                                    </label>
                                    <Textarea
                                      value={reviewNotes}
                                      onChange={(e) => setReviewNotes(e.target.value)}
                                      placeholder="Partagez vos réflexions sur ce match du point de vue islamique..."
                                      rows={4}
                                    />
                                  </div>
                                  
                                  <div className="flex gap-4 pt-4">
                                    <Button
                                      onClick={() => submitReview(match.id, 'approved')}
                                      className="flex-1 bg-emerald hover:bg-emerald-dark"
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Approuver ce match
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      onClick={() => submitReview(match.id, 'declined')}
                                      className="flex-1"
                                    >
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Refuser ce match
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                            
                            {matchStatus.status !== 'pending' && (
                              <Card>
                                <CardContent className="pt-6 text-center">
                                  {matchStatus.status === 'approved' ? (
                                    <div className="space-y-2">
                                      <CheckCircle className="h-8 w-8 text-emerald mx-auto" />
                                      <p className="font-medium text-emerald">Match approuvé</p>
                                      <p className="text-sm text-muted-foreground">
                                        Ce match a été approuvé par la famille
                                      </p>
                                    </div>
                                  ) : (
                                    <div className="space-y-2">
                                      <XCircle className="h-8 w-8 text-destructive mx-auto" />
                                      <p className="font-medium text-destructive">Match refusé</p>
                                      <p className="text-sm text-muted-foreground">
                                        Ce match a été refusé par la famille
                                      </p>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            )}
                          </TabsContent>
                        </Tabs>
                      </DialogContent>
                    </Dialog>

                    {matchStatus.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => submitReview(match.id, 'approved')}
                          className="bg-emerald hover:bg-emerald-dark"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approuver
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => submitReview(match.id, 'declined')}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Refuser
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MatchApprovalSystem;
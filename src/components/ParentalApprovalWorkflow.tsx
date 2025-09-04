import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Calendar,
  Heart,
  Star,
  AlertTriangle,
  FileText,
  Crown,
  Shield,
  ThumbsUp,
  ThumbsDown,
  Eye
} from 'lucide-react';

interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  match_score: number;
  is_mutual: boolean;
  created_at: string;
  profiles: {
    full_name: string;
    age: number;
    location: string;
    profession: string;
    avatar_url?: string;
    bio?: string;
  };
}

interface FamilyMember {
  id: string;
  full_name: string;
  relationship: string;
  is_wali: boolean;
  can_communicate: boolean;
}

interface FamilyReview {
  id: string;
  match_id: string;
  family_member_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'needs_discussion';
  notes?: string;
  reviewed_at?: string;
  family_member: FamilyMember;
}

const ParentalApprovalWorkflow = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [matches, setMatches] = useState<Match[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [reviews, setReviews] = useState<Record<string, FamilyReview[]>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    if (user) {
      fetchMatches();
      fetchFamilyMembers();
    }
  }, [user]);

  const fetchMatches = async () => {
    if (!user) return;

    try {
      // Fetch matches for users where current user is a family member
      const { data: familyData, error: familyError } = await supabase
        .from('family_members')
        .select('user_id')
        .eq('email', user.email);

      if (familyError) throw familyError;

      if (familyData && familyData.length > 0) {
        const userIds = familyData.map(f => f.user_id);
        
        const { data: matchesData, error: matchesError } = await supabase
          .from('matches')
          .select('*')
          .in('user1_id', userIds)
          .eq('is_mutual', true)
          .order('created_at', { ascending: false });

        if (matchesError) throw matchesError;

        // Fetch profiles for each match
        const matchesWithProfiles = await Promise.all(
          (matchesData || []).map(async (match) => {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', match.user2_id)
              .single();

            return {
              ...match,
              profiles: profileData || {
                full_name: 'Utilisateur',
                age: 0,
                location: '',
                profession: '',
                avatar_url: undefined,
                bio: ''
              }
            };
          })
        );

        setMatches(matchesWithProfiles);
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFamilyMembers = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('family_members')
        .select('*')
        .eq('email', user.email);

      if (error) throw error;
      setFamilyMembers(data || []);
    } catch (error) {
      console.error('Error fetching family members:', error);
    }
  };

  const handleReview = async (matchId: string, status: 'approved' | 'rejected', notes?: string) => {
    try {
      // For now, we'll use notifications to track family reviews
      const { error } = await supabase.rpc('create_notification', {
        target_user_id: matches.find(m => m.id === matchId)?.user1_id,
        notification_type: 'family_review',
        notification_title: `Avis familial: ${status === 'approved' ? 'Approuvé' : 'Non approuvé'}`,
        notification_content: notes || `La famille a ${status === 'approved' ? 'approuvé' : 'exprimé des réserves sur'} ce match.`,
        sender_user_id: user?.id
      });

      if (error) throw error;

      toast({
        title: status === 'approved' ? "Match approuvé" : "Réserves exprimées",
        description: `Votre avis a été transmis à la famille.`
      });

      // Update local state
      setReviews(prev => ({
        ...prev,
        [matchId]: [
          ...(prev[matchId] || []),
          {
            id: Date.now().toString(),
            match_id: matchId,
            family_member_id: user?.id || '',
            status: status,
            notes: notes,
            reviewed_at: new Date().toISOString(),
            family_member: {
              id: user?.id || '',
              full_name: user?.email || '',
              relationship: 'famille',
              is_wali: false,
              can_communicate: true
            }
          }
        ]
      }));

    } catch (error) {
      console.error('Error recording family review:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer votre avis",
        variant: "destructive"
      });
    }
  };

  const scheduleDiscussion = async (matchId: string) => {
    try {
      await supabase.rpc('create_notification', {
        target_user_id: matches.find(m => m.id === matchId)?.user1_id,
        notification_type: 'family_meeting',
        notification_title: 'Réunion familiale programmée',
        notification_content: 'Une discussion familiale a été programmée pour examiner ce match.',
        sender_user_id: user?.id
      });

      toast({
        title: "Discussion programmée",
        description: "Une réunion familiale a été programmée"
      });

    } catch (error) {
      console.error('Error scheduling discussion:', error);
      toast({
        title: "Erreur",
        description: "Impossible de programmer la discussion",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const pendingMatches = matches.filter(m => !reviews[m.id]?.length);
  const reviewedMatches = matches.filter(m => reviews[m.id]?.length);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
          <Shield className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Processus d'Approbation Familiale</h2>
          <p className="text-muted-foreground">
            Examinez et donnez votre avis selon les traditions islamiques
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">À examiner</p>
                <p className="text-2xl font-bold">{pendingMatches.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Eye className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Examinés</p>
                <p className="text-2xl font-bold">{reviewedMatches.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Heart className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Matches mutuels</p>
                <p className="text-2xl font-bold">{matches.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Famille</p>
                <p className="text-2xl font-bold">{familyMembers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">
            À examiner ({pendingMatches.length})
          </TabsTrigger>
          <TabsTrigger value="reviewed">
            Examinés ({reviewedMatches.length})
          </TabsTrigger>
          <TabsTrigger value="guidance">
            Guidance islamique
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingMatches.length > 0 ? (
            pendingMatches.map((match) => (
              <MatchReviewCard
                key={match.id}
                match={match}
                onApprove={(notes) => handleReview(match.id, 'approved', notes)}
                onReject={(notes) => handleReview(match.id, 'rejected', notes)}
                onScheduleDiscussion={() => scheduleDiscussion(match.id)}
                showActions={true}
              />
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Tous les matches ont été examinés</h3>
                <p className="text-muted-foreground">
                  Il n'y a actuellement aucun nouveau match à examiner.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="reviewed" className="space-y-4">
          {reviewedMatches.map((match) => (
            <MatchReviewCard
              key={match.id}
              match={match}
              reviews={reviews[match.id] || []}
              showActions={false}
            />
          ))}
        </TabsContent>

        <TabsContent value="guidance" className="space-y-4">
          <Card className="bg-gradient-to-r from-gold/10 to-emerald/10 border-gold/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-gold" />
                Guidance Islamique pour l'Évaluation des Matches
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Critères Prioritaires</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <div className="h-1.5 w-1.5 bg-emerald rounded-full mt-2 flex-shrink-0"></div>
                      <span><strong>Dīn (Religion):</strong> Piété, pratique religieuse, connaissance islamique</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="h-1.5 w-1.5 bg-emerald rounded-full mt-2 flex-shrink-0"></div>
                      <span><strong>Akhlāq (Caractère):</strong> Comportement, éthique, respect</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="h-1.5 w-1.5 bg-emerald rounded-full mt-2 flex-shrink-0"></div>
                      <span><strong>Compatibilité:</strong> Objectifs de vie, valeurs familiales</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="h-1.5 w-1.5 bg-emerald rounded-full mt-2 flex-shrink-0"></div>
                      <span><strong>Stabilité:</strong> Situation professionnelle et personnelle</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Points d'Attention</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <span>Vérifier la sincérité des intentions matrimoniales</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <span>S'assurer de la compréhension des responsabilités</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <span>Évaluer la maturité émotionnelle et spirituelle</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <span>Considérer l'acceptation familiale mutuelle</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-gold" />
                Rôle du Wali
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Le wali (tuteur) a la responsabilité religieuse d'approuver le mariage et de s'assurer 
                que le candidat convient selon les critères islamiques. Cette responsabilité implique :
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Investigation respectueuse du background du candidat</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Conseil et guidance basés sur l'expérience</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Protection des intérêts de la personne sous tutelle</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Facilitation du processus si le candidat est approprié</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Match Review Card Component
interface MatchReviewCardProps {
  match: Match;
  reviews?: FamilyReview[];
  onApprove?: (notes?: string) => void;
  onReject?: (notes?: string) => void;
  onScheduleDiscussion?: () => void;
  showActions?: boolean;
}

const MatchReviewCard = ({ 
  match, 
  reviews = [],
  onApprove, 
  onReject, 
  onScheduleDiscussion,
  showActions = false 
}: MatchReviewCardProps) => {
  const [notes, setNotes] = useState('');
  const [showNotesField, setShowNotesField] = useState(false);

  const profile = match.profiles;
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Badge className="bg-emerald/10 text-emerald border-emerald/20">
              <Star className="h-3 w-3 mr-1" />
              {match.match_score}% compatible
            </Badge>
            <Badge className="bg-pink/10 text-pink border-pink/20">
              <Heart className="h-3 w-3 mr-1" />
              Match mutuel
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            {new Date(match.created_at).toLocaleDateString('fr-FR')}
          </div>
        </div>

        {/* Profile Info */}
        <div className="flex items-start gap-4 mb-6">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback className="bg-gradient-to-br from-emerald to-gold text-white text-lg">
              {profile?.full_name?.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-2">{profile?.full_name}</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Âge & Localisation</p>
                <p className="font-medium">{profile?.age} ans • {profile?.location}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Profession</p>
                <p className="font-medium">{profile?.profession}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Statut</p>
                <p className="font-medium text-emerald">Prêt pour examen familial</p>
              </div>
            </div>

            {profile?.bio && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-1">À propos</p>
                <p className="text-sm">{profile.bio}</p>
              </div>
            )}
          </div>
        </div>

        {/* Previous Reviews */}
        {reviews.length > 0 && (
          <div className="mb-4">
            <h4 className="font-medium mb-2">Avis de la famille :</h4>
            <div className="space-y-2">
              {reviews.map((review) => (
                <Alert key={review.id} className={
                  review.status === 'approved' 
                    ? 'border-green-200 bg-green-50' 
                    : review.status === 'rejected'
                    ? 'border-red-200 bg-red-50'
                    : 'border-yellow-200 bg-yellow-50'
                }>
                  <AlertDescription>
                    <div className="flex items-center gap-2 mb-1">
                      {review.status === 'approved' ? (
                        <ThumbsUp className="h-4 w-4 text-green-600" />
                      ) : review.status === 'rejected' ? (
                        <ThumbsDown className="h-4 w-4 text-red-600" />
                      ) : (
                        <MessageSquare className="h-4 w-4 text-yellow-600" />
                      )}
                      <strong>
                        {review.status === 'approved' ? 'Approuvé' : 
                         review.status === 'rejected' ? 'Non approuvé' : 'Discussion demandée'}
                      </strong>
                      <span className="text-sm text-muted-foreground">
                        par {review.family_member.full_name}
                      </span>
                    </div>
                    {review.notes && <p className="text-sm">{review.notes}</p>}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </div>
        )}

        {/* Notes Field */}
        {showNotesField && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Votre avis et commentaires
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Partagez votre avis sur ce candidat selon les critères islamiques..."
              rows={3}
            />
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNotesField(!showNotesField)}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Ajouter un commentaire
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onScheduleDiscussion?.()}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Discussion familiale
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onReject?.(notes)}
                className="text-red-600 hover:text-red-700"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Émettre des réserves
              </Button>
              <Button
                size="sm"
                onClick={() => onApprove?.(notes)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Approuver
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ParentalApprovalWorkflow;
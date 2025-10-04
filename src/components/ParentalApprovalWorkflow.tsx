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
import MatchReviewCard from '@/components/family-approval/MatchReviewCard';
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
      // Fetch matches for users where current user is an invited family member
      const { data: familyData, error: familyError } = await supabase
        .from('family_members')
        .select('user_id')
        .eq('invited_user_id', user.id)
        .eq('invitation_status', 'accepted');

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
              .maybeSingle();

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
        .eq('invited_user_id', user.id)
        .eq('invitation_status', 'accepted');

      if (error) throw error;
      setFamilyMembers(data || []);
    } catch (error) {
      console.error('Error fetching family members:', error);
    }
  };

  const handleApproval = async (requestId: string, status: 'approved' | 'rejected', notes?: string) => {
    try {
      // Insert into family_reviews table
      const { error } = await supabase
        .from('family_reviews')
        .insert({
          match_id: requestId,
          family_member_id: familyMembers.find(fm => fm.id === user?.id)?.id,
          status,
          notes: notes || null
        });

      if (error) throw error;

      // Update the overall match status if this is from a Wali
      const familyMember = familyMembers.find(fm => fm.id === user?.id);
      if (familyMember?.is_wali) {
        await supabase
          .from('matches')
          .update({
            family_approved: status === 'approved',
            family_notes: notes,
            family_reviewed_at: new Date().toISOString(),
            family_reviewer_id: familyMember.id
          })
          .eq('id', requestId);
      }

      toast({
        title: status === 'approved' ? "Approuvé" : "Réserves exprimées",
        description: `Votre avis a été enregistré avec succès.`
      });

      fetchMatches();
    } catch (error) {
      console.error('Error recording approval decision:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer votre décision",
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
        <div className="h-12 w-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
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
              <Clock className="h-8 w-8 text-warning" />
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
              <Eye className="h-8 w-8 text-primary" />
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
              <Heart className="h-8 w-8 text-destructive" />
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
              <Users className="h-8 w-8 text-success" />
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
                onApprove={(notes) => handleApproval(match.id, 'approved', notes)}
                onReject={(notes) => handleApproval(match.id, 'rejected', notes)}
                onScheduleDiscussion={() => scheduleDiscussion(match.id)}
                showActions={true}
              />
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle2 className="h-16 w-16 text-success mx-auto mb-4" />
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
          <Card className="bg-muted/30 border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-warning" />
                Guidance Islamique pour l'Évaluation des Matches
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Critères Prioritaires</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 bg-success rounded-full mt-2 flex-shrink-0"></div>
                      <span><strong>Dīn (Religion):</strong> Piété, pratique religieuse, connaissance islamique</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="h-1.5 w-1.5 bg-success rounded-full mt-2 flex-shrink-0"></div>
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
                      <AlertTriangle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
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
                <Crown className="h-5 w-5 text-warning" />
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
                  <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
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

export default ParentalApprovalWorkflow;
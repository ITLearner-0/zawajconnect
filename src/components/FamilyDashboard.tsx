import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsTrigger } from '@/components/ui/tabs';
import { ResponsiveTabsList } from '@/components/ui/responsive-tabs-list';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import FamilyApprovalDashboard from '@/components/FamilyApprovalDashboard';
import {
  Users,
  Heart,
  MessageCircle,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  AlertTriangle,
  Crown,
  Phone,
  Video,
  Mail,
  Calendar,
  Star,
  TrendingUp
} from 'lucide-react';

interface Profile {
  id: string;
  full_name: string;
  age: number;
  location: string;
  profession: string;
  education: string;
  bio: string;
  avatar_url?: string;
}

interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  match_score: number;
  is_mutual: boolean;
  created_at: string;
  profiles: Profile;
}

interface FamilyMember {
  id: string;
  user_id: string;
  full_name: string;
  relationship: string;
  is_wali: boolean;
  can_communicate: boolean;
  can_view_profile: boolean;
}

interface SupervisedUser {
  id: string;
  full_name: string;
  profiles: Profile;
}

const FamilyDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [supervisedUsers, setSupervisedUsers] = useState<SupervisedUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [matches, setMatches] = useState<Match[]>([]);
  const [familyRole, setFamilyRole] = useState<FamilyMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMatches: 0,
    recentMatches: 0,
    mutualMatches: 0,
    activeConversations: 0
  });

  useEffect(() => {
    if (user) {
      fetchSupervisedUsers();
    }
  }, [user]);

  useEffect(() => {
    if (selectedUser) {
      fetchUserMatches(selectedUser);
      fetchFamilyRole(selectedUser);
    }
  }, [selectedUser]);

  const fetchSupervisedUsers = async () => {
    if (!user) return;

    try {
      // Find all users where the current user is invited as a family member
      const { data: familyData, error: familyError } = await supabase
        .from('family_members')
        .select('user_id')
        .eq('invited_user_id', user.id)
        .eq('invitation_status', 'accepted');

      if (familyError) throw familyError;

      if (familyData && familyData.length > 0) {
        const userIds = familyData.map(f => f.user_id);
        
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .in('user_id', userIds);

        if (profilesError) throw profilesError;

        const users: SupervisedUser[] = profilesData?.map(profile => ({
          id: profile.user_id,
          full_name: profile.full_name || 'Utilisateur',
          profiles: {
            ...profile,
            age: profile.age ?? 0,
            full_name: profile.full_name || 'Utilisateur',
            location: profile.location || '',
            profession: profile.profession || '',
            education: profile.education || '',
            bio: profile.bio || '',
            avatar_url: profile.avatar_url ?? undefined
          }
        })) || [];

        setSupervisedUsers(users);
        
        if (users.length > 0 && users[0]?.id) {
          setSelectedUser(users[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching supervised users:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les utilisateurs supervisés",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFamilyRole = async (userId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('family_members')
        .select('*')
        .eq('user_id', userId)
        .eq('invited_user_id', user.id)
        .eq('invitation_status', 'accepted')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        setFamilyRole({
          ...data,
          is_wali: data.is_wali ?? false,
          can_communicate: data.can_communicate ?? false,
          can_view_profile: data.can_view_profile ?? false
        });
      }
    } catch (error) {
      console.error('Error fetching family role:', error);
    }
  };

  const fetchUserMatches = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('user1_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const matchData = data || [];
      
      // Fetch profiles for each match
      const matchesWithProfiles = await Promise.all(
        matchData.map(async (match) => {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', match.user2_id)
            .maybeSingle();

          return {
            ...match,
            profiles: profileData ? {
              ...profileData,
              age: profileData.age ?? 0,
              full_name: profileData.full_name || 'Utilisateur',
              location: profileData.location || '',
              profession: profileData.profession || '',
              education: profileData.education || '',
              bio: profileData.bio || '',
              avatar_url: profileData.avatar_url ?? undefined
            } : {
              id: '',
              full_name: 'Utilisateur',
              age: 0,
              location: '',
              profession: '',
              education: '',
              bio: '',
              avatar_url: undefined
            }
          };
        })
      );

      const normalizedMatches = matchesWithProfiles.map(m => ({
        ...m,
        is_mutual: m.is_mutual ?? false,
        match_score: m.match_score ?? 0
      }));

      setMatches(normalizedMatches);

      // Calculate stats
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      setStats({
        totalMatches: matchesWithProfiles.length,
        recentMatches: matchesWithProfiles.filter(m => new Date(m.created_at) > oneWeekAgo).length,
        mutualMatches: matchesWithProfiles.filter(m => m.is_mutual).length,
        activeConversations: matchesWithProfiles.filter(m => m.is_mutual).length
      });

    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  };

  const sendFamilyAdvice = async (matchId: string, advice: string) => {
    try {
      // Create a notification with family advice
      await supabase.rpc('create_notification', {
        target_user_id: selectedUser,
        notification_type: 'family_advice',
        notification_title: 'Conseil de la famille',
        notification_content: advice,
        sender_user_id: user?.id
      });

      toast({
        title: "Conseil envoyé",
        description: "Votre conseil a été transmis avec succès"
      });

    } catch (error) {
      console.error('Error sending family advice:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le conseil",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (supervisedUsers.length === 0) {
    return (
      <div className="p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Vous n'avez accès à aucun profil familial. Assurez-vous d'être ajouté comme membre de famille 
            par la personne que vous souhaitez superviser.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const selectedUserData = supervisedUsers.find(u => u.id === selectedUser);

  return (
    <div className="space-y-6">
      {/* Family Approval Dashboard */}
      <FamilyApprovalDashboard />
      
      <Separator className="my-8" />
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 bg-gradient-to-br from-gold to-emerald rounded-full flex items-center justify-center">
          <Shield className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Supervision Continue</h2>
          <p className="text-muted-foreground">
            Supervisez et guidez les matches de votre famille
          </p>
        </div>
      </div>

      {/* User Selector */}
      {supervisedUsers.length > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <span className="font-medium">Superviser :</span>
              <div className="flex gap-2">
                {supervisedUsers.map((user) => (
                  <Button
                    key={user.id}
                    variant={selectedUser === user.id ? "default" : "outline"}
                    onClick={() => setSelectedUser(user.id)}
                    className="flex items-center gap-2"
                  >
                    <Users className="h-4 w-4" />
                    {user.full_name}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue/10 rounded-full flex items-center justify-center">
                <Heart className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Matches</p>
                <p className="text-2xl font-bold">{stats.totalMatches}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-green/10 rounded-full flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cette semaine</p>
                <p className="text-2xl font-bold">{stats.recentMatches}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-purple/10 rounded-full flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mutuels</p>
                <p className="text-2xl font-bold">{stats.mutualMatches}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-orange/10 rounded-full flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Conversations</p>
                <p className="text-2xl font-bold">{stats.activeConversations}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="matches" className="space-y-4">
        <ResponsiveTabsList tabCount={3}>
          <TabsTrigger value="matches">
            Matches récents ({matches.length})
          </TabsTrigger>
          <TabsTrigger value="mutual">
            Matches mutuels ({stats.mutualMatches})
          </TabsTrigger>
          <TabsTrigger value="guidance">
            Conseils familiaux
          </TabsTrigger>
        </ResponsiveTabsList>

        <TabsContent value="matches" className="space-y-4">
          {matches.length > 0 ? (
            matches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                onSendAdvice={(advice) => sendFamilyAdvice(match.id, advice)}
                familyRole={familyRole}
              />
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucun match pour l'instant</h3>
                <p className="text-muted-foreground">
                  Les matches apparaîtront ici dès qu'ils seront créés.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="mutual" className="space-y-4">
          {matches.filter(m => m.is_mutual).map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              onSendAdvice={(advice) => sendFamilyAdvice(match.id, advice)}
              familyRole={familyRole}
              isImportant={true}
            />
          ))}
        </TabsContent>

        <TabsContent value="guidance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Envoyer un conseil général
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Écrivez vos conseils et guidance pour votre famille member..."
                rows={4}
              />
              <Button className="w-full bg-emerald hover:bg-emerald-dark text-white">
                <Mail className="h-4 w-4 mr-2" />
                Envoyer le conseil
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-gold/10 to-emerald/10 border-gold/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Crown className="h-6 w-6 text-gold flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Guidance Islamique</h3>
                  <p className="text-muted-foreground text-sm">
                    En tant que famille, votre rôle est d'offrir guidance et conseil selon les principes islamiques. 
                    Rappelez l'importance de la compatibilité religieuse, du respect mutuel et de la piété dans le choix du partenaire.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Family Role Info */}
      {familyRole && (
        <Card className="bg-gradient-to-r from-gold/5 to-emerald/5 border-gold/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Crown className="h-5 w-5 text-gold" />
              <div>
                <p className="font-medium">
                  Votre rôle : {familyRole.is_wali ? 'Wali (Tuteur)' : 'Membre de famille'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {familyRole.is_wali 
                    ? 'Vous avez l\'autorité religieuse pour guider et approuver'
                    : `Vous pouvez ${familyRole.can_communicate ? 'communiquer et ' : ''}${familyRole.can_view_profile ? 'consulter le profil' : 'voir les matches'}`
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Match Card Component
interface MatchCardProps {
  match: Match;
  onSendAdvice?: (advice: string) => void;
  familyRole?: FamilyMember | null;
  isImportant?: boolean;
}

const MatchCard = ({ match, onSendAdvice, familyRole, isImportant = false }: MatchCardProps) => {
  const [advice, setAdvice] = useState('');
  const [showAdviceField, setShowAdviceField] = useState(false);

  const profile = match.profiles;
  
  return (
    <Card className={`hover:shadow-md transition-shadow ${isImportant ? 'border-emerald/40 bg-emerald/5' : ''}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback className="bg-gradient-to-br from-emerald to-gold text-white text-lg">
              {profile?.full_name?.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-semibold">{profile?.full_name}</h3>
              <Badge className="bg-emerald/10 text-emerald border-emerald/20">
                <Star className="h-3 w-3 mr-1" />
                {match.match_score}% compatible
              </Badge>
              
              {match.is_mutual && (
                <Badge className="bg-pink/10 text-pink border-pink/20">
                  <Heart className="h-3 w-3 mr-1" />
                  Match mutuel
                </Badge>
              )}
              
              {isImportant && (
                <Badge className="bg-orange/10 text-orange-dark border-orange/20">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Prioritaire
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Âge & Localisation</p>
                <p className="font-medium">{profile?.age} ans • {profile?.location}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Profession</p>
                <p className="font-medium">{profile?.profession}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Éducation</p>
                <p className="font-medium">{profile?.education}</p>
              </div>
            </div>

            {profile?.bio && (
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-1">À propos</p>
                <p className="text-sm">{profile.bio}</p>
              </div>
            )}

            {showAdviceField && (
              <div className="mb-4 p-4 bg-muted/50 rounded-lg">
                <label className="block text-sm font-medium mb-2">
                  Votre conseil familial
                </label>
                <Textarea
                  value={advice}
                  onChange={(e) => setAdvice(e.target.value)}
                  placeholder="Partagez vos conseils et guidance sur ce match..."
                  rows={3}
                />
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    onClick={() => {
                      onSendAdvice?.(advice);
                      setAdvice('');
                      setShowAdviceField(false);
                    }}
                    disabled={!advice.trim()}
                  >
                    Envoyer
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAdviceField(false)}
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            )}

            <Separator className="my-4" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Match créé le {new Date(match.created_at).toLocaleDateString('fr-FR')}</span>
              </div>

              {(familyRole?.can_communicate || familyRole?.is_wali) && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAdviceField(true)}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Conseiller
                  </Button>
                  {familyRole?.can_communicate && (
                    <Button
                      variant="outline"
                      size="sm"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Contacter
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FamilyDashboard;
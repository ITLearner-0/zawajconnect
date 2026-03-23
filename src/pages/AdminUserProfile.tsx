import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsTrigger } from '@/components/ui/tabs';
import { ResponsiveTabsList } from '@/components/ui/responsive-tabs-list';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Heart,
  Shield,
  Users,
  MessageCircle,
  AlertTriangle,
  CheckCircle,
  Clock,
  BookOpen,
  Briefcase,
  GraduationCap,
  Home,
} from 'lucide-react';

interface ProfileData {
  user_id: string;
  full_name: string;
  age: number;
  gender: string;
  location: string;
  bio: string;
  avatar_url: string;
  education: string;
  profession: string;
  interests: string[];
  created_at: string;
}

interface IslamicPreferences {
  prayer_frequency: string;
  quran_reading: string;
  madhab: string;
  halal_diet?: boolean;
  hijab_preference: string;
  beard_preference?: string;
  desired_partner_sect?: string;
  importance_of_religion?: string;
}

interface PrivacySettings {
  profile_visibility: string;
  allow_family_involvement: boolean;
  allow_messages_from?: string;
  allow_profile_views?: boolean;
  contact_visibility?: string;
  last_seen_visibility?: string;
  photo_visibility?: string;
}

interface UserVerification {
  email_verified: boolean;
  phone_verified: boolean;
  id_verified: boolean;
  verification_score: number;
}

interface MatchingPreferences {
  min_age?: number;
  max_age?: number;
  preferred_locations?: string[];
  education_preference?: string;
  family_approval_required?: boolean;
  min_compatibility?: number;
  use_ai_scoring?: boolean;
  weight_cultural?: number;
  weight_islamic?: number;
  weight_personality?: number;
}

const AdminUserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | undefined>(undefined);
  const [islamicPrefs, setIslamicPrefs] = useState<IslamicPreferences | undefined>(undefined);
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings | undefined>(undefined);
  const [verification, setVerification] = useState<UserVerification | undefined>(undefined);
  const [matchingPrefs, setMatchingPrefs] = useState<MatchingPreferences | undefined>(undefined);
  const [stats, setStats] = useState({
    totalMatches: 0,
    activeConversations: 0,
    totalMessages: 0,
  });

  useEffect(() => {
    if (!userId) {
      navigate('/admin');
      return;
    }
    loadUserProfile();
  }, [userId]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);

      // Load all user data in parallel
      const [
        profileResult,
        islamicResult,
        privacyResult,
        verificationResult,
        matchingResult,
        matchesResult,
        messagesResult,
      ] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId ?? '')
          .single(),
        supabase
          .from('islamic_preferences')
          .select('*')
          .eq('user_id', userId ?? '')
          .maybeSingle(),
        supabase
          .from('privacy_settings')
          .select('*')
          .eq('user_id', userId ?? '')
          .maybeSingle(),
        supabase
          .from('user_verifications')
          .select('*')
          .eq('user_id', userId ?? '')
          .maybeSingle(),
        supabase
          .from('matching_preferences')
          .select('*')
          .eq('user_id', userId ?? '')
          .maybeSingle(),
        supabase
          .from('matches')
          .select('*', { count: 'exact', head: true })
          .or(`user1_id.eq.${userId ?? ''},user2_id.eq.${userId ?? ''}`),
        supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('sender_id', userId ?? ''),
      ]);

      if (profileResult.error) throw profileResult.error;

      setProfile(
        profileResult.data
          ? {
              ...profileResult.data,
              full_name: profileResult.data.full_name ?? '',
              age: profileResult.data.age ?? 0,
              gender: profileResult.data.gender ?? '',
              location: profileResult.data.location ?? '',
              bio: profileResult.data.bio ?? '',
              avatar_url: profileResult.data.avatar_url ?? '',
              education: profileResult.data.education ?? '',
              profession: profileResult.data.profession ?? '',
              interests: (profileResult.data.interests ?? []).filter(
                (i): i is string => i !== null
              ),
            }
          : undefined
      );

      setIslamicPrefs(
        islamicResult.data
          ? {
              prayer_frequency: islamicResult.data.prayer_frequency ?? '',
              quran_reading: islamicResult.data.quran_reading ?? '',
              madhab: islamicResult.data.madhab ?? '',
              halal_diet: !!islamicResult.data.halal_diet,
              hijab_preference: islamicResult.data.hijab_preference ?? '',
              beard_preference: islamicResult.data.beard_preference ?? undefined,
              desired_partner_sect: islamicResult.data.desired_partner_sect ?? undefined,
              importance_of_religion: islamicResult.data.importance_of_religion ?? undefined,
            }
          : undefined
      );

      setPrivacySettings(
        privacyResult.data
          ? {
              profile_visibility: privacyResult.data.profile_visibility ?? '',
              allow_family_involvement: !!privacyResult.data.allow_family_involvement,
              allow_messages_from: privacyResult.data.allow_messages_from ?? undefined,
              allow_profile_views: !!privacyResult.data.allow_profile_views,
              contact_visibility: privacyResult.data.contact_visibility ?? undefined,
              last_seen_visibility: privacyResult.data.last_seen_visibility ?? undefined,
              photo_visibility: privacyResult.data.photo_visibility ?? undefined,
            }
          : undefined
      );

      setVerification(
        verificationResult.data
          ? {
              email_verified: !!verificationResult.data.email_verified,
              phone_verified: !!verificationResult.data.phone_verified,
              id_verified: !!verificationResult.data.id_verified,
              verification_score: verificationResult.data.verification_score ?? 0,
            }
          : undefined
      );

      setMatchingPrefs(
        matchingResult.data
          ? {
              min_age: (matchingResult.data as any).min_age ?? undefined,
              max_age: (matchingResult.data as any).max_age ?? undefined,
              preferred_locations: ((matchingResult.data as any).preferred_locations ?? []).filter(
                (l: string | null): l is string => l !== null
              ),
              education_preference: (matchingResult.data as any).education_preference ?? undefined,
              family_approval_required: !!matchingResult.data.family_approval_required,
              min_compatibility: matchingResult.data.min_compatibility ?? undefined,
              use_ai_scoring: !!matchingResult.data.use_ai_scoring,
              weight_cultural: matchingResult.data.weight_cultural ?? undefined,
              weight_islamic: matchingResult.data.weight_islamic ?? undefined,
              weight_personality: matchingResult.data.weight_personality ?? undefined,
            }
          : undefined
      );

      // Count active conversations
      const { count: activeConversations } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .or(`user1_id.eq.${userId ?? ''},user2_id.eq.${userId ?? ''}`)
        .eq('conversation_status', 'active');

      setStats({
        totalMatches: matchesResult.count || 0,
        activeConversations: activeConversations || 0,
        totalMessages: messagesResult.count || 0,
      });
    } catch (error) {
      console.error('Error loading user profile:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger le profil utilisateur',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: 'var(--color-bg-page)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--color-primary)' }}></div>
          <p style={{ color: 'var(--color-text-secondary)' }}>Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto py-8" style={{ backgroundColor: 'var(--color-bg-page)' }}>
        <Card style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-lg)' }}>
          <CardHeader>
            <CardTitle style={{ color: 'var(--color-text-primary)' }}>Profil non trouvé</CardTitle>
            <CardDescription style={{ color: 'var(--color-text-muted)' }}>L'utilisateur demandé n'existe pas</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/admin')} style={{ backgroundColor: 'var(--color-primary)', color: '#fff', borderRadius: 'var(--radius-md)' }}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à l'administration
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6" style={{ backgroundColor: 'var(--color-bg-page)' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/admin')} style={{ color: 'var(--color-text-secondary)' }}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à l'administration
        </Button>
      </div>

      {/* Profile Header */}
      <Card style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-lg)' }}>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
              <AvatarFallback className="text-2xl" style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                {profile.full_name?.charAt(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{profile.full_name}</h1>
                {verification && (
                  <Badge variant={verification.verification_score >= 80 ? 'default' : 'secondary'}>
                    <Shield className="h-3 w-3 mr-1" />
                    Score: {verification.verification_score}%
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-4" style={{ color: 'var(--color-text-secondary)' }}>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{profile.age} ans</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{profile.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span className="capitalize">{profile.gender}</span>
                </div>
              </div>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Inscrit le {new Date(profile.created_at).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-lg)' }}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
              <div>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Matches Total</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{stats.totalMatches}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-lg)' }}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" style={{ color: 'var(--color-warning)' }} />
              <div>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Conversations actives</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{stats.activeConversations}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-lg)' }}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
              <div>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Messages envoyés</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{stats.totalMessages}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information Tabs */}
      <Tabs defaultValue="profile" className="space-y-4">
        <ResponsiveTabsList tabCount={5}>
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="islamic">Préférences Islamiques</TabsTrigger>
          <TabsTrigger value="matching">Critères de recherche</TabsTrigger>
          <TabsTrigger value="privacy">Confidentialité</TabsTrigger>
          <TabsTrigger value="verification">Vérification</TabsTrigger>
        </ResponsiveTabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-lg)' }}>
            <CardHeader>
              <CardTitle style={{ color: 'var(--color-text-primary)' }}>Informations du profil</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <BookOpen className="h-5 w-5 mt-0.5" style={{ color: 'var(--color-text-muted)' }} />
                  <div className="flex-1">
                    <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Biographie</p>
                    <p style={{ color: 'var(--color-text-secondary)' }}>{profile.bio || 'Non renseignée'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <GraduationCap className="h-5 w-5 mt-0.5" style={{ color: 'var(--color-text-muted)' }} />
                  <div className="flex-1">
                    <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Éducation</p>
                    <p style={{ color: 'var(--color-text-secondary)' }}>{profile.education || 'Non renseignée'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Briefcase className="h-5 w-5 mt-0.5" style={{ color: 'var(--color-text-muted)' }} />
                  <div className="flex-1">
                    <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Profession</p>
                    <p style={{ color: 'var(--color-text-secondary)' }}>
                      {profile.profession || 'Non renseignée'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Heart className="h-5 w-5 mt-0.5" style={{ color: 'var(--color-text-muted)' }} />
                  <div className="flex-1">
                    <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Centres d'intérêt</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {profile.interests?.map((interest, idx) => (
                        <Badge key={idx} variant="outline" style={{ borderColor: 'var(--color-border-default)', color: 'var(--color-text-secondary)' }}>
                          {interest}
                        </Badge>
                      )) || <span style={{ color: 'var(--color-text-muted)' }}>Aucun</span>}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Islamic Preferences Tab */}
        <TabsContent value="islamic">
          <Card style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-lg)' }}>
            <CardHeader>
              <CardTitle style={{ color: 'var(--color-text-primary)' }}>Préférences Islamiques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {islamicPrefs ? (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Fréquence de prière</span>
                    <span className="capitalize" style={{ color: 'var(--color-text-secondary)' }}>
                      {islamicPrefs.prayer_frequency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Lecture du Coran</span>
                    <span className="capitalize" style={{ color: 'var(--color-text-secondary)' }}>
                      {islamicPrefs.quran_reading}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Madhab</span>
                    <span className="capitalize" style={{ color: 'var(--color-text-secondary)' }}>{islamicPrefs.madhab}</span>
                  </div>
                  {islamicPrefs.halal_diet !== undefined && (
                    <div className="flex justify-between">
                      <span className="font-medium">Régime Halal</span>
                      <Badge variant={islamicPrefs.halal_diet ? 'default' : 'secondary'}>
                        {islamicPrefs.halal_diet ? 'Oui' : 'Non'}
                      </Badge>
                    </div>
                  )}
                  {islamicPrefs.hijab_preference && (
                    <div className="flex justify-between">
                      <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Préférence Hijab</span>
                      <span className="capitalize" style={{ color: 'var(--color-text-secondary)' }}>
                        {islamicPrefs.hijab_preference}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <p style={{ color: 'var(--color-text-muted)' }}>Aucune préférence islamique renseignée</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Matching Preferences Tab */}
        <TabsContent value="matching">
          <Card style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-lg)' }}>
            <CardHeader>
              <CardTitle style={{ color: 'var(--color-text-primary)' }}>Critères de recherche</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {matchingPrefs ? (
                <div className="space-y-3">
                  {matchingPrefs.min_age && matchingPrefs.max_age && (
                    <div className="flex justify-between">
                      <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Tranche d'âge</span>
                      <span style={{ color: 'var(--color-text-secondary)' }}>
                        {matchingPrefs.min_age} - {matchingPrefs.max_age} ans
                      </span>
                    </div>
                  )}
                  {matchingPrefs.preferred_locations &&
                    matchingPrefs.preferred_locations.length > 0 && (
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 mt-0.5" style={{ color: 'var(--color-text-muted)' }} />
                        <div className="flex-1">
                          <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Localisations préférées</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {matchingPrefs.preferred_locations.map((loc, idx) => (
                              <Badge key={idx} variant="outline" style={{ borderColor: 'var(--color-border-default)', color: 'var(--color-text-secondary)' }}>
                                {loc}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  {matchingPrefs.education_preference && (
                    <div className="flex justify-between">
                      <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Niveau d'éducation</span>
                      <span className="capitalize" style={{ color: 'var(--color-text-secondary)' }}>
                        {matchingPrefs.education_preference}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <p style={{ color: 'var(--color-text-muted)' }}>Aucun critère de recherche défini</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Settings Tab */}
        <TabsContent value="privacy">
          <Card style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-lg)' }}>
            <CardHeader>
              <CardTitle style={{ color: 'var(--color-text-primary)' }}>Paramètres de confidentialité</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {privacySettings ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Visibilité du profil</span>
                    <Badge variant="outline" className="capitalize">
                      {privacySettings.profile_visibility}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Implication familiale</span>
                    <Badge
                      variant={privacySettings.allow_family_involvement ? 'default' : 'secondary'}
                    >
                      {privacySettings.allow_family_involvement ? 'Autorisée' : 'Non autorisée'}
                    </Badge>
                  </div>
                  {privacySettings.photo_visibility && (
                    <div className="flex justify-between items-center">
                      <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Visibilité des photos</span>
                      <Badge variant="outline" className="capitalize">
                        {privacySettings.photo_visibility}
                      </Badge>
                    </div>
                  )}
                </div>
              ) : (
                <p style={{ color: 'var(--color-text-muted)' }}>Paramètres par défaut</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Verification Tab */}
        <TabsContent value="verification">
          <Card style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-lg)' }}>
            <CardHeader>
              <CardTitle style={{ color: 'var(--color-text-primary)' }}>Statut de vérification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {verification ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Email vérifié</span>
                    <Badge variant={verification.email_verified ? 'default' : 'secondary'}>
                      {verification.email_verified ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <Clock className="h-3 w-3 mr-1" />
                      )}
                      {verification.email_verified ? 'Vérifié' : 'Non vérifié'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Téléphone vérifié</span>
                    <Badge variant={verification.phone_verified ? 'default' : 'secondary'}>
                      {verification.phone_verified ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <Clock className="h-3 w-3 mr-1" />
                      )}
                      {verification.phone_verified ? 'Vérifié' : 'Non vérifié'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Identité vérifiée</span>
                    <Badge variant={verification.id_verified ? 'default' : 'secondary'}>
                      {verification.id_verified ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <Clock className="h-3 w-3 mr-1" />
                      )}
                      {verification.id_verified ? 'Vérifié' : 'Non vérifié'}
                    </Badge>
                  </div>
                  <div className="pt-4" style={{ borderTop: '1px solid var(--color-border-default)' }}>
                    <div className="flex justify-between items-center">
                      <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Score de vérification global</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
                          <div
                            className="h-full transition-all"
                            style={{ width: `${verification.verification_score}%`, backgroundColor: 'var(--color-primary)' }}
                          />
                        </div>
                        <span className="font-bold text-lg">
                          {verification.verification_score}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p style={{ color: 'var(--color-text-muted)' }}>Aucune vérification effectuée</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminUserProfile;

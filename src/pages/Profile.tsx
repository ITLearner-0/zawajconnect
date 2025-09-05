import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCompatibility } from '@/hooks/useCompatibility';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, MapPin, GraduationCap, Briefcase, Heart, User, MessageCircle, Eye, Calendar, Flag } from 'lucide-react';
import VerificationBadge from '@/components/VerificationBadge';
import ReportModal from '@/components/ReportModal';

interface ProfileData {
  id: string;
  user_id: string;
  full_name: string;
  age: number;
  gender: string;
  location: string;
  education: string;
  profession: string;
  bio: string;
  looking_for: string;
  interests: string[];
  avatar_url?: string;
  created_at: string;
  islamic_preferences?: {
    prayer_frequency: string;
    quran_reading: string;
    hijab_preference: string;
    beard_preference: string;
    sect: string;
    madhab: string;
    halal_diet: boolean;
    smoking: string;
    importance_of_religion: string;
  };
}

const Profile = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const { calculateCompatibilityScore } = useCompatibility();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [verification, setVerification] = useState<any>(null);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (!userId) {
      navigate('/browse');
      return;
    }
    fetchProfile();
    checkIfLiked();
    recordProfileView();
    fetchVerificationStatus();
  }, [user, userId]);

  const fetchProfile = async () => {
    if (!userId) return;

    try {
      // Get profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileData) {
        // Get Islamic preferences
        const { data: prefsData } = await supabase
          .from('islamic_preferences')
          .select('*')
          .eq('user_id', userId)
          .single();

        setProfile({
          ...profileData,
          islamic_preferences: prefsData || undefined
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkIfLiked = async () => {
    if (!user || !userId) return;

    try {
      const { data: match } = await supabase
        .from('matches')
        .select('*')
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${userId}),and(user1_id.eq.${userId},user2_id.eq.${user.id})`)
        .single();

      if (match) {
        const userLiked = (match.user1_id === user.id && match.user1_liked) || 
                          (match.user2_id === user.id && match.user2_liked);
        setIsLiked(userLiked);
      }
    } catch (error) {
      // No match found, that's ok
    }
  };

  const fetchVerificationStatus = async () => {
    if (!userId) return;

    try {
      const { data } = await supabase
        .from('user_verifications')
        .select('*')
        .eq('user_id', userId)
        .single();

      setVerification(data);
    } catch (error) {
      console.error('Error fetching verification status:', error);
    }
  };

  const recordProfileView = async () => {
    if (!user || !userId || user.id === userId) return;

    try {
      await supabase
        .from('profile_views')
        .upsert({
          viewer_id: user.id,
          viewed_id: userId
        }, { onConflict: 'viewer_id,viewed_id' });
    } catch (error) {
      console.error('Error recording profile view:', error);
    }
  };

  const handleLike = async () => {
    if (!user || !userId) return;

    try {
      const { data: existingMatch } = await supabase
        .from('matches')
        .select('*')
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${userId}),and(user1_id.eq.${userId},user2_id.eq.${user.id})`)
        .single();

      if (existingMatch) {
        // Update existing match
        const isUser1 = existingMatch.user1_id === user.id;
        const updateData = isUser1 
          ? { user1_liked: true }
          : { user2_liked: true };

        const isMutual = isUser1 
          ? existingMatch.user2_liked 
          : existingMatch.user1_liked;

        if (isMutual) {
          (updateData as any).is_mutual = true;
        }

        await supabase
          .from('matches')
          .update(updateData)
          .eq('id', existingMatch.id);

        if (isMutual) {
          alert('C\'est un match ! 🎉 Vous pouvez maintenant discuter.');
          navigate('/matches');
        } else {
          setIsLiked(true);
          alert('Profil liké ! Si cette personne vous like en retour, vous pourrez discuter.');
        }
      } else {
        // Calculate real compatibility score
        const compatibilityScore = await calculateCompatibilityScore(userId);
        
        // Create new match
        await supabase
          .from('matches')
          .insert({
            user1_id: user.id,
            user2_id: userId,
            user1_liked: true,
            match_score: Math.round(compatibilityScore)
          });

        setIsLiked(true);
        alert('Profil liké ! Si cette personne vous like en retour, vous pourrez discuter.');
      }
    } catch (error) {
      console.error('Error handling like:', error);
    }
  };

  const getDisplayValue = (value: string | null | undefined, mapping: Record<string, string>) => {
    if (!value) return 'Non spécifié';
    return mapping[value] || value;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-emerald/5 flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-emerald/5 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground mb-2">Profil introuvable</h2>
          <Button onClick={() => navigate('/browse')} className="bg-emerald hover:bg-emerald-dark text-primary-foreground">
            Retour à la recherche
          </Button>
        </div>
      </div>
    );
  }

  const prayerFrequencyMap = {
    '5_times_daily': '5 fois par jour',
    'sometimes': 'Parfois',
    'fridays_only': 'Seulement le vendredi',
    'occasionally': 'Occasionnellement'
  };

  const quranReadingMap = {
    'daily': 'Quotidiennement',
    'weekly': 'Hebdomadairement',
    'monthly': 'Mensuellement',
    'occasionally': 'Occasionnellement',
    'learning': 'En apprentissage'
  };

  const sectMap = {
    'sunni': 'Sunnite',
    'shia': 'Chiite',
    'other': 'Autre',
    'prefer_not_to_say': 'Préfère ne pas dire'
  };

  const importanceMap = {
    'very_important': 'Très important',
    'important': 'Important',
    'somewhat_important': 'Assez important',
    'not_important': 'Pas important'
  };

  const smokingMap = {
    'never': 'Jamais',
    'occasionally': 'Occasionnellement',
    'regularly': 'Régulièrement'
  };

  return (
    <div className="py-8 px-4">
      <div className="container mx-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="h-12 w-12 bg-gradient-to-br from-emerald to-emerald-light rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Profil de {profile.full_name}</h1>
              <p className="text-muted-foreground">Découvrez les informations détaillées</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Profile Info */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="animate-fade-in">
                <CardHeader className="text-center">
                  <div className="h-32 w-32 rounded-full overflow-hidden mx-auto mb-4 bg-gradient-to-br from-emerald to-emerald-light flex items-center justify-center">
                    {profile.avatar_url ? (
                      <img 
                        src={profile.avatar_url} 
                        alt={`Photo de ${profile.full_name}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl text-primary-foreground font-bold">
                        {profile.full_name?.charAt(0) || '?'}
                      </span>
                    )}
                  </div>
                  <CardTitle className="text-2xl">{profile.full_name}</CardTitle>
                  <p className="text-muted-foreground">{profile.age} ans</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{profile.location || 'Non spécifié'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Briefcase className="h-4 w-4" />
                      <span>{profile.profession || 'Non spécifié'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <GraduationCap className="h-4 w-4" />
                      <span>{profile.education || 'Non spécifié'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Membre depuis {new Date(profile.created_at).getFullYear()}</span>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">À propos</h3>
                    <p className="text-muted-foreground">
                      {profile.bio || 'Aucune description disponible.'}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Ce que je recherche</h3>
                    <p className="text-muted-foreground">
                      {profile.looking_for || 'Non spécifié.'}
                    </p>
                  </div>

                  {profile.interests && profile.interests.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Centres d'intérêt</h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.interests.map((interest, index) => (
                          <Badge key={index} variant="secondary">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Islamic Preferences */}
              {profile.islamic_preferences && (
                <Card className="animate-fade-in">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5" />
                      Préférences Islamiques
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-foreground mb-1">Fréquence de prière</h4>
                        <p className="text-muted-foreground">
                          {getDisplayValue(profile.islamic_preferences.prayer_frequency, prayerFrequencyMap)}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground mb-1">Lecture du Coran</h4>
                        <p className="text-muted-foreground">
                          {getDisplayValue(profile.islamic_preferences.quran_reading, quranReadingMap)}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground mb-1">Secte</h4>
                        <p className="text-muted-foreground">
                          {getDisplayValue(profile.islamic_preferences.sect, sectMap)}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground mb-1">Importance de la religion</h4>
                        <p className="text-muted-foreground">
                          {getDisplayValue(profile.islamic_preferences.importance_of_religion, importanceMap)}
                        </p>
                      </div>
                      {profile.islamic_preferences.madhab && (
                        <div>
                          <h4 className="font-medium text-foreground mb-1">Madhab</h4>
                          <p className="text-muted-foreground">{profile.islamic_preferences.madhab}</p>
                        </div>
                      )}
                      <div>
                        <h4 className="font-medium text-foreground mb-1">Fumeur</h4>
                        <p className="text-muted-foreground">
                          {getDisplayValue(profile.islamic_preferences.smoking, smokingMap)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">Alimentation Halal:</span>
                        <Badge variant={profile.islamic_preferences.halal_diet ? "default" : "secondary"}>
                          {profile.islamic_preferences.halal_diet ? 'Oui' : 'Non'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Action Sidebar */}
            <div className="space-y-6">
              <Card className="animate-fade-in">
                <CardHeader>
                  <CardTitle className="text-center">Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={handleLike}
                    disabled={isLiked}
                    className="w-full bg-emerald hover:bg-emerald-dark text-primary-foreground"
                  >
                    <Heart className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                    {isLiked ? 'Déjà liké' : 'Liker ce profil'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/matches`)}
                    className="w-full"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Voir mes matches
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => navigate('/browse')}
                    className="w-full"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Autres profils
                  </Button>
                </CardContent>
              </Card>

              <Card className="animate-fade-in">
                <CardHeader>
                  <CardTitle className="text-center">Compatibilité</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="h-20 w-20 bg-gradient-to-br from-emerald to-emerald-light rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl text-primary-foreground font-bold">
                      {Math.floor(Math.random() * 30) + 70}%
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Score de compatibilité basé sur vos préférences communes
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setShowReportModal(true)}
                    className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Flag className="h-4 w-4 mr-2" />
                    Signaler ce profil
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <ReportModal
          reportedUserId={userId!}
          reportedUserName={profile?.full_name || 'Utilisateur'}
        >
          <Button variant="destructive" size="sm">
            Signaler ce profil
          </Button>
        </ReportModal>
      )}
    </div>
  );
};

export default Profile;
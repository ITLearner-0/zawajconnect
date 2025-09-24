import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCompatibility } from '@/hooks/useCompatibility';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Heart, 
  Shield, 
  Camera, 
  Brain, 
  Settings,
  CheckCircle,
  AlertCircle,
  Star,
  TrendingUp,
  Lock,
  Users
} from 'lucide-react';

// Enhanced Components
import ProfileWizard from '@/components/enhanced/ProfileWizard';
import PhotoVerificationSystem from '@/components/enhanced/PhotoVerificationSystem';
import EnhancedIslamicPreferences from '@/components/enhanced/EnhancedIslamicPreferences';
import EnhancedPrivacyControls from '@/components/enhanced/EnhancedPrivacyControls';
import CompatibilityAssessment from '@/components/enhanced/CompatibilityAssessment';

// Existing Components
import VerificationBadge from '@/components/VerificationBadge';
import SecurityStatusBadge from '@/components/security/SecurityStatusBadge';
import PhotoUpload from '@/components/PhotoUpload';

interface ProfileCompletionStats {
  overall: number;
  basicInfo: number;
  islamicPrefs: number;
  photos: number;
  compatibility: number;
  privacy: number;
  verification: number;
}

interface ProfileData {
  id: string;
  full_name: string;
  age: number;
  avatar_url?: string;
  bio?: string;
  location?: string;
  education?: string;
  profession?: string;
  interests?: string[];
}

interface VerificationData {
  email_verified: boolean;
  phone_verified: boolean;
  id_verified: boolean;
  family_verified: boolean;
  verification_score: number;
  verification_documents?: string[];
  verification_notes?: string;
  verified_at?: string;
}

interface IslamicPreferencesData {
  prayer_frequency?: string;
  quran_reading?: string;
  hijab_preference?: string;
  beard_preference?: string;
  sect?: string;
  madhab?: string;
  halal_diet?: boolean;
  smoking?: string;
  desired_partner_sect?: string;
  importance_of_religion?: string;
}

interface PrivacySettingsData {
  profile_visibility?: string;
  photo_visibility?: string;
  contact_visibility?: string;
  last_seen_visibility?: string;
  allow_messages_from?: string;
  allow_family_involvement?: boolean;
}

const EnhancedProfile = () => {
  const { user } = useAuth();
  const { stats: compatibilityStats } = useCompatibility();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [verification, setVerification] = useState<VerificationData | null>(null);
  const [islamicPrefs, setIslamicPrefs] = useState<IslamicPreferencesData | null>(null);
  const [privacySettings, setPrivacySettings] = useState<PrivacySettingsData | null>(null);
  const [completionStats, setCompletionStats] = useState<ProfileCompletionStats>({
    overall: 0,
    basicInfo: 0,
    islamicPrefs: 0,
    photos: 0,
    compatibility: 0,
    privacy: 0,
    verification: 0
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchProfileData();
  }, [user]);

  useEffect(() => {
    if (profile) {
      calculateCompletionStats();
    }
  }, [profile, compatibilityStats, islamicPrefs, privacySettings, verification]);

  const fetchProfileData = async () => {
    if (!user) return;

    try {
      const [profileRes, verificationRes, islamicRes, privacyRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('user_verifications').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('islamic_preferences').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('privacy_settings').select('*').eq('user_id', user.id).maybeSingle()
      ]);

      if (profileRes.error) throw profileRes.error;
      if (verificationRes.error) throw verificationRes.error;
      if (islamicRes.error) throw islamicRes.error;
      if (privacyRes.error) throw privacyRes.error;

      setProfile(profileRes.data);
      setVerification(verificationRes.data);
      setIslamicPrefs(islamicRes.data);
      setPrivacySettings(privacyRes.data);
    } catch (error) {
      console.error('Error fetching profile data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du profil",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateCompletionStats = () => {
    if (!profile) return;

    // Calculate basic info completion
    const basicFields = ['full_name', 'age', 'location', 'bio', 'education', 'profession'];
    const basicCompleted = basicFields.filter(field => {
      const value = profile[field as keyof ProfileData];
      return value !== null && value !== undefined && value !== '';
    }).length;
    const basicInfo = (basicCompleted / basicFields.length) * 100;

    // Photos completion
    const photos = profile.avatar_url ? 100 : 0;

    // Compatibility from hook
    const compatibility = compatibilityStats.completionPercentage;

    // Calculate Islamic preferences completion
    let islamicPrefsScore = 0;
    if (islamicPrefs) {
      const islamicFields = [
        'prayer_frequency', 'quran_reading', 'hijab_preference', 'beard_preference',
        'sect', 'madhab', 'importance_of_religion', 'desired_partner_sect'
      ];
      const islamicCompleted = islamicFields.filter(field => {
        const value = islamicPrefs[field as keyof IslamicPreferencesData];
        return value !== null && value !== undefined && value !== '';
      }).length;
      islamicPrefsScore = (islamicCompleted / islamicFields.length) * 100;
    }

    // Calculate privacy settings completion
    let privacyScore = 0;
    if (privacySettings) {
      const privacyFields = [
        'profile_visibility', 'photo_visibility', 'contact_visibility',
        'last_seen_visibility', 'allow_messages_from'
      ];
      const privacyCompleted = privacyFields.filter(field => {
        const value = privacySettings[field as keyof PrivacySettingsData];
        return value !== null && value !== undefined && value !== '';
      }).length;
      privacyScore = (privacyCompleted / privacyFields.length) * 100;
    }

    // Verification score
    const verificationScore = verification?.verification_score || 0;

    const overall = (basicInfo + islamicPrefsScore + photos + compatibility + privacyScore + verificationScore) / 6;

    setCompletionStats({
      overall: Math.round(overall),
      basicInfo: Math.round(basicInfo),
      islamicPrefs: Math.round(islamicPrefsScore),
      photos: Math.round(photos),
      compatibility: Math.round(compatibility),
      privacy: Math.round(privacyScore),
      verification: Math.round(verificationScore)
    });
  };

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 80) return 'text-emerald';
    if (percentage >= 60) return 'text-gold';
    if (percentage >= 40) return 'text-amber-600';
    return 'text-destructive';
  };

  const getCompletionIcon = (percentage: number) => {
    if (percentage >= 80) return CheckCircle;
    if (percentage >= 60) return AlertCircle;
    return AlertCircle;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-emerald/5 p-4">
        <div className="container mx-auto max-w-6xl">
          <Card className="shadow-lg">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald border-t-transparent mx-auto mb-4"></div>
                <p className="text-muted-foreground">Chargement du profil...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-emerald/5 p-4">
      <div className="container mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-gradient-to-br from-emerald to-gold rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Profil Enhanced</CardTitle>
                  <p className="text-muted-foreground">
                    Système de profil avancé avec IA et valeurs islamiques
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <SecurityStatusBadge />
                <Badge 
                  className={`${getCompletionColor(completionStats.overall)} bg-current/10`}
                  variant="outline"
                >
                  {completionStats.overall}% Complété
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Completion Overview */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald" />
              Progression du Profil
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { key: 'basicInfo', label: 'Infos de Base', icon: User },
                { key: 'islamicPrefs', label: 'Préférences', icon: Heart },
                { key: 'photos', label: 'Photos', icon: Camera },
                { key: 'compatibility', label: 'Compatibilité', icon: Brain },
                { key: 'privacy', label: 'Confidentialité', icon: Lock },
                { key: 'verification', label: 'Vérification', icon: Shield }
              ].map(({ key, label, icon: Icon }) => {
                const percentage = completionStats[key as keyof ProfileCompletionStats];
                const CompletionIcon = getCompletionIcon(percentage);
                return (
                  <div key={key} className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-1">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <CompletionIcon className={`h-4 w-4 ${getCompletionColor(percentage)}`} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium">{label}</p>
                      <Progress value={percentage} className="h-2" />
                      <p className="text-xs text-muted-foreground">{percentage}%</p>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-6 p-4 bg-gradient-to-r from-emerald/5 to-gold/5 rounded-lg border border-emerald/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-gold" />
                  <span className="font-medium">Score de Profil Global</span>
                </div>
                <Badge className="bg-gradient-to-r from-emerald to-gold text-primary-foreground">
                  {completionStats.overall}/100
                </Badge>
              </div>
              <Progress value={completionStats.overall} className="mt-2 h-3" />
              <p className="text-sm text-muted-foreground mt-2">
                {completionStats.overall >= 80 
                  ? 'Excellent ! Votre profil est prêt pour des matches de qualité.'
                  : completionStats.overall >= 60
                  ? 'Bon progrès ! Complétez quelques sections pour améliorer vos matches.'
                  : 'Continuez à compléter votre profil pour de meilleurs résultats.'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Vue d'ensemble</span>
            </TabsTrigger>
            <TabsTrigger value="wizard" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Assistant</span>
            </TabsTrigger>
            <TabsTrigger value="photos" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              <span className="hidden sm:inline">Photos</span>
            </TabsTrigger>
            <TabsTrigger value="islamic" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">Islamique</span>
            </TabsTrigger>
            <TabsTrigger value="compatibility" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">Compatibilité</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Confidentialité</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-emerald" />
                    Actions Rapides
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={() => setActiveTab('wizard')}
                    className="w-full justify-start bg-gradient-to-r from-emerald to-emerald-light text-primary-foreground"
                    disabled={completionStats.basicInfo >= 80}
                  >
                    <User className="h-4 w-4 mr-2" />
                    {completionStats.basicInfo >= 80 ? 'Profil de base complété' : 'Compléter le profil de base'}
                  </Button>
                  
                  <Button 
                    onClick={() => setActiveTab('photos')}
                    variant="outline"
                    className="w-full justify-start"
                    disabled={completionStats.photos >= 100}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    {completionStats.photos >= 100 ? 'Photos vérifiées' : 'Vérifier les photos'}
                  </Button>
                  
                  <Button 
                    onClick={() => setActiveTab('compatibility')}
                    variant="outline"
                    className="w-full justify-start"
                    disabled={completionStats.compatibility >= 80}
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    {completionStats.compatibility >= 80 ? 'Test complété' : 'Faire le test de compatibilité'}
                  </Button>
                  
                  <Button 
                    onClick={() => setActiveTab('islamic')}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Configurer les préférences islamiques
                  </Button>
                  
                  <Button 
                    onClick={() => setActiveTab('privacy')}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Paramètres de confidentialité
                  </Button>
                </CardContent>
              </Card>

              {/* Profile Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-gold" />
                    Résumé du Profil
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full overflow-hidden bg-gradient-to-br from-emerald/20 to-gold/20 flex items-center justify-center">
                      {profile?.avatar_url ? (
                        <img 
                          src={profile.avatar_url} 
                          alt="Photo de profil" 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold">{profile?.full_name || 'Non défini'}</h3>
                      <p className="text-sm text-muted-foreground">
                        {profile?.age ? `${profile.age} ans` : 'Âge non défini'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {profile?.location || 'Localisation non définie'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Qualité du profil</span>
                      <Badge variant="outline" className={getCompletionColor(completionStats.overall)}>
                        {completionStats.overall >= 80 ? 'Excellent' : 
                         completionStats.overall >= 60 ? 'Bon' : 'À améliorer'}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Compatibilité</span>
                      <span className="text-muted-foreground">
                        {compatibilityStats.answeredQuestions}/{compatibilityStats.totalQuestions} réponses
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Vérification</span>
                      <span className="text-muted-foreground">
                        {verification?.verification_score || 0}% vérifié
                      </span>
                    </div>
                  </div>

                  <Button 
                    onClick={() => navigate('/matches')}
                    className="w-full bg-gradient-to-r from-gold to-gold-light text-primary-foreground"
                    disabled={completionStats.overall < 60}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    {completionStats.overall >= 60 ? 'Voir mes Matches' : 'Complétez votre profil pour les matches'}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-emerald" />
                  Recommandations Personnalisées
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {completionStats.basicInfo < 80 && (
                    <div className="p-4 bg-accent/20 rounded-lg border border-accent/30">
                      <h4 className="font-medium text-primary mb-2">Complétez vos informations</h4>
                      <p className="text-sm text-muted-foreground">
                        Ajoutez plus de détails à votre profil pour de meilleurs matches.
                      </p>
                    </div>
                  )}
                  
                  {completionStats.photos < 100 && (
                    <div className="p-4 bg-secondary/50 rounded-lg border border-secondary">
                      <h4 className="font-medium text-secondary-foreground mb-2">Vérifiez vos photos</h4>
                      <p className="text-sm text-muted-foreground">
                        Les photos vérifiées augmentent la confiance de 300%.
                      </p>
                    </div>
                  )}
                  
                  {completionStats.compatibility < 70 && (
                    <div className="p-4 bg-emerald/5 rounded-lg border border-emerald/20">
                      <h4 className="font-medium text-emerald mb-2">Test de compatibilité</h4>
                      <p className="text-sm text-muted-foreground">
                        Améliorez vos matches avec notre IA avancée.
                      </p>
                    </div>
                  )}
                  
                  {completionStats.islamicPrefs < 70 && (
                    <div className="p-4 bg-gold/5 rounded-lg border border-gold/20">
                      <h4 className="font-medium text-gold mb-2">Préférences islamiques</h4>
                      <p className="text-sm text-muted-foreground">
                        Configurez vos préférences religieuses pour de meilleurs matches.
                      </p>
                    </div>
                  )}
                  
                  {completionStats.privacy < 70 && (
                    <div className="p-4 bg-sage/20 rounded-lg border border-sage/30">
                      <h4 className="font-medium text-sage-dark mb-2">Paramètres de confidentialité</h4>
                      <p className="text-sm text-muted-foreground">
                        Personnalisez qui peut voir vos informations.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wizard">
            <ProfileWizard onComplete={fetchProfileData} />
          </TabsContent>

          <TabsContent value="photos">
            <div className="space-y-6">
              <PhotoUpload 
                currentPhotoUrl={profile?.avatar_url}
                onPhotoUpdate={fetchProfileData}
              />
              <PhotoVerificationSystem 
                onComplete={() => {
                  fetchProfileData();
                  toast({ 
                    title: "Photos vérifiées", 
                    description: "Vos photos ont été traitées avec succès" 
                  });
                }} 
              />
            </div>
          </TabsContent>

          <TabsContent value="islamic">
            <EnhancedIslamicPreferences embedded />
          </TabsContent>

          <TabsContent value="compatibility">
            <CompatibilityAssessment embedded />
          </TabsContent>

          <TabsContent value="privacy">
            <EnhancedPrivacyControls embedded />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EnhancedProfile;

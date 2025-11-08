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
import PhotoUpload from '@/components/PhotoUpload';
import ProfileQualityPanel from '@/components/ProfileQualityPanel';

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
  const [profile, setProfile] = useState<ProfileData | undefined>(undefined);
  const [verification, setVerification] = useState<VerificationData | undefined>(undefined);
  const [islamicPrefs, setIslamicPrefs] = useState<IslamicPreferencesData | undefined>(undefined);
  const [privacySettings, setPrivacySettings] = useState<PrivacySettingsData | undefined>(undefined);
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
    
    // TIMEOUT de 10 secondes pour débloquer l'UI
    const timeoutId = setTimeout(() => {
      console.warn('⏰ TIMEOUT EnhancedProfile - Arrêt du chargement');
      setLoading(false);
      toast({
        title: "Chargement lent",
        description: "Certaines données n'ont pas pu être chargées. Réessayez ou contactez le support.",
        variant: "destructive"
      });
    }, 10000);
    
    fetchProfileData().finally(() => {
      clearTimeout(timeoutId);
    });
    
    return () => clearTimeout(timeoutId);
  }, [user]);

  useEffect(() => {
    if (profile) {
      calculateCompletionStats();
    }
  }, [profile, compatibilityStats, islamicPrefs, privacySettings, verification]);

  const fetchProfileData = async () => {
    console.log('📊 EnhancedProfile - Fetching profile data for user:', user?.id);
    if (!user) {
      console.log('📊 No user, aborting fetch');
      setLoading(false);
      return;
    }

    try {
      console.log('📊 Starting parallel fetch...');
      const [profileRes, verificationRes, islamicRes, privacyRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('user_verifications').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('islamic_preferences').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('privacy_settings').select('*').eq('user_id', user.id).maybeSingle()
      ]);

      console.log('📊 Fetch results:', {
        profile: profileRes.data,
        profileError: profileRes.error,
        verification: verificationRes.data,
        verificationError: verificationRes.error,
        islamic: islamicRes.data,
        islamicError: islamicRes.error,
        privacy: privacyRes.data,
        privacyError: privacyRes.error
      });

      // Don't throw on individual errors - set undefined data instead
      if (profileRes.error) {
        console.error('📊 Profile error:', profileRes.error);
        setProfile(undefined);
      } else if (profileRes.data) {
        setProfile({
          ...profileRes.data,
          full_name: profileRes.data.full_name ?? '',
          age: profileRes.data.age ?? 0,
          avatar_url: profileRes.data.avatar_url ?? undefined,
          bio: profileRes.data.bio ?? undefined,
          location: profileRes.data.location ?? undefined,
          education: profileRes.data.education ?? undefined,
          profession: profileRes.data.profession ?? undefined,
          interests: (profileRes.data.interests ?? []).filter((i): i is string => i !== null)
        } as ProfileData);
      }

      if (verificationRes.error) {
        console.error('📊 Verification error:', verificationRes.error);
        setVerification(undefined);
      } else if (verificationRes.data) {
        setVerification({
          email_verified: !!verificationRes.data.email_verified,
          phone_verified: !!verificationRes.data.phone_verified,
          id_verified: !!verificationRes.data.id_verified,
          family_verified: !!verificationRes.data.family_verified,
          verification_score: verificationRes.data.verification_score ?? 0,
          verification_documents: (verificationRes.data.verification_documents ?? []).filter((d): d is string => d !== null),
          verification_notes: verificationRes.data.verification_notes ?? undefined,
          verified_at: verificationRes.data.verified_at ?? undefined
        });
      }

      if (islamicRes.error) {
        console.error('📊 Islamic prefs error:', islamicRes.error);
        setIslamicPrefs(undefined);
      } else if (islamicRes.data) {
        setIslamicPrefs({
          prayer_frequency: islamicRes.data.prayer_frequency ?? undefined,
          quran_reading: islamicRes.data.quran_reading ?? undefined,
          hijab_preference: islamicRes.data.hijab_preference ?? undefined,
          beard_preference: islamicRes.data.beard_preference ?? undefined,
          sect: islamicRes.data.sect ?? undefined,
          madhab: islamicRes.data.madhab ?? undefined,
          halal_diet: !!islamicRes.data.halal_diet,
          smoking: islamicRes.data.smoking ?? undefined,
          desired_partner_sect: islamicRes.data.desired_partner_sect ?? undefined,
          importance_of_religion: islamicRes.data.importance_of_religion ?? undefined
        });
      }

      if (privacyRes.error) {
        console.error('📊 Privacy error:', privacyRes.error);
        setPrivacySettings(undefined);
      } else if (privacyRes.data) {
        setPrivacySettings({
          profile_visibility: privacyRes.data.profile_visibility ?? undefined,
          photo_visibility: privacyRes.data.photo_visibility ?? undefined,
          contact_visibility: privacyRes.data.contact_visibility ?? undefined,
          last_seen_visibility: privacyRes.data.last_seen_visibility ?? undefined,
          allow_messages_from: privacyRes.data.allow_messages_from ?? undefined,
          allow_family_involvement: !!privacyRes.data.allow_family_involvement
        });
      }

      console.log('📊 All data loaded successfully');
    } catch (error) {
      console.error('📊 Critical error fetching profile data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du profil",
        variant: "destructive"
      });
    } finally {
      console.log('📊 Setting loading to false');
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
      console.log('📊 Islamic Prefs Data:', islamicPrefs);
      const islamicFields = [
        'prayer_frequency', 'quran_reading', 'hijab_preference', 'beard_preference',
        'sect', 'madhab', 'importance_of_religion', 'desired_partner_sect', 'smoking'
      ];
      const islamicCompleted = islamicFields.filter(field => {
        const value = islamicPrefs[field as keyof IslamicPreferencesData];
        const isCompleted = value !== null && value !== undefined && value !== '';
        console.log(`📊 Field ${field}: ${value} (completed: ${isCompleted})`);
        return isCompleted;
      }).length;
      
      // Count halal_diet separately (boolean field)
      const halalDietCompleted = islamicPrefs.halal_diet !== null && islamicPrefs.halal_diet !== undefined ? 1 : 0;
      console.log(`📊 Field halal_diet: ${islamicPrefs.halal_diet} (completed: ${halalDietCompleted > 0})`);
      
      const totalFields = islamicFields.length + 1; // +1 for halal_diet
      const totalCompleted = islamicCompleted + halalDietCompleted;
      islamicPrefsScore = (totalCompleted / totalFields) * 100;
      console.log(`📊 Islamic Prefs Score: ${totalCompleted}/${totalFields} = ${islamicPrefsScore}%`);
    } else {
      console.log('📊 No Islamic Prefs data found');
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
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-card rounded-lg border p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Mon Profil</h1>
            <p className="text-muted-foreground">
              Gérez vos informations et préférences
            </p>
          </div>
          <div className="flex items-center gap-3">
            <VerificationBadge verificationScore={verification?.verification_score || 0} />
            <Badge variant="outline">
              {completionStats.overall}% Complété
            </Badge>
          </div>
        </div>
      </div>

      {/* Completion Progress */}
      <div className="bg-card rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-4">Progression du Profil</h2>
        <div className="space-y-4">
          {[
            { key: 'basicInfo', label: 'Informations de Base', icon: User },
            { key: 'islamicPrefs', label: 'Préférences Islamiques', icon: Heart },
            { key: 'photos', label: 'Photos', icon: Camera },
            { key: 'compatibility', label: 'Test de Compatibilité', icon: Brain },
            { key: 'privacy', label: 'Paramètres de Confidentialité', icon: Lock },
            { key: 'verification', label: 'Vérification', icon: Shield }
          ].map(({ key, label, icon: Icon }) => {
            const percentage = completionStats[key as keyof ProfileCompletionStats];
            return (
              <div key={key} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">{label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={percentage} className="w-32 h-2" />
                  <span className="text-sm font-medium w-12 text-right">{percentage}%</span>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/10">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Score Global</span>
            <Badge variant="outline">{completionStats.overall}/100</Badge>
          </div>
          <Progress value={completionStats.overall} className="h-3" />
        </div>
      </div>

      {/* Profile Sections */}
      <div className="bg-card rounded-lg border p-6">
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

            {/* Profile Quality Panel */}
            <ProfileQualityPanel
              profileData={profile}
              islamicPrefs={islamicPrefs}
              onNavigateToSection={(sectionId) => {
                const tabMap: Record<string, string> = {
                  'basic_info': 'wizard',
                  'bio': 'wizard',
                  'interests': 'wizard',
                  'islamic': 'islamic',
                  'photo': 'photos'
                };
                const targetTab = tabMap[sectionId];
                if (targetTab) {
                  setActiveTab(targetTab);
                }
              }}
            />

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
            <EnhancedIslamicPreferences 
              embedded 
              onComplete={() => {
                fetchProfileData();
                toast({ 
                  title: "Préférences sauvegardées", 
                  description: "Vos préférences islamiques ont été enregistrées avec succès" 
                });
              }}
            />
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

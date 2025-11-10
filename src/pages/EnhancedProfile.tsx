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
import { motion, AnimatePresence } from 'framer-motion';
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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0
    }
  };

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-emerald/5 p-4"
      >
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
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Section */}
      <motion.div 
        variants={itemVariants}
        className="bg-card rounded-lg border p-6"
      >
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Mon Profil</h1>
            <p className="text-muted-foreground">
              Gérez vos informations et préférences
            </p>
          </div>
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            >
              <VerificationBadge verificationScore={verification?.verification_score || 0} />
            </motion.div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
            >
              <Badge variant="outline">
                {completionStats.overall}% Complété
              </Badge>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Profile Sections */}
      <motion.div 
        variants={itemVariants}
        className="bg-card rounded-lg border p-6"
      >
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
            <AnimatePresence mode="wait">
              <motion.div
                key="overview"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Quick Actions and Profile Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.4 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5 text-emerald" />
                      Actions Rapides
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button 
                        onClick={() => setActiveTab('wizard')}
                        className="w-full justify-start bg-gradient-to-r from-emerald to-emerald-light text-primary-foreground"
                        disabled={completionStats.basicInfo >= 80}
                      >
                        <User className="h-4 w-4 mr-2" />
                        {completionStats.basicInfo >= 80 ? 'Profil de base complété' : 'Compléter le profil de base'}
                      </Button>
                    </motion.div>
                    
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button 
                        onClick={() => setActiveTab('photos')}
                        variant="outline"
                        className="w-full justify-start"
                        disabled={completionStats.photos >= 100}
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        {completionStats.photos >= 100 ? 'Photos vérifiées' : 'Vérifier les photos'}
                      </Button>
                    </motion.div>
                    
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button 
                        onClick={() => setActiveTab('compatibility')}
                        variant="outline"
                        className="w-full justify-start"
                        disabled={completionStats.compatibility >= 80}
                      >
                        <Brain className="h-4 w-4 mr-2" />
                        {completionStats.compatibility >= 80 ? 'Test complété' : 'Faire le test de compatibilité'}
                      </Button>
                    </motion.div>
                    
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button 
                        onClick={() => setActiveTab('islamic')}
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <Heart className="h-4 w-4 mr-2" />
                        Configurer les préférences islamiques
                      </Button>
                    </motion.div>
                    
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button 
                        onClick={() => setActiveTab('privacy')}
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Paramètres de confidentialité
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Profile Summary */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
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

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button 
                        onClick={() => navigate('/matches')}
                        className="w-full bg-gradient-to-r from-gold to-gold-light text-primary-foreground"
                        disabled={completionStats.overall < 60}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        {completionStats.overall >= 60 ? 'Voir mes Matches' : 'Complétez votre profil pour les matches'}
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Completion Progress */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">Progression du Profil</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    {[
                      { key: 'basicInfo', label: 'Informations de Base', icon: User },
                      { key: 'islamicPrefs', label: 'Préférences Islamiques', icon: Heart },
                      { key: 'photos', label: 'Photos', icon: Camera },
                      { key: 'compatibility', label: 'Test de Compatibilité', icon: Brain },
                      { key: 'privacy', label: 'Paramètres de Confidentialité', icon: Lock },
                      { key: 'verification', label: 'Vérification', icon: Shield }
                    ].map(({ key, label, icon: Icon }, index) => {
                      const percentage = completionStats[key as keyof ProfileCompletionStats];
                      return (
                        <motion.div
                          key={key}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + index * 0.1, duration: 0.4 }}
                          whileHover={{ scale: 1.02, x: 5 }}
                          className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="h-5 w-5 text-muted-foreground" />
                            <span className="font-medium">{label}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ delay: 0.5 + index * 0.1, duration: 1, ease: "easeOut" }}
                                className="h-full bg-primary"
                              />
                            </div>
                            <motion.span
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.7 + index * 0.1 }}
                              className="text-sm font-medium w-12 text-right"
                            >
                              {percentage}%
                            </motion.span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                  
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1, duration: 0.5 }}
                    className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/10"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Score Global</span>
                      <Badge variant="outline">{completionStats.overall}/100</Badge>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${completionStats.overall}%` }}
                        transition={{ delay: 1.2, duration: 1.5, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-primary to-primary/80"
                      />
                    </div>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Profile Quality Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
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
            </motion.div>

            {/* Recommendations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
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
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.7, duration: 0.4 }}
                        whileHover={{ scale: 1.05, y: -5 }}
                        className="p-4 bg-accent/20 rounded-lg border border-accent/30 cursor-pointer"
                      >
                        <h4 className="font-medium text-primary mb-2">Complétez vos informations</h4>
                        <p className="text-sm text-muted-foreground">
                          Ajoutez plus de détails à votre profil pour de meilleurs matches.
                        </p>
                      </motion.div>
                    )}
                    
                    {completionStats.photos < 100 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8, duration: 0.4 }}
                        whileHover={{ scale: 1.05, y: -5 }}
                        className="p-4 bg-secondary/50 rounded-lg border border-secondary cursor-pointer"
                      >
                        <h4 className="font-medium text-secondary-foreground mb-2">Vérifiez vos photos</h4>
                        <p className="text-sm text-muted-foreground">
                          Les photos vérifiées augmentent la confiance de 300%.
                        </p>
                      </motion.div>
                    )}
                    
                    {completionStats.compatibility < 70 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.9, duration: 0.4 }}
                        whileHover={{ scale: 1.05, y: -5 }}
                        className="p-4 bg-emerald/5 rounded-lg border border-emerald/20 cursor-pointer"
                      >
                        <h4 className="font-medium text-emerald mb-2">Test de compatibilité</h4>
                        <p className="text-sm text-muted-foreground">
                          Améliorez vos matches avec notre IA avancée.
                        </p>
                      </motion.div>
                    )}
                    
                    {completionStats.islamicPrefs < 70 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.0, duration: 0.4 }}
                        whileHover={{ scale: 1.05, y: -5 }}
                        className="p-4 bg-gold/5 rounded-lg border border-gold/20 cursor-pointer"
                      >
                        <h4 className="font-medium text-gold mb-2">Préférences islamiques</h4>
                        <p className="text-sm text-muted-foreground">
                          Configurez vos préférences religieuses pour de meilleurs matches.
                        </p>
                      </motion.div>
                    )}
                    
                    {completionStats.privacy < 70 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.1, duration: 0.4 }}
                        whileHover={{ scale: 1.05, y: -5 }}
                        className="p-4 bg-sage/20 rounded-lg border border-sage/30 cursor-pointer"
                      >
                        <h4 className="font-medium text-sage-dark mb-2">Paramètres de confidentialité</h4>
                        <p className="text-sm text-muted-foreground">
                          Personnalisez qui peut voir vos informations.
                        </p>
                      </motion.div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="wizard">
            <AnimatePresence mode="wait">
              <motion.div
                key="wizard"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <ProfileWizard onComplete={fetchProfileData} />
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="photos">
            <AnimatePresence mode="wait">
              <motion.div
                key="photos"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
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
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="islamic">
            <AnimatePresence mode="wait">
              <motion.div
                key="islamic"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
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
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="compatibility">
            <AnimatePresence mode="wait">
              <motion.div
                key="compatibility"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <CompatibilityAssessment embedded />
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="privacy">
            <AnimatePresence mode="wait">
              <motion.div
                key="privacy"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <EnhancedPrivacyControls embedded />
              </motion.div>
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
};

export default EnhancedProfile;

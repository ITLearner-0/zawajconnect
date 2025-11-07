import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserData } from '@/contexts/UserDataContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import PhotoUpload from '@/components/PhotoUpload';
import OnboardingWelcome from '@/components/onboarding/OnboardingWelcome';
import ProfilePreview from '@/components/onboarding/ProfilePreview';
import StepIndicator from '@/components/onboarding/StepIndicator';
import InterestsSelector from '@/components/onboarding/InterestsSelector';
import StepValidation from '@/components/onboarding/StepValidation';
import PhotoUploadStep from '@/components/onboarding/PhotoUploadStep';
import IslamicPreferencesStep from '@/components/onboarding/IslamicPreferencesStep';
import MobileStepNavigation from '@/components/onboarding/MobileStepNavigation';
import { SessionResumptionModal } from '@/components/onboarding/SessionResumptionModal';
import { KeyboardShortcutsPanel } from '@/components/onboarding/KeyboardShortcutsPanel';
import { SmartSuggestionPanel } from '@/components/onboarding/SmartSuggestionPanel';
import { useOnboardingValidation } from '@/hooks/useOnboardingValidation';
import { useOnboardingPersistence } from '@/hooks/useOnboardingPersistence';
import { useOnboardingAnalytics } from '@/hooks/useOnboardingAnalytics';
import { useOnboardingKeyboardNavigation } from '@/hooks/useOnboardingKeyboardNavigation';
import { useOnboardingSuggestions } from '@/hooks/useOnboardingSuggestions';
import { useOnboardingAchievements } from '@/hooks/useOnboardingAchievements';
import { useOnboardingTutorial } from '@/hooks/useOnboardingTutorial';
import { useProfileSave } from '@/hooks/useProfileSave';
import OnboardingTooltip from '@/components/onboarding/OnboardingTooltip';
import ProfileExamplesModal from '@/components/onboarding/ProfileExamplesModal';
import ProgressCelebration from '@/components/onboarding/ProgressCelebration';
import { SaveStatusIndicator } from '@/components/SaveStatusIndicator';
import { 
  ArrowLeft, 
  ArrowRight, 
  User, 
  Heart, 
  Camera, 
  MapPin, 
  CheckCircle,
  Sparkles,
  Star,
  Target,
  Settings,
  Keyboard
} from 'lucide-react';

interface ProfileData {
  full_name: string;
  age: number | undefined;
  gender: string;
  location: string;
  education: string;
  profession: string;
  bio: string;
  looking_for: string;
  interests: string[];
  avatar_url: string;
}

interface IslamicPreferences {
  prayer_frequency: string;
  quran_reading: string;
  hijab_preference: string;
  beard_preference: string;
  sect: string;
  madhab: string;
  halal_diet: boolean;
  smoking: string;
  desired_partner_sect: string;
  importance_of_religion: string;
}

const Onboarding = () => {
  const { user } = useAuth();
  const { refreshUserData } = useUserData();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [showWelcome, setShowWelcome] = useState(true);
  const [showResumptionModal, setShowResumptionModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setSaving] = useState(false);
  const [savedSessionData, setSavedSessionData] = useState<{
    step: number;
    progress: number;
    lastSaveTime?: Date;
  } | null>(null);

  // Profile data states
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: '',
    age: undefined,
    gender: '',
    location: '',
    education: '',
    profession: '',
    bio: '',
    looking_for: '',
    interests: [],
    avatar_url: ''
  });

  const [skippedSections, setSkippedSections] = useState<string[]>([]);

  const [islamicPrefs, setIslamicPrefs] = useState<IslamicPreferences>({
    prayer_frequency: '',
    quran_reading: '',
    hijab_preference: '',
    beard_preference: '',
    sect: '',
    madhab: '',
    halal_diet: true,
    smoking: '',
    desired_partner_sect: '',
    importance_of_religion: ''
  });

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  // Use hooks
  const validation = useOnboardingValidation({
    profileData,
    islamicPrefs,
    currentStep
  });

  // Unified persistence hook - replaces useFormAutoSave, useEmergencyBackup, and useFormPersistence
  const persistence = useOnboardingPersistence({
    profileData,
    islamicPrefs,
    currentStep,
    skippedSections
  });

  // Analytics tracking
  const analytics = useOnboardingAnalytics();

  // Profile save hook
  const { saveProfile: saveToDatabase, uploadAvatar, saving } = useProfileSave();

  // Smart suggestions hook
  const suggestions = useOnboardingSuggestions();
  const [bioSuggestions, setBioSuggestions] = useState<string[]>([]);
  const [islamicSuggestions, setIslamicSuggestions] = useState<any>(null);
  const [interestsSuggestions, setInterestsSuggestions] = useState<string[]>([]);

  // Achievements hook
  const { checkProfileComplete, checkSpeedMaster, checkDetailOriented } = useOnboardingAchievements();
  const [onboardingStartTime] = useState(Date.now());

  // Tutorial hook
  const tutorial = useOnboardingTutorial(currentStep);
  const [showExamplesModal, setShowExamplesModal] = useState(false);

  const calculateCompletionPercentage = validation.getOverallProgress;

  const steps = [
    {
      id: 1,
      title: "Informations personnelles",
      description: "Nom, âge, localisation",
      icon: <User className="w-5 h-5" />,
      estimatedTime: "30s"
    },
    {
      id: 2,
      title: "Profil détaillé",
      description: "Éducation, profession, bio",
      icon: <Settings className="w-5 h-5" />,
      estimatedTime: "1min"
    },
    {
      id: 3,
      title: "Préférences islamiques",
      description: "Pratiques religieuses",
      icon: <Heart className="w-5 h-5" />,
      estimatedTime: "1min"
    },
    {
      id: 4,
      title: "Objectifs",
      description: "Ce que vous recherchez",
      icon: <Target className="w-5 h-5" />,
      estimatedTime: "30s"
    }
  ];

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    // Check if this is a Wali user and redirect to Wali onboarding
    const userType = user.user_metadata?.user_type;
    
    if (userType === 'wali') {
      const token = user.user_metadata?.invitation_token;
      navigate(`/wali-onboarding${token ? `?token=${token}` : ''}`);
      return;
    }
    
    // PRIORITÉ: Charger d'abord les données de la base de données
    loadExistingData();
  }, [user, navigate]);

  const loadExistingData = async () => {
    if (!user) return;

    try {
      console.log('📂 Chargement des données avec le système unifié...');
      
      // Use intelligent restore from unified persistence hook
      const restoredData = await persistence.restore();

      if (restoredData && (restoredData.profileData || restoredData.islamicPrefs)) {
        // First restore the data to state
        if (restoredData.profileData) {
          setProfileData(restoredData.profileData);
        }
        if (restoredData.islamicPrefs) {
          setIslamicPrefs(restoredData.islamicPrefs);
        }
        if (restoredData.currentStep) {
          setCurrentStep(restoredData.currentStep);
        }
        if (restoredData.skippedSections) {
          setSkippedSections(restoredData.skippedSections);
        }

        // Wait for state to update, then calculate progress and show modal
        setTimeout(() => {
          const savedStep = restoredData.currentStep || 1;
          const savedProgress = validation.getOverallProgress();

          setSavedSessionData({
            step: savedStep,
            progress: savedProgress,
            lastSaveTime: restoredData.timestamp ? new Date(restoredData.timestamp) : undefined,
          });
          setShowResumptionModal(true);
          setShowWelcome(false);
        }, 100);
        
        console.log('✅ Données restaurées - modal affichée');
      } else {
        console.log('ℹ️ Aucune donnée sauvegardée trouvée');
      }
      
    } catch (error) {
      console.error('❌ Erreur chargement données:', error);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger vos données sauvegardées.",
        variant: "destructive"
      });
    }
  };

  const startOnboarding = () => {
    setShowWelcome(false);
    // Track onboarding start
    analytics.trackStepStart(1);
  };

  const handleContinueSession = () => {
    setShowResumptionModal(false);
    // Data is already loaded, just continue
  };

  const handleRestartSession = () => {
    // Clear all saved data and restart
    persistence.clearAll();
    setProfileData({
      full_name: '',
      age: undefined,
      gender: '',
      location: '',
      education: '',
      profession: '',
      bio: '',
      looking_for: '',
      interests: [],
      avatar_url: ''
    });
    setIslamicPrefs({
      prayer_frequency: '',
      quran_reading: '',
      hijab_preference: '',
      beard_preference: '',
      sect: '',
      madhab: '',
      halal_diet: true,
      smoking: '',
      desired_partner_sect: '',
      importance_of_religion: ''
    });
    setCurrentStep(1);
    setSkippedSections([]);
    setSavedSessionData(null);
    setShowResumptionModal(false);
    setShowWelcome(true);
  };

  const handleSkipSection = (sectionName: string) => {
    setSkippedSections(prev => [...prev, sectionName]);
    // Track skipped section
    console.log(`Section skipped: ${sectionName}`);
    nextStep();
  };

  // Suggestion generators
  const handleGenerateBioSuggestions = async () => {
    const result = await suggestions.generateBioSuggestions({
      interests: profileData.interests,
      profession: profileData.profession,
      education: profileData.education,
      lookingFor: profileData.looking_for
    });
    
    if (result && Array.isArray(result)) {
      setBioSuggestions(result);
    }
  };

  const handleGenerateIslamicSuggestions = async () => {
    const result = await suggestions.generateIslamicPreferencesSuggestions({
      sect: islamicPrefs.sect,
      madhab: islamicPrefs.madhab,
      prayerFrequency: islamicPrefs.prayer_frequency,
      quranReading: islamicPrefs.quran_reading,
      importanceOfReligion: islamicPrefs.importance_of_religion,
      halalDiet: islamicPrefs.halal_diet,
      hijabPreference: islamicPrefs.hijab_preference,
      beardPreference: islamicPrefs.beard_preference
    });
    
    if (result) {
      setIslamicSuggestions(result);
    }
  };

  const handleGenerateInterestsSuggestions = async () => {
    const result = await suggestions.generateInterestsSuggestions({
      currentInterests: profileData.interests,
      profession: profileData.profession,
      education: profileData.education
    });
    
    if (result && Array.isArray(result)) {
      setInterestsSuggestions(result);
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      // Track step completion
      analytics.trackStepComplete(currentStep);
      
      // Move to next step and track start
      const nextStepNumber = currentStep + 1;
      setCurrentStep(nextStepNumber);
      analytics.trackStepStart(nextStepNumber);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      // Track step abandon when going back
      analytics.trackStepAbandon(currentStep, 'navigated_back');
      
      const prevStepNumber = currentStep - 1;
      setCurrentStep(prevStepNumber);
      analytics.trackStepStart(prevStepNumber);
    }
  };

  const saveProfile = async () => {
    if (!user) return false;
    
    try {
      // Check if profile exists first
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingProfile) {
        // Update existing profile
        const { error } = await supabase
          .from('profiles')
          .update(profileData)
          .eq('user_id', user.id);
        
        if (error) throw error;
      } else {
        // Insert or update profile using upsert to avoid conflicts
        const { error } = await supabase
          .from('profiles')
          .upsert({
            user_id: user.id,
            ...profileData
          }, {
            onConflict: 'user_id',
            ignoreDuplicates: false
          });
        
        if (error) throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Error saving profile:', error);
      return false;
    }
  };

  const saveIslamicPreferences = async () => {
    if (!user) return false;
    
    try {
      // Filter out empty strings and replace with null, remove undefined values
      const cleanPrefs = Object.fromEntries(
        Object.entries(islamicPrefs)
          .filter(([_, value]) => value !== undefined)
          .map(([key, value]) => [
            key,
            value === '' || value === null ? null : value
          ])
      );

      // Check if preferences exist first
      const { data: existingPrefs } = await supabase
        .from('islamic_preferences')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingPrefs) {
        // Update existing preferences
        const { error } = await supabase
          .from('islamic_preferences')
          .update(cleanPrefs)
          .eq('user_id', user.id);
        
        if (error) throw error;
      } else {
        // Insert new preferences
        const { error } = await supabase
          .from('islamic_preferences')
          .insert({
            user_id: user.id,
            ...cleanPrefs
          });
        
        if (error) throw error;
      }

      return true;
    } catch (error) {
      console.error('Error saving Islamic preferences:', error);
      return false;
    }
  };

  const completeOnboarding = async () => {
    if (!user) {
      toast({
        title: "Erreur d'authentification",
        description: "Vous devez être connecté pour finaliser votre profil.",
        variant: "destructive"
      });
      return;
    }

    // Prevent double submission
    if (saving) {
      console.log('Already saving, preventing double submission');
      return;
    }

    // Validate required fields before saving
    if (!profileData.full_name || !profileData.age || !profileData.gender) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive"
      });
      return;
    }

    // Ensure gender is in correct format
    const validGenders = ['male', 'female'];
    if (!validGenders.includes(profileData.gender)) {
      console.error('Invalid gender value:', profileData.gender);
      toast({
        title: "Erreur de validation",
        description: "Veuillez sélectionner un genre valide.",
        variant: "destructive"
      });
      return;
    }

    console.log('Profile data before save:', JSON.stringify(profileData, null, 2));
    console.log('Islamic preferences before save:', JSON.stringify(islamicPrefs, null, 2));
    
    // Double check gender value before calling hook
    console.log('ONBOARDING DEBUG - Gender value before save:', JSON.stringify(profileData.gender));
    console.log('ONBOARDING DEBUG - Gender type:', typeof profileData.gender);
    console.log('ONBOARDING DEBUG - Is valid gender?', ['male', 'female'].includes(profileData.gender));
    
    setSaving(true);
    
    try {
      const result = await saveToDatabase(profileData, islamicPrefs);
      
      if (result.success) {
        // Track onboarding completion
        analytics.trackOnboardingComplete();
        
        // Check and unlock achievements
        await checkProfileComplete(calculateCompletionPercentage());
        await checkSpeedMaster(onboardingStartTime);
        if (profileData.bio) {
          await checkDetailOriented(profileData.bio.length);
        }
        
        // Clear all saved data on successful completion
        persistence.clearAll();
        
        // Refresh user data to update profileComplete status
        await refreshUserData();
        
        navigate('/enhanced-profile');
      } else {
        toast({
          title: "Erreur de sauvegarde",
          description: result.error || "Une erreur est survenue lors de la sauvegarde de votre profil.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Onboarding completion error:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const isStepValid = () => validation.isStepValid(currentStep);

  // Keyboard navigation - after all handler functions are defined
  const keyboardNav = useOnboardingKeyboardNavigation({
    onNextStep: nextStep,
    onPrevStep: prevStep,
    canGoNext: isStepValid(),
    canGoPrev: currentStep > 1,
    currentStep,
    totalSteps,
  });

  const handleStepClick = (step: number) => {
    // Allow navigation to previous steps or current step
    if (step <= currentStep) {
      setCurrentStep(step);
    }
  };

  // Show welcome screen first
  if (showWelcome) {
    return (
      <OnboardingWelcome 
        onStart={startOnboarding}
        userName={user?.user_metadata?.full_name}
      />
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2 mb-8">
              <div className="flex justify-center">
                <div className="h-12 w-12 bg-gradient-to-br from-emerald to-emerald-light rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold">Informations personnelles</h2>
              <p className="text-muted-foreground">Parlez-nous un peu de vous</p>
              {tutorial.tutorialEnabled && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowExamplesModal(true)}
                  className="mt-2"
                >
                  <Star className="h-4 w-4 mr-2" />
                  Voir des exemples de profils
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Label htmlFor="fullName">Nom complet *</Label>
                <Input
                  id="fullName"
                  value={profileData.full_name}
                  onChange={(e) => {
                    setProfileData({...profileData, full_name: e.target.value});
                    if (e.target.value && tutorial.tutorialEnabled) {
                      tutorial.markFieldComplete('full_name');
                    }
                  }}
                  onFocus={() => tutorial.showTooltip('full_name')}
                  onBlur={() => tutorial.hideTooltip()}
                  placeholder="Votre nom complet"
                  required
                />
                {tutorial.currentTooltip === 'full_name' && tutorial.tutorialEnabled && (
                  <OnboardingTooltip
                    title="Votre nom complet"
                    description="Utilisez votre vrai nom pour établir la confiance"
                    tips={[
                      'Soyez authentique - utilisez votre vrai nom',
                      'Évitez les pseudonymes ou surnoms',
                      'La transparence est clé dans les rencontres halal'
                    ]}
                    example="Ahmed Ben Ali"
                    isVisible={true}
                    onClose={() => tutorial.hideTooltip()}
                    onMarkComplete={() => tutorial.markFieldComplete('full_name')}
                  />
                )}
              </div>
              <div>
                <Label htmlFor="age">Âge *</Label>
                <Input
                  id="age"
                  type="number"
                  value={profileData.age || ''}
                  onChange={(e) => setProfileData({...profileData, age: parseInt(e.target.value) || undefined})}
                  placeholder="Votre âge"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Genre *</Label>
                <Select value={profileData.gender} onValueChange={(value) => setProfileData({...profileData, gender: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez votre genre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Homme</SelectItem>
                    <SelectItem value="female">Femme</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="location">Localisation *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="location"
                    value={profileData.location}
                    onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                    placeholder="Ville, Pays"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2 mb-8">
              <div className="flex justify-center">
                <div className="h-12 w-12 bg-gradient-to-br from-emerald to-emerald-light rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold">Profil professionnel</h2>
              <p className="text-muted-foreground">Votre parcours et personnalité</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="education">Éducation *</Label>
                <Input
                  id="education"
                  value={profileData.education}
                  onChange={(e) => setProfileData({...profileData, education: e.target.value})}
                  placeholder="Votre niveau d'éducation"
                  required
                />
              </div>
              <div>
                <Label htmlFor="profession">Profession *</Label>
                <Input
                  id="profession"
                  value={profileData.profession}
                  onChange={(e) => setProfileData({...profileData, profession: e.target.value})}
                  placeholder="Votre profession"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="bio">À propos de moi *</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleGenerateBioSuggestions}
                  disabled={suggestions.loading || !profileData.profession}
                  className="h-8 gap-1"
                >
                  <Sparkles className="h-3 w-3" />
                  <span className="text-xs">Suggestions IA</span>
                </Button>
              </div>
              <div className="relative">
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => {
                    setProfileData({...profileData, bio: e.target.value});
                    if (e.target.value.length > 50 && tutorial.tutorialEnabled) {
                      tutorial.markFieldComplete('bio');
                    }
                  }}
                  onFocus={() => tutorial.showTooltip('bio')}
                  onBlur={() => tutorial.hideTooltip()}
                  placeholder="Décrivez-vous en quelques phrases..."
                  rows={4}
                  required
                />
                {tutorial.currentTooltip === 'bio' && tutorial.tutorialEnabled && (
                  <OnboardingTooltip
                    title="Votre biographie"
                    description="Présentez-vous de manière authentique et engageante"
                    tips={[
                      'Visez 150-250 caractères pour l\'optimal',
                      'Parlez de vos valeurs, passions et objectifs',
                      'Soyez positif et authentique',
                      'Mentionnez ce qui vous rend unique'
                    ]}
                    example="Ingénieur passionné par la technologie et l'innovation. J'aime voyager, découvrir de nouvelles cultures et pratiquer le sport. Je recherche une personne partageant mes valeurs pour construire une famille solide basée sur la foi et le respect mutuel."
                    isVisible={true}
                    onClose={() => tutorial.hideTooltip()}
                    onMarkComplete={() => tutorial.markFieldComplete('bio')}
                    position="bottom"
                  />
                )}
              </div>
              
              {/* Bio Suggestions */}
              {bioSuggestions.length > 0 && (
                <SmartSuggestionPanel
                  title="Suggestions de bio"
                  description="Cliquez sur une suggestion pour l'utiliser"
                  suggestions={bioSuggestions}
                  loading={suggestions.loading}
                  onSelect={(suggestion) => setProfileData({...profileData, bio: suggestion})}
                  onRefresh={handleGenerateBioSuggestions}
                />
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Centres d'intérêt</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleGenerateInterestsSuggestions}
                  disabled={suggestions.loading}
                  className="h-8 gap-1"
                >
                  <Sparkles className="h-3 w-3" />
                  <span className="text-xs">Suggestions</span>
                </Button>
              </div>
              
              {/* Interests Suggestions */}
              {interestsSuggestions.length > 0 && (
                <SmartSuggestionPanel
                  title="Suggestions d'intérêts"
                  suggestions={interestsSuggestions}
                  loading={suggestions.loading}
                  onSelect={(suggestion) => {
                    if (!profileData.interests.includes(suggestion)) {
                      setProfileData({
                        ...profileData,
                        interests: [...profileData.interests, suggestion]
                      });
                    }
                  }}
                  compact
                />
              )}
              
              <InterestsSelector 
                interests={profileData.interests}
                onInterestsChange={(interests) => setProfileData({...profileData, interests})}
              />
              {(!profileData.interests || profileData.interests.length === 0) && (
                <div className="flex justify-center">
                  <Button
                    variant="ghost"
                    onClick={() => handleSkipSection('interests')}
                    className="text-muted-foreground"
                  >
                    Je compléterai plus tard
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <PhotoUploadStep 
                avatarUrl={profileData.avatar_url}
                onPhotoChange={(url) => setProfileData({...profileData, avatar_url: url})}
                userName={profileData.full_name}
              />
              {!profileData.avatar_url && (
                <div className="flex justify-center">
                  <Button
                    variant="ghost"
                    onClick={() => handleSkipSection('photo')}
                    className="text-muted-foreground"
                  >
                    Je compléterai plus tard
                  </Button>
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            {/* Islamic Suggestions */}
            {islamicSuggestions && (
              <SmartSuggestionPanel
                title="Suggestions et avertissements"
                description="L'IA a analysé vos préférences islamiques"
                suggestions={islamicSuggestions}
                loading={suggestions.loading}
              />
            )}
            
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateIslamicSuggestions}
                disabled={suggestions.loading || !islamicPrefs.sect}
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Analyser mes préférences
              </Button>
            </div>
            
            <IslamicPreferencesStep
              preferences={islamicPrefs}
              onPreferencesChange={setIslamicPrefs}
              gender={profileData.gender}
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2 mb-8">
              <div className="flex justify-center">
                <div className="h-12 w-12 bg-gradient-to-br from-gold to-gold-light rounded-full flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold">Vos attentes</h2>
              <p className="text-muted-foreground">Décrivez votre partenaire idéal</p>
            </div>

            <div>
              <Label htmlFor="lookingFor">Ce que je recherche *</Label>
              <Textarea
                id="lookingFor"
                value={profileData.looking_for}
                onChange={(e) => setProfileData({...profileData, looking_for: e.target.value})}
                placeholder="Décrivez le type de partenaire que vous recherchez, vos valeurs communes, vos objectifs de mariage..."
                rows={6}
                required
              />
            </div>

            <div>
              <Label>Secte du partenaire souhaité</Label>
              <Select value={islamicPrefs.desired_partner_sect} onValueChange={(value) => setIslamicPrefs({...islamicPrefs, desired_partner_sect: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez" />
                </SelectTrigger>
              <SelectContent>
                <SelectItem value="same_sect">Même secte que moi</SelectItem>
                <SelectItem value="sunni">Sunnite</SelectItem>
                <SelectItem value="shia">Chiite</SelectItem>
                <SelectItem value="any">Peu importe</SelectItem>
              </SelectContent>
              </Select>
            </div>

            <Card className="bg-emerald/5 border-emerald/20">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-emerald mt-0.5" />
                  <div>
                    <h4 className="font-medium text-emerald">Profil presque terminé !</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Une fois votre profil validé, vous pourrez découvrir des personnes compatibles selon vos valeurs islamiques.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-emerald/5 islamic-pattern pb-24 md:pb-8">
      {/* Celebration Animation */}
      <ProgressCelebration
        message={tutorial.celebrationMessage}
        isVisible={tutorial.showCelebration}
      />

      {/* Profile Examples Modal */}
      <ProfileExamplesModal
        isOpen={showExamplesModal}
        onClose={() => setShowExamplesModal(false)}
      />

      {/* Keyboard Shortcuts Panel */}
      <KeyboardShortcutsPanel
        show={keyboardNav.showHelp}
        onClose={keyboardNav.closeHelp}
        currentStep={currentStep}
        totalSteps={totalSteps}
      />

      {/* Tutorial Dismissal Banner */}
      {tutorial.tutorialEnabled && (
        <div className="fixed top-4 right-4 z-40 animate-fade-in">
          <Card className="p-3 shadow-lg border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
            <div className="flex items-center gap-3">
              <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
              <p className="text-sm font-medium">Mode tutoriel activé</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={tutorial.dismissTutorial}
                className="ml-2 h-6 px-2 text-xs"
              >
                Désactiver
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Session Resumption Modal */}
      {savedSessionData && (
        <SessionResumptionModal
          open={showResumptionModal}
          onContinue={handleContinueSession}
          onRestart={handleRestartSession}
          savedStep={savedSessionData.step}
          totalSteps={totalSteps}
          completionPercentage={savedSessionData.progress}
          lastSaveTime={savedSessionData.lastSaveTime}
        />
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-3xl font-bold text-foreground mb-2 gradient-text">
              Créez votre profil ZawajConnect
            </h1>
            <p className="text-muted-foreground">
              Quelques informations pour trouver votre âme sœur
            </p>
            
            {/* Keyboard shortcut hint */}
            <button
              onClick={keyboardNav.toggleHelp}
              className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted rounded-full transition-colors"
            >
              <Keyboard className="h-3 w-3" />
              <span>Appuyez sur <kbd className="px-1.5 py-0.5 bg-background border border-border rounded text-xs font-mono">?</kbd> pour les raccourcis</span>
            </button>
          </div>

          {/* Step Indicator */}
          <div className="mb-8">
            <StepIndicator
              steps={steps}
              currentStep={currentStep}
              onStepClick={handleStepClick}
            />
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <Card className="border-border/50 shadow-soft bg-card/95 backdrop-blur-sm animate-slide-in-right card-hover">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-gradient-to-br from-emerald to-emerald-light rounded-full flex items-center justify-center text-white">
                        {steps[currentStep - 1]?.icon}
                      </div>
                      <span>{steps[currentStep - 1]?.title}</span>
                    </CardTitle>
                    <div className="text-right desktop-only">
                      <div className="text-sm text-muted-foreground mb-2">
                        Temps estimé: {steps[currentStep - 1]?.estimatedTime}
                      </div>
                      <SaveStatusIndicator 
                        status={persistence.saveStatus}
                        lastSaveTime={persistence.lastSaveTime}
                      />
                      <Progress value={progress} className="h-2 w-32 animate-slide-in-right mt-2" />
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {renderStep()}
                  
                  {/* Step Validation */}
                  <StepValidation 
                    rules={validation.getCurrentStepRules()}
                    stepNumber={currentStep}
                  />

                  {/* Desktop Navigation Buttons */}
                  <div className="desktop-only flex justify-between pt-6 border-t border-border/50">
                    <Button
                      onClick={prevStep}
                      variant="outline"
                      disabled={currentStep === 1}
                      className="flex items-center space-x-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span>Précédent</span>
                    </Button>

                    {currentStep === totalSteps ? (
                      <Button
                        onClick={completeOnboarding}
                        disabled={loading || !isStepValid()}
                        className="bg-gradient-to-r from-emerald to-emerald-dark hover:from-emerald-dark hover:to-emerald text-white flex items-center space-x-2"
                      >
                        {saving ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Finalisation...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            <span>Terminer</span>
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        onClick={nextStep}
                        disabled={!isStepValid()}
                        className="bg-emerald hover:bg-emerald-dark text-white flex items-center space-x-2"
                      >
                        <span>Suivant</span>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Profile Preview Sidebar */}
            <div className="lg:col-span-1 desktop-only">
              <div className="sticky top-8">
                <ProfilePreview
                  profileData={profileData}
                  islamicPrefs={islamicPrefs}
                  completionPercentage={calculateCompletionPercentage()}
                />
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="mobile-only fixed bottom-0 left-0 right-0 z-50">
            <MobileStepNavigation
              currentStep={currentStep}
              totalSteps={totalSteps}
              isStepValid={isStepValid()}
              canGoNext={isStepValid()}
              canGoPrevious={currentStep > 1}
              isLoading={saving}
              onPrevious={prevStep}
              onNext={nextStep}
              onComplete={completeOnboarding}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
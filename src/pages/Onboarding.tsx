import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
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
import { useOnboardingValidation } from '@/hooks/useOnboardingValidation';
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
  Settings
} from 'lucide-react';

interface ProfileData {
  full_name: string;
  age: number | null;
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
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [showWelcome, setShowWelcome] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setSaving] = useState(false);

  // Profile data states
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: '',
    age: null,
    gender: '',
    location: '',
    education: '',
    profession: '',
    bio: '',
    looking_for: '',
    interests: [],
    avatar_url: ''
  });

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

  // Use validation hook
  const validation = useOnboardingValidation({
    profileData,
    islamicPrefs,
    currentStep
  });

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
    
    // Check if user already has a complete profile
    checkExistingProfile();
  }, [user, navigate]);

  const checkExistingProfile = async () => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profile && profile.bio && profile.looking_for) {
        // User already has a complete profile, redirect to dashboard
        navigate('/dashboard');
      } else if (profile) {
        // Pre-fill existing data
        setProfileData({
          full_name: profile.full_name || '',
          age: profile.age || null,
          gender: profile.gender || '',
          location: profile.location || '',
          education: profile.education || '',
          profession: profile.profession || '',
          bio: profile.bio || '',
          looking_for: profile.looking_for || '',
          interests: profile.interests || [],
          avatar_url: profile.avatar_url || ''
        });
        setShowWelcome(false);
      }

      // Load Islamic preferences if they exist
      const { data: islamicData } = await supabase
        .from('islamic_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (islamicData) {
        setIslamicPrefs({
          prayer_frequency: islamicData.prayer_frequency || '',
          quran_reading: islamicData.quran_reading || '',
          hijab_preference: islamicData.hijab_preference || '',
          beard_preference: islamicData.beard_preference || '',
          sect: islamicData.sect || '',
          madhab: islamicData.madhab || '',
          halal_diet: islamicData.halal_diet ?? true,
          smoking: islamicData.smoking || '',
          desired_partner_sect: islamicData.desired_partner_sect || '',
          importance_of_religion: islamicData.importance_of_religion || ''
        });
      }
    } catch (error) {
      console.error('Error checking existing profile:', error);
    }
  };

  const startOnboarding = () => {
    setShowWelcome(false);
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
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
        // Insert new profile
        const { error } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            ...profileData
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
    setSaving(true);
    
    const profileSaved = await saveProfile();
    const prefsSaved = await saveIslamicPreferences();
    
    if (profileSaved && prefsSaved) {
      toast({
        title: "Profil créé avec succès !",
        description: "Bienvenue sur NikahConnect. Vous pouvez maintenant découvrir des profils compatibles.",
      });
      navigate('/dashboard');
    } else {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la sauvegarde. Veuillez réessayer.",
        variant: "destructive"
      });
    }
    
    setSaving(false);
  };

  const isStepValid = () => validation.isStepValid(currentStep);

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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Nom complet *</Label>
                <Input
                  id="fullName"
                  value={profileData.full_name}
                  onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
                  placeholder="Votre nom complet"
                  required
                />
              </div>
              <div>
                <Label htmlFor="age">Âge *</Label>
                <Input
                  id="age"
                  type="number"
                  value={profileData.age || ''}
                  onChange={(e) => setProfileData({...profileData, age: parseInt(e.target.value) || null})}
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

            <div>
              <Label htmlFor="bio">À propos de moi *</Label>
              <Textarea
                id="bio"
                value={profileData.bio}
                onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                placeholder="Décrivez-vous en quelques phrases..."
                rows={4}
                required
              />
            </div>

            <InterestsSelector 
              interests={profileData.interests}
              onInterestsChange={(interests) => setProfileData({...profileData, interests})}
            />

            <PhotoUploadStep 
              avatarUrl={profileData.avatar_url}
              onPhotoChange={(url) => setProfileData({...profileData, avatar_url: url})}
              userName={profileData.full_name}
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2 mb-8">
              <div className="flex justify-center">
                <div className="h-12 w-12 bg-gradient-to-br from-emerald to-emerald-light rounded-full flex items-center justify-center">
                  <Heart className="h-6 w-6 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold">Préférences islamiques</h2>
              <p className="text-muted-foreground">Vos pratiques et valeurs religieuses</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Fréquence de prière *</Label>
                <Select value={islamicPrefs.prayer_frequency} onValueChange={(value) => setIslamicPrefs({...islamicPrefs, prayer_frequency: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5_times_daily">5 fois par jour</SelectItem>
                    <SelectItem value="sometimes">Parfois</SelectItem>
                    <SelectItem value="fridays_only">Seulement le vendredi</SelectItem>
                    <SelectItem value="occasionally">Occasionnellement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Lecture du Coran</Label>
                <Select value={islamicPrefs.quran_reading} onValueChange={(value) => setIslamicPrefs({...islamicPrefs, quran_reading: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Quotidiennement</SelectItem>
                    <SelectItem value="weekly">Hebdomadairement</SelectItem>
                    <SelectItem value="occasionally">Occasionnellement</SelectItem>
                    <SelectItem value="rarely">Rarement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>École juridique (Madhab)</Label>
                <Select value={islamicPrefs.madhab} onValueChange={(value) => setIslamicPrefs({...islamicPrefs, madhab: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hanafi">Hanafi</SelectItem>
                    <SelectItem value="maliki">Maliki</SelectItem>
                    <SelectItem value="shafi">Shafi'i</SelectItem>
                    <SelectItem value="hanbali">Hanbali</SelectItem>
                    <SelectItem value="salafi">Salafi</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Secte *</Label>
                <Select value={islamicPrefs.sect} onValueChange={(value) => setIslamicPrefs({...islamicPrefs, sect: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sunni">Sunnite</SelectItem>
                    <SelectItem value="shia">Chiite</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Importance de la religion *</Label>
              <Select value={islamicPrefs.importance_of_religion} onValueChange={(value) => setIslamicPrefs({...islamicPrefs, importance_of_religion: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="very_important">Très importante</SelectItem>
                  <SelectItem value="somewhat_important">Assez importante</SelectItem>
                  <SelectItem value="moderate">Modérée</SelectItem>
                  <SelectItem value="not_very_important">Peu importante</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="halal_diet"
                checked={islamicPrefs.halal_diet}
                onCheckedChange={(checked) => setIslamicPrefs({...islamicPrefs, halal_diet: checked === true})}
              />
              <Label htmlFor="halal_diet">Je suis un régime halal</Label>
            </div>
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
                  <SelectItem value="same">Même secte que moi</SelectItem>
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
    <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-emerald/5">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Créez votre profil NikahConnect
            </h1>
            <p className="text-muted-foreground">
              Quelques informations pour trouver votre âme sœur
            </p>
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
              <Card className="border-border/50 shadow-soft bg-card/95 backdrop-blur-sm animate-slide-in-right">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-gradient-to-br from-emerald to-emerald-light rounded-full flex items-center justify-center text-white">
                        {steps[currentStep - 1]?.icon}
                      </div>
                      <span>{steps[currentStep - 1]?.title}</span>
                    </CardTitle>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">
                        Temps estimé: {steps[currentStep - 1]?.estimatedTime}
                      </div>
                      <Progress value={progress} className="h-2 w-32 animate-slide-in-right" />
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

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-6 border-t border-border/50">
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
                        {loading ? (
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
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <ProfilePreview
                  profileData={profileData}
                  islamicPrefs={islamicPrefs}
                  completionPercentage={calculateCompletionPercentage()}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
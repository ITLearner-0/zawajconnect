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
import { 
  ArrowLeft, 
  ArrowRight, 
  User, 
  Heart, 
  Camera, 
  MapPin, 
  CheckCircle,
  Sparkles,
  Star
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
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setSaving] = useState(false);
  const [newInterest, setNewInterest] = useState('');

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
      }
    } catch (error) {
      console.error('Error checking existing profile:', error);
    }
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

  const addInterest = () => {
    if (newInterest.trim() && !profileData.interests.includes(newInterest.trim())) {
      setProfileData({
        ...profileData,
        interests: [...profileData.interests, newInterest.trim()]
      });
      setNewInterest('');
    }
  };

  const removeInterest = (interestToRemove: string) => {
    setProfileData({
      ...profileData,
      interests: profileData.interests.filter(interest => interest !== interestToRemove)
    });
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

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return profileData.full_name && profileData.age && profileData.gender && profileData.location;
      case 2:
        return profileData.education && profileData.profession && profileData.bio;
      case 3:
        return islamicPrefs.prayer_frequency && islamicPrefs.sect && islamicPrefs.importance_of_religion;
      case 4:
        return profileData.looking_for;
      default:
        return true;
    }
  };

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

            <div>
              <Label>Centres d'intérêt</Label>
              <div className="flex flex-wrap gap-2 mt-2 mb-2">
                {profileData.interests.map((interest) => (
                  <span
                    key={interest}
                    className="bg-emerald/10 text-emerald px-3 py-1 rounded-full text-sm cursor-pointer hover:bg-emerald/20 transition-colors"
                    onClick={() => removeInterest(interest)}
                  >
                    {interest} ×
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  placeholder="Ajouter un centre d'intérêt"
                  onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                />
                <Button type="button" onClick={addInterest} variant="outline">
                  Ajouter
                </Button>
              </div>
            </div>

            <PhotoUpload 
              currentPhotoUrl={profileData.avatar_url}
              onPhotoUpdate={(url) => setProfileData({...profileData, avatar_url: url})}
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
    <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-emerald/5 p-4">
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Configuration du profil</h1>
          </div>
          <Progress value={progress} className="w-full max-w-md mx-auto h-2" />
          <p className="text-sm text-muted-foreground mt-2">
            Étape {currentStep} sur {totalSteps}
          </p>
        </div>

        {/* Main Content */}
        <Card className="shadow-lg">
          <CardContent className="p-8">
            {renderStep()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-6">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Précédent
          </Button>

          {currentStep < totalSteps ? (
            <Button
              onClick={nextStep}
              disabled={!isStepValid()}
              className="flex items-center gap-2 bg-emerald hover:bg-emerald-dark"
            >
              Suivant
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={completeOnboarding}
              disabled={!isStepValid() || loading}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald to-gold hover:from-emerald-dark hover:to-gold-dark"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Star className="h-4 w-4" />
              )}
              {loading ? 'Finalisation...' : 'Finaliser mon profil'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
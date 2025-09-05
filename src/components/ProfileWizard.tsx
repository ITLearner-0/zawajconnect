import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { User, Heart, Briefcase, GraduationCap, MapPin, Image, CheckCircle } from 'lucide-react';
import PhotoUpload from '@/components/PhotoUpload';

interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  completed: boolean;
}

interface ProfileData {
  full_name: string;
  age: number;
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
  sect: string;
  madhab: string;
  prayer_frequency: string;
  quran_reading: string;
  hijab_preference: string;
  beard_preference: string;
  halal_diet: boolean;
  smoking: string;
  importance_of_religion: string;
  desired_partner_sect: string;
}

const ProfileWizard = ({ onComplete }: { onComplete: () => void }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: '',
    age: 18,
    gender: '',
    location: '',
    education: '',
    profession: '',
    bio: '',
    looking_for: '',
    interests: [],
    avatar_url: ''
  });
  const [islamicPreferences, setIslamicPreferences] = useState<IslamicPreferences>({
    sect: '',
    madhab: '',
    prayer_frequency: '',
    quran_reading: '',
    hijab_preference: '',
    beard_preference: '',
    halal_diet: true,
    smoking: '',
    importance_of_religion: '',
    desired_partner_sect: ''
  });

  const availableInterests = [
    'Lecture', 'Sport', 'Voyage', 'Cuisine', 'Art', 'Musique', 'Nature', 'Technologie',
    'Éducation', 'Bénévolat', 'Jardinage', 'Photographie', 'Films', 'Langues'
  ];

  const steps: WizardStep[] = [
    {
      id: 'basic',
      title: 'Informations de base',
      description: 'Présentez-vous avec vos informations essentielles',
      icon: User,
      completed: Boolean(profileData.full_name && profileData.age && profileData.gender)
    },
    {
      id: 'location_work',
      title: 'Lieu et profession',
      description: 'Où vivez-vous et que faites-vous ?',
      icon: MapPin,
      completed: Boolean(profileData.location && profileData.profession)
    },
    {
      id: 'education',
      title: 'Éducation et intérêts',
      description: 'Parlez-nous de votre parcours et passions',
      icon: GraduationCap,
      completed: Boolean(profileData.education && profileData.interests.length > 0)
    },
    {
      id: 'islamic',
      title: 'Préférences islamiques',
      description: 'Vos valeurs et pratiques religieuses',
      icon: Heart,
      completed: Boolean(islamicPreferences.sect && islamicPreferences.prayer_frequency)
    },
    {
      id: 'photo',
      title: 'Photo de profil',
      description: 'Ajoutez une photo respectueuse',
      icon: Image,
      completed: Boolean(profileData.avatar_url)
    },
    {
      id: 'bio',
      title: 'À propos de vous',
      description: 'Décrivez-vous et ce que vous recherchez',
      icon: Briefcase,
      completed: Boolean(profileData.bio && profileData.looking_for)
    }
  ];

  const progress = (steps.filter(step => step.completed).length / steps.length) * 100;

  const updateProfileData = (field: keyof ProfileData, value: any) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const updateIslamicPreferences = (field: keyof IslamicPreferences, value: any) => {
    setIslamicPreferences(prev => ({ ...prev, [field]: value }));
  };

  const toggleInterest = (interest: string) => {
    setProfileData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePhotoUpdate = (url: string) => {
    updateProfileData('avatar_url', url);
  };

  const saveProfile = async () => {
    if (!user) return;

    try {
      // Update or create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          ...profileData
        });

      if (profileError) throw profileError;

      // Update or create Islamic preferences
      const { error: preferencesError } = await supabase
        .from('islamic_preferences')
        .upsert({
          user_id: user.id,
          ...islamicPreferences
        });

      if (preferencesError) throw preferencesError;

      toast({
        title: "Profil créé avec succès !",
        description: "Bienvenue dans la communauté. Vous pouvez maintenant découvrir des profils compatibles.",
      });

      onComplete();
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le profil. Veuillez réessayer.",
        variant: "destructive"
      });
    }
  };

  const renderStepContent = () => {
    const currentStepData = steps[currentStep];

    switch (currentStepData.id) {
      case 'basic':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="full_name">Nom complet *</Label>
              <Input
                id="full_name"
                value={profileData.full_name}
                onChange={(e) => updateProfileData('full_name', e.target.value)}
                placeholder="Votre nom complet"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="age">Âge *</Label>
                <Input
                  id="age"
                  type="number"
                  min="18"
                  max="100"
                  value={profileData.age}
                  onChange={(e) => updateProfileData('age', parseInt(e.target.value) || 18)}
                />
              </div>
              <div>
                <Label htmlFor="gender">Genre *</Label>
                <Select value={profileData.gender} onValueChange={(value) => updateProfileData('gender', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="homme">Homme</SelectItem>
                    <SelectItem value="femme">Femme</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 'location_work':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="location">Localisation *</Label>
              <Input
                id="location"
                value={profileData.location}
                onChange={(e) => updateProfileData('location', e.target.value)}
                placeholder="Ville, Pays"
              />
            </div>
            <div>
              <Label htmlFor="profession">Profession *</Label>
              <Input
                id="profession"
                value={profileData.profession}
                onChange={(e) => updateProfileData('profession', e.target.value)}
                placeholder="Votre profession actuelle"
              />
            </div>
          </div>
        );

      case 'education':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="education">Niveau d'éducation *</Label>
              <Select value={profileData.education} onValueChange={(value) => updateProfileData('education', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner votre niveau" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Baccalauréat">Baccalauréat</SelectItem>
                  <SelectItem value="Licence/Bachelor">Licence/Bachelor</SelectItem>
                  <SelectItem value="Master">Master</SelectItem>
                  <SelectItem value="Doctorat">Doctorat</SelectItem>
                  <SelectItem value="Formation professionnelle">Formation professionnelle</SelectItem>
                  <SelectItem value="Autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Centres d'intérêt * (sélectionnez au moins 3)</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {availableInterests.map(interest => (
                  <div key={interest} className="flex items-center space-x-2">
                    <Checkbox
                      id={interest}
                      checked={profileData.interests.includes(interest)}
                      onCheckedChange={() => toggleInterest(interest)}
                    />
                    <label htmlFor={interest} className="text-sm">{interest}</label>
                  </div>
                ))}
              </div>
              <div className="mt-2">
                <Badge variant="outline">
                  {profileData.interests.length} sélectionné(s)
                </Badge>
              </div>
            </div>
          </div>
        );

      case 'islamic':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Secte *</Label>
                <Select value={islamicPreferences.sect} onValueChange={(value) => updateIslamicPreferences('sect', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sunnite">Sunnite</SelectItem>
                    <SelectItem value="chiite">Chiite</SelectItem>
                    <SelectItem value="autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Madhab</Label>
                <Select value={islamicPreferences.madhab} onValueChange={(value) => updateIslamicPreferences('madhab', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hanafi">Hanafi</SelectItem>
                    <SelectItem value="maliki">Maliki</SelectItem>
                    <SelectItem value="shafii">Shafi'i</SelectItem>
                    <SelectItem value="hanbali">Hanbali</SelectItem>
                    <SelectItem value="jafari">Ja'fari</SelectItem>
                    <SelectItem value="autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Fréquence de prière *</Label>
              <Select value={islamicPreferences.prayer_frequency} onValueChange={(value) => updateIslamicPreferences('prayer_frequency', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="toujours">Toujours (5 fois par jour)</SelectItem>
                  <SelectItem value="souvent">Souvent</SelectItem>
                  <SelectItem value="parfois">Parfois</SelectItem>
                  <SelectItem value="rarement">Rarement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Importance de la religion *</Label>
              <Select value={islamicPreferences.importance_of_religion} onValueChange={(value) => updateIslamicPreferences('importance_of_religion', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="très_importante">Très importante</SelectItem>
                  <SelectItem value="importante">Importante</SelectItem>
                  <SelectItem value="modérément_importante">Modérément importante</SelectItem>
                  <SelectItem value="peu_importante">Peu importante</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="halal_diet"
                checked={islamicPreferences.halal_diet}
                onCheckedChange={(checked) => updateIslamicPreferences('halal_diet', checked)}
              />
              <label htmlFor="halal_diet" className="text-sm">Je suis un régime halal strict</label>
            </div>
          </div>
        );

      case 'photo':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                Ajoutez une photo de profil respectueuse selon les valeurs islamiques. 
                Les photos doivent être modestes et appropriées.
              </p>
              <PhotoUpload onPhotoUpdate={handlePhotoUpdate} currentPhotoUrl={profileData.avatar_url} />
            </div>
          </div>
        );

      case 'bio':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="bio">À propos de vous *</Label>
              <Textarea
                id="bio"
                value={profileData.bio}
                onChange={(e) => updateProfileData('bio', e.target.value)}
                placeholder="Parlez-nous de votre personnalité, vos valeurs, vos passions..."
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="looking_for">Ce que vous recherchez *</Label>
              <Textarea
                id="looking_for"
                value={profileData.looking_for}
                onChange={(e) => updateProfileData('looking_for', e.target.value)}
                placeholder="Décrivez le type de partenaire et de relation que vous recherchez..."
                rows={4}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-emerald/5 p-4">
      <div className="container mx-auto max-w-2xl">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="h-12 w-12 bg-gradient-to-br from-emerald to-emerald-light rounded-full flex items-center justify-center">
                <Heart className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl mb-2">Création de votre profil</CardTitle>
            <p className="text-muted-foreground">
              Complétez votre profil pour commencer à découvrir des compatibilités
            </p>
            <div className="mt-4">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground mt-2">
                {Math.round(progress)}% complété
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Steps Navigation */}
            <div className="flex justify-center mb-6">
              <div className="flex space-x-2">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <Button
                      key={step.id}
                      variant={index === currentStep ? "default" : step.completed ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => setCurrentStep(index)}
                      className="flex items-center gap-2"
                    >
                      {step.completed ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                      <span className="hidden sm:inline">{step.title}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Current Step Content */}
            <div>
              <h3 className="text-xl font-semibold mb-2">{steps[currentStep].title}</h3>
              <p className="text-muted-foreground mb-4">{steps[currentStep].description}</p>
              {renderStepContent()}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={previousStep}
                disabled={currentStep === 0}
              >
                Précédent
              </Button>

              {currentStep < steps.length - 1 ? (
                <Button
                  onClick={nextStep}
                  disabled={!steps[currentStep].completed}
                  className="bg-emerald hover:bg-emerald-dark"
                >
                  Suivant
                </Button>
              ) : (
                <Button
                  onClick={saveProfile}
                  disabled={!steps.every(step => step.completed)}
                  className="bg-emerald hover:bg-emerald-dark"
                >
                  Terminer le profil
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileWizard;
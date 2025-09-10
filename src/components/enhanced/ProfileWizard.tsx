import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useIslamicModeration } from '@/hooks/useIslamicModeration';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Heart, 
  MapPin, 
  GraduationCap, 
  Briefcase,
  Camera,
  Shield,
  Book,
  Users,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Star,
  Moon,
  Settings,
  Globe,
  Lock,
  Eye
} from 'lucide-react';

interface ProfileData {
  // Basic Information
  full_name: string;
  age: number;
  gender: 'male' | 'female';
  location: string;
  phone: string;
  
  // Professional & Education
  education: string;
  profession: string;
  income_range?: string;
  
  // Physical & Personal
  height?: string;
  marital_status: string;
  children?: string;
  disabilities?: string;
  
  // Islamic Information
  sect: string;
  madhab: string;
  prayer_frequency: string;
  quran_reading: string;
  hijab_preference?: string;
  beard_preference?: string;
  halal_diet: boolean;
  importance_of_religion: string;
  islamic_education: string;
  memorized_quran?: string;
  
  // Family & Background
  family_background: string;
  parents_occupation?: string;
  siblings?: string;
  family_religiosity: string;
  
  // Partner Preferences
  looking_for: string;
  desired_partner_age_min: number;
  desired_partner_age_max: number;
  desired_partner_location?: string;
  desired_partner_education?: string;
  desired_partner_sect?: string;
  desired_partner_qualities: string[];
  
  // About & Biography
  bio: string;
  interests: string[];
  hobbies: string[];
  languages: string[];
  
  // Privacy & Verification
  profile_visibility: 'public' | 'family_only' | 'matches_only';
  contact_visibility: 'family_only' | 'matches_only' | 'after_approval';
  photo_visibility: 'public' | 'family_only' | 'matches_only';
  family_involvement: boolean;
  requires_wali_approval: boolean;
}

interface ProfileWizardProps {
  onComplete?: (profile: ProfileData) => void;
  existingProfile?: Partial<ProfileData>;
}

const ProfileWizard: React.FC<ProfileWizardProps> = ({ onComplete, existingProfile }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { moderateContent } = useIslamicModeration();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [profileData, setProfileData] = useState<Partial<ProfileData>>(existingProfile || {});
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const totalSteps = 7;
  const progress = (currentStep / totalSteps) * 100;

  useEffect(() => {
    // Load existing profile data if available
    if (user && !existingProfile) {
      loadExistingProfile();
    }
  }, [user]);

  const loadExistingProfile = async () => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      const { data: islamicPrefs } = await supabase
        .from('islamic_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      const { data: privacySettings } = await supabase
        .from('privacy_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profile || islamicPrefs || privacySettings) {
        setProfileData({
          ...(profile as any),
          ...(islamicPrefs as any),
          ...(privacySettings as any)
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    switch (step) {
      case 1: // Basic Information
        if (!profileData.full_name) errors.full_name = 'Nom complet requis';
        if (!profileData.age || profileData.age < 18) errors.age = 'Âge valide requis (18+)';
        if (!profileData.gender) errors.gender = 'Genre requis';
        if (!profileData.location) errors.location = 'Localisation requise';
        break;
      
      case 2: // Islamic Information
        if (!profileData.sect) errors.sect = 'Secte religieuse requise';
        if (!profileData.prayer_frequency) errors.prayer_frequency = 'Fréquence de prière requise';
        if (!profileData.importance_of_religion) errors.importance_of_religion = 'Importance de la religion requise';
        break;
      
      case 3: // Education & Profession
        if (!profileData.education) errors.education = 'Niveau d\'éducation requis';
        if (!profileData.profession) errors.profession = 'Profession requise';
        break;
      
      case 4: // Family & Background
        if (!profileData.family_background) errors.family_background = 'Contexte familial requis';
        if (!profileData.family_religiosity) errors.family_religiosity = 'Religiosité familiale requise';
        break;
      
      case 5: // Partner Preferences
        if (!profileData.looking_for) errors.looking_for = 'Type de partenaire recherché requis';
        if (!profileData.desired_partner_age_min) errors.desired_partner_age_min = 'Âge minimum requis';
        if (!profileData.desired_partner_age_max) errors.desired_partner_age_max = 'Âge maximum requis';
        break;
      
      case 6: // About & Interests
        if (!profileData.bio || profileData.bio.length < 50) {
          errors.bio = 'Biographie d\'au moins 50 caractères requise';
        }
        break;
      
      case 7: // Privacy & Verification
        if (profileData.profile_visibility === undefined) {
          errors.profile_visibility = 'Visibilité du profil requise';
        }
        break;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = async () => {
    if (validateStep(currentStep)) {
      // Moderate content for text fields in certain steps
      if (currentStep === 6 && profileData.bio) {
        const moderationResult = await moderateContent(profileData.bio, user?.id || '', 'profile');
        if (!moderationResult.approved) {
          toast({
            title: "Contenu non conforme",
            description: moderationResult.reason,
            variant: "destructive"
          });
          return;
        }
      }

      setCompletedSteps(prev => [...prev, currentStep]);
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      } else {
        await saveProfile();
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateProfileData = (field: string, value: any) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    // Clear validation error when field is updated
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const saveProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Save to profiles table
      const profileUpdateData = {
        user_id: user.id,
        full_name: profileData.full_name,
        age: profileData.age,
        gender: profileData.gender,
        location: profileData.location,
        phone: profileData.phone,
        education: profileData.education,
        profession: profileData.profession,
        bio: profileData.bio,
        interests: profileData.interests || [],
        looking_for: profileData.looking_for
      };

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(profileUpdateData, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        });

      if (profileError) throw profileError;

      // Save to islamic_preferences table
      const islamicPrefsData = {
        user_id: user.id,
        sect: profileData.sect,
        madhab: profileData.madhab,
        prayer_frequency: profileData.prayer_frequency,
        quran_reading: profileData.quran_reading,
        hijab_preference: profileData.hijab_preference,
        beard_preference: profileData.beard_preference,
        halal_diet: profileData.halal_diet || true,
        importance_of_religion: profileData.importance_of_religion,
        desired_partner_sect: profileData.desired_partner_sect
      };

      const { error: islamicError } = await supabase
        .from('islamic_preferences')
        .upsert(islamicPrefsData);

      if (islamicError) throw islamicError;

      // Save to privacy_settings table
      const privacyData = {
        user_id: user.id,
        profile_visibility: profileData.profile_visibility || 'matches_only',
        contact_visibility: profileData.contact_visibility || 'family_only',
        photo_visibility: profileData.photo_visibility || 'matches_only',
        allow_family_involvement: profileData.family_involvement || false
      };

      const { error: privacyError } = await supabase
        .from('privacy_settings')
        .upsert(privacyData);

      if (privacyError) throw privacyError;

      toast({
        title: "Profil sauvegardé",
        description: "Votre profil a été créé avec succès selon les valeurs islamiques"
      });

      if (onComplete) {
        onComplete(profileData as ProfileData);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le profil",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderBasicInformation();
      case 2:
        return renderIslamicInformation();
      case 3:
        return renderEducationProfession();
      case 4:
        return renderFamilyBackground();
      case 5:
        return renderPartnerPreferences();
      case 6:
        return renderAboutInterests();
      case 7:
        return renderPrivacySettings();
      default:
        return null;
    }
  };

  const renderBasicInformation = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <User className="h-12 w-12 mx-auto mb-4 text-primary" />
        <h3 className="text-xl font-semibold">Informations de base</h3>
        <p className="text-muted-foreground">Commençons par vos informations personnelles</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="full_name">Nom complet *</Label>
          <Input
            id="full_name"
            value={profileData.full_name || ''}
            onChange={(e) => updateProfileData('full_name', e.target.value)}
            placeholder="Votre nom complet"
          />
        </div>

        <div>
          <Label htmlFor="age">Âge *</Label>
          <Input
            id="age"
            type="number"
            min="18"
            max="100"
            value={profileData.age || ''}
            onChange={(e) => updateProfileData('age', parseInt(e.target.value))}
          />
        </div>

        <div>
          <Label htmlFor="gender">Genre *</Label>
          <Select value={profileData.gender} onValueChange={(value) => updateProfileData('gender', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez votre genre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Homme</SelectItem>
              <SelectItem value="female">Femme</SelectItem>
            </SelectContent>
          </Select>
          {validationErrors.gender && (
            <p className="text-sm text-destructive mt-1">{validationErrors.gender}</p>
          )}
        </div>

        <div>
          <Label htmlFor="location">Localisation *</Label>
          <Input
            id="location"
            value={profileData.location || ''}
            onChange={(e) => updateProfileData('location', e.target.value)}
            placeholder="Ville, Pays"
          />
        </div>

        <div>
          <Label htmlFor="phone">Téléphone</Label>
          <Input
            id="phone"
            value={profileData.phone || ''}
            onChange={(e) => updateProfileData('phone', e.target.value)}
            placeholder="+33 1 23 45 67 89"
          />
        </div>

        <div>
          <Label htmlFor="marital_status">Statut matrimonial</Label>
          <Select value={profileData.marital_status} onValueChange={(value) => updateProfileData('marital_status', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez votre statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="never_married">Jamais marié(e)</SelectItem>
              <SelectItem value="married">Marié(e)</SelectItem>
              <SelectItem value="divorced">Divorcé(e)</SelectItem>
              <SelectItem value="widowed">Veuf/Veuve</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const renderIslamicInformation = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Moon className="h-12 w-12 mx-auto mb-4 text-primary" />
        <h3 className="text-xl font-semibold">Informations islamiques</h3>
        <p className="text-muted-foreground">Partagez votre parcours spirituel et vos pratiques religieuses</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="sect">Secte religieuse *</Label>
          <Select value={profileData.sect} onValueChange={(value) => updateProfileData('sect', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez votre secte" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sunni">Sunnite</SelectItem>
              <SelectItem value="shia">Chiite</SelectItem>
              <SelectItem value="other">Autre</SelectItem>
            </SelectContent>
          </Select>
          {validationErrors.sect && (
            <p className="text-sm text-destructive mt-1">{validationErrors.sect}</p>
          )}
        </div>

        <div>
          <Label htmlFor="madhab">École juridique (Madhab)</Label>
          <Select value={profileData.madhab} onValueChange={(value) => updateProfileData('madhab', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez votre madhab" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hanafi">Hanafite</SelectItem>
              <SelectItem value="maliki">Malikite</SelectItem>
              <SelectItem value="shafii">Chaféite</SelectItem>
              <SelectItem value="hanbali">Hanbalite</SelectItem>
              <SelectItem value="jafari">Jafarite</SelectItem>
              <SelectItem value="salafi">Salafi</SelectItem>
              <SelectItem value="other">Autre</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="prayer_frequency">Fréquence de prière *</Label>
          <Select value={profileData.prayer_frequency} onValueChange={(value) => updateProfileData('prayer_frequency', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez la fréquence" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="always">Toujours (5 fois par jour)</SelectItem>
              <SelectItem value="usually">Habituellement</SelectItem>
              <SelectItem value="sometimes">Parfois</SelectItem>
              <SelectItem value="rarely">Rarement</SelectItem>
              <SelectItem value="never">Jamais</SelectItem>
            </SelectContent>
          </Select>
          {validationErrors.prayer_frequency && (
            <p className="text-sm text-destructive mt-1">{validationErrors.prayer_frequency}</p>
          )}
        </div>

        <div>
          <Label htmlFor="quran_reading">Lecture du Coran</Label>
          <Select value={profileData.quran_reading} onValueChange={(value) => updateProfileData('quran_reading', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Fréquence de lecture" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Quotidiennement</SelectItem>
              <SelectItem value="weekly">Hebdomadaire</SelectItem>
              <SelectItem value="monthly">Mensuel</SelectItem>
              <SelectItem value="occasionally">Occasionnellement</SelectItem>
              <SelectItem value="rarely">Rarement</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="importance_of_religion">Importance de la religion *</Label>
          <Select value={profileData.importance_of_religion} onValueChange={(value) => updateProfileData('importance_of_religion', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Niveau d'importance" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="very_important">Très importante</SelectItem>
              <SelectItem value="important">Importante</SelectItem>
              <SelectItem value="somewhat_important">Assez importante</SelectItem>
              <SelectItem value="not_very_important">Peu importante</SelectItem>
            </SelectContent>
          </Select>
          {validationErrors.importance_of_religion && (
            <p className="text-sm text-destructive mt-1">{validationErrors.importance_of_religion}</p>
          )}
        </div>

        <div>
          <Label htmlFor="islamic_education">Éducation islamique</Label>
          <Input
            id="islamic_education"
            value={profileData.islamic_education || ''}
            onChange={(e) => updateProfileData('islamic_education', e.target.value)}
            placeholder="Madrasah, université islamique, etc."
          />
        </div>

        {profileData.gender === 'female' && (
          <div>
            <Label htmlFor="hijab_preference">Port du hijab</Label>
            <Select value={profileData.hijab_preference} onValueChange={(value) => updateProfileData('hijab_preference', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Votre pratique" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="always">Toujours</SelectItem>
                <SelectItem value="usually">Habituellement</SelectItem>
                <SelectItem value="sometimes">Parfois</SelectItem>
                <SelectItem value="planning_to">Prévoit de le porter</SelectItem>
                <SelectItem value="never">Jamais</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {profileData.gender === 'male' && (
          <div>
            <Label htmlFor="beard_preference">Port de la barbe</Label>
            <Select value={profileData.beard_preference} onValueChange={(value) => updateProfileData('beard_preference', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Votre pratique" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full_beard">Barbe complète</SelectItem>
                <SelectItem value="trimmed_beard">Barbe taillée</SelectItem>
                <SelectItem value="goatee">Bouc</SelectItem>
                <SelectItem value="mustache">Moustache</SelectItem>
                <SelectItem value="clean_shaven">Rasé</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="md:col-span-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="halal_diet"
              checked={profileData.halal_diet || false}
              onCheckedChange={(checked) => updateProfileData('halal_diet', checked)}
            />
            <Label htmlFor="halal_diet">Je suis un régime halal strict</Label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEducationProfession = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <GraduationCap className="h-12 w-12 mx-auto mb-4 text-primary" />
        <h3 className="text-xl font-semibold">Éducation et Profession</h3>
        <p className="text-muted-foreground">Partagez votre parcours professionnel et éducatif</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="education">Niveau d'éducation *</Label>
          <Select value={profileData.education} onValueChange={(value) => updateProfileData('education', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez votre niveau" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high_school">Baccalauréat</SelectItem>
              <SelectItem value="bachelors">Licence</SelectItem>
              <SelectItem value="masters">Master</SelectItem>
              <SelectItem value="phd">Doctorat</SelectItem>
              <SelectItem value="professional">Formation professionnelle</SelectItem>
              <SelectItem value="islamic_education">Éducation islamique</SelectItem>
            </SelectContent>
          </Select>
          {validationErrors.education && (
            <p className="text-sm text-destructive mt-1">{validationErrors.education}</p>
          )}
        </div>

        <div>
          <Label htmlFor="profession">Profession *</Label>
          <Input
            id="profession"
            value={profileData.profession || ''}
            onChange={(e) => updateProfileData('profession', e.target.value)}
            placeholder="Votre métier actuel"
          />
        </div>

        <div>
          <Label htmlFor="income_range">Tranche de revenus (optionnel)</Label>
          <Select value={profileData.income_range} onValueChange={(value) => updateProfileData('income_range', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez une tranche" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="under_30k">Moins de 30 000€</SelectItem>
              <SelectItem value="30k_50k">30 000€ - 50 000€</SelectItem>
              <SelectItem value="50k_75k">50 000€ - 75 000€</SelectItem>
              <SelectItem value="75k_100k">75 000€ - 100 000€</SelectItem>
              <SelectItem value="over_100k">Plus de 100 000€</SelectItem>
              <SelectItem value="prefer_not_to_say">Préfère ne pas dire</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="height">Taille</Label>
          <Input
            id="height"
            value={profileData.height || ''}
            onChange={(e) => updateProfileData('height', e.target.value)}
            placeholder="Ex: 175 cm"
          />
        </div>

        <div>
          <Label htmlFor="languages">Langues parlées</Label>
          <Input
            id="languages"
            value={profileData.languages?.join(', ') || ''}
            onChange={(e) => updateProfileData('languages', e.target.value.split(',').map(l => l.trim()))}
            placeholder="Français, Arabe, Anglais..."
          />
        </div>

        <div>
          <Label htmlFor="disabilities">Handicaps ou conditions médicales</Label>
          <Input
            id="disabilities"
            value={profileData.disabilities || ''}
            onChange={(e) => updateProfileData('disabilities', e.target.value)}
            placeholder="Optionnel - pour transparence"
          />
        </div>
      </div>
    </div>
  );

  const renderFamilyBackground = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Users className="h-12 w-12 mx-auto mb-4 text-primary" />
        <h3 className="text-xl font-semibold">Famille et Contexte</h3>
        <p className="text-muted-foreground">Partagez des informations sur votre famille et votre contexte</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="family_background">Contexte familial *</Label>
          <Textarea
            id="family_background"
            value={profileData.family_background || ''}
            onChange={(e) => updateProfileData('family_background', e.target.value)}
            placeholder="Décrivez votre famille, votre origine, vos traditions..."
            rows={4}
          />
          {validationErrors.family_background && (
            <p className="text-sm text-destructive mt-1">{validationErrors.family_background}</p>
          )}
        </div>

        <div>
          <Label htmlFor="family_religiosity">Religiosité de la famille *</Label>
          <Select value={profileData.family_religiosity} onValueChange={(value) => updateProfileData('family_religiosity', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Niveau religieux de votre famille" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="very_religious">Très religieuse</SelectItem>
              <SelectItem value="religious">Religieuse</SelectItem>
              <SelectItem value="moderately_religious">Modérément religieuse</SelectItem>
              <SelectItem value="somewhat_religious">Peu religieuse</SelectItem>
              <SelectItem value="not_religious">Non religieuse</SelectItem>
            </SelectContent>
          </Select>
          {validationErrors.family_religiosity && (
            <p className="text-sm text-destructive mt-1">{validationErrors.family_religiosity}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="parents_occupation">Profession des parents</Label>
            <Input
              id="parents_occupation"
              value={profileData.parents_occupation || ''}
              onChange={(e) => updateProfileData('parents_occupation', e.target.value)}
              placeholder="Métiers du père et de la mère"
            />
          </div>

          <div>
            <Label htmlFor="siblings">Frères et sœurs</Label>
            <Input
              id="siblings"
              value={profileData.siblings || ''}
              onChange={(e) => updateProfileData('siblings', e.target.value)}
              placeholder="Ex: 2 frères, 1 sœur"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="children">Enfants (si applicable)</Label>
          <Input
            id="children"
            value={profileData.children || ''}
            onChange={(e) => updateProfileData('children', e.target.value)}
            placeholder="Nombre et âges des enfants"
          />
        </div>
      </div>
    </div>
  );

  const renderPartnerPreferences = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Heart className="h-12 w-12 mx-auto mb-4 text-primary" />
        <h3 className="text-xl font-semibold">Préférences de partenaire</h3>
        <p className="text-muted-foreground">Décrivez votre partenaire idéal selon les valeurs islamiques</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="looking_for">Type de relation recherchée *</Label>
          <Select value={profileData.looking_for} onValueChange={(value) => updateProfileData('looking_for', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Que recherchez-vous ?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monogamous_marriage">Mariage monogame</SelectItem>
              <SelectItem value="polygamous_marriage">Mariage polygame</SelectItem>
            </SelectContent>
          </Select>
          {validationErrors.looking_for && (
            <p className="text-sm text-destructive mt-1">{validationErrors.looking_for}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="desired_partner_age_min">Âge minimum souhaité *</Label>
            <Input
              id="desired_partner_age_min"
              type="number"
              min="18"
              max="100"
              value={profileData.desired_partner_age_min || ''}
              onChange={(e) => updateProfileData('desired_partner_age_min', parseInt(e.target.value))}
            />
          </div>

          <div>
            <Label htmlFor="desired_partner_age_max">Âge maximum souhaité *</Label>
            <Input
              id="desired_partner_age_max"
              type="number"
              min="18"
              max="100"
              value={profileData.desired_partner_age_max || ''}
              onChange={(e) => updateProfileData('desired_partner_age_max', parseInt(e.target.value))}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="desired_partner_location">Localisation préférée</Label>
            <Input
              id="desired_partner_location"
              value={profileData.desired_partner_location || ''}
              onChange={(e) => updateProfileData('desired_partner_location', e.target.value)}
              placeholder="Ville, région, pays"
            />
          </div>

          <div>
            <Label htmlFor="desired_partner_education">Éducation souhaitée</Label>
            <Select value={profileData.desired_partner_education} onValueChange={(value) => updateProfileData('desired_partner_education', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Niveau d'éducation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Peu importe</SelectItem>
                <SelectItem value="high_school">Baccalauréat minimum</SelectItem>
                <SelectItem value="bachelors">Licence minimum</SelectItem>
                <SelectItem value="masters">Master minimum</SelectItem>
                <SelectItem value="islamic_education">Éducation islamique</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="desired_partner_sect">Secte religieuse préférée</Label>
          <Select value={profileData.desired_partner_sect} onValueChange={(value) => updateProfileData('desired_partner_sect', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Préférence religieuse" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Peu importe</SelectItem>
              <SelectItem value="same_as_mine">Même que la mienne</SelectItem>
              <SelectItem value="sunni">Sunnite</SelectItem>
              <SelectItem value="shia">Chiite</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="desired_partner_qualities">Qualités importantes recherchées</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
            {[
              'Religieux/se', 'Éduqué(e)', 'Respectueux/se', 'Honnête', 'Généreux/se',
              'Patient(e)', 'Compréhensif/ve', 'Travailleur/se', 'Fidèle', 'Humble',
              'Drôle', 'Intelligent(e)', 'Bienveillant(e)', 'Responsable', 'Famille-oriented'
            ].map((quality) => (
              <div key={quality} className="flex items-center space-x-2">
                <Checkbox
                  id={quality}
                  checked={profileData.desired_partner_qualities?.includes(quality) || false}
                  onCheckedChange={(checked) => {
                    const currentQualities = profileData.desired_partner_qualities || [];
                    if (checked) {
                      updateProfileData('desired_partner_qualities', [...currentQualities, quality]);
                    } else {
                      updateProfileData('desired_partner_qualities', currentQualities.filter(q => q !== quality));
                    }
                  }}
                />
                <Label htmlFor={quality} className="text-sm">{quality}</Label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAboutInterests = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Book className="h-12 w-12 mx-auto mb-4 text-primary" />
        <h3 className="text-xl font-semibold">À propos de vous</h3>
        <p className="text-muted-foreground">Partagez qui vous êtes et vos intérêts</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="bio">Biographie personnelle *</Label>
          <Textarea
            id="bio"
            value={profileData.bio || ''}
            onChange={(e) => updateProfileData('bio', e.target.value)}
            placeholder="Présentez-vous de manière authentique et respectueuse. Partagez vos valeurs, aspirations, et ce qui vous rend unique..."
            rows={6}
            className="resize-none"
          />
          <div className="flex justify-between mt-1">
            <span className="text-sm text-muted-foreground">
              {(profileData.bio || '').length}/500 caractères
            </span>
            {validationErrors.bio && (
              <span className="text-sm text-destructive">{validationErrors.bio}</span>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="interests">Centres d'intérêt</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
            {[
              'Lecture', 'Voyage', 'Cuisine', 'Sport', 'Nature', 'Art',
              'Musique', 'Photographie', 'Écriture', 'Bénévolat', 'Technologie',
              'Histoire islamique', 'Calligraphie', 'Jardinage', 'Films',
              'Langues', 'Méditation', 'Famille', 'Études islamiques', 'Artisanat'
            ].map((interest) => (
              <div key={interest} className="flex items-center space-x-2">
                <Checkbox
                  id={interest}
                  checked={profileData.interests?.includes(interest) || false}
                  onCheckedChange={(checked) => {
                    const currentInterests = profileData.interests || [];
                    if (checked) {
                      updateProfileData('interests', [...currentInterests, interest]);
                    } else {
                      updateProfileData('interests', currentInterests.filter(i => i !== interest));
                    }
                  }}
                />
                <Label htmlFor={interest} className="text-sm">{interest}</Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="hobbies">Loisirs personnalisés</Label>
          <Input
            id="hobbies"
            value={profileData.hobbies?.join(', ') || ''}
            onChange={(e) => updateProfileData('hobbies', e.target.value.split(',').map(h => h.trim()).filter(h => h))}
            placeholder="Ajoutez vos loisirs spécifiques, séparés par des virgules"
          />
        </div>
      </div>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Shield className="h-12 w-12 mx-auto mb-4 text-primary" />
        <h3 className="text-xl font-semibold">Confidentialité et Vérification</h3>
        <p className="text-muted-foreground">Configurez vos paramètres de confidentialité selon vos préférences</p>
      </div>

      <div className="space-y-6">
        <div>
          <Label htmlFor="profile_visibility">Visibilité du profil *</Label>
          <Select value={profileData.profile_visibility} onValueChange={(value) => updateProfileData('profile_visibility', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Qui peut voir votre profil ?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4" />
                  <span>Public - Visible par tous les utilisateurs</span>
                </div>
              </SelectItem>
              <SelectItem value="matches_only">
                <div className="flex items-center space-x-2">
                  <Heart className="h-4 w-4" />
                  <span>Matches uniquement - Visible après match mutuel</span>
                </div>
              </SelectItem>
              <SelectItem value="family_only">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Famille seulement - Visible par la famille approuvée</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          {validationErrors.profile_visibility && (
            <p className="text-sm text-destructive mt-1">{validationErrors.profile_visibility}</p>
          )}
        </div>

        <div>
          <Label htmlFor="photo_visibility">Visibilité des photos</Label>
          <Select value={profileData.photo_visibility || 'matches_only'} onValueChange={(value) => updateProfileData('photo_visibility', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Qui peut voir vos photos ?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">
                <div className="flex items-center space-x-2">
                  <Eye className="h-4 w-4" />
                  <span>Publiques</span>
                </div>
              </SelectItem>
              <SelectItem value="matches_only">
                <div className="flex items-center space-x-2">
                  <Heart className="h-4 w-4" />
                  <span>Matches uniquement</span>
                </div>
              </SelectItem>
              <SelectItem value="family_only">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Famille seulement</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="contact_visibility">Visibilité des informations de contact</Label>
          <Select value={profileData.contact_visibility || 'family_only'} onValueChange={(value) => updateProfileData('contact_visibility', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Qui peut voir vos contacts ?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="family_only">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Famille seulement</span>
                </div>
              </SelectItem>
              <SelectItem value="matches_only">
                <div className="flex items-center space-x-2">
                  <Heart className="h-4 w-4" />
                  <span>Matches uniquement</span>
                </div>
              </SelectItem>
              <SelectItem value="after_approval">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Après approbation familiale</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="family_involvement"
              checked={profileData.family_involvement || false}
              onCheckedChange={(checked) => updateProfileData('family_involvement', checked)}
            />
            <Label htmlFor="family_involvement" className="text-sm">
              Impliquer ma famille dans le processus de matching (recommandé selon l'Islam)
            </Label>
          </div>

          {profileData.gender === 'female' && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="requires_wali_approval"
                checked={profileData.requires_wali_approval || false}
                onCheckedChange={(checked) => updateProfileData('requires_wali_approval', checked)}
              />
              <Label htmlFor="requires_wali_approval" className="text-sm">
                Requérir l'approbation de mon wali pour toute communication (recommandé)
              </Label>
            </div>
          )}
        </div>

        <div className="bg-secondary/20 p-4 rounded-lg">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-500" />
            Recommandations islamiques
          </h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• L'implication de la famille est encouragée dans l'Islam</li>
            <li>• La transparence et l'honnêteté sont des valeurs fondamentales</li>
            <li>• Respectez les limites de pudeur dans vos photos et descriptions</li>
            <li>• La vérification familiale aide à établir la confiance</li>
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Assistant de Création de Profil Islamique
          </CardTitle>
          <Badge variant="secondary">{currentStep}/{totalSteps}</Badge>
        </div>
        <Progress value={progress} className="mt-2" />
      </CardHeader>

      <CardContent className="space-y-6">
        {renderStepContent()}

        <div className="flex items-center justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Précédent
          </Button>

          <div className="flex items-center gap-2">
            {completedSteps.map((step) => (
              <CheckCircle key={step} className="h-5 w-5 text-green-500" />
            ))}
          </div>

          <Button
            onClick={nextStep}
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            ) : currentStep === totalSteps ? (
              'Finaliser le Profil'
            ) : (
              <>
                Suivant
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileWizard;
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Heart, Settings, Eye, Save, Camera, MapPin, Briefcase, GraduationCap, Brain, Target, Sparkles, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import PhotoUpload from '@/components/PhotoUpload';
import VerificationBadge from '@/components/VerificationBadge';
import CompatibilityCard from '@/components/CompatibilityCard';
import CompatibilityPrompt from '@/components/CompatibilityPrompt';
import InsightsPreviewCard from '@/components/InsightsPreviewCard';
import OnboardingFlow from '@/components/OnboardingFlow';
import GamifiedInsights from '@/components/GamifiedInsights';
import SmartMatchingSuggestions from '@/components/SmartMatchingSuggestions';
import QuickActionsPanel from '@/components/QuickActionsPanel';
import OnboardingCompletionGuide from '@/components/OnboardingCompletionGuide';
import GamificationDashboard from '@/components/gamification/GamificationDashboard';

interface Profile {
  id: string;
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

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | undefined>(undefined);
  const [islamicPrefs, setIslamicPrefs] = useState<IslamicPreferences | undefined>(undefined);
  const [verification, setVerification] = useState<any>(undefined);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchProfileData();
  }, [user]);

  const fetchProfileData = async () => {
    if (!user) return;

    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      // Fetch Islamic preferences
      const { data: prefsData } = await supabase
        .from('islamic_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      // Fetch verification status
      const { data: verificationData } = await supabase
        .from('user_verifications')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      setProfile(profileData ? {
        id: profileData.id,
        full_name: profileData.full_name ?? '',
        age: profileData.age ?? 0,
        gender: profileData.gender ?? '',
        location: profileData.location ?? '',
        education: profileData.education ?? '',
        profession: profileData.profession ?? '',
        bio: profileData.bio ?? '',
        looking_for: profileData.looking_for ?? '',
        interests: (profileData.interests as string[] | null) ?? [],
        avatar_url: profileData.avatar_url ?? ''
      } : undefined);
      
      setIslamicPrefs(prefsData ? {
        prayer_frequency: prefsData.prayer_frequency ?? '',
        quran_reading: prefsData.quran_reading ?? '',
        hijab_preference: prefsData.hijab_preference ?? '',
        beard_preference: prefsData.beard_preference ?? '',
        sect: prefsData.sect ?? '',
        madhab: prefsData.madhab ?? '',
        halal_diet: !!prefsData.halal_diet,
        smoking: prefsData.smoking ?? '',
        desired_partner_sect: prefsData.desired_partner_sect ?? '',
        importance_of_religion: prefsData.importance_of_religion ?? ''
      } : undefined);
      
      setVerification(verificationData ?? undefined);
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

  const saveProfile = async () => {
    if (!profile || !user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          ...profile
        }, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        });

      if (error) throw error;

      // Refresh the profile data to update UI
      await fetchProfileData();

      toast({
        title: "Profil sauvegardé",
        description: "Vos modifications ont été enregistrées avec succès."
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le profil",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const saveIslamicPreferences = async () => {
    if (!islamicPrefs || !user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('islamic_preferences')
        .upsert({
          user_id: user.id,
          ...islamicPrefs
        });

      if (error) throw error;

      toast({
        title: "Préférences sauvegardées",
        description: "Vos préférences islamiques ont été enregistrées."
      });
    } catch (error) {
      console.error('Error updating Islamic preferences:', error);
      toast({
        title: "Erreur", 
        description: "Impossible de sauvegarder les préférences",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const addInterest = (interest: string) => {
    if (!interest.trim() || !profile) return;
    
    if (!profile.interests.includes(interest.trim())) {
      setProfile({
        ...profile,
        interests: [...profile.interests, interest.trim()]
      });
    }
  };

  const removeInterest = (interestToRemove: string) => {
    if (!profile) return;
    
    setProfile({
      ...profile,
      interests: profile.interests.filter(interest => interest !== interestToRemove)
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-emerald/5 p-4">
        <div className="container mx-auto max-w-2xl">
          <Card className="shadow-lg">
            <CardContent className="p-8">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="py-8 px-4">
      <div className="container mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Mon Profil</h1>
            <p className="text-muted-foreground">
              Gérez votre profil et vos préférences
            </p>
          </div>
          <div className="flex items-center gap-2">
            <VerificationBadge verificationScore={verification?.verification_score || 0} />
            {profile && (
              <Badge 
                variant={profile.bio && profile.looking_for ? "default" : "secondary"}
                className="text-xs"
              >
                {profile.bio && profile.looking_for ? 'Profil complet' : 'Profil incomplet'}
              </Badge>
            )}
          </div>
        </div>

        {/* Onboarding Guide for new users */}
        <OnboardingCompletionGuide />

        {/* Compatibility Prompt for incomplete questionnaires */}
        <CompatibilityPrompt />

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-emerald" />
                <div>
                  <p className="text-sm font-medium">Profil</p>
                  <p className="text-xs text-muted-foreground">
                    {profile?.bio ? 'Complet' : 'À compléter'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Heart className="h-5 w-5 text-gold" />
                <div>
                  <p className="text-sm font-medium">Préférences</p>
                  <p className="text-xs text-muted-foreground">
                    {islamicPrefs?.sect ? 'Configurées' : 'À configurer'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/advanced-matching')}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Brain className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Matching IA</p>
                  <p className="text-xs text-muted-foreground">
                    Système avancé
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <CompatibilityCard compact />
        </div>

        {/* Advanced Matching Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Système de Matching Avancé
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Découvrez vos compatibilités avec notre IA spécialisée dans les valeurs islamiques
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors cursor-pointer" onClick={() => navigate('/advanced-matching?tab=ai-engine')}>
                <CardContent className="p-4 text-center">
                  <Brain className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold">Moteur IA</h3>
                  <p className="text-xs text-muted-foreground">Analyse de compatibilité intelligente</p>
                </CardContent>
              </Card>
              
              <Card className="border-2 border-emerald/20 hover:border-emerald/40 transition-colors cursor-pointer" onClick={() => navigate('/advanced-matching?tab=islamic-filters')}>
                <CardContent className="p-4 text-center">
                  <Target className="h-8 w-8 text-emerald mx-auto mb-2" />
                  <h3 className="font-semibold">Filtres Islamiques</h3>
                  <p className="text-xs text-muted-foreground">Critères religieux avancés</p>
                </CardContent>
              </Card>
              
              <Card className="border-2 border-gold/20 hover:border-gold/40 transition-colors cursor-pointer" onClick={() => navigate('/advanced-matching?tab=smart-recommendations')}>
                <CardContent className="p-4 text-center">
                  <Sparkles className="h-8 w-8 text-gold mx-auto mb-2" />
                  <h3 className="font-semibold">Recommandations IA</h3>
                  <p className="text-xs text-muted-foreground">Suggestions personnalisées</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="flex justify-center pt-2">
              <Button 
                onClick={() => navigate('/advanced-matching')}
                className="bg-gradient-to-r from-primary via-primary-glow to-emerald-600 hover:from-primary-dark hover:via-primary hover:to-emerald-700 text-white"
              >
                <Brain className="h-4 w-4 mr-2" />
                Accéder au Matching Avancé
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="xl:col-span-3 order-2 xl:order-1">
            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="profile">Profil Personnel</TabsTrigger>
                <TabsTrigger value="islamic">Préférences Islamiques</TabsTrigger>
                <TabsTrigger value="privacy">Confidentialité</TabsTrigger>
                <TabsTrigger value="gamification">
                  <Trophy className="h-4 w-4 mr-2" />
                  Gamification
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Informations Personnelles
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fullName">Nom complet</Label>
                        <Input
                          id="fullName"
                          value={profile?.full_name ?? ''}
                          onChange={(e) => setProfile(prev => prev ? {...prev, full_name: e.target.value} : undefined)}
                          placeholder="Votre nom complet"
                        />
                      </div>
                      <div>
                        <Label htmlFor="age">Âge</Label>
                        <Input
                          id="age"
                          type="number"
                          value={profile?.age ?? ''}
                          onChange={(e) => setProfile(prev => prev ? {...prev, age: parseInt(e.target.value)} : undefined)}
                          placeholder="Votre âge"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="gender">Genre</Label>
                        <Select value={profile?.gender ?? ''} onValueChange={(value) => setProfile(prev => prev ? {...prev, gender: value} : undefined)}>
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
                        <Label htmlFor="location">Localisation</Label>
                        <Input
                          id="location"
                          value={profile?.location ?? ''}
                          onChange={(e) => setProfile(prev => prev ? {...prev, location: e.target.value} : undefined)}
                          placeholder="Ville, Pays"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="education">Éducation</Label>
                        <Input
                          id="education"
                          value={profile?.education ?? ''}
                          onChange={(e) => setProfile(prev => prev ? {...prev, education: e.target.value} : undefined)}
                          placeholder="Votre niveau d'éducation"
                        />
                      </div>
                      <div>
                        <Label htmlFor="profession">Profession</Label>
                        <Input
                          id="profession"
                          value={profile?.profession ?? ''}
                          onChange={(e) => setProfile(prev => prev ? {...prev, profession: e.target.value} : undefined)}
                          placeholder="Votre profession"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="bio">À propos de moi</Label>
                      <Textarea
                        id="bio"
                        value={profile?.bio ?? ''}
                        onChange={(e) => setProfile(prev => prev ? {...prev, bio: e.target.value} : undefined)}
                        placeholder="Décrivez-vous brièvement..."
                        rows={4}
                      />
                    </div>

                    <div>
                      <Label htmlFor="lookingFor">Ce que je recherche</Label>
                      <Textarea
                        id="lookingFor"
                        value={profile?.looking_for ?? ''}
                        onChange={(e) => setProfile(prev => prev ? {...prev, looking_for: e.target.value} : undefined)}
                        placeholder="Décrivez le type de partenaire que vous recherchez..."
                        rows={3}
                      />
                    </div>

                    <PhotoUpload 
                      currentPhotoUrl={profile?.avatar_url}
                      onPhotoUpdate={(url) => setProfile(prev => prev ? {...prev, avatar_url: url} : undefined)}
                    />

                    <div>
                      <Label>Centres d'intérêt</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {(profile?.interests || []).map((interest) => (
                          <Badge 
                            key={interest} 
                            variant="secondary" 
                            className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground" 
                            onClick={() => removeInterest(interest)}
                          >
                            {interest} ×
                          </Badge>
                        ))}
                      </div>
                      <Input
                        placeholder="Ajouter un centre d'intérêt (appuyez sur Entrée)"
                        className="mt-2"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            const target = e.target as HTMLInputElement;
                            addInterest(target.value);
                            target.value = '';
                          }
                        }}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Cliquez sur un centre d'intérêt avec × pour le supprimer
                      </p>
                    </div>

                    <Separator />

                    <Button 
                      onClick={saveProfile} 
                      disabled={saving}
                      className="w-full bg-emerald hover:bg-emerald-dark text-primary-foreground"
                    >
                      {saving ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      {saving ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="islamic" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5" />
                      Préférences Islamiques
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Fréquence de prière</Label>
                        <Select 
                          value={islamicPrefs?.prayer_frequency ?? ''} 
                          onValueChange={(value) => setIslamicPrefs(prev => prev ? {...prev, prayer_frequency: value} : undefined)}
                        >
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
                        <Select 
                          value={islamicPrefs?.quran_reading ?? ''} 
                          onValueChange={(value) => setIslamicPrefs(prev => prev ? {...prev, quran_reading: value} : undefined)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Quotidiennement</SelectItem>
                            <SelectItem value="weekly">Hebdomadairement</SelectItem>
                            <SelectItem value="monthly">Mensuellement</SelectItem>
                            <SelectItem value="occasionally">Occasionnellement</SelectItem>
                            <SelectItem value="learning">En apprentissage</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Secte</Label>
                        <Select 
                          value={islamicPrefs?.sect ?? ''} 
                          onValueChange={(value) => setIslamicPrefs(prev => prev ? {...prev, sect: value} : undefined)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sunni">Sunnite</SelectItem>
                            <SelectItem value="shia">Chiite</SelectItem>
                            <SelectItem value="other">Autre</SelectItem>
                            <SelectItem value="prefer_not_to_say">Préfère ne pas dire</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Importance de la religion</Label>
                        <Select 
                          value={islamicPrefs?.importance_of_religion ?? ''} 
                          onValueChange={(value) => setIslamicPrefs(prev => prev ? {...prev, importance_of_religion: value} : undefined)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="very_important">Très important</SelectItem>
                            <SelectItem value="important">Important</SelectItem>
                            <SelectItem value="somewhat_important">Assez important</SelectItem>
                            <SelectItem value="not_important">Pas important</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Separator />

                    <Button 
                      onClick={saveIslamicPreferences} 
                      disabled={saving}
                      className="w-full bg-emerald hover:bg-emerald-dark text-primary-foreground"
                    >
                      {saving ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      {saving ? 'Sauvegarde...' : 'Sauvegarder les préférences'}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="privacy" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Paramètres de confidentialité
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div>
                        <h3 className="font-medium">Visibilité du profil</h3>
                        <p className="text-sm text-muted-foreground">Qui peut voir votre profil complet</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate('/settings?tab=privacy')}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Gérer
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div>
                        <h3 className="font-medium">Photos</h3>
                        <p className="text-sm text-muted-foreground">Gérer la visibilité de vos photos</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate('/settings?tab=privacy')}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Configurer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="gamification" className="space-y-6">
                <GamificationDashboard layout="stack" />
              </TabsContent>
            </Tabs>
          </div>

          {/* Compatibility Card */}
          <div className="xl:col-span-1 order-1 xl:order-2">
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-1">
              <QuickActionsPanel />
              <SmartMatchingSuggestions />
              <CompatibilityCard />
              <InsightsPreviewCard />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
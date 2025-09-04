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
import { User, Heart, Settings, Eye, Save, Camera, MapPin, Briefcase, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import PhotoUpload from '@/components/PhotoUpload';
import VerificationBadge from '@/components/VerificationBadge';

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
  const [profile, setProfile] = useState<Profile | null>(null);
  const [islamicPrefs, setIslamicPrefs] = useState<IslamicPreferences | null>(null);
  const [verification, setVerification] = useState<any>(null);
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
        .single();

      // Fetch Islamic preferences
      const { data: prefsData } = await supabase
        .from('islamic_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Fetch verification status
      const { data: verificationData } = await supabase
        .from('user_verifications')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setProfile(profileData);
      setIslamicPrefs(prefsData);
      setVerification(verificationData);
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
    if (!user || !profile) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          age: profile.age,
          gender: profile.gender,
          location: profile.location,
          education: profile.education,
          profession: profile.profession,
          bio: profile.bio,
          looking_for: profile.looking_for,
          interests: profile.interests,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Profil sauvegardé",
        description: "Vos informations personnelles ont été mises à jour avec succès",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
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
    if (!user || !islamicPrefs) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('islamic_preferences')
        .update(islamicPrefs)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Préférences sauvegardées",
        description: "Vos préférences islamiques ont été mises à jour avec succès",
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
    if (interest && profile && !profile.interests.includes(interest)) {
      setProfile(prev => prev ? {
        ...prev,
        interests: [...prev.interests, interest]
      } : null);
    }
  };

  const removeInterest = (interest: string) => {
    if (profile) {
      setProfile(prev => prev ? {
        ...prev,
        interests: prev.interests.filter(i => i !== interest)
      } : null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-emerald/5 flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement de votre profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4">
      <div className="container mx-auto">
        <div className="max-w-4xl mx-auto">
          {/* Header with Profile Overview */}
          <div className="flex flex-col lg:flex-row items-start gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="h-20 w-20 rounded-full overflow-hidden bg-gradient-to-br from-emerald to-emerald-light flex items-center justify-center">
                  {profile?.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt="Photo de profil"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-10 w-10 text-primary-foreground" />
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1">
                  <VerificationBadge verificationScore={verification?.verification_score || 0} />
                </div>
              </div>
              
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  {profile?.full_name || 'Votre Profil'}
                </h1>
                <div className="flex items-center gap-4 text-muted-foreground mt-1">
                  {profile?.age && (
                    <span className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {profile.age} ans
                    </span>
                  )}
                  {profile?.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {profile.location}
                    </span>
                  )}
                  {profile?.profession && (
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      {profile.profession}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 ml-auto">
              <Button
                variant="outline"
                onClick={() => navigate('/browse')}
                className="border-emerald text-emerald hover:bg-emerald hover:text-white"
              >
                <Eye className="h-4 w-4 mr-2" />
                Découvrir
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/matches')}
                className="border-emerald text-emerald hover:bg-emerald hover:text-white"
              >
                <Heart className="h-4 w-4 mr-2" />
                Mes matches
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/settings')}
              >
                <Settings className="h-4 w-4 mr-2" />
                Paramètres
              </Button>
            </div>
          </div>

          {/* Completion Progress */}
          {profile && (
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">Complétude du profil</h3>
                    <p className="text-sm text-muted-foreground">
                      Complétez votre profil pour améliorer vos chances de match
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-emerald">
                      {Math.round(((profile.full_name ? 1 : 0) +
                        (profile.age ? 1 : 0) +
                        (profile.location ? 1 : 0) +
                        (profile.bio ? 1 : 0) +
                        (profile.avatar_url ? 1 : 0) +
                        (profile.profession ? 1 : 0)) / 6 * 100)}%
                    </div>
                    <p className="text-xs text-muted-foreground">Complet</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profil Personnel</TabsTrigger>
              <TabsTrigger value="islamic">Préférences Islamiques</TabsTrigger>
              <TabsTrigger value="privacy">Confidentialité</TabsTrigger>
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
                        value={profile?.full_name || ''}
                        onChange={(e) => setProfile(prev => prev ? {...prev, full_name: e.target.value} : null)}
                        placeholder="Votre nom complet"
                      />
                    </div>
                    <div>
                      <Label htmlFor="age">Âge</Label>
                      <Input
                        id="age"
                        type="number"
                        value={profile?.age || ''}
                        onChange={(e) => setProfile(prev => prev ? {...prev, age: parseInt(e.target.value)} : null)}
                        placeholder="Votre âge"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="gender">Genre</Label>
                      <Select value={profile?.gender || ''} onValueChange={(value) => setProfile(prev => prev ? {...prev, gender: value} : null)}>
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
                        value={profile?.location || ''}
                        onChange={(e) => setProfile(prev => prev ? {...prev, location: e.target.value} : null)}
                        placeholder="Ville, Pays"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="education">Éducation</Label>
                      <Input
                        id="education"
                        value={profile?.education || ''}
                        onChange={(e) => setProfile(prev => prev ? {...prev, education: e.target.value} : null)}
                        placeholder="Votre niveau d'éducation"
                      />
                    </div>
                    <div>
                      <Label htmlFor="profession">Profession</Label>
                      <Input
                        id="profession"
                        value={profile?.profession || ''}
                        onChange={(e) => setProfile(prev => prev ? {...prev, profession: e.target.value} : null)}
                        placeholder="Votre profession"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bio">À propos de moi</Label>
                    <Textarea
                      id="bio"
                      value={profile?.bio || ''}
                      onChange={(e) => setProfile(prev => prev ? {...prev, bio: e.target.value} : null)}
                      placeholder="Décrivez-vous brièvement..."
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="lookingFor">Ce que je recherche</Label>
                    <Textarea
                      id="lookingFor"
                      value={profile?.looking_for || ''}
                      onChange={(e) => setProfile(prev => prev ? {...prev, looking_for: e.target.value} : null)}
                      placeholder="Décrivez le type de partenaire que vous recherchez..."
                      rows={3}
                    />
                  </div>

                  <PhotoUpload 
                    currentPhotoUrl={profile?.avatar_url}
                    onPhotoUpdate={(url) => setProfile(prev => prev ? {...prev, avatar_url: url} : null)}
                  />

                  <div>
                    <Label>Centres d'intérêt</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {profile?.interests.map((interest) => (
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
                        value={islamicPrefs?.prayer_frequency || ''} 
                        onValueChange={(value) => setIslamicPrefs(prev => prev ? {...prev, prayer_frequency: value} : null)}
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
                        value={islamicPrefs?.quran_reading || ''} 
                        onValueChange={(value) => setIslamicPrefs(prev => prev ? {...prev, quran_reading: value} : null)}
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
                        value={islamicPrefs?.sect || ''} 
                        onValueChange={(value) => setIslamicPrefs(prev => prev ? {...prev, sect: value} : null)}
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
                        value={islamicPrefs?.importance_of_religion || ''} 
                        onValueChange={(value) => setIslamicPrefs(prev => prev ? {...prev, importance_of_religion: value} : null)}
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
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Gérer
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <h3 className="font-medium">Photos</h3>
                      <p className="text-sm text-muted-foreground">Gérer la visibilité de vos photos</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Configurer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
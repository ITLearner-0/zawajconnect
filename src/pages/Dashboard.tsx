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
import { User, Heart, Settings, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PhotoUpload from '@/components/PhotoUpload';

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
  const [profile, setProfile] = useState<Profile | null>(null);
  const [islamicPrefs, setIslamicPrefs] = useState<IslamicPreferences | null>(null);
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

      setProfile(profileData);
      setIslamicPrefs(prefsData);
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!user || !profile) return;

    setSaving(true);
    try {
      await supabase
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

      alert('Profil mis à jour avec succès !');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Erreur lors de la mise à jour du profil');
    } finally {
      setSaving(false);
    }
  };

  const saveIslamicPreferences = async () => {
    if (!user || !islamicPrefs) return;

    setSaving(true);
    try {
      await supabase
        .from('islamic_preferences')
        .update(islamicPrefs)
        .eq('user_id', user.id);

      alert('Préférences islamiques mises à jour avec succès !');
    } catch (error) {
      console.error('Error updating Islamic preferences:', error);
      alert('Erreur lors de la mise à jour des préférences');
    } finally {
      setSaving(false);
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
          <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-12 bg-gradient-to-br from-emerald to-emerald-light rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Mon Profil</h1>
              <p className="text-muted-foreground">Gérez votre profil matrimonial islamique</p>
            </div>
          </div>

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

                  <Button 
                    onClick={saveProfile} 
                    disabled={saving}
                    className="bg-emerald hover:bg-emerald-dark text-primary-foreground"
                  >
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

                  <Button 
                    onClick={saveIslamicPreferences} 
                    disabled={saving}
                    className="bg-emerald hover:bg-emerald-dark text-primary-foreground"
                  >
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
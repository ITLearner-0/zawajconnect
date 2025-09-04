import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  User, 
  Mail, 
  Phone,
  MapPin,
  Save,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface UserSettings {
  email_notifications: boolean;
  match_notifications: boolean;
  message_notifications: boolean;
  profile_visibility: string;
  search_distance: number;
  age_min: number;
  age_max: number;
  auto_accept_matches: boolean;
}

interface Profile {
  full_name: string;
  age: number;
  gender: string;
  location: string;
  phone: string;
  bio: string;
  profession: string;
  education: string;
  looking_for: string;
  interests: string[];
}

const Settings = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<UserSettings>({
    email_notifications: true,
    match_notifications: true,
    message_notifications: true,
    profile_visibility: 'public',
    search_distance: 50,
    age_min: 18,
    age_max: 50,
    auto_accept_matches: false
  });
  const [profile, setProfile] = useState<Profile>({
    full_name: '',
    age: 18,
    gender: '',
    location: '',
    phone: '',
    bio: '',
    profession: '',
    education: '',
    looking_for: '',
    interests: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchUserData();
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileData) {
        setProfile({
          full_name: profileData.full_name || '',
          age: profileData.age || 18,
          gender: profileData.gender || '',
          location: profileData.location || '',
          phone: profileData.phone || '',
          bio: profileData.bio || '',
          profession: profileData.profession || '',
          education: profileData.education || '',
          looking_for: profileData.looking_for || '',
          interests: profileData.interests || []
        });
      }

      // Fetch user settings
      const { data: settingsData } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (settingsData) {
        setSettings({
          email_notifications: settingsData.email_notifications ?? true,
          match_notifications: settingsData.match_notifications ?? true,
          message_notifications: settingsData.message_notifications ?? true,
          profile_visibility: settingsData.profile_visibility || 'public',
          search_distance: settingsData.search_distance || 50,
          age_min: settingsData.age_min || 18,
          age_max: settingsData.age_max || 50,
          auto_accept_matches: settingsData.auto_accept_matches ?? false
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!user) return;
    setSaving(true);

    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          ...profile,
          updated_at: new Date().toISOString()
        });

      if (profileError) throw profileError;

      // Update settings
      const { error: settingsError } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          ...settings,
          updated_at: new Date().toISOString()
        });

      if (settingsError) throw settingsError;

      toast({
        title: "Paramètres sauvegardés",
        description: "Vos modifications ont été enregistrées avec succès.",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder vos paramètres.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteAccount = async () => {
    if (!user) return;

    try {
      // Delete user data (Supabase will handle cascading deletes)
      const { error } = await supabase.auth.admin.deleteUser(user.id);
      
      if (error) throw error;

      await signOut();
      navigate('/');
      
      toast({
        title: "Compte supprimé",
        description: "Votre compte a été supprimé définitivement.",
      });
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer votre compte. Contactez le support.",
        variant: "destructive"
      });
    }
  };

  const addInterest = (interest: string) => {
    if (interest && !profile.interests.includes(interest)) {
      setProfile(prev => ({
        ...prev,
        interests: [...prev.interests, interest]
      }));
    }
  };

  const removeInterest = (interest: string) => {
    setProfile(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-emerald/5 flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des paramètres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-12 w-12 bg-gradient-to-br from-emerald to-emerald-light rounded-full flex items-center justify-center">
            <SettingsIcon className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Paramètres</h1>
            <p className="text-muted-foreground">Gérez vos informations personnelles et préférences</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Profile Information */}
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
                    value={profile.full_name}
                    onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Votre nom complet"
                  />
                </div>
                <div>
                  <Label htmlFor="age">Âge</Label>
                  <Input
                    id="age"
                    type="number"
                    min="18"
                    max="100"
                    value={profile.age}
                    onChange={(e) => setProfile(prev => ({ ...prev, age: parseInt(e.target.value) || 18 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Genre</Label>
                  <Select value={profile.gender} onValueChange={(value) => setProfile(prev => ({ ...prev, gender: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez votre genre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="homme">Homme</SelectItem>
                      <SelectItem value="femme">Femme</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="location">Localisation</Label>
                  <Input
                    id="location"
                    value={profile.location}
                    onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Votre ville, pays"
                  />
                </div>
                <div>
                  <Label htmlFor="profession">Profession</Label>
                  <Input
                    id="profession"
                    value={profile.profession}
                    onChange={(e) => setProfile(prev => ({ ...prev, profession: e.target.value }))}
                    placeholder="Votre métier"
                  />
                </div>
                <div>
                  <Label htmlFor="education">Éducation</Label>
                  <Input
                    id="education"
                    value={profile.education}
                    onChange={(e) => setProfile(prev => ({ ...prev, education: e.target.value }))}
                    placeholder="Votre niveau d'études"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="bio">Présentation</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Présentez-vous en quelques mots..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="lookingFor">Recherche</Label>
                <Textarea
                  id="lookingFor"
                  value={profile.looking_for}
                  onChange={(e) => setProfile(prev => ({ ...prev, looking_for: e.target.value }))}
                  placeholder="Décrivez le type de partenaire que vous recherchez..."
                  rows={3}
                />
              </div>

              <div>
                <Label>Centres d'intérêt</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {profile.interests.map((interest) => (
                    <Badge key={interest} variant="secondary" className="cursor-pointer" onClick={() => removeInterest(interest)}>
                      {interest} ×
                    </Badge>
                  ))}
                </div>
                <Input
                  placeholder="Ajouter un centre d'intérêt (appuyez sur Entrée)"
                  className="mt-2"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addInterest(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emailNotif">Notifications par email</Label>
                  <p className="text-sm text-muted-foreground">Recevoir les mises à jour par email</p>
                </div>
                <Switch
                  id="emailNotif"
                  checked={settings.email_notifications}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, email_notifications: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="matchNotif">Notifications de match</Label>
                  <p className="text-sm text-muted-foreground">Être averti des nouveaux matches</p>
                </div>
                <Switch
                  id="matchNotif"
                  checked={settings.match_notifications}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, match_notifications: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="messageNotif">Notifications de message</Label>
                  <p className="text-sm text-muted-foreground">Être averti des nouveaux messages</p>
                </div>
                <Switch
                  id="messageNotif"
                  checked={settings.message_notifications}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, message_notifications: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Search */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Confidentialité et Recherche
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="visibility">Visibilité du profil</Label>
                <Select value={settings.profile_visibility} onValueChange={(value) => setSettings(prev => ({ ...prev, profile_visibility: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public - Visible par tous</SelectItem>
                    <SelectItem value="matches">Matches uniquement</SelectItem>
                    <SelectItem value="private">Privé - Invisible</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="distance">Distance de recherche (km)</Label>
                  <Input
                    id="distance"
                    type="number"
                    min="1"
                    max="500"
                    value={settings.search_distance}
                    onChange={(e) => setSettings(prev => ({ ...prev, search_distance: parseInt(e.target.value) || 50 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="ageMin">Âge minimum</Label>
                  <Input
                    id="ageMin"
                    type="number"
                    min="18"
                    max="100"
                    value={settings.age_min}
                    onChange={(e) => setSettings(prev => ({ ...prev, age_min: parseInt(e.target.value) || 18 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="ageMax">Âge maximum</Label>
                  <Input
                    id="ageMax"
                    type="number"
                    min="18"
                    max="100"
                    value={settings.age_max}
                    onChange={(e) => setSettings(prev => ({ ...prev, age_max: parseInt(e.target.value) || 50 }))}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoAccept">Acceptation automatique des matches</Label>
                  <p className="text-sm text-muted-foreground">Les matches seront automatiquement acceptés</p>
                </div>
                <Switch
                  id="autoAccept"
                  checked={settings.auto_accept_matches}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, auto_accept_matches: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={saveSettings}
              disabled={saving}
              className="flex-1 bg-emerald hover:bg-emerald-dark text-primary-foreground"
            >
              {saving ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Sauvegarder
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="flex-1"
            >
              Retour au profil
            </Button>
          </div>

          <Separator />

          {/* Danger Zone */}
          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Zone dangereuse
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!showDeleteConfirm ? (
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer mon compte
                </Button>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    ⚠️ Cette action est irréversible. Toutes vos données seront définitivement supprimées.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      onClick={deleteAccount}
                    >
                      Confirmer la suppression
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
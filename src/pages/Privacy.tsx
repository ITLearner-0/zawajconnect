import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Shield, Eye, Users, MessageCircle, Camera, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PrivacySettings {
  profile_visibility: string;
  photo_visibility: string;
  contact_visibility: string;
  last_seen_visibility: string;
  allow_messages_from: string;
  allow_profile_views: boolean;
  allow_family_involvement: boolean;
}

const Privacy = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<PrivacySettings | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchPrivacySettings();
  }, [user]);

  const fetchPrivacySettings = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('privacy_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      setSettings(data ? {
        profile_visibility: data.profile_visibility ?? 'public',
        photo_visibility: data.photo_visibility ?? 'matches_only',
        contact_visibility: data.contact_visibility ?? 'matches_only',
        last_seen_visibility: data.last_seen_visibility ?? 'everyone',
        allow_messages_from: data.allow_messages_from ?? 'matches_only',
        allow_profile_views: !!data.allow_profile_views,
        allow_family_involvement: !!data.allow_family_involvement
      } : undefined);
    } catch (error) {
      console.error('Error fetching privacy settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!user || !settings) return;

    setSaving(true);
    try {
      await supabase
        .from('privacy_settings')
        .update(settings)
        .eq('user_id', user.id);

      alert('Paramètres de confidentialité mis à jour avec succès !');
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      alert('Erreur lors de la sauvegarde des paramètres');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: keyof PrivacySettings, value: string | boolean) => {
    setSettings(prev => prev ? { ...prev, [key]: value } : undefined);
  };

  if (loading) {
    return (
      <div className="py-8 px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald border-t-transparent mx-auto mb-4"></div>
              <p className="text-muted-foreground">Chargement des paramètres...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="py-8 px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <h2 className="text-xl font-bold text-foreground mb-2">Paramètres non trouvés</h2>
              <Button onClick={() => navigate('/enhanced-profile')} className="bg-emerald hover:bg-emerald-dark text-primary-foreground">
                Retour au profil
              </Button>
            </div>
          </div>
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
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Paramètres de confidentialité</h1>
              <p className="text-muted-foreground">Contrôlez qui peut voir vos informations</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Profile Visibility */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Visibilité du profil
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="profile-visibility">Qui peut voir votre profil complet</Label>
                  <Select 
                    value={settings.profile_visibility} 
                    onValueChange={(value) => updateSetting('profile_visibility', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Tout le monde</SelectItem>
                      <SelectItem value="verified_only">Utilisateurs vérifiés uniquement</SelectItem>
                      <SelectItem value="private">Personne (profil privé)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Autoriser les visites de profil</Label>
                    <p className="text-sm text-muted-foreground">Permettre aux autres de voir que vous avez consulté leur profil</p>
                  </div>
                  <Switch
                    checked={settings.allow_profile_views}
                    onCheckedChange={(checked) => updateSetting('allow_profile_views', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Photo Visibility */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Visibilité des photos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="photo-visibility">Qui peut voir vos photos</Label>
                  <Select 
                    value={settings.photo_visibility} 
                    onValueChange={(value) => updateSetting('photo_visibility', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Tout le monde</SelectItem>
                      <SelectItem value="matches_only">Mes matches uniquement</SelectItem>
                      <SelectItem value="verified_only">Utilisateurs vérifiés uniquement</SelectItem>
                      <SelectItem value="private">Personne</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Communication Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Paramètres de communication
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="messages-from">Qui peut m'envoyer des messages</Label>
                  <Select 
                    value={settings.allow_messages_from} 
                    onValueChange={(value) => updateSetting('allow_messages_from', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="everyone">Tout le monde</SelectItem>
                      <SelectItem value="verified_only">Utilisateurs vérifiés uniquement</SelectItem>
                      <SelectItem value="matches_only">Mes matches uniquement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="contact-visibility">Visibilité des informations de contact</Label>
                  <Select 
                    value={settings.contact_visibility} 
                    onValueChange={(value) => updateSetting('contact_visibility', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Tout le monde</SelectItem>
                      <SelectItem value="matches_only">Mes matches uniquement</SelectItem>
                      <SelectItem value="family_only">Famille uniquement</SelectItem>
                      <SelectItem value="private">Personne</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="last-seen">Visibilité de la dernière connexion</Label>
                  <Select 
                    value={settings.last_seen_visibility} 
                    onValueChange={(value) => updateSetting('last_seen_visibility', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="everyone">Tout le monde</SelectItem>
                      <SelectItem value="matches_only">Mes matches uniquement</SelectItem>
                      <SelectItem value="nobody">Personne</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Family Involvement */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Implication familiale
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Autoriser l'implication de la famille</Label>
                    <p className="text-sm text-muted-foreground">
                      Permettre aux membres de votre famille de voir votre profil et d'être impliqués dans le processus
                    </p>
                  </div>
                  <Switch
                    checked={settings.allow_family_involvement}
                    onCheckedChange={(checked) => updateSetting('allow_family_involvement', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Button 
              onClick={saveSettings} 
              disabled={saving}
              className="w-full bg-emerald hover:bg-emerald-dark text-primary-foreground"
            >
              {saving ? 'Sauvegarde...' : 'Sauvegarder les paramètres'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
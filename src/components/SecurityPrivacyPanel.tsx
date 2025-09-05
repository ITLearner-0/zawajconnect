import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  Lock, 
  Eye, 
  EyeOff, 
  UserCheck, 
  AlertTriangle,
  Settings,
  Database,
  Clock,
  Bell
} from 'lucide-react';

interface SecuritySettings {
  id: string;
  setting_key: string;
  setting_value: any;
  description: string;
  category: string;
}

interface PrivacySettings {
  profile_visibility: string;
  photo_visibility: string;
  allow_messages_from: string;
  contact_visibility: string;
  last_seen_visibility: string;
  allow_family_involvement: boolean;
  allow_profile_views: boolean;
}

const SecurityPrivacyPanel = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<SecuritySettings[]>([]);
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Load admin settings
      const { data: adminSettings, error: adminError } = await supabase
        .from('admin_settings')
        .select('*')
        .in('category', ['security', 'privacy', 'limits', 'family']);

      if (adminError && adminError.code !== 'PGRST116') {
        throw adminError;
      }

      setSettings(adminSettings || []);

      // Load user privacy settings
      const { data: userPrivacy, error: privacyError } = await supabase
        .from('privacy_settings')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (privacyError && privacyError.code !== 'PGRST116') {
        console.warn('Privacy settings not found, will create default');
      }

      setPrivacySettings(userPrivacy || {
        profile_visibility: 'matches_only',
        photo_visibility: 'matches_only',
        allow_messages_from: 'matches_only',
        contact_visibility: 'matches_only',
        last_seen_visibility: 'matches_only',
        allow_family_involvement: false,
        allow_profile_views: true
      });

    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les paramètres",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateAdminSetting = async (settingKey: string, value: any) => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('admin_settings')
        .update({ 
          setting_value: value,
          updated_by: user?.id 
        })
        .eq('setting_key', settingKey);

      if (error) throw error;

      // Update local state
      setSettings(prev => 
        prev.map(setting => 
          setting.setting_key === settingKey 
            ? { ...setting, setting_value: value }
            : setting
        )
      );

      toast({
        title: "Succès",
        description: "Paramètre mis à jour avec succès"
      });
    } catch (error) {
      console.error('Error updating admin setting:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le paramètre",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const updatePrivacySetting = async (field: keyof PrivacySettings, value: any) => {
    if (!privacySettings) return;

    try {
      setSaving(true);
      const updatedSettings = { ...privacySettings, [field]: value };

      const { error } = await supabase
        .from('privacy_settings')
        .upsert({
          user_id: user?.id,
          ...updatedSettings
        });

      if (error) throw error;

      setPrivacySettings(updatedSettings);

      toast({
        title: "Succès",
        description: "Paramètre de confidentialité mis à jour"
      });
    } catch (error) {
      console.error('Error updating privacy setting:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le paramètre",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const getSettingValue = (key: string) => {
    const setting = settings.find(s => s.setting_key === key);
    return setting?.setting_value;
  };

  const getVisibilityLabel = (value: string) => {
    const labels = {
      public: 'Public',
      matches_only: 'Matches uniquement',
      family_only: 'Famille uniquement',
      private: 'Privé'
    };
    return labels[value as keyof typeof labels] || value;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des paramètres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
          <Shield className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Sécurité & Confidentialité</h2>
          <p className="text-muted-foreground">Gérez la sécurité et la confidentialité de votre plateforme</p>
        </div>
      </div>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Paramètres de Sécurité
          </CardTitle>
          <CardDescription>
            Configurez les paramètres de sécurité de la plateforme
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="password_min_length">Longueur minimale du mot de passe</Label>
                <Input
                  id="password_min_length"
                  type="number"
                  min="6"
                  max="20"
                  value={getSettingValue('security_password_min_length') || 8}
                  onChange={(e) => updateAdminSetting('security_password_min_length', parseInt(e.target.value))}
                  disabled={saving}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Vérification requise pour les messages</Label>
                  <p className="text-sm text-muted-foreground">
                    Exiger une vérification avant de pouvoir envoyer des messages
                  </p>
                </div>
                <Switch
                  checked={getSettingValue('verification_required_for_messaging') || false}
                  onCheckedChange={(checked) => updateAdminSetting('verification_required_for_messaging', checked)}
                  disabled={saving}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="max_daily_likes">Limite de likes par jour</Label>
                <Input
                  id="max_daily_likes"
                  type="number"
                  min="10"
                  max="200"
                  value={getSettingValue('max_daily_likes') || 50}
                  onChange={(e) => updateAdminSetting('max_daily_likes', parseInt(e.target.value))}
                  disabled={saving}
                />
              </div>

              <div>
                <Label htmlFor="max_photos">Photos maximum par profil</Label>
                <Input
                  id="max_photos"
                  type="number"
                  min="3"
                  max="10"
                  value={getSettingValue('max_photos_per_profile') || 6}
                  onChange={(e) => updateAdminSetting('max_photos_per_profile', parseInt(e.target.value))}
                  disabled={saving}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Family Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Paramètres Familiaux
          </CardTitle>
          <CardDescription>
            Configurez l'implication familiale selon les traditions islamiques
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Supervision familiale activée</Label>
              <p className="text-sm text-muted-foreground">
                Permettre aux familles de superviser les conversations
              </p>
            </div>
            <Switch
              checked={getSettingValue('enable_family_supervision') || false}
              onCheckedChange={(checked) => updateAdminSetting('enable_family_supervision', checked)}
              disabled={saving}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Approbation familiale requise</Label>
              <p className="text-sm text-muted-foreground">
                Exiger l'approbation de la famille pour les matches
              </p>
            </div>
            <Switch
              checked={getSettingValue('require_family_approval') || false}
              onCheckedChange={(checked) => updateAdminSetting('require_family_approval', checked)}
              disabled={saving}
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      {privacySettings && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Paramètres de Confidentialité Personnels
            </CardTitle>
            <CardDescription>
              Gérez vos propres paramètres de confidentialité
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Visibilité du profil</Label>
                <Select
                  value={privacySettings.profile_visibility}
                  onValueChange={(value) => updatePrivacySetting('profile_visibility', value)}
                  disabled={saving}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="matches_only">Matches uniquement</SelectItem>
                    <SelectItem value="family_only">Famille uniquement</SelectItem>
                    <SelectItem value="private">Privé</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Visibilité des photos</Label>
                <Select
                  value={privacySettings.photo_visibility}
                  onValueChange={(value) => updatePrivacySetting('photo_visibility', value)}
                  disabled={saving}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="matches_only">Matches uniquement</SelectItem>
                    <SelectItem value="family_only">Famille uniquement</SelectItem>
                    <SelectItem value="private">Privé</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Messages autorisés de</Label>
                <Select
                  value={privacySettings.allow_messages_from}
                  onValueChange={(value) => updatePrivacySetting('allow_messages_from', value)}
                  disabled={saving}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="matches_only">Matches uniquement</SelectItem>
                    <SelectItem value="verified_only">Utilisateurs vérifiés uniquement</SelectItem>
                    <SelectItem value="family_approved">Approuvés par la famille</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Dernière connexion visible par</Label>
                <Select
                  value={privacySettings.last_seen_visibility}
                  onValueChange={(value) => updatePrivacySetting('last_seen_visibility', value)}
                  disabled={saving}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="matches_only">Matches uniquement</SelectItem>
                    <SelectItem value="family_only">Famille uniquement</SelectItem>
                    <SelectItem value="private">Personne</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Permettre l'implication familiale</Label>
                  <p className="text-sm text-muted-foreground">
                    Autoriser les membres de la famille à participer au processus matrimonial
                  </p>
                </div>
                <Switch
                  checked={privacySettings.allow_family_involvement}
                  onCheckedChange={(checked) => updatePrivacySetting('allow_family_involvement', checked)}
                  disabled={saving}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Autoriser les vues de profil</Label>
                  <p className="text-sm text-muted-foreground">
                    Permettre aux autres utilisateurs de voir votre profil
                  </p>
                </div>
                <Switch
                  checked={privacySettings.allow_profile_views}
                  onCheckedChange={(checked) => updatePrivacySetting('allow_profile_views', checked)}
                  disabled={saving}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            État du Système
          </CardTitle>
          <CardDescription>
            Surveillez l'état de sécurité de votre plateforme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <div className="h-3 w-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium">Sécurité des Données</p>
                <p className="text-sm text-muted-foreground">RLS Activé</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
              <div>
                <p className="font-medium">Protection des Mots de Passe</p>
                <p className="text-sm text-muted-foreground">À configurer</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <div className="h-3 w-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium">Chiffrement</p>
                <p className="text-sm text-muted-foreground">SSL/TLS Actif</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityPrivacyPanel;
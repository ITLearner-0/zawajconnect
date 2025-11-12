import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Shield, Eye, MessageCircle, Users, Heart, Clock } from 'lucide-react';

interface PrivacySettings {
  profile_visibility: string;
  photo_visibility: string;
  contact_visibility: string;
  last_seen_visibility: string;
  allow_messages_from: string;
  allow_profile_views: boolean;
  allow_family_involvement: boolean;
}

const PrivacySettingsForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<PrivacySettings>({
    profile_visibility: 'public',
    photo_visibility: 'matches_only',
    contact_visibility: 'matches_only',
    last_seen_visibility: 'matches_only',
    allow_messages_from: 'matches_only',
    allow_profile_views: true,
    allow_family_involvement: false,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      loadPrivacySettings();
    }
  }, [user]);

  const loadPrivacySettings = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('privacy_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings({
          profile_visibility: data.profile_visibility ?? 'public',
          photo_visibility: data.photo_visibility ?? 'matches_only',
          contact_visibility: data.contact_visibility ?? 'matches_only',
          last_seen_visibility: data.last_seen_visibility ?? 'matches_only',
          allow_messages_from: data.allow_messages_from ?? 'matches_only',
          allow_profile_views: data.allow_profile_views ?? true,
          allow_family_involvement: data.allow_family_involvement ?? false,
        });
      }
    } catch (error) {
      console.error('Error loading privacy settings:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger vos paramètres de confidentialité',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const savePrivacySettings = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase.from('privacy_settings').upsert({
        user_id: user.id,
        ...settings,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      toast({
        title: 'Paramètres sauvegardés',
        description: 'Vos paramètres de confidentialité ont été mis à jour',
      });
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder vos paramètres',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = <K extends keyof PrivacySettings>(key: K, value: PrivacySettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const visibilityOptions = [
    { value: 'public', label: 'Public', description: 'Visible par tous les utilisateurs' },
    {
      value: 'matches_only',
      label: 'Matches uniquement',
      description: 'Visible seulement par vos matches',
    },
    {
      value: 'family_approved',
      label: 'Approuvé par la famille',
      description: 'Nécessite approbation familiale',
    },
    { value: 'private', label: 'Privé', description: 'Visible uniquement par vous' },
  ];

  const messageOptions = [
    { value: 'everyone', label: 'Tout le monde', description: 'Recevoir des messages de tous' },
    {
      value: 'matches_only',
      label: 'Matches uniquement',
      description: 'Seulement de vos matches mutuels',
    },
    {
      value: 'family_supervised',
      label: 'Supervisé par la famille',
      description: 'Messages approuvés par la famille',
    },
    { value: 'none', label: 'Personne', description: 'Ne pas recevoir de messages' },
  ];

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald border-t-transparent mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement des paramètres...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald" />
            Confidentialité selon les Valeurs Islamiques
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Configurez vos paramètres de confidentialité en respectant les principes islamiques de
            modestie et de respect.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Visibility */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-emerald" />
              <Label className="text-base font-medium">Visibilité du Profil</Label>
            </div>
            <Select
              value={settings.profile_visibility}
              onValueChange={(value) => updateSetting('profile_visibility', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {visibilityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-muted-foreground">{option.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Photo Visibility */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-gold" />
              <Label className="text-base font-medium">Visibilité des Photos</Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Contrôlez qui peut voir vos photos selon les principes islamiques de modestie.
            </p>
            <Select
              value={settings.photo_visibility}
              onValueChange={(value) => updateSetting('photo_visibility', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {visibilityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-muted-foreground">{option.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Contact Information */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-emerald" />
              <Label className="text-base font-medium">Informations de Contact</Label>
            </div>
            <Select
              value={settings.contact_visibility}
              onValueChange={(value) => updateSetting('contact_visibility', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {visibilityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-muted-foreground">{option.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Last Seen Status */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-sage" />
              <Label className="text-base font-medium">Dernière Connexion</Label>
            </div>
            <Select
              value={settings.last_seen_visibility}
              onValueChange={(value) => updateSetting('last_seen_visibility', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {visibilityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-muted-foreground">{option.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Messages */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-emerald" />
              <Label className="text-base font-medium">Recevoir des Messages de</Label>
            </div>
            <Select
              value={settings.allow_messages_from}
              onValueChange={(value) => updateSetting('allow_messages_from', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {messageOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-muted-foreground">{option.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Toggle Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-emerald" />
                <div>
                  <Label className="text-base font-medium">Autoriser les Vues de Profil</Label>
                  <p className="text-sm text-muted-foreground">
                    Permettre aux autres utilisateurs de voir votre profil
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.allow_profile_views}
                onCheckedChange={(checked) => updateSetting('allow_profile_views', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gold" />
                <div>
                  <Label className="text-base font-medium">Supervision Familiale</Label>
                  <p className="text-sm text-muted-foreground">
                    Permettre à votre famille de superviser vos interactions
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.allow_family_involvement}
                onCheckedChange={(checked) => updateSetting('allow_family_involvement', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Islamic Guidelines Card */}
      <Card className="border-gold/20 bg-gradient-to-br from-gold/5 to-emerald/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-gold" />
            Conseils Islamiques pour la Confidentialité
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="h-2 w-2 bg-gold rounded-full mt-2"></div>
              <p className="text-muted-foreground">
                <strong>Modestie :</strong> Limitez la visibilité de vos photos aux matches sérieux
                pour respecter les principes islamiques de modestie.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-2 w-2 bg-emerald rounded-full mt-2"></div>
              <p className="text-muted-foreground">
                <strong>Supervision familiale :</strong> L'implication de la famille est encouragée
                dans l'Islam pour garantir des relations appropriées.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-2 w-2 bg-sage rounded-full mt-2"></div>
              <p className="text-muted-foreground">
                <strong>Communication respectueuse :</strong> Limitez les messages pour maintenir
                des interactions appropriées et respectueuses.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={savePrivacySettings}
          disabled={saving}
          className="bg-emerald hover:bg-emerald-dark text-primary-foreground"
        >
          {saving ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>
              Sauvegarde...
            </div>
          ) : (
            'Sauvegarder les Paramètres'
          )}
        </Button>
      </div>
    </div>
  );
};

export default PrivacySettingsForm;

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SupervisionSettings as SupervisionSettingsType } from '@/types/waliInvitation';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Shield, Settings, Bell, Eye } from 'lucide-react';

interface SupervisionSettingsProps {
  waliUserId: string;
  currentSettings?: SupervisionSettingsType;
  currentLevel?: string;
  onSettingsUpdate?: (settings: SupervisionSettingsType, level: string) => void;
}

const SupervisionSettings: React.FC<SupervisionSettingsProps> = ({
  waliUserId,
  currentSettings,
  currentLevel = 'moderate',
  onSettingsUpdate,
}) => {
  const { toast } = useToast();
  const [supervisionLevel, setSupervisionLevel] = useState(currentLevel);
  const [settings, setSettings] = useState<SupervisionSettingsType>(
    currentSettings || {
      require_approval_for_new_conversations: true,
      receive_all_messages: false,
      can_end_conversations: true,
      notification_frequency: 'immediate',
      auto_approve_known_contacts: false,
    }
  );
  const [loading, setLoading] = useState(false);

  const supervisionLevels = {
    minimal: {
      label: 'Supervision Minimale',
      description: 'Notifications de base uniquement',
      color: 'bg-green-100 text-green-800',
      settings: {
        require_approval_for_new_conversations: false,
        receive_all_messages: false,
        can_end_conversations: false,
        notification_frequency: 'daily' as const,
        auto_approve_known_contacts: true,
      },
    },
    moderate: {
      label: 'Supervision Modérée',
      description: 'Équilibre entre supervision et autonomie',
      color: 'bg-blue-100 text-blue-800',
      settings: {
        require_approval_for_new_conversations: true,
        receive_all_messages: false,
        can_end_conversations: true,
        notification_frequency: 'immediate' as const,
        auto_approve_known_contacts: false,
      },
    },
    strict: {
      label: 'Supervision Stricte',
      description: 'Contrôle total des interactions',
      color: 'bg-red-100 text-red-800',
      settings: {
        require_approval_for_new_conversations: true,
        receive_all_messages: true,
        can_end_conversations: true,
        notification_frequency: 'immediate' as const,
        auto_approve_known_contacts: false,
      },
    },
  };

  const handleLevelChange = (newLevel: string) => {
    setSupervisionLevel(newLevel);
    const levelSettings = supervisionLevels[newLevel as keyof typeof supervisionLevels];
    if (levelSettings) {
      setSettings(levelSettings.settings);
    }
  };

  const handleSettingChange = (key: keyof SupervisionSettingsType, value: boolean | string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('wali_profiles' as any)
        .update({
          supervision_level: supervisionLevel,
          supervision_settings: settings,
        } as any)
        .eq('user_id', waliUserId);

      if (error) throw error;

      toast({
        title: 'Paramètres sauvegardés',
        description: 'Vos paramètres de supervision ont été mis à jour',
      });

      if (onSettingsUpdate) {
        onSettingsUpdate(settings, supervisionLevel);
      }
    } catch (error: any) {
      console.error('Error updating supervision settings:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder les paramètres',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Paramètres de Supervision
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Niveau de supervision */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Niveau de Supervision</Label>
          <Select value={supervisionLevel} onValueChange={handleLevelChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(supervisionLevels).map(([key, level]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    <Badge className={level.color}>{level.label}</Badge>
                    <span className="text-sm text-muted-foreground">{level.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Paramètres détaillés */}
        <div className="space-y-4">
          <Label className="text-base font-medium flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Paramètres Détaillés
          </Label>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Approbation des nouvelles conversations</Label>
                <p className="text-sm text-muted-foreground">
                  Exiger votre approbation avant qu'une nouvelle conversation commence
                </p>
              </div>
              <Switch
                checked={settings.require_approval_for_new_conversations}
                onCheckedChange={(checked) =>
                  handleSettingChange('require_approval_for_new_conversations', checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Recevoir tous les messages
                </Label>
                <p className="text-sm text-muted-foreground">
                  Voir tous les messages échangés en temps réel
                </p>
              </div>
              <Switch
                checked={settings.receive_all_messages}
                onCheckedChange={(checked) => handleSettingChange('receive_all_messages', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Pouvoir terminer les conversations</Label>
                <p className="text-sm text-muted-foreground">
                  Autorisation de mettre fin aux conversations inappropriées
                </p>
              </div>
              <Switch
                checked={settings.can_end_conversations}
                onCheckedChange={(checked) => handleSettingChange('can_end_conversations', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Auto-approbation des contacts connus</Label>
                <p className="text-sm text-muted-foreground">
                  Approuver automatiquement les demandes de contacts déjà validés
                </p>
              </div>
              <Switch
                checked={settings.auto_approve_known_contacts}
                onCheckedChange={(checked) =>
                  handleSettingChange('auto_approve_known_contacts', checked)
                }
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Fréquence des notifications
              </Label>
              <Select
                value={settings.notification_frequency}
                onValueChange={(value) => handleSettingChange('notification_frequency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immédiate</SelectItem>
                  <SelectItem value="hourly">Toutes les heures</SelectItem>
                  <SelectItem value="daily">Quotidienne</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Button onClick={saveSettings} disabled={loading} className="w-full">
          {loading ? 'Sauvegarde...' : 'Sauvegarder les Paramètres'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SupervisionSettings;

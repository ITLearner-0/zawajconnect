import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Save, Phone, Video, Clock, Bell } from 'lucide-react';

interface CallSettings {
  allow_video_calls: boolean;
  require_call_approval: boolean;
  max_call_duration_minutes: number | null;
  notify_on_calls: boolean;
}

interface CallSupervisionSettingsProps {
  familyMemberId: string;
  supervisedUserName: string;
}

export function CallSupervisionSettings({ 
  familyMemberId, 
  supervisedUserName 
}: CallSupervisionSettingsProps) {
  const [settings, setSettings] = useState<CallSettings>({
    allow_video_calls: true,
    require_call_approval: false,
    max_call_duration_minutes: 60,
    notify_on_calls: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, [familyMemberId]);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('family_members')
        .select('allow_video_calls, require_call_approval, max_call_duration_minutes, notify_on_calls')
        .eq('id', familyMemberId)
        .single();

      if (error) throw error;

      if (data) {
        setSettings({
          allow_video_calls: data.allow_video_calls ?? true,
          require_call_approval: data.require_call_approval ?? false,
          max_call_duration_minutes: data.max_call_duration_minutes,
          notify_on_calls: data.notify_on_calls ?? true
        });
      }
    } catch (error) {
      console.error('Error loading call settings:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les paramètres",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('family_members')
        .update({
          allow_video_calls: settings.allow_video_calls,
          require_call_approval: settings.require_call_approval,
          max_call_duration_minutes: settings.max_call_duration_minutes,
          notify_on_calls: settings.notify_on_calls
        })
        .eq('id', familyMemberId);

      if (error) throw error;

      toast({
        title: "Paramètres enregistrés",
        description: "Les paramètres de supervision des appels ont été mis à jour"
      });
    } catch (error) {
      console.error('Error saving call settings:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer les paramètres",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Paramètres de supervision des appels
        </CardTitle>
        <CardDescription>
          Configuration pour {supervisedUserName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Video Calls Permission */}
        <div className="flex items-center justify-between space-x-2">
          <div className="flex items-center gap-3 flex-1">
            <Video className="h-5 w-5 text-muted-foreground" />
            <div className="space-y-0.5">
              <Label htmlFor="allow-video">Autoriser les appels vidéo</Label>
              <p className="text-sm text-muted-foreground">
                Si désactivé, seuls les appels audio seront autorisés
              </p>
            </div>
          </div>
          <Switch
            id="allow-video"
            checked={settings.allow_video_calls}
            onCheckedChange={(checked) => 
              setSettings(prev => ({ ...prev, allow_video_calls: checked }))
            }
          />
        </div>

        {/* Call Approval Required */}
        <div className="flex items-center justify-between space-x-2">
          <div className="flex items-center gap-3 flex-1">
            <Phone className="h-5 w-5 text-muted-foreground" />
            <div className="space-y-0.5">
              <Label htmlFor="require-approval">Approbation préalable requise</Label>
              <p className="text-sm text-muted-foreground">
                L'utilisateur doit obtenir votre permission avant chaque appel
              </p>
            </div>
          </div>
          <Switch
            id="require-approval"
            checked={settings.require_call_approval}
            onCheckedChange={(checked) => 
              setSettings(prev => ({ ...prev, require_call_approval: checked }))
            }
          />
        </div>

        {/* Max Call Duration */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <Label htmlFor="max-duration">Durée maximale d'appel (minutes)</Label>
          </div>
          <div className="flex items-center gap-3">
            <Input
              id="max-duration"
              type="number"
              min="0"
              max="300"
              value={settings.max_call_duration_minutes || ''}
              onChange={(e) => {
                const value = e.target.value === '' ? null : parseInt(e.target.value);
                setSettings(prev => ({ ...prev, max_call_duration_minutes: value }));
              }}
              placeholder="Illimité"
              className="max-w-[200px]"
            />
            <span className="text-sm text-muted-foreground">
              {settings.max_call_duration_minutes 
                ? `${settings.max_call_duration_minutes} minutes maximum`
                : 'Aucune limite'}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Vous serez alerté si un appel dépasse cette durée (0 ou vide = illimité)
          </p>
        </div>

        {/* Call Notifications */}
        <div className="flex items-center justify-between space-x-2">
          <div className="flex items-center gap-3 flex-1">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <div className="space-y-0.5">
              <Label htmlFor="notify-calls">Notifications en temps réel</Label>
              <p className="text-sm text-muted-foreground">
                Recevoir une notification à chaque début et fin d'appel
              </p>
            </div>
          </div>
          <Switch
            id="notify-calls"
            checked={settings.notify_on_calls}
            onCheckedChange={(checked) => 
              setSettings(prev => ({ ...prev, notify_on_calls: checked }))
            }
          />
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t">
          <Button onClick={saveSettings} disabled={saving} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Enregistrement...' : 'Enregistrer les paramètres'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
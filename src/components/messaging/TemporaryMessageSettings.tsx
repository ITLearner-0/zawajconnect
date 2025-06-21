
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Clock, Timer, AlertTriangle } from 'lucide-react';

interface TemporaryMessageSettings {
  enabled: boolean;
  defaultDuration: number; // in hours
  allowCustomDuration: boolean;
  warnBeforeExpiry: boolean;
  warningTime: number; // in minutes
}

interface TemporaryMessageSettingsProps {
  settings: TemporaryMessageSettings;
  onSettingsChange: (settings: TemporaryMessageSettings) => void;
}

const DURATION_OPTIONS = [
  { value: 1, label: '1 heure' },
  { value: 6, label: '6 heures' },
  { value: 12, label: '12 heures' },
  { value: 24, label: '1 jour' },
  { value: 72, label: '3 jours' },
  { value: 168, label: '1 semaine' },
  { value: 720, label: '1 mois' }
];

const WARNING_OPTIONS = [
  { value: 5, label: '5 minutes' },
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 60, label: '1 heure' },
  { value: 120, label: '2 heures' }
];

const TemporaryMessageSettings: React.FC<TemporaryMessageSettingsProps> = ({
  settings,
  onSettingsChange
}) => {
  const [localSettings, setLocalSettings] = useState<TemporaryMessageSettings>(settings);
  const [isOpen, setIsOpen] = useState(false);

  const handleSave = () => {
    onSettingsChange(localSettings);
    setIsOpen(false);
  };

  const updateSetting = <K extends keyof TemporaryMessageSettings>(
    key: K,
    value: TemporaryMessageSettings[K]
  ) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Timer className="h-4 w-4 mr-1" />
          Messages Temporaires
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Messages à Durée Limitée
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Enable/Disable */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Activer les messages temporaires</Label>
              <p className="text-xs text-muted-foreground">
                Les messages disparaîtront automatiquement
              </p>
            </div>
            <Switch
              checked={localSettings.enabled}
              onCheckedChange={(checked) => updateSetting('enabled', checked)}
            />
          </div>

          {localSettings.enabled && (
            <>
              {/* Default Duration */}
              <div className="space-y-2">
                <Label>Durée par défaut</Label>
                <Select
                  value={localSettings.defaultDuration.toString()}
                  onValueChange={(value) => 
                    updateSetting('defaultDuration', parseInt(value))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATION_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Custom Duration */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Permettre la durée personnalisée</Label>
                  <p className="text-xs text-muted-foreground">
                    Les utilisateurs peuvent choisir la durée
                  </p>
                </div>
                <Switch
                  checked={localSettings.allowCustomDuration}
                  onCheckedChange={(checked) => 
                    updateSetting('allowCustomDuration', checked)
                  }
                />
              </div>

              {/* Warning Before Expiry */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Avertir avant expiration</Label>
                  <p className="text-xs text-muted-foreground">
                    Notifier avant la suppression
                  </p>
                </div>
                <Switch
                  checked={localSettings.warnBeforeExpiry}
                  onCheckedChange={(checked) => 
                    updateSetting('warnBeforeExpiry', checked)
                  }
                />
              </div>

              {/* Warning Time */}
              {localSettings.warnBeforeExpiry && (
                <div className="space-y-2">
                  <Label>Temps d'avertissement</Label>
                  <Select
                    value={localSettings.warningTime.toString()}
                    onValueChange={(value) => 
                      updateSetting('warningTime', parseInt(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {WARNING_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value.toString()}>
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            {option.label} avant
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Info Box */}
              <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-xs text-blue-700 dark:text-blue-300">
                    <p className="font-medium mb-1">À propos des messages temporaires</p>
                    <ul className="space-y-1">
                      <li>•Les messages seront supprimés automatiquement</li>
                      <li>•Cette action est irréversible</li>
                      <li>•Les deux participants verront la suppression</li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Save Button */}
          <Button onClick={handleSave} className="w-full">
            <Timer className="h-4 w-4 mr-2" />
            Enregistrer les Paramètres
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TemporaryMessageSettings;

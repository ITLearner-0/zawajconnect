
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  EyeOff, 
  Shield, 
  Clock, 
  MapPin, 
  Image,
  Settings,
  UserX,
  Pause,
  Play
} from 'lucide-react';
import { EnhancedPrivacySettings } from '@/types/enhancedPrivacy';

interface EnhancedPrivacyControlsProps {
  userId: string;
  currentSettings: EnhancedPrivacySettings;
  onSettingsChange: (settings: EnhancedPrivacySettings) => void;
}

const EnhancedPrivacyControls: React.FC<EnhancedPrivacyControlsProps> = ({
  userId,
  currentSettings,
  onSettingsChange
}) => {
  const [localSettings, setLocalSettings] = useState<EnhancedPrivacySettings>(currentSettings);
  const [isAccountPaused, setIsAccountPaused] = useState(false);

  const updateSettings = (newSettings: Partial<EnhancedPrivacySettings>) => {
    const updated = { ...localSettings, ...newSettings };
    setLocalSettings(updated);
    onSettingsChange(updated);
  };

  const updateProgressiveReveal = (key: string, value: any) => {
    updateSettings({
      progressiveReveal: {
        ...localSettings.progressiveReveal,
        [key]: value
      }
    });
  };

  const updateIncognito = (key: string, value: any) => {
    updateSettings({
      incognito: {
        ...localSettings.incognito,
        [key]: value
      }
    });
  };

  const updateProfileVisibility = (key: string, value: any) => {
    updateSettings({
      profileVisibility: {
        ...localSettings.profileVisibility,
        [key]: value
      }
    });
  };

  const toggleAccountPause = () => {
    const newPauseState = !isAccountPaused;
    setIsAccountPaused(newPauseState);
    
    if (newPauseState) {
      updateSettings({
        profileVisibility: {
          ...localSettings.profileVisibility,
          whoCanSeeProfile: 'custom',
          showInSearchResults: false
        },
        incognito: {
          ...localSettings.incognito,
          enabled: true,
          hideFromSearch: true
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Photo Blur Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Paramètres de Floutage des Photos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Photo de profil floutée par défaut</Label>
              <p className="text-sm text-muted-foreground">
                Flouter votre photo de profil jusqu'à approbation
              </p>
            </div>
            <Switch
              checked={localSettings.progressiveReveal.enabled}
              onCheckedChange={(checked) => updateProgressiveReveal('enabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Flouter pour les non-matchs</Label>
              <p className="text-sm text-muted-foreground">
                Masquer les photos pour les utilisateurs sans compatibilité élevée
              </p>
            </div>
            <Switch
              checked={localSettings.progressiveReveal.revealStages.personal}
              onCheckedChange={(checked) => 
                updateProgressiveReveal('revealStages', {
                  ...localSettings.progressiveReveal.revealStages,
                  personal: checked
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Score de compatibilité requis pour révéler les photos</Label>
            <Slider
              value={[localSettings.progressiveReveal.requiresCompatibilityScore]}
              onValueChange={([value]) => updateProgressiveReveal('requiresCompatibilityScore', value)}
              max={100}
              min={0}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>0%</span>
              <span>{localSettings.progressiveReveal.requiresCompatibilityScore}%</span>
              <span>100%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progressive Reveal Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Révélation Progressive des Informations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            {Object.entries(localSettings.progressiveReveal.revealStages).map(([stage, enabled]) => (
              <div key={stage} className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="capitalize">
                    {stage === 'basic' && 'Informations de base'}
                    {stage === 'education' && 'Éducation et profession'}
                    {stage === 'religious' && 'Pratique religieuse'}
                    {stage === 'personal' && 'À propos de moi'}
                    {stage === 'contact' && 'Informations de contact'}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {stage === 'basic' && 'Nom, âge, localisation générale'}
                    {stage === 'education' && 'Niveau d\'études, occupation'}
                    {stage === 'religious' && 'Niveau de pratique, madhab'}
                    {stage === 'personal' && 'Description personnelle, famille'}
                    {stage === 'contact' && 'Informations du wali'}
                  </p>
                </div>
                <Switch
                  checked={enabled}
                  onCheckedChange={(checked) =>
                    updateProgressiveReveal('revealStages', {
                      ...localSettings.progressiveReveal.revealStages,
                      [stage]: checked
                    })
                  }
                />
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label>Auto-révélation après (jours)</Label>
            <Input
              type="number"
              value={localSettings.progressiveReveal.autoRevealAfterDays}
              onChange={(e) => updateProgressiveReveal('autoRevealAfterDays', parseInt(e.target.value) || 7)}
              min={1}
              max={30}
            />
          </div>
        </CardContent>
      </Card>

      {/* Incognito Mode */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <EyeOff className="h-5 w-5" />
            Mode Invisible
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Activer le mode invisible</Label>
              <p className="text-sm text-muted-foreground">
                Naviguez sans laisser de traces de visite
              </p>
            </div>
            <Switch
              checked={localSettings.incognito.enabled}
              onCheckedChange={(checked) => updateIncognito('enabled', checked)}
            />
          </div>

          {localSettings.incognito.enabled && (
            <>
              <div className="flex items-center justify-between">
                <Label>Masquer dans les résultats de recherche</Label>
                <Switch
                  checked={localSettings.incognito.hideFromSearch}
                  onCheckedChange={(checked) => updateIncognito('hideFromSearch', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Masquer la dernière activité</Label>
                <Switch
                  checked={localSettings.incognito.hideLastActive}
                  onCheckedChange={(checked) => updateIncognito('hideLastActive', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Masquer l'historique des visites</Label>
                <Switch
                  checked={localSettings.incognito.hideViewHistory}
                  onCheckedChange={(checked) => updateIncognito('hideViewHistory', checked)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Limiter les vues de profil par jour</Label>
                  <Switch
                    checked={localSettings.incognito.limitProfileViews}
                    onCheckedChange={(checked) => updateIncognito('limitProfileViews', checked)}
                  />
                </div>
                {localSettings.incognito.limitProfileViews && (
                  <Input
                    type="number"
                    value={localSettings.incognito.maxProfileViewsPerDay}
                    onChange={(e) => updateIncognito('maxProfileViewsPerDay', parseInt(e.target.value) || 5)}
                    min={1}
                    max={50}
                  />
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Distance Privacy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Confidentialité de Localisation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Précision de la localisation affichée</Label>
            <Select
              value={localSettings.profileVisibility.customCriteria.allowedLocations.length > 0 ? 'city' : 'approximate'}
              onValueChange={(value) => {
                if (value === 'approximate') {
                  updateProfileVisibility('customCriteria', {
                    ...localSettings.profileVisibility.customCriteria,
                    allowedLocations: []
                  });
                }
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="exact">Distance exacte</SelectItem>
                <SelectItem value="approximate">Distance approximative (±5km)</SelectItem>
                <SelectItem value="city">Ville uniquement</SelectItem>
                <SelectItem value="region">Région uniquement</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Masquer la localisation exacte</Label>
              <p className="text-sm text-muted-foreground">
                Afficher uniquement une zone générale
              </p>
            </div>
            <Switch
              checked={!localSettings.showLocation}
              onCheckedChange={(checked) => updateSettings({ showLocation: !checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Account Pause */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isAccountPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
            Pause de Compte
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Mettre le compte en pause</Label>
              <p className="text-sm text-muted-foreground">
                {isAccountPaused 
                  ? "Votre profil est actuellement masqué" 
                  : "Masquer temporairement votre profil de tous les utilisateurs"
                }
              </p>
            </div>
            <Button
              variant={isAccountPaused ? "default" : "outline"}
              onClick={toggleAccountPause}
              className={isAccountPaused ? "bg-green-600 hover:bg-green-700" : ""}
            >
              {isAccountPaused ? (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Réactiver
                </>
              ) : (
                <>
                  <Pause className="mr-2 h-4 w-4" />
                  Mettre en pause
                </>
              )}
            </Button>
          </div>

          {isAccountPaused && (
            <div className="bg-yellow-50 p-3 rounded-lg">
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800">Compte en pause</p>
                  <p className="text-yellow-700">
                    Votre profil est masqué et vous n'apparaissez plus dans les recherches.
                    Vous pouvez réactiver votre compte à tout moment.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Retention */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Rétention des Données
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Supprimer l'historique des vues après (jours)</Label>
            <Input
              type="number"
              value={localSettings.dataRetention.deleteViewHistoryAfterDays}
              onChange={(e) => updateSettings({
                dataRetention: {
                  ...localSettings.dataRetention,
                  deleteViewHistoryAfterDays: parseInt(e.target.value) || 30
                }
              })}
              min={1}
              max={365}
            />
          </div>

          <div className="space-y-2">
            <Label>Supprimer les conversations après (jours)</Label>
            <Input
              type="number"
              value={localSettings.dataRetention.deleteConversationsAfterDays}
              onChange={(e) => updateSettings({
                dataRetention: {
                  ...localSettings.dataRetention,
                  deleteConversationsAfterDays: parseInt(e.target.value) || 365
                }
              })}
              min={1}
              max={3650}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Supprimer automatiquement les matchs rejetés</Label>
              <p className="text-sm text-muted-foreground">
                Effacer les données des profils que vous avez rejetés
              </p>
            </div>
            <Switch
              checked={localSettings.dataRetention.autoDeleteRejectedMatches}
              onCheckedChange={(checked) => updateSettings({
                dataRetention: {
                  ...localSettings.dataRetention,
                  autoDeleteRejectedMatches: checked
                }
              })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Résumé des Paramètres de Confidentialité</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {localSettings.progressiveReveal.enabled && (
              <Badge variant="secondary">
                <Eye className="mr-1 h-3 w-3" />
                Révélation progressive activée
              </Badge>
            )}
            {localSettings.incognito.enabled && (
              <Badge variant="secondary">
                <EyeOff className="mr-1 h-3 w-3" />
                Mode invisible activé
              </Badge>
            )}
            {isAccountPaused && (
              <Badge variant="destructive">
                <Pause className="mr-1 h-3 w-3" />
                Compte en pause
              </Badge>
            )}
            {!localSettings.showLocation && (
              <Badge variant="secondary">
                <MapPin className="mr-1 h-3 w-3" />
                Localisation masquée
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedPrivacyControls;

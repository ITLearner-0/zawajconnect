import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Eye,
  EyeOff,
  Shield,
  MapPin,
  Clock,
  Settings,
  Users,
  Lock,
  Unlock,
  Info,
} from 'lucide-react';

interface VisibilitySettings {
  isVisible: boolean;
  visibilityLevel: number;
  showOnlyToMatches: boolean;
  hideFromSearch: boolean;
  temporaryHide: boolean;
  temporaryHideUntil?: Date;
}

interface ProfileVisibilityManagerProps {
  userId?: string;
  settings: VisibilitySettings;
  onSettingsChange: (settings: VisibilitySettings) => void;
}

const ProfileVisibilityManager: React.FC<ProfileVisibilityManagerProps> = ({
  userId,
  settings,
  onSettingsChange,
}) => {
  const [localSettings, setLocalSettings] = useState<VisibilitySettings>(settings);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateSetting = (key: keyof VisibilitySettings, value: any) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const getVisibilityDescription = (level: number) => {
    switch (level) {
      case 0:
        return 'Profil complètement privé - Invisible pour tous';
      case 25:
        return 'Très privé - Visible uniquement pour les matchs vérifiés';
      case 50:
        return 'Privé - Visible pour les matchs et utilisateurs compatibles';
      case 75:
        return 'Modéré - Visible avec informations limitées';
      case 100:
        return 'Public - Toutes les informations visibles';
      default:
        return 'Niveau de visibilité personnalisé';
    }
  };

  const setTemporaryHide = (hours: number) => {
    const hideUntil = new Date();
    hideUntil.setHours(hideUntil.getHours() + hours);

    updateSetting('temporaryHide', true);
    updateSetting('temporaryHideUntil', hideUntil);
  };

  const clearTemporaryHide = () => {
    updateSetting('temporaryHide', false);
    updateSetting('temporaryHideUntil', undefined);
  };

  return (
    <div className="space-y-6">
      {/* Main Visibility Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {localSettings.isVisible ? (
              <Eye className="h-5 w-5 text-green-600" />
            ) : (
              <EyeOff className="h-5 w-5 text-red-600" />
            )}
            Visibilité du Profil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-medium">
                Profil {localSettings.isVisible ? 'Visible' : 'Masqué'}
              </Label>
              <p className="text-sm text-muted-foreground">
                {localSettings.isVisible
                  ? "Votre profil apparaît dans les recherches et peut être vu par d'autres utilisateurs"
                  : 'Votre profil est complètement masqué de tous les utilisateurs'}
              </p>
            </div>
            <Switch
              checked={localSettings.isVisible}
              onCheckedChange={(checked) => updateSetting('isVisible', checked)}
              className="data-[state=checked]:bg-green-600"
            />
          </div>

          {!localSettings.isVisible && (
            <Alert>
              <EyeOff className="h-4 w-4" />
              <AlertDescription>
                Votre profil est actuellement masqué. Vous n'apparaissez dans aucune recherche et ne
                recevrez aucune nouvelle connexion.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Visibility Level Control */}
      {localSettings.isVisible && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Niveau de Visibilité
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>Niveau de confidentialité</Label>
                <Badge variant="outline">{localSettings.visibilityLevel}%</Badge>
              </div>

              <Slider
                value={[localSettings.visibilityLevel]}
                onValueChange={([value]) => updateSetting('visibilityLevel', value)}
                max={100}
                min={0}
                step={25}
                className="w-full"
              />

              <div className="grid grid-cols-5 text-xs text-muted-foreground">
                <span>Privé</span>
                <span>Très privé</span>
                <span>Modéré</span>
                <span>Ouvert</span>
                <span>Public</span>
              </div>

              <p className="text-sm text-muted-foreground mt-2">
                {getVisibilityDescription(localSettings.visibilityLevel)}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Advanced Visibility Options */}
      {localSettings.isVisible && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Options Avancées
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowAdvanced(!showAdvanced)}>
                {showAdvanced ? 'Masquer' : 'Afficher'}
              </Button>
            </CardTitle>
          </CardHeader>
          {showAdvanced && (
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Visible uniquement pour les matchs</Label>
                  <p className="text-sm text-muted-foreground">
                    Seuls les utilisateurs avec qui vous avez une compatibilité élevée peuvent voir
                    votre profil
                  </p>
                </div>
                <Switch
                  checked={localSettings.showOnlyToMatches}
                  onCheckedChange={(checked) => updateSetting('showOnlyToMatches', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Masquer des résultats de recherche</Label>
                  <p className="text-sm text-muted-foreground">
                    Votre profil n'apparaîtra pas dans les recherches générales
                  </p>
                </div>
                <Switch
                  checked={localSettings.hideFromSearch}
                  onCheckedChange={(checked) => updateSetting('hideFromSearch', checked)}
                />
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Temporary Hide Options */}
      {localSettings.isVisible && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Masquage Temporaire
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {localSettings.temporaryHide ? (
              <div className="space-y-3">
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    Votre profil est temporairement masqué jusqu'au{' '}
                    {localSettings.temporaryHideUntil?.toLocaleString('fr-FR')}
                  </AlertDescription>
                </Alert>
                <Button variant="outline" onClick={clearTemporaryHide} className="w-full">
                  <Unlock className="mr-2 h-4 w-4" />
                  Réactiver Maintenant
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Masquez temporairement votre profil pendant une durée définie
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" onClick={() => setTemporaryHide(1)}>
                    1 heure
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setTemporaryHide(6)}>
                    6 heures
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setTemporaryHide(24)}>
                    1 jour
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setTemporaryHide(168)}>
                    1 semaine
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Location Privacy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Confidentialité de Localisation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Précision de la localisation</Label>
            <Select defaultValue="approximate">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="exact">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <div>
                      <div>Distance exacte</div>
                      <div className="text-xs text-muted-foreground">
                        Affiche la distance précise
                      </div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="approximate">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <div>
                      <div>Distance approximative</div>
                      <div className="text-xs text-muted-foreground">±5km de votre position</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="city">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <div>
                      <div>Ville uniquement</div>
                      <div className="text-xs text-muted-foreground">
                        Affiche seulement votre ville
                      </div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="region">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <div>
                      <div>Région uniquement</div>
                      <div className="text-xs text-muted-foreground">
                        Affiche seulement votre région
                      </div>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Résumé de la Confidentialité
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Statut du profil</span>
              <Badge variant={localSettings.isVisible ? 'default' : 'destructive'}>
                {localSettings.isVisible ? 'Visible' : 'Masqué'}
              </Badge>
            </div>

            {localSettings.isVisible && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Niveau de visibilité</span>
                  <Badge variant="outline">{localSettings.visibilityLevel}%</Badge>
                </div>

                {localSettings.showOnlyToMatches && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Restriction</span>
                    <Badge variant="secondary">
                      <Users className="mr-1 h-3 w-3" />
                      Matchs uniquement
                    </Badge>
                  </div>
                )}

                {localSettings.hideFromSearch && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Recherche</span>
                    <Badge variant="secondary">
                      <EyeOff className="mr-1 h-3 w-3" />
                      Masqué
                    </Badge>
                  </div>
                )}
              </>
            )}

            {localSettings.temporaryHide && (
              <div className="flex items-center justify-between">
                <span className="text-sm">Masquage temporaire</span>
                <Badge variant="outline">
                  <Clock className="mr-1 h-3 w-3" />
                  Actif
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileVisibilityManager;


import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Eye, EyeOff, Settings, Clock } from 'lucide-react';

interface VisibilitySettings {
  isVisible: boolean;
  visibilityLevel: number; // 0-100
  showOnlyToMatches: boolean;
  hideFromSearch: boolean;
  temporaryHide: boolean;
  temporaryHideUntil?: Date;
}

interface ProfileVisibilityManagerProps {
  settings: VisibilitySettings;
  onSettingsChange: (settings: VisibilitySettings) => void;
}

const ProfileVisibilityManager: React.FC<ProfileVisibilityManagerProps> = ({ 
  settings, 
  onSettingsChange 
}) => {
  const [localSettings, setLocalSettings] = useState<VisibilitySettings>(settings);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSettingChange = (key: keyof VisibilitySettings, value: any) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const getVisibilityStatusText = () => {
    if (!localSettings.isVisible) return "Profil masqué";
    if (localSettings.temporaryHide) return "Masqué temporairement";
    if (localSettings.showOnlyToMatches) return "Visible aux correspondances seulement";
    if (localSettings.hideFromSearch) return "Masqué de la recherche";
    return "Entièrement visible";
  };

  const getStatusColor = () => {
    if (!localSettings.isVisible || localSettings.temporaryHide) return "bg-red-100 text-red-800";
    if (localSettings.showOnlyToMatches || localSettings.hideFromSearch) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-rose-800">
            <Eye className="w-5 h-5" />
            Gestion de la visibilité
          </div>
          <Badge className={`text-xs ${getStatusColor()}`}>
            {getVisibilityStatusText()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Visibility Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h4 className="font-medium">Profil visible</h4>
            <p className="text-sm text-gray-600">
              Rendre votre profil visible aux autres utilisateurs
            </p>
          </div>
          <Switch
            checked={localSettings.isVisible}
            onCheckedChange={(checked) => handleSettingChange('isVisible', checked)}
          />
        </div>

        {localSettings.isVisible && (
          <>
            {/* Visibility Level */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Niveau de visibilité</h4>
                <span className="text-sm text-gray-600">{localSettings.visibilityLevel}%</span>
              </div>
              <Slider
                value={[localSettings.visibilityLevel]}
                onValueChange={([value]) => handleSettingChange('visibilityLevel', value)}
                max={100}
                step={10}
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Plus le niveau est élevé, plus votre profil apparaîtra dans les résultats de recherche
              </p>
            </div>

            {/* Quick Settings */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className="font-medium">Visible uniquement aux correspondances</h4>
                  <p className="text-sm text-gray-600">
                    Seules vos correspondances peuvent voir votre profil
                  </p>
                </div>
                <Switch
                  checked={localSettings.showOnlyToMatches}
                  onCheckedChange={(checked) => handleSettingChange('showOnlyToMatches', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className="font-medium">Masquer de la recherche</h4>
                  <p className="text-sm text-gray-600">
                    Votre profil n'apparaîtra pas dans les résultats de recherche
                  </p>
                </div>
                <Switch
                  checked={localSettings.hideFromSearch}
                  onCheckedChange={(checked) => handleSettingChange('hideFromSearch', checked)}
                />
              </div>
            </div>

            {/* Advanced Settings */}
            <div className="space-y-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full"
              >
                <Settings className="w-4 h-4 mr-2" />
                {showAdvanced ? 'Masquer' : 'Afficher'} les options avancées
              </Button>

              {showAdvanced && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h4 className="font-medium">Masquage temporaire</h4>
                      <p className="text-sm text-gray-600">
                        Masquer temporairement votre profil
                      </p>
                    </div>
                    <Switch
                      checked={localSettings.temporaryHide}
                      onCheckedChange={(checked) => handleSettingChange('temporaryHide', checked)}
                    />
                  </div>

                  {localSettings.temporaryHide && (
                    <div className="ml-4 p-3 bg-yellow-50 rounded border">
                      <div className="flex items-center gap-2 text-yellow-800">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          Profil masqué temporairement
                        </span>
                      </div>
                      <p className="text-xs text-yellow-700 mt-1">
                        Votre profil ne sera visible à personne jusqu'à ce que vous le réactiviez
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {!localSettings.isVisible && (
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center gap-2 text-red-800">
              <EyeOff className="w-4 h-4" />
              <span className="font-medium">Profil masqué</span>
            </div>
            <p className="text-sm text-red-700 mt-1">
              Votre profil n'est visible à aucun autre utilisateur. 
              Activez la visibilité pour recommencer à recevoir des correspondances.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileVisibilityManager;

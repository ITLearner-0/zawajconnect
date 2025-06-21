
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { PhotoBlurSettings as PhotoBlurSettingsType } from '@/types/documents';
import { Eye, EyeOff } from 'lucide-react';

interface PhotoBlurSettingsProps {
  settings: PhotoBlurSettingsType;
  onChange: (settings: PhotoBlurSettingsType) => void;
}

const PhotoBlurSettings: React.FC<PhotoBlurSettingsProps> = ({
  settings,
  onChange
}) => {
  const updateSetting = (key: keyof PhotoBlurSettingsType, value: boolean) => {
    onChange({
      ...settings,
      [key]: value
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <EyeOff className="h-5 w-5" />
          Paramètres de floutage des photos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Photo de profil floutée</Label>
            <p className="text-sm text-muted-foreground">
              Flouter votre photo de profil par défaut
            </p>
          </div>
          <Switch
            checked={settings.blur_profile_picture}
            onCheckedChange={(checked) => updateSetting('blur_profile_picture', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Galerie photo floutée</Label>
            <p className="text-sm text-muted-foreground">
              Flouter les photos de votre galerie
            </p>
          </div>
          <Switch
            checked={settings.blur_gallery_photos}
            onCheckedChange={(checked) => updateSetting('blur_gallery_photos', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Flouter jusqu'à approbation</Label>
            <p className="text-sm text-muted-foreground">
              Flouter les photos jusqu'à ce qu'un match soit approuvé
            </p>
          </div>
          <Switch
            checked={settings.blur_until_approved}
            onCheckedChange={(checked) => updateSetting('blur_until_approved', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Flouter pour les non-matchs</Label>
            <p className="text-sm text-muted-foreground">
              Flouter les photos pour les utilisateurs avec qui vous n'avez pas de match
            </p>
          </div>
          <Switch
            checked={settings.blur_for_non_matches}
            onCheckedChange={(checked) => updateSetting('blur_for_non_matches', checked)}
          />
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-start gap-2">
            <Eye className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                Respect de la pudeur islamique
              </p>
              <p className="text-sm text-blue-700">
                Ces paramètres vous permettent de préserver votre intimité tout en respectant les principes islamiques de modestie.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PhotoBlurSettings;

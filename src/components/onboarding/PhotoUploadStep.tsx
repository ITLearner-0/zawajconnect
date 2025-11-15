import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import {
  Camera,
  Upload,
  X,
  CheckCircle,
  Shield,
  Eye,
  AlertTriangle,
  Image as ImageIcon,
} from 'lucide-react';

interface PhotoUploadStepProps {
  avatarUrl: string;
  onPhotoChange: (url: string) => void;
  userName?: string;
  className?: string;
}

const PhotoUploadStep = ({
  avatarUrl,
  onPhotoChange,
  userName = 'User',
  className = '',
}: PhotoUploadStepProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Format invalide',
        description: 'Veuillez sélectionner une image valide (JPG, PNG, WebP)',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Fichier trop volumineux',
        description: "L'image doit faire moins de 5MB",
        variant: 'destructive',
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Erreur',
        description: 'Vous devez être connecté pour uploader une photo',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      console.log('📸 Uploading avatar to Supabase Storage...');

      // Upload file to Supabase storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file, {
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage.from('profile-photos').getPublicUrl(fileName);

      console.log('✅ Avatar uploaded successfully:', data.publicUrl);

      onPhotoChange(data.publicUrl);

      toast({
        title: 'Photo uploadée',
        description: 'Votre photo a été enregistrée avec succès',
      });
    } catch (error: unknown) {
      console.error('Erreur upload:', error);
      const errorMessage =
        error instanceof Error ? error.message : "Erreur lors de l'upload. Veuillez réessayer.";
      toast({
        title: "Erreur d'upload",
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileUpload(files[0]);
    }
  };

  const removePhoto = () => {
    onPhotoChange('');
  };

  const guidelines = [
    'Photo claire et bien éclairée',
    'Visage visible et souriant',
    'Tenue modeste et appropriée',
    'Pas de photos de groupe',
    'Format JPG, PNG ou WebP',
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <div className="h-12 w-12 bg-gradient-to-br from-emerald to-emerald-light rounded-full flex items-center justify-center">
            <Camera className="h-6 w-6 text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold">Photo de profil</h2>
        <p className="text-muted-foreground">Ajoutez une photo pour recevoir 3x plus de matches</p>
      </div>

      {/* Current Photo Display */}
      <div className="flex justify-center">
        <div className="relative">
          <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback className="bg-gradient-to-br from-emerald to-emerald-light text-white text-2xl font-semibold">
              {getInitials(userName)}
            </AvatarFallback>
          </Avatar>

          {avatarUrl && (
            <>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <Button
                variant="destructive"
                size="sm"
                className="absolute -bottom-2 left-1/2 -translate-x-1/2"
                onClick={removePhoto}
              >
                <X className="w-3 h-3" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Upload Section */}
      {!avatarUrl && (
        <Card
          className={`transition-all cursor-pointer ${
            dragActive
              ? 'border-emerald bg-emerald/5'
              : 'border-dashed border-2 hover:border-emerald/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <CardContent className="p-8 text-center space-y-4">
            <div className="flex justify-center">
              <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center">
                <Upload className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Glissez votre photo ici</h3>
              <p className="text-sm text-muted-foreground mb-4">
                ou cliquez pour sélectionner un fichier
              </p>

              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={isUploading}
                className="hidden"
                id="photo-upload"
              />

              <Button
                variant="outline"
                disabled={isUploading}
                onClick={() => document.getElementById('photo-upload')?.click()}
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                {isUploading ? 'Upload en cours...' : 'Sélectionner une photo'}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">Max 5MB • JPG, PNG, WebP</p>
          </CardContent>
        </Card>
      )}

      {/* Guidelines */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center space-x-2">
            <Shield className="w-4 h-4 text-blue-600" />
            <span>Conseils pour une bonne photo</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {guidelines.map((guideline, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm">
                <CheckCircle className="w-3 h-3 text-emerald flex-shrink-0" />
                <span>{guideline}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Privacy Notice */}
      <Alert>
        <Eye className="h-4 w-4" />
        <AlertDescription className="text-sm">
          <strong>Confidentialité :</strong> Votre photo ne sera visible que par les membres
          vérifiés. Vous pouvez la modifier ou la supprimer à tout moment.
        </AlertDescription>
      </Alert>

      {/* Photo Status */}
      {avatarUrl ? (
        <div className="text-center">
          <Badge className="bg-emerald text-white">
            <CheckCircle className="w-3 h-3 mr-1" />
            Photo ajoutée avec succès
          </Badge>
        </div>
      ) : (
        <Alert className="border-gold/20 bg-gold/5">
          <AlertTriangle className="h-4 w-4 text-gold" />
          <AlertDescription className="text-sm text-gold">
            Une photo de profil augmente vos chances de match de 300%
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default PhotoUploadStep;

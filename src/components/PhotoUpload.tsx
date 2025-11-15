import { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Camera, Upload, X, Check } from 'lucide-react';

interface PhotoUploadProps {
  currentPhotoUrl?: string;
  onPhotoUpdate: (photoUrl: string) => void;
}

const PhotoUpload = ({ currentPhotoUrl, onPhotoUpdate }: PhotoUploadProps) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentPhotoUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image valide');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("La taille de l'image ne doit pas dépasser 5 MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    await uploadPhoto(file);
  };

  const uploadPhoto = async (file: File) => {
    if (!user) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/profile-${Date.now()}.${fileExt}`;

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage.from('profile-photos').upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage.from('profile-photos').getPublicUrl(fileName);

      const photoUrl = urlData.publicUrl;

      // Update profile with new photo URL
      await supabase.from('profiles').update({ avatar_url: photoUrl }).eq('user_id', user.id);

      onPhotoUpdate(photoUrl);

      setTimeout(() => {
        setUploadProgress(0);
      }, 2000);
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Erreur lors du téléchargement de la photo');
      setPreviewUrl(currentPhotoUrl || null);
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = async () => {
    if (!user || !currentPhotoUrl) return;

    try {
      // Extract file path from URL
      const urlParts = currentPhotoUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `${user.id}/${fileName}`;

      // Delete from storage
      await supabase.storage.from('profile-photos').remove([filePath]);

      // Update profile
      await supabase.from('profiles').update({ avatar_url: null }).eq('user_id', user.id);

      setPreviewUrl(null);
      onPhotoUpdate('');
    } catch (error) {
      console.error('Error removing photo:', error);
      alert('Erreur lors de la suppression de la photo');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Photo de profil
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center space-y-4">
          {/* Photo Preview */}
          <div className="relative">
            <div className="h-32 w-32 rounded-full overflow-hidden bg-gradient-to-br from-emerald/20 to-gold/20 flex items-center justify-center border-4 border-border">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Photo de profil"
                  className="h-full w-full object-cover"
                />
              ) : (
                <Camera className="h-12 w-12 text-muted-foreground" />
              )}
            </div>

            {previewUrl && (
              <Button
                size="sm"
                variant="destructive"
                className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                onClick={removePhoto}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="w-full space-y-2">
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-sm text-center text-muted-foreground">
                {uploadProgress === 100 ? (
                  <span className="flex items-center justify-center gap-1 text-emerald">
                    <Check className="h-4 w-4" />
                    Photo téléchargée avec succès !
                  </span>
                ) : (
                  `Téléchargement... ${uploadProgress}%`
                )}
              </p>
            </div>
          )}

          {/* Upload Button */}
          <div className="flex gap-2">
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="bg-emerald hover:bg-emerald-dark text-primary-foreground"
            >
              <Upload className="h-4 w-4 mr-2" />
              {previewUrl ? 'Changer la photo' : 'Ajouter une photo'}
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          <p className="text-xs text-center text-muted-foreground max-w-xs">
            Formats acceptés: JPG, PNG, GIF. Taille maximale: 5 MB. Une photo de profil améliore vos
            chances de trouver un match.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PhotoUpload;

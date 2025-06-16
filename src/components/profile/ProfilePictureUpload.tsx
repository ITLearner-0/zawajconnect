
import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Upload, X, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProfilePictureUploadProps {
  currentImage?: string;
  onImageUpdate: (imageUrl: string) => void;
  isEditing?: boolean;
}

const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  currentImage,
  onImageUpdate,
  isEditing = false
}) => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Format non valide",
        description: "Veuillez sélectionner une image (JPG, PNG, etc.)",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Fichier trop volumineux",
        description: "L'image doit faire moins de 5MB",
        variant: "destructive"
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreviewImage(result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!previewImage) return;

    setIsUploading(true);
    try {
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, you would upload to your storage service here
      onImageUpdate(previewImage);
      setPreviewImage(null);
      
      toast({
        title: "Photo mise à jour",
        description: "Votre photo de profil a été mise à jour avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur d'upload",
        description: "Impossible de télécharger l'image. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayImage = previewImage || currentImage;

  return (
    <Card className="shadow-lg border-rose-200 dark:border-rose-700 bg-white/80 dark:bg-rose-900/80 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="text-center">
          <h3 className="text-lg font-medium text-rose-800 dark:text-rose-200 mb-4">
            Photo de profil
          </h3>
          
          <div className="relative mx-auto w-32 h-32 mb-4">
            {displayImage ? (
              <img
                src={displayImage}
                alt="Photo de profil"
                className="w-full h-full object-cover rounded-full border-4 border-rose-200 dark:border-rose-600"
              />
            ) : (
              <div className="w-full h-full bg-rose-100 dark:bg-rose-800 rounded-full border-4 border-rose-200 dark:border-rose-600 flex items-center justify-center">
                <Camera className="h-8 w-8 text-rose-400" />
              </div>
            )}
            
            {isEditing && !previewImage && (
              <Button
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0 bg-rose-500 hover:bg-rose-600"
              >
                <Camera className="h-4 w-4" />
              </Button>
            )}
          </div>

          {previewImage && (
            <div className="flex justify-center space-x-2 mb-4">
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancel}
                disabled={isUploading}
                className="border-gray-300"
              >
                <X className="h-4 w-4 mr-1" />
                Annuler
              </Button>
              <Button
                size="sm"
                onClick={handleUpload}
                disabled={isUploading}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isUploading ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-1" />
                ) : (
                  <Check className="h-4 w-4 mr-1" />
                )}
                {isUploading ? 'Upload...' : 'Confirmer'}
              </Button>
            </div>
          )}

          {isEditing && !previewImage && (
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="border-rose-300 text-rose-700 hover:bg-rose-50"
            >
              <Upload className="h-4 w-4 mr-2" />
              Changer la photo
            </Button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />

          <p className="text-xs text-rose-600 dark:text-rose-300 mt-2">
            Formats acceptés: JPG, PNG (max 5MB)
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfilePictureUpload;

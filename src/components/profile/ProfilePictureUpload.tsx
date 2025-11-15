import { useState } from 'react';
import { Camera, Loader2, X } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import LazyImage from '@/components/ui/LazyImage';

interface ProfilePictureUploadProps {
  currentPicture?: string;
  fullName: string;
  onPictureChange: (imageUrl: string | null) => void;
}

const ProfilePictureUpload = ({
  currentPicture,
  fullName,
  onPictureChange,
}: ProfilePictureUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file is an image
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner un fichier image',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Erreur',
        description: "La taille de l'image doit être inférieure à 5MB",
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      // For demo purposes, we'll create a local URL
      // In a real app, you would upload to Supabase storage
      const imageUrl = URL.createObjectURL(file);

      // Simulate network delay for demo
      await new Promise((resolve) => setTimeout(resolve, 1000));

      onPictureChange(imageUrl);
      toast({
        title: 'Succès',
        description: 'Photo de profil mise à jour avec succès',
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Erreur',
        description: 'Échec de la mise à jour de la photo de profil',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePicture = () => {
    onPictureChange(null);
    toast({
      title: 'Photo supprimée',
      description: 'Photo de profil supprimée avec succès',
    });
  };

  const initials = fullName
    .split(' ')
    .map((name) => name.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative group">
        <Avatar className="h-32 w-32 ring-4 ring-offset-4 ring-rose-200 dark:ring-rose-700 group-hover:opacity-80 transition-opacity">
          {currentPicture ? (
            <LazyImage
              src={currentPicture}
              alt="Photo de profil"
              className="h-full w-full object-cover"
              placeholderClassName="bg-rose-100 dark:bg-rose-800"
              fallbackSrc="https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=128&h=128&fit=crop&crop=face"
            />
          ) : (
            <AvatarFallback className="bg-rose-500 text-white text-2xl font-semibold">
              {initials || '?'}
            </AvatarFallback>
          )}
        </Avatar>

        <label
          htmlFor="profile-picture-upload"
          className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-opacity"
          aria-label="Changer la photo de profil"
        >
          {isUploading ? (
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          ) : (
            <Camera className="h-8 w-8 text-white" />
          )}
        </label>

        <input
          type="file"
          id="profile-picture-upload"
          accept="image/*"
          className="sr-only"
          onChange={handleFileChange}
          disabled={isUploading}
        />

        {currentPicture && (
          <Button
            size="sm"
            variant="destructive"
            className="absolute -top-2 -right-2 h-8 w-8 rounded-full p-0"
            onClick={handleRemovePicture}
            disabled={isUploading}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Cliquez sur l'image pour changer votre photo de profil
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          JPG, PNG ou GIF. Maximum 5MB.
        </p>
      </div>

      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => document.getElementById('profile-picture-upload')?.click()}
          disabled={isUploading}
        >
          <Camera className="h-4 w-4 mr-2" />
          {currentPicture ? 'Changer' : 'Ajouter'} une photo
        </Button>
      </div>
    </div>
  );
};

export default ProfilePictureUpload;

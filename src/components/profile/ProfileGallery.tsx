
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Plus, X, Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProfileGalleryProps {
  images: string[];
  onImagesUpdate: (images: string[]) => void;
  isEditing?: boolean;
  maxImages?: number;
}

const ProfileGallery: React.FC<ProfileGalleryProps> = ({
  images = [],
  onImagesUpdate,
  isEditing = false,
  maxImages = 6
}) => {
  const { toast } = useToast();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleImageAdd = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (images.length + files.length > maxImages) {
      toast({
        title: "Limite atteinte",
        description: `Vous ne pouvez ajouter que ${maxImages} photos maximum.`,
        variant: "destructive"
      });
      return;
    }

    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Format non valide",
          description: "Veuillez sélectionner des images uniquement.",
          variant: "destructive"
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onImagesUpdate([...images, result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesUpdate(newImages);
    toast({
      title: "Photo supprimée",
      description: "La photo a été retirée de votre galerie.",
    });
  };

  return (
    <Card className="shadow-lg border-rose-200 dark:border-rose-700 bg-white/80 dark:bg-rose-900/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-rose-800 dark:text-rose-200">
          Galerie de photos ({images.length}/{maxImages})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <Dialog>
                <DialogTrigger asChild>
                  <div className="relative cursor-pointer">
                    <img
                      src={image}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border-2 border-rose-200 hover:border-rose-300 transition-colors"
                      onClick={() => setSelectedImage(image)}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg" />
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <img
                    src={image}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-auto rounded-lg"
                  />
                </DialogContent>
              </Dialog>
              
              {isEditing && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleImageRemove(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
          
          {/* Bouton d'ajout */}
          {isEditing && images.length < maxImages && (
            <label className="cursor-pointer">
              <div className="w-full h-24 border-2 border-dashed border-rose-300 rounded-lg flex items-center justify-center hover:border-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900 transition-colors">
                <div className="text-center">
                  <Plus className="h-6 w-6 text-rose-400 mx-auto mb-1" />
                  <span className="text-xs text-rose-600 dark:text-rose-300">
                    Ajouter
                  </span>
                </div>
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageAdd}
                className="hidden"
              />
            </label>
          )}
        </div>
        
        {images.length === 0 && !isEditing && (
          <div className="text-center py-8">
            <Camera className="h-12 w-12 text-rose-300 mx-auto mb-4" />
            <p className="text-rose-600 dark:text-rose-300">
              Aucune photo dans la galerie
            </p>
          </div>
        )}
        
        {isEditing && (
          <p className="text-xs text-rose-600 dark:text-rose-300 mt-4 text-center">
            Ajoutez jusqu'à {maxImages} photos pour présenter votre personnalité
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileGallery;

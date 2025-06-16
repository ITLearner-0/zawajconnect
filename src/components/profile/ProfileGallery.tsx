
import { useState } from 'react';
import { Plus, X, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import LazyImage from '@/components/ui/LazyImage';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ProfileGalleryProps {
  gallery: string[];
  onGalleryChange: (gallery: string[]) => void;
}

const ProfileGallery = ({ gallery, onGalleryChange }: ProfileGalleryProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate each file
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Erreur",
          description: 'Veuillez sélectionner uniquement des fichiers image',
          variant: "destructive"
        });
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Erreur",
          description: 'Chaque image doit être inférieure à 5MB',
          variant: "destructive"
        });
        return;
      }
    }

    // Check gallery limit (max 6 photos)
    if (gallery.length + files.length > 6) {
      toast({
        title: "Limite atteinte",
        description: 'Vous ne pouvez avoir que 6 photos maximum dans votre galerie',
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      // Create URLs for the new images
      const newImageUrls = files.map(file => URL.createObjectURL(file));
      
      // Simulate network delay for demo
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedGallery = [...gallery, ...newImageUrls];
      onGalleryChange(updatedGallery);
      
      toast({
        title: "Succès",
        description: `${files.length} photo(s) ajoutée(s) à votre galerie`
      });
    } catch (error) {
      console.error('Error uploading images:', error);
      toast({
        title: "Erreur",
        description: 'Échec de l\'ajout des photos',
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      // Reset the input
      e.target.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    const updatedGallery = gallery.filter((_, i) => i !== index);
    onGalleryChange(updatedGallery);
    toast({
      title: "Photo supprimée",
      description: 'Photo supprimée de votre galerie'
    });
  };

  const openImagePreview = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Galerie de photos ({gallery.length}/6)
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => document.getElementById('gallery-upload')?.click()}
          disabled={isUploading || gallery.length >= 6}
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter des photos
        </Button>
      </div>

      <input
        type="file"
        id="gallery-upload"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={handleFileChange}
        disabled={isUploading}
      />

      {gallery.length === 0 ? (
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
          <div className="space-y-2">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <svg
                className="h-12 w-12"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p>Aucune photo dans votre galerie</p>
              <p className="text-xs mt-1">
                Cliquez sur "Ajouter des photos" pour commencer
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {gallery.map((imageUrl, index) => (
            <div key={index} className="relative group aspect-square">
              <LazyImage
                src={imageUrl}
                alt={`Photo de galerie ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
                placeholderClassName="bg-rose-100 dark:bg-rose-800 rounded-lg"
                fallbackSrc="https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=400&fit=crop&crop=face"
              />
              
              {/* Overlay with actions */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => openImagePreview(imageUrl)}
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRemoveImage(index)}
                    className="h-8 w-8 p-0"
                    disabled={isUploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-xs text-gray-500 dark:text-gray-400">
        <p>• Maximum 6 photos dans votre galerie</p>
        <p>• JPG, PNG ou GIF. Maximum 5MB par photo.</p>
        <p>• Les photos seront visibles aux autres utilisateurs selon vos paramètres de confidentialité</p>
      </div>

      {/* Image Preview Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Aperçu de la photo</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="w-full max-h-96 overflow-hidden rounded-lg">
              <LazyImage
                src={selectedImage}
                alt="Aperçu de la photo"
                className="w-full h-full object-contain"
                placeholderClassName="bg-rose-100 dark:bg-rose-800"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfileGallery;

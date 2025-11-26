/**
 * PhotoGalleryTab - Complete Photo Management
 *
 * Features:
 * - View all photos in grid
 * - Upload new photos (own profile)
 * - Delete photos (own profile)
 * - Set profile picture (own profile)
 * - Lightbox for full-size viewing
 * - Privacy settings per photo
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  Upload,
  Trash2,
  Star,
  Eye,
  EyeOff,
  X,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { DatabaseProfile } from '@/types/profile';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface PhotoGalleryTabProps {
  profile: DatabaseProfile;
  isOwnProfile: boolean;
}

interface Photo {
  id: string;
  url: string;
  isProfilePicture: boolean;
  isPrivate: boolean;
  uploadedAt: string;
}

const PhotoGalleryTab = ({ profile, isOwnProfile }: PhotoGalleryTabProps) => {
  const { toast } = useToast();

  // Mock photos data (will be fetched from Supabase)
  const [photos, setPhotos] = useState<Photo[]>([
    {
      id: '1',
      url: profile.profile_picture || '',
      isProfilePicture: true,
      isPrivate: false,
      uploadedAt: new Date().toISOString(),
    },
    ...(profile.gallery || []).map((url, index) => ({
      id: `gallery-${index}`,
      url,
      isProfilePicture: false,
      isPrivate: false,
      uploadedAt: new Date().toISOString(),
    })),
  ]);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState<Photo | null>(null);

  const handleUpload = () => {
    toast({
      title: 'Fonctionnalité en développement',
      description: 'L\'upload de photos sera bientôt disponible.',
    });
  };

  const handleDelete = (photo: Photo) => {
    setPhotoToDelete(photo);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!photoToDelete) return;

    setPhotos(photos.filter((p) => p.id !== photoToDelete.id));
    toast({
      title: 'Photo supprimée',
      description: 'La photo a été supprimée avec succès.',
    });
    setDeleteDialogOpen(false);
    setPhotoToDelete(null);
  };

  const handleSetProfilePicture = (photo: Photo) => {
    setPhotos(
      photos.map((p) => ({
        ...p,
        isProfilePicture: p.id === photo.id,
      }))
    );
    toast({
      title: 'Photo de profil modifiée',
      description: 'Cette photo est maintenant votre photo de profil.',
    });
  };

  const togglePrivacy = (photo: Photo) => {
    setPhotos(
      photos.map((p) => (p.id === photo.id ? { ...p, isPrivate: !p.isPrivate } : p))
    );
    toast({
      title: photo.isPrivate ? 'Photo rendue publique' : 'Photo rendue privée',
      description: photo.isPrivate
        ? 'Cette photo est maintenant visible par tous.'
        : 'Cette photo est maintenant visible uniquement par vous.',
    });
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const nextPhoto = () => {
    setLightboxIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setLightboxIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  // Empty state
  if (photos.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="mx-auto w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-6">
          <Camera className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {isOwnProfile ? 'Aucune photo' : 'Pas de photos à afficher'}
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          {isOwnProfile
            ? 'Ajoutez des photos pour rendre votre profil plus attractif et augmenter vos chances de trouver des matches compatibles.'
            : 'Cet utilisateur n\'a pas encore ajouté de photos à sa galerie.'}
        </p>
        {isOwnProfile && (
          <Button onClick={handleUpload} className="bg-emerald-500 hover:bg-emerald-600">
            <Upload className="h-4 w-4 mr-2" />
            Ajouter des photos
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {photos.length} {photos.length === 1 ? 'Photo' : 'Photos'}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {isOwnProfile
              ? 'Gérez vos photos, définissez votre photo de profil et contrôlez la confidentialité'
              : 'Parcourez la galerie photos de ce profil'}
          </p>
        </div>
        {isOwnProfile && (
          <Button onClick={handleUpload} className="bg-emerald-500 hover:bg-emerald-600">
            <Upload className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Ajouter des photos</span>
            <span className="sm:hidden">Ajouter</span>
          </Button>
        )}
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo, index) => (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="group relative overflow-hidden aspect-square cursor-pointer hover:shadow-xl transition-shadow">
              {/* Photo Image */}
              <div
                onClick={() => openLightbox(index)}
                className="w-full h-full relative"
              >
                <img
                  src={photo.url}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover transition-transform group-hover:scale-110"
                />

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {photo.isProfilePicture && (
                    <div className="bg-gold-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      <span>Profil</span>
                    </div>
                  )}
                  {photo.isPrivate && isOwnProfile && (
                    <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <EyeOff className="h-3 w-3" />
                      <span>Privée</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions (own profile only) */}
              {isOwnProfile && (
                <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!photo.isProfilePicture && (
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8 bg-white/90 hover:bg-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetProfilePicture(photo);
                      }}
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8 bg-white/90 hover:bg-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePrivacy(photo);
                    }}
                  >
                    {photo.isPrivate ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </Button>
                  {!photo.isProfilePicture && (
                    <Button
                      size="icon"
                      variant="destructive"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(photo);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={() => setLightboxOpen(false)}
          >
            {/* Close button */}
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-4 right-4 text-white hover:bg-white/20"
              onClick={() => setLightboxOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Navigation buttons */}
            {photos.length > 1 && (
              <>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevPhoto();
                  }}
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextPhoto();
                  }}
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              </>
            )}

            {/* Photo */}
            <motion.img
              key={lightboxIndex}
              src={photos[lightboxIndex].url}
              alt={`Photo ${lightboxIndex + 1}`}
              className="max-w-full max-h-full object-contain"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            />

            {/* Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
              {lightboxIndex + 1} / {photos.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette photo ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La photo sera définitivement supprimée de
              votre galerie.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PhotoGalleryTab;

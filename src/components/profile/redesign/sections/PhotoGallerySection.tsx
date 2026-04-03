import { useState } from 'react';
import { Camera, Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ProfileSection, { SectionContent, EmptyState } from '../ProfileSection';
import { DatabaseProfile } from '@/types/profile';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeInUp, scaleIn } from '@/styles/animations';

interface PhotoGallerySectionProps {
  profile: DatabaseProfile;
  isOwnProfile: boolean;
  onUpload?: (file: File) => Promise<void>;
  onDelete?: (photoUrl: string) => Promise<void>;
}

/**
 * PhotoGallerySection Component
 *
 * Displays and manages profile photos.
 * Features:
 * - Grid layout for photos
 * - Upload new photos (for own profile)
 * - Delete photos (for own profile)
 * - Maximum 6 photos
 * - Empty state
 * - Photo count badge
 * - Hover effects
 */
const PhotoGallerySection = ({
  profile,
  isOwnProfile,
  onUpload,
  onDelete,
}: PhotoGallerySectionProps) => {
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null);

  const MAX_PHOTOS = 6;
  const photos = profile.gallery || [];
  const photoCount = photos.length;
  const canAddMore = photoCount < MAX_PHOTOS;

  // Badge showing photo count
  const badge = (
    <Badge
      variant="outline"
      className={
        photoCount >= MAX_PHOTOS
          ? 'border-emerald-500 text-emerald-700'
          : photoCount > 0
            ? 'border-gold-500 text-gold-700'
            : ''
      }
    >
      <Camera className="h-3 w-3 mr-1" />
      {photoCount}/{MAX_PHOTOS}
    </Badge>
  );

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUpload) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La taille de l\'image ne doit pas dépasser 5 MB');
      return;
    }

    try {
      setUploadingIndex(photoCount);
      await onUpload(file);
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Erreur lors du téléchargement de la photo');
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleDelete = async (photoUrl: string) => {
    if (!onDelete || !confirm('Êtes-vous sûr de vouloir supprimer cette photo ?')) return;

    try {
      setDeletingUrl(photoUrl);
      await onDelete(photoUrl);
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert('Erreur lors de la suppression de la photo');
    } finally {
      setDeletingUrl(null);
    }
  };

  return (
    <ProfileSection
      icon={Camera}
      title="Photos"
      accentColor="gold"
      defaultOpen={true}
      badge={badge}
    >
      <SectionContent>
        {photoCount > 0 || isOwnProfile ? (
          <div className="space-y-4">
            {/* Photo Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <AnimatePresence>
                {photos.map((photoUrl, index) => (
                  <motion.div
                    key={photoUrl}
                    variants={scaleIn}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ delay: index * 0.1 }}
                    className="relative aspect-square group"
                  >
                    <img
                      src={photoUrl}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg shadow-md"
                    />

                    {/* Delete Button (own profile only) */}
                    {isOwnProfile && onDelete && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(photoUrl)}
                          disabled={deletingUrl === photoUrl}
                          className="shadow-lg"
                        >
                          <X className="h-4 w-4 mr-1" />
                          {deletingUrl === photoUrl ? 'Suppression...' : 'Supprimer'}
                        </Button>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Upload Button (own profile only) */}
              {isOwnProfile && canAddMore && onUpload && (
                <motion.label
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors"
                  style={{ borderColor: 'var(--color-border-default)' }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    disabled={uploadingIndex !== null}
                    className="hidden"
                  />
                  {uploadingIndex === photoCount ? (
                    <div className="text-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold-500 border-t-transparent mx-auto mb-2" />
                      <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Upload...</span>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="h-8 w-8 mb-2 mx-auto" style={{ color: 'var(--color-text-muted)' }} />
                      <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Ajouter</span>
                      <span className="text-xs block mt-1" style={{ color: 'var(--color-text-muted)' }}>Max 5MB</span>
                    </div>
                  )}
                </motion.label>
              )}
            </div>

            {/* Guidelines */}
            {isOwnProfile && (
              <div className="p-4 bg-gold-50 border border-gold-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-gold-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gold-800 space-y-1">
                    <p className="font-medium">Conseils pour vos photos :</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Utilisez des photos claires et récentes</li>
                      <li>Respectez les règles de pudeur islamiques</li>
                      <li>Évitez les photos de groupe</li>
                      <li>Photos professionnelles recommandées</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Max photos reached message */}
            {isOwnProfile && !canAddMore && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
                <p className="text-sm text-emerald-800">
                  ✓ Vous avez atteint le nombre maximum de photos ({MAX_PHOTOS})
                </p>
              </div>
            )}
          </div>
        ) : (
          <EmptyState
            icon={ImageIcon}
            title="Aucune photo disponible"
            description="Cet utilisateur n'a pas encore ajouté de photos à son profil."
          />
        )}
      </SectionContent>
    </ProfileSection>
  );
};

export default PhotoGallerySection;

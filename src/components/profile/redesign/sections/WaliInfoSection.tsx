import { Users, Phone, CheckCircle, User, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ProfileSection, { InfoGrid, SectionContent, EmptyState } from '../ProfileSection';
import { DatabaseProfile } from '@/types/profile';

interface WaliInfoSectionProps {
  profile: DatabaseProfile;
  isOwnProfile: boolean;
  onContactWali?: () => void;
  onEdit?: () => void;
}

/**
 * WaliInfoSection Component
 *
 * Displays information about the user's wali (guardian).
 * Features:
 * - Wali name and relationship
 * - Contact information (if available)
 * - Verification status badge
 * - Contact wali button for other users
 * - Empty state for profiles without wali
 * - Islamic context and importance
 */
const WaliInfoSection = ({
  profile,
  isOwnProfile,
  onContactWali,
  onEdit,
}: WaliInfoSectionProps) => {
  const hasWaliInfo = profile.wali_name && profile.wali_name.trim().length > 0;
  const isWaliVerified = profile.wali_verified === true;

  // Badge showing verification status
  const badge = isWaliVerified ? (
    <Badge variant="outline" className="border-emerald-500 text-emerald-700">
      <CheckCircle className="h-3 w-3 mr-1" />
      Vérifié
    </Badge>
  ) : hasWaliInfo ? (
    <Badge variant="outline" className="border-gold-500 text-gold-700">
      <Shield className="h-3 w-3 mr-1" />
      En attente
    </Badge>
  ) : null;

  // Prepare items for InfoGrid
  const prepareGridItems = () => {
    const items: Array<{ label: string; value: React.ReactNode; icon?: any }> = [];

    if (profile.wali_name) {
      items.push({
        label: 'Nom du Wali',
        value: profile.wali_name,
        icon: User,
      });
    }

    if (profile.wali_relationship) {
      items.push({
        label: 'Relation',
        value: profile.wali_relationship,
        icon: Users,
      });
    }

    if (profile.wali_contact) {
      // Show contact info only for own profile or if explicitly allowed
      if (isOwnProfile) {
        items.push({
          label: 'Contact',
          value: profile.wali_contact,
          icon: Phone,
        });
      } else {
        items.push({
          label: 'Contact',
          value: (
            <Button
              size="sm"
              variant="outline"
              onClick={onContactWali}
              className="text-emerald-600 border-emerald-300 hover:bg-emerald-50"
            >
              <Phone className="h-3 w-3 mr-2" />
              Contacter le Wali
            </Button>
          ),
        });
      }
    }

    if (isWaliVerified) {
      items.push({
        label: 'Statut de vérification',
        value: (
          <Badge variant="outline" className="border-emerald-500 text-emerald-700">
            <CheckCircle className="h-3 w-3 mr-1" />
            Vérifié
          </Badge>
        ),
      });
    }

    return items;
  };

  const gridItems = prepareGridItems();

  return (
    <ProfileSection
      icon={Users}
      title="Famille & Wali"
      accentColor="sage"
      defaultOpen={true}
      badge={badge}
    >
      <SectionContent>
        {hasWaliInfo ? (
          <>
            <InfoGrid columns={2} items={gridItems} />

            {/* Information about Wali importance */}
            {!isOwnProfile && (
              <div className="mt-4 p-4 bg-sage-50 border border-sage-200 rounded-lg">
                <p className="text-sm text-sage-800">
                  ℹ️ <strong>À propos du Wali :</strong> Conformément aux enseignements islamiques,
                  le wali (tuteur) joue un rôle important dans le processus de mariage. Toute
                  communication sérieuse doit passer par le wali.
                </p>
              </div>
            )}

            {/* Verification encouragement for own profile */}
            {isOwnProfile && !isWaliVerified && (
              <div className="mt-4 p-4 bg-gold-50 border border-gold-200 rounded-lg">
                <p className="text-sm text-gold-800">
                  💡 <strong>Conseil :</strong> Faites vérifier votre wali pour augmenter la
                  confiance des autres utilisateurs. Les profils avec wali vérifié reçoivent 2x plus
                  de demandes sérieuses.
                </p>
              </div>
            )}
          </>
        ) : isOwnProfile ? (
          <EmptyState
            icon={Users}
            title="Ajoutez les informations de votre Wali"
            description={
              profile.gender === 'female'
                ? "En Islam, le wali (tuteur) joue un rôle essentiel dans le mariage d'une femme. Ajoutez ses coordonnées pour faciliter les démarches sérieuses."
                : "Bien que non obligatoire pour les hommes, mentionner un contact familial peut rassurer les familles des candidates."
            }
            action={
              onEdit
                ? {
                    label: 'Ajouter maintenant',
                    onClick: onEdit,
                  }
                : undefined
            }
          />
        ) : (
          <div className="text-center py-8 space-y-4">
            <p className="text-gray-500 italic">
              Aucune information de wali disponible
            </p>
            {profile.gender === 'female' && (
              <p className="text-sm text-gray-600">
                Cette utilisatrice n'a pas encore ajouté les informations de son wali.
              </p>
            )}
          </div>
        )}
      </SectionContent>
    </ProfileSection>
  );
};

export default WaliInfoSection;

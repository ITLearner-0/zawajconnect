import { Heart, CheckCircle, Book, Moon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import ProfileSection, { InfoGrid, SectionContent, EmptyState } from '../ProfileSection';
import { DatabaseProfile } from '@/types/profile';

interface IslamicPreferencesSectionProps {
  profile: DatabaseProfile;
  isOwnProfile: boolean;
  islamicPrefs?: {
    prayer_frequency?: string;
    quran_reading?: string;
    hijab_preference?: string;
    beard_preference?: string;
    sect?: string;
    madhab?: string;
    halal_diet?: boolean;
    smoking?: string;
    desired_partner_sect?: string;
    importance_of_religion?: string;
  };
  onEdit?: () => void;
}

/**
 * IslamicPreferencesSection Component
 *
 * Displays Islamic preferences and practices.
 * Features:
 * - Organized grid layout
 * - Icons for visual hierarchy
 * - Completion badge
 * - Empty state for incomplete profiles
 * - Edit button for own profile
 */
const IslamicPreferencesSection = ({
  profile,
  isOwnProfile,
  islamicPrefs,
  onEdit,
}: IslamicPreferencesSectionProps) => {
  // Calculate completion percentage
  const calculateCompletion = () => {
    if (!islamicPrefs) return 0;

    const fields = [
      'prayer_frequency',
      'quran_reading',
      'sect',
      'madhab',
      'importance_of_religion',
    ];

    const completedFields = fields.filter((field) => {
      const value = islamicPrefs[field as keyof typeof islamicPrefs];
      return value !== null && value !== undefined && value !== '';
    }).length;

    // Include gender-specific fields
    if (profile.gender === 'female' && islamicPrefs.hijab_preference) {
      return Math.round(((completedFields + 1) / (fields.length + 1)) * 100);
    }
    if (profile.gender === 'male' && islamicPrefs.beard_preference) {
      return Math.round(((completedFields + 1) / (fields.length + 1)) * 100);
    }

    return Math.round((completedFields / fields.length) * 100);
  };

  const completionPercentage = calculateCompletion();
  const isComplete = completionPercentage >= 80;
  const hasData = islamicPrefs && Object.keys(islamicPrefs).some(
    (key) => islamicPrefs[key as keyof typeof islamicPrefs]
  );

  // Badge showing completion status
  const badge = isComplete ? (
    <Badge variant="outline" className="border-emerald-500 text-emerald-700">
      <CheckCircle className="h-3 w-3 mr-1" />
      Complété
    </Badge>
  ) : completionPercentage > 0 ? (
    <Badge variant="outline" className="border-gold-500 text-gold-700">
      {completionPercentage}%
    </Badge>
  ) : null;

  // Prepare items for InfoGrid
  const prepareGridItems = () => {
    if (!islamicPrefs) return [];

    const items: Array<{ label: string; value: React.ReactNode; icon?: any }> = [];

    // Religious Practice
    if (profile.religious_practice_level) {
      items.push({
        label: 'Pratique religieuse',
        value: profile.religious_practice_level,
        icon: Heart,
      });
    }

    // Prayer
    if (islamicPrefs.prayer_frequency || profile.prayer_frequency) {
      items.push({
        label: 'Prière',
        value: islamicPrefs.prayer_frequency || profile.prayer_frequency,
        icon: Moon,
      });
    }

    // Quran Reading
    if (islamicPrefs.quran_reading) {
      items.push({
        label: 'Lecture du Coran',
        value: islamicPrefs.quran_reading,
        icon: Book,
      });
    }

    // Sect
    if (islamicPrefs.sect) {
      items.push({
        label: 'Courant',
        value: islamicPrefs.sect,
      });
    }

    // Madhab
    if (islamicPrefs.madhab) {
      items.push({
        label: 'Madhab',
        value: islamicPrefs.madhab,
      });
    }

    // Importance of Religion
    if (islamicPrefs.importance_of_religion) {
      items.push({
        label: 'Importance de la religion',
        value: islamicPrefs.importance_of_religion,
      });
    }

    // Gender-specific fields
    if (profile.gender === 'female' && islamicPrefs.hijab_preference) {
      items.push({
        label: 'Port du Hijab',
        value: islamicPrefs.hijab_preference,
      });
    }

    if (profile.gender === 'male' && islamicPrefs.beard_preference) {
      items.push({
        label: 'Barbe',
        value: islamicPrefs.beard_preference,
      });
    }

    // Halal Diet
    if (islamicPrefs.halal_diet !== undefined) {
      items.push({
        label: 'Régime Halal',
        value: islamicPrefs.halal_diet ? 'Oui' : 'Non',
      });
    }

    // Smoking
    if (islamicPrefs.smoking) {
      items.push({
        label: 'Tabagisme',
        value: islamicPrefs.smoking,
      });
    }

    // Partner preferences
    if (islamicPrefs.desired_partner_sect) {
      items.push({
        label: 'Courant souhaité (partenaire)',
        value: islamicPrefs.desired_partner_sect,
      });
    }

    return items;
  };

  const gridItems = prepareGridItems();

  return (
    <ProfileSection
      icon={Heart}
      title="Préférences Islamiques"
      accentColor="emerald"
      defaultOpen={true}
      badge={badge}
    >
      <SectionContent>
        {hasData && gridItems.length > 0 ? (
          <>
            <InfoGrid columns={2} items={gridItems} />

            {!isComplete && isOwnProfile && (
              <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <p className="text-sm text-emerald-800">
                  💡 <strong>Conseil :</strong> Complétez vos préférences islamiques pour
                  améliorer la qualité de vos matches. Les profils complets reçoivent 3x plus
                  d'attention !
                </p>
              </div>
            )}
          </>
        ) : isOwnProfile ? (
          <EmptyState
            icon={Heart}
            title="Configurez vos préférences islamiques"
            description="Ajoutez vos préférences et pratiques religieuses pour trouver des partenaires compatibles. Ces informations sont essentielles pour un bon match."
            action={
              onEdit
                ? {
                    label: 'Configurer maintenant',
                    onClick: onEdit,
                  }
                : undefined
            }
          />
        ) : (
          <div className="text-center py-8 text-gray-500 italic">
            Les préférences islamiques ne sont pas disponibles
          </div>
        )}
      </SectionContent>
    </ProfileSection>
  );
};

export default IslamicPreferencesSection;

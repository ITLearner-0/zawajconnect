import { Briefcase, BookOpen, GraduationCap, TrendingUp } from 'lucide-react';
import ProfileSection, { InfoGrid, SectionContent, EmptyState } from '../ProfileSection';
import { DatabaseProfile } from '@/types/profile';

interface EducationCareerSectionProps {
  profile: DatabaseProfile;
  isOwnProfile: boolean;
  additionalInfo?: {
    field?: string;
    company?: string;
    years_of_experience?: number;
    education_institution?: string;
    languages?: string[];
  };
  onEdit?: () => void;
}

/**
 * EducationCareerSection Component
 *
 * Displays education and career information.
 * Features:
 * - Education level and institution
 * - Current occupation and company
 * - Years of experience
 * - Languages spoken
 * - Empty state for incomplete profiles
 */
const EducationCareerSection = ({
  profile,
  isOwnProfile,
  additionalInfo,
  onEdit,
}: EducationCareerSectionProps) => {
  const hasEducation = profile.education_level && profile.education_level.trim().length > 0;
  const hasOccupation = profile.occupation && profile.occupation.trim().length > 0;
  const hasData = hasEducation || hasOccupation || (additionalInfo && Object.keys(additionalInfo).length > 0);

  // Prepare items for InfoGrid
  const prepareGridItems = () => {
    const items: Array<{ label: string; value: React.ReactNode; icon?: any }> = [];

    // Education Level
    if (profile.education_level) {
      items.push({
        label: "Niveau d'éducation",
        value: profile.education_level,
        icon: GraduationCap,
      });
    }

    // Education Institution
    if (additionalInfo?.education_institution) {
      items.push({
        label: 'Institution',
        value: additionalInfo.education_institution,
        icon: BookOpen,
      });
    }

    // Occupation
    if (profile.occupation) {
      items.push({
        label: 'Profession',
        value: profile.occupation,
        icon: Briefcase,
      });
    }

    // Field
    if (additionalInfo?.field) {
      items.push({
        label: 'Domaine',
        value: additionalInfo.field,
      });
    }

    // Company
    if (additionalInfo?.company) {
      items.push({
        label: 'Entreprise',
        value: additionalInfo.company,
      });
    }

    // Years of Experience
    if (additionalInfo?.years_of_experience !== undefined && additionalInfo.years_of_experience > 0) {
      const years = additionalInfo.years_of_experience;
      items.push({
        label: 'Expérience',
        value: years === 1 ? '1 an' : `${years} ans`,
        icon: TrendingUp,
      });
    }

    // Languages
    if (additionalInfo?.languages && additionalInfo.languages.length > 0) {
      items.push({
        label: 'Langues',
        value: (
          <div className="flex flex-wrap gap-1">
            {additionalInfo.languages.map((lang, index) => (
              <span
                key={index}
                className="inline-block px-2 py-1 text-xs bg-gold-100 text-gold-700 rounded"
              >
                {lang}
              </span>
            ))}
          </div>
        ),
      });
    }

    return items;
  };

  const gridItems = prepareGridItems();

  return (
    <ProfileSection
      icon={Briefcase}
      title="Éducation & Carrière"
      accentColor="gold"
      defaultOpen={true}
    >
      <SectionContent>
        {hasData && gridItems.length > 0 ? (
          <InfoGrid columns={2} items={gridItems} />
        ) : isOwnProfile ? (
          <EmptyState
            icon={Briefcase}
            title="Ajoutez vos informations professionnelles"
            description="Partagez votre parcours éducatif et professionnel. Ces informations aident à trouver des partenaires avec des objectifs et ambitions similaires."
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
          <div className="text-center py-8 text-gray-500 italic">
            Aucune information professionnelle disponible
          </div>
        )}
      </SectionContent>
    </ProfileSection>
  );
};

export default EducationCareerSection;

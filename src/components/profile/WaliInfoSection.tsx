
import { DatabaseProfile } from '@/types/profile';

interface WaliInfoSectionProps {
  profile: DatabaseProfile;
}

const WaliInfoSection = ({ profile }: WaliInfoSectionProps) => {
  // Only show wali information for female profiles and when wali info exists
  if (profile.gender !== 'female' && profile.gender !== 'Female') return null;
  if (!profile.wali_name) return null;
  
  return (
    <div className="mt-4 p-4 bg-islamic-cream rounded-lg border border-islamic-sand">
      <h3 className="font-semibold text-islamic-burgundy">Informations du Wali</h3>
      <div className="mt-2 space-y-2 text-sm">
        <div><span className="font-medium">Nom:</span> {profile.wali_name}</div>
        <div><span className="font-medium">Relation:</span> {profile.wali_relationship}</div>
        <div><span className="font-medium">Contact:</span> {profile.wali_contact}</div>
      </div>
    </div>
  );
};

export default WaliInfoSection;

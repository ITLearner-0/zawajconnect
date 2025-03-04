
import { DatabaseProfile } from '@/types/profile';

interface WaliInfoSectionProps {
  profile: DatabaseProfile;
}

const WaliInfoSection = ({ profile }: WaliInfoSectionProps) => {
  if (!profile.wali_name) return null;
  
  return (
    <div className="mt-4 p-4 bg-islamic-cream rounded-lg border border-islamic-sand">
      <h3 className="font-semibold text-islamic-burgundy">Wali Information</h3>
      <div className="mt-2 space-y-2 text-sm">
        <div><span className="font-medium">Name:</span> {profile.wali_name}</div>
        <div><span className="font-medium">Relationship:</span> {profile.wali_relationship}</div>
        <div><span className="font-medium">Contact:</span> {profile.wali_contact}</div>
      </div>
    </div>
  );
};

export default WaliInfoSection;

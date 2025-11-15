import { DatabaseProfile } from '@/types/profile';
import { BookHeart } from 'lucide-react';

interface ReligiousSectionProps {
  profile: DatabaseProfile;
}

const ReligiousSection = ({ profile }: ReligiousSectionProps) => {
  return (
    <div>
      <h2 className="text-xl font-semibold text-islamic-teal flex items-center">
        <BookHeart className="mr-2 h-5 w-5" /> Religious Background
      </h2>
      <div className="mt-3 space-y-3">
        <div className="flex items-center text-sm">
          <span className="font-medium text-gray-500 w-24">Practice Level:</span>
          <span>{profile.religious_practice_level}</span>
        </div>
        <div className="flex items-center text-sm">
          <span className="font-medium text-gray-500 w-24">Prayer:</span>
          <span>{profile.prayer_frequency}</span>
        </div>
      </div>
    </div>
  );
};

export default ReligiousSection;

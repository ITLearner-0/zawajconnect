
import { DatabaseProfile } from '@/types/profile';
import { User, MapPin } from 'lucide-react';

interface BasicInformationSectionProps {
  profile: DatabaseProfile;
}

const BasicInformationSection = ({ profile }: BasicInformationSectionProps) => {
  return (
    <div>
      <h2 className="text-xl font-semibold text-islamic-teal flex items-center">
        <User className="mr-2 h-5 w-5" /> Basic Information
      </h2>
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-center text-sm">
          <span className="font-medium text-gray-500 w-24">Age:</span>
          <span>{profile.birth_date ? new Date().getFullYear() - new Date(profile.birth_date).getFullYear() : 'Not specified'}</span>
        </div>
        <div className="flex items-center text-sm">
          <span className="font-medium text-gray-500 w-24">Location:</span>
          <span className="flex items-center">
            <MapPin className="h-3 w-3 mr-1 text-islamic-gold" /> {profile.location}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BasicInformationSection;

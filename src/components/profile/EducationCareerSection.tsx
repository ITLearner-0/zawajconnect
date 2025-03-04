
import { DatabaseProfile } from '@/types/profile';
import { BookOpen } from 'lucide-react';

interface EducationCareerSectionProps {
  profile: DatabaseProfile;
}

const EducationCareerSection = ({ profile }: EducationCareerSectionProps) => {
  return (
    <div>
      <h2 className="text-xl font-semibold text-islamic-teal flex items-center">
        <BookOpen className="mr-2 h-5 w-5" /> Education & Career
      </h2>
      <div className="mt-3 space-y-3">
        <div className="flex items-center text-sm">
          <span className="font-medium text-gray-500 w-24">Education:</span>
          <span>{profile.education_level}</span>
        </div>
        <div className="flex items-center text-sm">
          <span className="font-medium text-gray-500 w-24">Occupation:</span>
          <span>{profile.occupation}</span>
        </div>
      </div>
    </div>
  );
};

export default EducationCareerSection;

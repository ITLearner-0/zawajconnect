
import { DatabaseProfile } from '@/types/profile';
import { IslamicPattern } from '@/components/ui/islamic-pattern';
import BasicInformationSection from './BasicInformationSection';
import EducationCareerSection from './EducationCareerSection';
import ReligiousSection from './ReligiousSection';
import AboutMeSection from './AboutMeSection';
import WaliInfoSection from './WaliInfoSection';

interface ProfileDetailsProps {
  profile: DatabaseProfile;
}

const ProfileDetails = ({ profile }: ProfileDetailsProps) => {
  return (
    <IslamicPattern variant="background" className="bg-white rounded-lg shadow-lg p-6">
      <div className="space-y-6">
        <BasicInformationSection profile={profile} />
        <EducationCareerSection profile={profile} />
        <ReligiousSection profile={profile} />
        <AboutMeSection profile={profile} />
        <WaliInfoSection profile={profile} />
      </div>
    </IslamicPattern>
  );
};

export default ProfileDetails;

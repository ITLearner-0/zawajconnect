
import { DatabaseProfile } from '@/types/profile';

interface AboutMeSectionProps {
  profile: DatabaseProfile;
}

const AboutMeSection = ({ profile }: AboutMeSectionProps) => {
  return (
    <div>
      <h2 className="text-xl font-semibold text-islamic-teal">About Me</h2>
      <p className="mt-2 text-gray-700">{profile.about_me}</p>
    </div>
  );
};

export default AboutMeSection;

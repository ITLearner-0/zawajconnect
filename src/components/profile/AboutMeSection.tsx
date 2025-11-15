import { DatabaseProfile } from '@/types/profile';

interface AboutMeSectionProps {
  profile: DatabaseProfile;
}

const AboutMeSection = ({ profile }: AboutMeSectionProps) => {
  return (
    <div className="bg-white/80 dark:bg-rose-900/80 backdrop-blur-sm p-6 rounded-lg border border-rose-200 dark:border-rose-700">
      <h2 className="text-xl font-semibold text-rose-800 dark:text-rose-200 mb-3">About Me</h2>
      <p className="text-rose-700 dark:text-rose-300 leading-relaxed">{profile.about_me}</p>
    </div>
  );
};

export default AboutMeSection;

import { DatabaseProfile } from '@/types/profile';
import LazyProfileCardAvatar from './LazyProfileCardAvatar';

interface ProfileCardAvatarProps {
  profile: DatabaseProfile;
}

const ProfileCardAvatar = ({ profile }: ProfileCardAvatarProps) => {
  return <LazyProfileCardAvatar profile={profile} />;
};

export default ProfileCardAvatar;

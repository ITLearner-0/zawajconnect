
import { DatabaseProfile } from '@/types/profile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ProfileCardAvatarProps {
  profile: DatabaseProfile;
}

const ProfileCardAvatar = ({ profile }: ProfileCardAvatarProps) => {
  return (
    <Avatar className="h-32 w-32 ring-4 ring-offset-4 ring-islamic-teal/20 mb-4">
      {profile.profile_picture ? (
        <AvatarImage src={profile.profile_picture} alt={`${profile.first_name}'s profile`} />
      ) : null}
      <AvatarFallback className="bg-islamic-teal text-white text-3xl">
        {profile.first_name[0]}
      </AvatarFallback>
    </Avatar>
  );
};

export default ProfileCardAvatar;

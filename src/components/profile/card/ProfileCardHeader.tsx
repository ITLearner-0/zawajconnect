
import { DatabaseProfile } from '@/types/profile';
import { Badge } from '@/components/ui/badge';
import ProfileCardAvatar from './ProfileCardAvatar';

interface ProfileCardHeaderProps {
  profile: DatabaseProfile;
}

const ProfileCardHeader = ({ profile }: ProfileCardHeaderProps) => {
  return (
    <div className="flex flex-col items-center text-center">
      <ProfileCardAvatar profile={profile} />
      
      <h1 className="text-2xl font-bold text-islamic-blue">
        {profile.first_name} {profile.last_name}
      </h1>
      
      <p className="text-muted-foreground mt-1">{profile.occupation}</p>
      
      <Badge className={`mt-2 ${profile.gender === 'Male' ? 'bg-islamic-blue' : 'bg-islamic-gold'}`}>
        {profile.gender}
      </Badge>
    </div>
  );
};

export default ProfileCardHeader;

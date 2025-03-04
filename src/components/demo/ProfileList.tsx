
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DatabaseProfile } from '@/types/profile';

interface ProfileListProps {
  profiles: DatabaseProfile[];
}

const ProfileList = ({ profiles }: ProfileListProps) => {
  return (
    <div>
      <h3 className="font-semibold mb-2">Available Profiles</h3>
      <div className="space-y-3">
        {profiles.map(profile => (
          <div key={profile.id} className="flex items-center p-3 border rounded-lg">
            <Avatar className="h-10 w-10 mr-3">
              {profile.profile_picture ? (
                <AvatarImage src={profile.profile_picture} alt={`${profile.first_name}'s profile`} />
              ) : null}
              <AvatarFallback>{profile.first_name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{profile.first_name} {profile.last_name}</div>
              <div className="text-sm text-muted-foreground">{profile.occupation}</div>
            </div>
            <Badge variant={profile.gender === 'Male' ? 'default' : 'secondary'} className="ml-auto">
              {profile.gender}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileList;

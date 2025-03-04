
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DatabaseProfile } from '@/types/profile';
import { Button } from '@/components/ui/button';
import { Heart, User, MessageCircle } from 'lucide-react';
import { IslamicPattern } from '@/components/ui/islamic-pattern';

interface ProfileListProps {
  profiles: DatabaseProfile[];
  onSelectProfile?: (profile: DatabaseProfile) => void;
}

const ProfileList = ({ profiles, onSelectProfile }: ProfileListProps) => {
  return (
    <IslamicPattern variant="background" className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="font-semibold mb-4 text-islamic-teal flex items-center">
        <User className="h-4 w-4 mr-2 text-islamic-gold" />
        Available Profiles
      </h3>
      <div className="space-y-3">
        {profiles.map(profile => (
          <div 
            key={profile.id} 
            className="flex items-center p-4 border border-islamic-sand rounded-lg hover:bg-islamic-cream transition-colors cursor-pointer"
            onClick={() => onSelectProfile && onSelectProfile(profile)}
          >
            <Avatar className="h-12 w-12 mr-4 ring-2 ring-offset-2 ring-islamic-teal/20">
              {profile.profile_picture ? (
                <AvatarImage src={profile.profile_picture} alt={`${profile.first_name}'s profile`} />
              ) : null}
              <AvatarFallback className="bg-islamic-teal text-white">{profile.first_name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="font-medium text-islamic-blue">{profile.first_name} {profile.last_name}</div>
              <div className="text-sm text-muted-foreground">{profile.occupation}</div>
            </div>
            <Badge variant={profile.gender === 'Male' ? 'default' : 'secondary'} className={`ml-auto ${profile.gender === 'Male' ? 'bg-islamic-blue' : 'bg-islamic-gold'}`}>
              {profile.gender}
            </Badge>
            <Button variant="ghost" size="sm" className="ml-2 text-islamic-teal">
              <MessageCircle className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </IslamicPattern>
  );
};

export default ProfileList;

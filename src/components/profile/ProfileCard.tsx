
import { DatabaseProfile } from '@/types/profile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { IslamicPattern } from '@/components/ui/islamic-pattern';
import { Mail, Bookmark } from 'lucide-react';
import CustomButton from '@/components/CustomButton';

interface ProfileCardProps {
  profile: DatabaseProfile;
}

const ProfileCard = ({ profile }: ProfileCardProps) => {
  return (
    <IslamicPattern variant="border" className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex flex-col items-center text-center">
        <Avatar className="h-32 w-32 ring-4 ring-offset-4 ring-islamic-teal/20 mb-4">
          {profile.profile_picture ? (
            <AvatarImage src={profile.profile_picture} alt={`${profile.first_name}'s profile`} />
          ) : null}
          <AvatarFallback className="bg-islamic-teal text-white text-3xl">
            {profile.first_name[0]}
          </AvatarFallback>
        </Avatar>
        
        <h1 className="text-2xl font-bold text-islamic-blue">
          {profile.first_name} {profile.last_name}
        </h1>
        
        <p className="text-muted-foreground mt-1">{profile.occupation}</p>
        
        <Badge className={`mt-2 ${profile.gender === 'Male' ? 'bg-islamic-blue' : 'bg-islamic-gold'}`}>
          {profile.gender}
        </Badge>

        <div className="flex items-center justify-center mt-6 space-x-2">
          <CustomButton variant="outline" size="sm" className="flex items-center">
            <Mail className="mr-1 h-4 w-4" /> Message
          </CustomButton>
          <CustomButton variant="outline" size="sm" className="flex items-center">
            <Bookmark className="mr-1 h-4 w-4" /> Save
          </CustomButton>
        </div>
      </div>
    </IslamicPattern>
  );
};

export default ProfileCard;

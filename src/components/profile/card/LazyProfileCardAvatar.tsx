import { DatabaseProfile } from '@/types/profile';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import LazyImage from '@/components/ui/LazyImage';

interface LazyProfileCardAvatarProps {
  profile: DatabaseProfile;
  className?: string;
}

const LazyProfileCardAvatar = ({
  profile,
  className = 'h-32 w-32 ring-4 ring-offset-4 ring-islamic-teal/20 mb-4',
}: LazyProfileCardAvatarProps) => {
  return (
    <Avatar className={className}>
      {profile.profile_picture ? (
        <LazyImage
          src={profile.profile_picture}
          alt={`${profile.full_name}'s profile`}
          className="h-full w-full object-cover"
          placeholderClassName="bg-islamic-teal/20"
          fallbackSrc="https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=200&h=200&fit=crop&crop=face"
        />
      ) : (
        <AvatarFallback className="bg-islamic-teal text-white text-3xl">
          {profile.full_name?.[0] ?? '?'}
        </AvatarFallback>
      )}
    </Avatar>
  );
};

export default LazyProfileCardAvatar;

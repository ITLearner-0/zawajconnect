import { ProfileListProps, ProfileListItemProps } from './types';

// Individual profile list item
export const ProfileListItem = ({ profile, onNavigateToProfile }: ProfileListItemProps) => {
  return (
    <div
      key={profile.id}
      className="p-3 border rounded-md flex justify-between items-center hover:bg-islamic-cream/30 transition-colors cursor-pointer"
      onClick={() => onNavigateToProfile(profile.id)}
      role="button"
      tabIndex={0}
      aria-label={`View ${profile.first_name}'s profile details`}
    >
      <div>
        <p className="font-medium">
          {profile.first_name} {profile.last_name}
        </p>
        <div className="text-sm text-gray-500">
          {profile.age && <span className="mr-2">{profile.age} years</span>}
          {profile.education && <span className="mr-2">{profile.education}</span>}
          {profile.practice_level && <span>{profile.practice_level}</span>}
        </div>
      </div>
      <span className="text-sm text-gray-500">{profile.distance.toFixed(1)} km away</span>
    </div>
  );
};

// List of all profiles
const ProfileList = ({ profiles, onNavigateToProfile }: ProfileListProps) => {
  if (profiles.length === 0) {
    return <p className="text-sm text-gray-500">No matches found in your area.</p>;
  }

  return (
    <div className="space-y-2">
      {profiles.map((profile) => (
        <ProfileListItem
          key={profile.id}
          profile={profile}
          onNavigateToProfile={onNavigateToProfile}
        />
      ))}
    </div>
  );
};

export default ProfileList;

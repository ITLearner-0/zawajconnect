import React from 'react';
import LazyImage from '@/components/ui/LazyImage';

interface ProfilePictureProps {
  profileImageSrc?: string;
  firstName?: string;
}

const ProfilePicture = ({ profileImageSrc, firstName }: ProfilePictureProps) => {
  const fallbackImageSrc =
    'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=48&h=48&fit=crop&crop=face';

  if (!profileImageSrc) return null;

  return (
    <div className="flex-shrink-0">
      <LazyImage
        src={profileImageSrc}
        alt={`${firstName || 'User'}'s profile picture`}
        className="w-12 h-12 rounded-full object-cover"
        fallbackSrc={fallbackImageSrc}
        enableProgressiveLoading={true}
        enableRetry={true}
        enableResilientLoading={true}
        enableNetworkOptimization={true}
        maxRetries={2}
        showNetworkStatus={false}
      />
    </div>
  );
};

export default ProfilePicture;

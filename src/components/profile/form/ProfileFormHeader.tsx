
import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';

interface ProfileFormHeaderProps {
  title: string;
  description?: string;
}

const ProfileFormHeader: React.FC<ProfileFormHeaderProps> = ({ title, description }) => {
  return (
    <CardHeader>
      <CardTitle className="text-rose-800 dark:text-rose-200">{title}</CardTitle>
      {description && (
        <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
      )}
    </CardHeader>
  );
};

export default ProfileFormHeader;

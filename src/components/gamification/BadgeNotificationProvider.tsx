import React from 'react';
import { BadgeNotification } from './BadgeNotification';
import { useBadgeNotifications } from '@/hooks/gamification/useBadgeNotifications';

/**
 * Provider component that handles badge notifications globally
 * Should be placed in the app layout to show notifications across all pages
 */
export const BadgeNotificationProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const { currentNotification, closeNotification } = useBadgeNotifications();

  return (
    <>
      {children}
      
      {currentNotification && (
        <BadgeNotification
          badge={currentNotification.badge}
          onClose={closeNotification}
          show={true}
        />
      )}
    </>
  );
};

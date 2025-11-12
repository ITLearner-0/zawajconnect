import React from 'react';
import { useAchievementNotifications } from '@/hooks/useAchievementNotifications';

interface AchievementNotificationProviderProps {
  children: React.ReactNode;
}

/**
 * Provider qui active automatiquement les notifications d'achievements
 * À placer au niveau de l'application pour que tous les utilisateurs
 * reçoivent des notifications en temps réel
 */
export function AchievementNotificationProvider({
  children,
}: AchievementNotificationProviderProps) {
  // Active automatiquement les notifications
  useAchievementNotifications();

  return <>{children}</>;
}

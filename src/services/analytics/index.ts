
// Re-export all analytics functions from their respective modules
export { getAnalyticsData } from './core';
export { getEmergencyStats } from './emergency';
export { getModerationStats } from './moderation';
export { getUserActivityStats } from './userActivity';
export { getWaliStats } from './wali';

// Re-export types for convenience
export type {
  AnalyticsData,
  EmergencyStats,
  ModerationStats,
  UserActivityStats,
  WaliStats,
  MessageTrend,
  DemographicStat,
  FlagByType,
  EmergencyReport,
  SupervisionTrend
} from '@/types/analytics';

/**
 * Profile Redesign Components
 *
 * Centralized export for all redesigned profile components.
 * Part of Phase 1: Foundations of the profile redesign implementation.
 */

// Main Components
export { default as HeroProfileSection } from './HeroProfileSection';
export { default as ProfileSidebar } from './ProfileSidebar';
export { default as ProfileSection } from './ProfileSection';

// Section Sub-components
export {
  InfoGrid,
  InfoItem,
  SectionContent,
  SectionText,
  EmptyState,
} from './ProfileSection';

// Stat Components
export {
  StatCard,
  StatItem,
  ProgressItem,
  CircularProgress,
  MetricRow,
  ComparisonBar,
  getScoreColor,
  formatNumber,
} from './StatComponents';

// Re-export ProgressItem from ProfileSidebar for backward compatibility
export { ProgressItem as SidebarProgressItem } from './ProfileSidebar';

// Type exports
export type { StatCardProps, StatItemProps, ProgressItemProps, CircularProgressProps, MetricRowProps, ComparisonBarProps } from './StatComponents';

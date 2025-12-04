/**
 * Profile Redesign Components
 *
 * Centralized export for all redesigned profile components.
 * Includes Phase 1 (Foundations) and Phase 2 (Content Sections).
 */

// Main Components (Phase 1)
export { default as HeroProfileSection } from './HeroProfileSection';
export { default as ProfileSidebar } from './ProfileSidebar';
export { default as ProfileSection } from './ProfileSection';

// Section Sub-components (Phase 1)
export {
  InfoGrid,
  InfoItem,
  SectionContent,
  SectionText,
  EmptyState,
} from './ProfileSection';

// Stat Components (Phase 1)
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

// Content Sections (Phase 2)
export {
  AboutMeSection,
  IslamicPreferencesSection,
  EducationCareerSection,
  WaliInfoSection,
  PhotoGallerySection,
} from './sections';

// Re-export ProgressItem from ProfileSidebar for backward compatibility
export { ProgressItem as SidebarProgressItem } from './ProfileSidebar';

// Type exports
export type { StatCardProps, StatItemProps, ProgressItemProps, CircularProgressProps, MetricRowProps, ComparisonBarProps } from './StatComponents';

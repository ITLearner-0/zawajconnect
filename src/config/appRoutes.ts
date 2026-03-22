import { ComponentType, lazy } from 'react';

/**
 * Retry dynamic imports on failure (handles stale cache after deployments).
 * When Vercel serves a new build, old chunk filenames become 404s.
 * This retries the import once, and if it still fails, reloads the page.
 */
function lazyRetry<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
) {
  return lazy(() =>
    importFn().catch((error) => {
      // Retry once
      return importFn().catch(() => {
        // If still failing, force a full page reload to get the new assets
        const hasReloaded = sessionStorage.getItem('lazy_reload');
        if (!hasReloaded) {
          sessionStorage.setItem('lazy_reload', '1');
          window.location.reload();
        }
        throw error;
      });
    })
  );
}

// Import Index directly (no lazy loading for landing page)
import Index from '@/pages/Index';

// Lazy load all other pages to reduce initial bundle size
// Public pages (loaded on demand)
const Auth = lazyRetry(() => import('@/pages/Auth'));
const ResetPassword = lazyRetry(() => import('@/pages/ResetPassword'));
const PrivacyPolicy = lazyRetry(() => import('@/pages/PrivacyPolicy'));
const TermsOfService = lazyRetry(() => import('@/pages/TermsOfService'));
const RefundPolicy = lazyRetry(() => import('@/pages/RefundPolicy'));
const CommunityGuidelines = lazyRetry(() => import('@/pages/CommunityGuidelines'));
const CookiePolicy = lazyRetry(() => import('@/pages/CookiePolicy'));
const FAQ = lazyRetry(() => import('@/pages/FAQ'));
const InvitationAuth = lazyRetry(() => import('@/pages/InvitationAuth'));
const InvitationAccept = lazyRetry(() => import('@/pages/InvitationAccept'));
const Status = lazyRetry(() => import('@/pages/Status'));

// Special routes (onboarding flows)
const Onboarding = lazyRetry(() => import('@/pages/Onboarding'));
const WaliOnboarding = lazyRetry(() => import('@/pages/WaliOnboarding'));
const SubscriptionSuccess = lazyRetry(() => import('@/pages/SubscriptionSuccess'));
const SubscriptionCanceled = lazyRetry(() => import('@/pages/SubscriptionCanceled'));

// Protected pages (user features)
const Dashboard = lazyRetry(() => import('@/pages/Dashboard'));
const Browse = lazyRetry(() => import('@/pages/Browse'));
const Matches = lazyRetry(() => import('@/pages/Matches'));
const Visiteurs = lazyRetry(() => import('@/pages/Visiteurs'));
const Chat = lazyRetry(() => import('@/pages/Chat'));
const ProfilePage = lazyRetry(() => import('@/pages/profile/ProfilePage'));
const Privacy = lazyRetry(() => import('@/pages/Privacy'));
const Settings = lazyRetry(() => import('@/pages/Settings'));
const PaymentHistory = lazyRetry(() => import('@/pages/PaymentHistory'));
const Favorites = lazyRetry(() => import('@/pages/Favorites'));
const NotesManager = lazyRetry(() => import('@/pages/NotesManager'));
const Gamification = lazyRetry(() => import('@/pages/Gamification'));
const BadgeLeaderboard = lazyRetry(() => import('@/pages/BadgeLeaderboard'));

// Matching & Compatibility
const AdvancedMatching = lazyRetry(() => import('@/pages/AdvancedMatching'));
const CompatibilityTest = lazyRetry(() => import('@/pages/CompatibilityTest'));
const CompatibilityInsightsPage = lazyRetry(() => import('@/pages/CompatibilityInsights'));
const Compare = lazyRetry(() => import('@/pages/Compare'));

// Daily Question Feature
const DailyQuestion = lazyRetry(() => import('@/pages/daily-question/DailyQuestion'));
const QuestionHistory = lazyRetry(() => import('@/pages/daily-question/QuestionHistory'));
const MatchesAnswers = lazyRetry(() => import('@/pages/daily-question/MatchesAnswers'));
const AdminQuestions = lazyRetry(() => import('@/pages/daily-question/AdminQuestions'));

// Family features
const Family = lazyRetry(() => import('@/pages/Family'));
const WaliDashboard = lazyRetry(() => import('@/pages/WaliDashboard'));
const WaliAccess = lazyRetry(() => import('@/pages/WaliAccess'));
const WaliRegistration = lazyRetry(() => import('@/pages/WaliRegistration'));
const MatchApproval = lazyRetry(() => import('@/pages/MatchApproval'));
const FamilyAnalyticsPage = lazyRetry(() => import('@/pages/FamilyAnalytics'));
const FamilySupervision = lazyRetry(() => import('@/pages/FamilySupervision'));
const FamilyNotifications = lazyRetry(() => import('@/pages/FamilyNotifications'));
const FamilyAccess = lazyRetry(() => import('@/pages/FamilyAccess'));
const FamilyAccessPortal = lazyRetry(() => import('@/components/FamilyAccessPortal'));
const FamilySupervisionPanel = lazyRetry(() => import('@/components/FamilySupervisionPanel'));
const WaliMonitoring = lazyRetry(() => import('@/pages/WaliMonitoring'));
const AdminWaliAlerts = lazyRetry(() => import('@/pages/AdminWaliAlerts'));
const AdminWaliAlertsDashboard = lazyRetry(() => import('@/pages/AdminWaliAlertsDashboard'));
const WaliAdmin = lazyRetry(() => import('@/pages/WaliAdmin'));

// Islamic tools
const IslamicTools = lazyRetry(() => import('@/pages/IslamicTools'));
const Guidance = lazyRetry(() => import('@/pages/Guidance'));

// New Features - Phase 2 (UI Prototypes)
const CoupleQuestions = lazyRetry(() => import('@/pages/CoupleQuestions'));
const PrivacyLayers = lazyRetry(() => import('@/pages/PrivacyLayers'));
const CompatibilityDeepDive = lazyRetry(() => import('@/pages/CompatibilityDeepDive'));
const CommunityVerification = lazyRetry(() => import('@/pages/CommunityVerification'));
const ValuesMatching = lazyRetry(() => import('@/pages/ValuesMatching'));
const IstikharahAssistant = lazyRetry(() => import('@/pages/IstikharahAssistant'));
const MahramMode = lazyRetry(() => import('@/pages/MahramMode'));
const SmartTiming = lazyRetry(() => import('@/pages/SmartTiming'));
const MahrCalculator = lazyRetry(() => import('@/pages/MahrCalculator'));
const ImamDashboard = lazyRetry(() => import('@/pages/ImamDashboard'));

// New Features - Phase 2 (Production: Supabase-backed)
const NikahAdvisor = lazyRetry(() => import('@/pages/NikahAdvisor'));
const IstikharaSession = lazyRetry(() => import('@/pages/IstikharaSession'));

// Admin & Moderation
const Admin = lazyRetry(() => import('@/pages/Admin'));
const ABTestingDashboard = lazyRetry(() => import('@/pages/ABTestingDashboard'));
const AdminUserProfile = lazyRetry(() => import('@/pages/AdminUserProfile'));
const AdminWaliRegistrations = lazyRetry(() => import('@/pages/AdminWaliRegistrations'));
const AdminWaliMonitoring = lazyRetry(() => import('@/pages/AdminWaliMonitoring'));
const AdminWaliAuditTrail = lazyRetry(() => import('@/pages/AdminWaliAuditTrail'));
const AdminWaliDashboard = lazyRetry(() => import('@/pages/AdminWaliDashboard'));
const AdminWaliPermissions = lazyRetry(() => import('@/pages/AdminWaliPermissions'));
const AdminWaliUserDetails = lazyRetry(() => import('@/pages/AdminWaliUserDetails'));
const AdminMatchingConfig = lazyRetry(() => import('@/pages/AdminMatchingConfig'));
const AdminUsers = lazyRetry(() => import('@/pages/AdminUsers'));
const ModerationTest = lazyRetry(() => import('@/pages/ModerationTest'));
const ModerationTests = lazyRetry(() => import('@/pages/ModerationTests'));

// Demo & Testing pages
const ProfileDemo = lazyRetry(() => import('@/pages/ProfileDemo'));

// Phase 3: New Profile View (Unified)
const ProfileView = lazyRetry(() => import('@/pages/ProfileView'));

// 404 page
const NotFound = lazyRetry(() => import('@/pages/NotFound'));

export interface AppRouteConfig {
  path: string;
  component: ComponentType;
  protected?: boolean;
  requiresOnboarding?: boolean;
}

// Public routes - no authentication required
export const publicRoutes: AppRouteConfig[] = [
  { path: '/', component: Index },
  { path: '/auth', component: Auth },
  { path: '/reset-password', component: ResetPassword },
  { path: '/wali', component: WaliAccess },
  { path: '/privacy-policy', component: PrivacyPolicy },
  { path: '/terms-of-service', component: TermsOfService },
  { path: '/refund-policy', component: RefundPolicy },
  { path: '/community-guidelines', component: CommunityGuidelines },
  { path: '/cookie-policy', component: CookiePolicy },
  { path: '/subscription-canceled', component: SubscriptionCanceled },
  { path: '/invitation-auth', component: InvitationAuth },
  { path: '/invitation', component: InvitationAccept },
  { path: '/invitation/accept', component: InvitationAccept },
  { path: '/invitation-accept', component: InvitationAccept },
  { path: '/status', component: Status },
  { path: '/profile-demo', component: ProfileDemo }, // Demo page for Phase 1 redesign
];

// Special routes - protected but may have different requirements
export const specialRoutes: AppRouteConfig[] = [
  {
    path: '/onboarding',
    component: Onboarding,
    protected: true,
    requiresOnboarding: false,
  },
  {
    path: '/wali-onboarding',
    component: WaliOnboarding,
    protected: true,
    requiresOnboarding: false,
  },
  {
    path: '/wali-registration',
    component: WaliRegistration,
    protected: true,
    requiresOnboarding: false,
  },
  {
    path: '/subscription-success',
    component: SubscriptionSuccess,
    protected: true,
    requiresOnboarding: false,
  },
];

// Protected routes - require authentication and complete profile
export const protectedRoutes: AppRouteConfig[] = [
  { path: '/dashboard', component: Dashboard },
  // Profile routes - Clean architecture (Phase 4)
  { path: '/profile', component: ProfileView }, // View own profile
  { path: '/profile/edit', component: ProfilePage }, // Edit profile + onboarding
  { path: '/profile/:id', component: ProfileView }, // View other users' profiles
  // Legacy redirects - maintained for backward compatibility
  { path: '/enhanced-profile', component: ProfileView }, // Redirect to /profile
  { path: '/profile-view', component: ProfileView }, // Redirect to /profile
  { path: '/profile-view/:id', component: ProfileView }, // Redirect to /profile/:id
  { path: '/advanced-matching', component: AdvancedMatching },
  { path: '/browse', component: Browse },
  { path: '/favorites', component: Favorites },
  { path: '/notes', component: NotesManager },
  { path: '/matches', component: Matches },
  { path: '/visiteurs', component: Visiteurs },
  { path: '/chat', component: Chat },
  { path: '/chat/:matchId', component: Chat },
  { path: '/privacy', component: Privacy },
  { path: '/family', component: Family },
  { path: '/guidance', component: Guidance },
  { path: '/admin', component: Admin },
  { path: '/ab-testing', component: ABTestingDashboard },
  { path: '/admin/user/:userId', component: AdminUserProfile },
  { path: '/admin/wali-registrations', component: AdminWaliRegistrations },
  { path: '/admin/wali-monitoring', component: AdminWaliMonitoring },
  { path: '/admin/wali-alerts', component: AdminWaliAlertsDashboard },
  { path: '/admin/wali', component: WaliAdmin },
  { path: '/admin/dashboard', component: AdminWaliDashboard },
  { path: '/admin/wali-audit', component: AdminWaliAuditTrail },
  { path: '/admin/wali-permissions', component: AdminWaliPermissions },
  { path: '/admin/wali-permissions/:userId', component: AdminWaliUserDetails },
  { path: '/admin/matching-config', component: AdminMatchingConfig },
  { path: '/admin/users', component: AdminUsers },
  { path: '/moderation-test', component: ModerationTest },
  { path: '/wali-dashboard', component: WaliDashboard },
  { path: '/wali-monitoring', component: WaliMonitoring },
  { path: '/match-approval', component: MatchApproval },
  { path: '/family-analytics', component: FamilyAnalyticsPage },
  { path: '/moderation-tests', component: ModerationTests },
  { path: '/faq', component: FAQ },
  { path: '/settings', component: Settings },
  { path: '/payment-history', component: PaymentHistory },
  { path: '/islamic-tools', component: IslamicTools },
  { path: '/family-supervision', component: FamilySupervision },
  { path: '/family-notifications', component: FamilyNotifications },
  { path: '/family-access', component: FamilyAccess },
  { path: '/family-portal', component: FamilyAccessPortal },
  { path: '/family-supervision-panel', component: FamilySupervisionPanel },
  { path: '/compatibility-test', component: CompatibilityTest },
  { path: '/compatibility-insights', component: CompatibilityInsightsPage },
  { path: '/compare', component: Compare },
  { path: '/gamification', component: Gamification },
  { path: '/badge-leaderboard', component: BadgeLeaderboard },
  // New Features - Phase 2
  { path: '/couple-questions', component: CoupleQuestions },
  { path: '/privacy-layers', component: PrivacyLayers },
  { path: '/compatibility-deep-dive', component: CompatibilityDeepDive },
  { path: '/community-verification', component: CommunityVerification },
  { path: '/values-matching', component: ValuesMatching },
  { path: '/istikharah', component: IstikharahAssistant },
  { path: '/mahram-mode', component: MahramMode },
  { path: '/smart-timing', component: SmartTiming },
  { path: '/mahr-calculator', component: MahrCalculator },
  { path: '/imam-dashboard', component: ImamDashboard },
  // New Features - Phase 2 (Production: Supabase-backed)
  { path: '/nikah-advisor', component: NikahAdvisor },
  { path: '/istikhara-session', component: IstikharaSession },
  // Daily Question
  { path: '/daily-question', component: DailyQuestion },
  { path: '/daily-question/history', component: QuestionHistory },
  { path: '/daily-question/matches', component: MatchesAnswers },
  { path: '/admin/daily-questions', component: AdminQuestions },
];

// Catch all route
export const notFoundRoute: AppRouteConfig = {
  path: '*',
  component: NotFound,
};

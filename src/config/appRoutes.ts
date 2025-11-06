import { ComponentType, lazy } from 'react';

// Import Index directly (no lazy loading for landing page)
import Index from '@/pages/Index';

// Lazy load all other pages to reduce initial bundle size
// Public pages (loaded on demand)
const Auth = lazy(() => import('@/pages/Auth'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
const PrivacyPolicy = lazy(() => import('@/pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('@/pages/TermsOfService'));
const RefundPolicy = lazy(() => import('@/pages/RefundPolicy'));
const CommunityGuidelines = lazy(() => import('@/pages/CommunityGuidelines'));
const CookiePolicy = lazy(() => import('@/pages/CookiePolicy'));
const FAQ = lazy(() => import('@/pages/FAQ'));
const InvitationAuth = lazy(() => import('@/pages/InvitationAuth'));
const InvitationAccept = lazy(() => import('@/pages/InvitationAccept'));

// Special routes (onboarding flows)
const Onboarding = lazy(() => import('@/pages/Onboarding'));
const WaliOnboarding = lazy(() => import('@/pages/WaliOnboarding'));
const SubscriptionSuccess = lazy(() => import('@/pages/SubscriptionSuccess'));
const SubscriptionCanceled = lazy(() => import('@/pages/SubscriptionCanceled'));

// Protected pages (user features)
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Browse = lazy(() => import('@/pages/Browse'));
const Matches = lazy(() => import('@/pages/Matches'));
const Chat = lazy(() => import('@/pages/Chat'));
const Profile = lazy(() => import('@/pages/Profile'));
const EnhancedProfile = lazy(() => import('@/pages/EnhancedProfile'));
const Privacy = lazy(() => import('@/pages/Privacy'));
const Settings = lazy(() => import('@/pages/Settings'));
const PaymentHistory = lazy(() => import('@/pages/PaymentHistory'));
const Favorites = lazy(() => import('@/pages/Favorites'));

// Matching & Compatibility
const AdvancedMatching = lazy(() => import('@/pages/AdvancedMatching'));
const CompatibilityTest = lazy(() => import('@/pages/CompatibilityTest'));
const CompatibilityInsightsPage = lazy(() => import('@/pages/CompatibilityInsights'));
const Compare = lazy(() => import('@/pages/Compare'));

// Family features
const Family = lazy(() => import('@/pages/Family'));
const WaliDashboard = lazy(() => import('@/pages/WaliDashboard'));
const WaliAccess = lazy(() => import('@/pages/WaliAccess'));
const MatchApproval = lazy(() => import('@/pages/MatchApproval'));
const FamilyAnalyticsPage = lazy(() => import('@/pages/FamilyAnalytics'));
const FamilySupervision = lazy(() => import('@/pages/FamilySupervision'));
const FamilyNotifications = lazy(() => import('@/pages/FamilyNotifications'));
const FamilyAccess = lazy(() => import('@/pages/FamilyAccess'));
const FamilyAccessPortal = lazy(() => import('@/components/FamilyAccessPortal'));
const FamilySupervisionPanel = lazy(() => import('@/components/FamilySupervisionPanel'));

// Islamic tools
const IslamicTools = lazy(() => import('@/pages/IslamicTools'));
const Guidance = lazy(() => import('@/pages/Guidance'));

// Admin & Moderation
const Admin = lazy(() => import('@/pages/Admin'));
const AdminUserProfile = lazy(() => import('@/pages/AdminUserProfile'));
const ModerationTest = lazy(() => import('@/pages/ModerationTest'));
const ModerationTests = lazy(() => import('@/pages/ModerationTests'));

// 404 page
const NotFound = lazy(() => import('@/pages/NotFound'));

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
];

// Special routes - protected but may have different requirements
export const specialRoutes: AppRouteConfig[] = [
  { 
    path: '/onboarding', 
    component: Onboarding, 
    protected: true, 
    requiresOnboarding: false 
  },
  { 
    path: '/wali-onboarding', 
    component: WaliOnboarding, 
    protected: true, 
    requiresOnboarding: false 
  },
  { 
    path: '/subscription-success', 
    component: SubscriptionSuccess, 
    protected: true, 
    requiresOnboarding: false 
  },
];

// Protected routes - require authentication and complete profile
export const protectedRoutes: AppRouteConfig[] = [
  { path: '/dashboard', component: Dashboard },
  { path: '/enhanced-profile', component: EnhancedProfile },
  { path: '/profile', component: EnhancedProfile },
  { path: '/advanced-matching', component: AdvancedMatching },
  { path: '/browse', component: Browse },
  { path: '/favorites', component: Favorites },
  { path: '/matches', component: Matches },
  { path: '/chat', component: Chat },
  { path: '/chat/:matchId', component: Chat },
  { path: '/profile/:userId', component: Profile },
  { path: '/privacy', component: Privacy },
  { path: '/family', component: Family },
  { path: '/guidance', component: Guidance },
  { path: '/admin', component: Admin },
  { path: '/admin/user/:userId', component: AdminUserProfile },
  { path: '/moderation-test', component: ModerationTest },
  { path: '/wali-dashboard', component: WaliDashboard },
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
];

// Catch all route
export const notFoundRoute: AppRouteConfig = {
  path: '*',
  component: NotFound,
};
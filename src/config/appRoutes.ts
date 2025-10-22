import { ComponentType } from 'react';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import Browse from '@/pages/Browse';
import Matches from '@/pages/Matches';
import Chat from '@/pages/Chat';
import Profile from '@/pages/Profile';
import Privacy from '@/pages/Privacy';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import Family from '@/pages/Family';
import Guidance from '@/pages/Guidance';
import ModerationTest from '@/pages/ModerationTest';
import WaliDashboard from '@/pages/WaliDashboard';
import WaliAccess from '@/pages/WaliAccess';
import MatchApproval from '@/pages/MatchApproval';
import FamilyAnalyticsPage from '@/pages/FamilyAnalytics';
import ModerationTests from '@/pages/ModerationTests';
import Admin from '@/pages/Admin';
import FAQ from '@/pages/FAQ';
import Settings from '@/pages/Settings';
import IslamicTools from '@/pages/IslamicTools';
import FamilySupervision from '@/pages/FamilySupervision';
import FamilyNotifications from '@/pages/FamilyNotifications';
import InvitationAuth from '@/pages/InvitationAuth';
import InvitationAccept from '@/pages/InvitationAccept';
import FamilyAccess from '@/pages/FamilyAccess';
import FamilyAccessPortal from '@/components/FamilyAccessPortal';
import FamilySupervisionPanel from '@/components/FamilySupervisionPanel';
import CompatibilityTest from '@/pages/CompatibilityTest';
import CompatibilityInsightsPage from '@/pages/CompatibilityInsights';
import EnhancedProfile from '@/pages/EnhancedProfile';
import AdvancedMatching from '@/pages/AdvancedMatching';
import Onboarding from '@/pages/Onboarding';
import WaliOnboarding from '@/pages/WaliOnboarding';
import SubscriptionSuccess from '@/pages/SubscriptionSuccess';
import NotFound from '@/pages/NotFound';
import TermsOfService from '@/pages/TermsOfService';
import RefundPolicy from '@/pages/RefundPolicy';
import CommunityGuidelines from '@/pages/CommunityGuidelines';
import CookiePolicy from '@/pages/CookiePolicy';
import SubscriptionCanceled from '@/pages/SubscriptionCanceled';

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
  { path: '/matches', component: Matches },
  { path: '/chat', component: Chat },
  { path: '/chat/:matchId', component: Chat },
  { path: '/profile/:userId', component: Profile },
  { path: '/privacy', component: Privacy },
  { path: '/family', component: Family },
  { path: '/guidance', component: Guidance },
  { path: '/admin', component: Admin },
  { path: '/moderation-test', component: ModerationTest },
  { path: '/wali-dashboard', component: WaliDashboard },
  { path: '/match-approval', component: MatchApproval },
  { path: '/family-analytics', component: FamilyAnalyticsPage },
  { path: '/moderation-tests', component: ModerationTests },
  { path: '/faq', component: FAQ },
  { path: '/settings', component: Settings },
  { path: '/islamic-tools', component: IslamicTools },
  { path: '/family-supervision', component: FamilySupervision },
  { path: '/family-notifications', component: FamilyNotifications },
  { path: '/family-access', component: FamilyAccess },
  { path: '/family-portal', component: FamilyAccessPortal },
  { path: '/family-supervision-panel', component: FamilySupervisionPanel },
  { path: '/compatibility-test', component: CompatibilityTest },
  { path: '/compatibility-insights', component: CompatibilityInsightsPage },
];

// Catch all route
export const notFoundRoute: AppRouteConfig = {
  path: '*',
  component: NotFound,
};
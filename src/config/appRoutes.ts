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
import NotFound from '@/pages/NotFound';

export interface AppRouteConfig {
  path: string;
  component: ComponentType;
  protected?: boolean;
  requiresOnboarding?: boolean;
  layout?: 'public' | 'auth' | 'protected' | 'minimal';
}

// Public routes - no authentication required
export const publicRoutes: AppRouteConfig[] = [
  { path: '/', component: Index, layout: 'public' },
  { path: '/auth', component: Auth, layout: 'auth' },
  { path: '/wali', component: WaliAccess, layout: 'public' },
  { path: '/privacy-policy', component: PrivacyPolicy, layout: 'public' },
  { path: '/invitation-auth', component: InvitationAuth, layout: 'auth' },
  { path: '/invitation', component: InvitationAccept, layout: 'minimal' },
  { path: '/invitation/accept', component: InvitationAccept, layout: 'minimal' },
];

// Special routes - protected but may have different requirements
export const specialRoutes: AppRouteConfig[] = [
  { 
    path: '/onboarding', 
    component: Onboarding, 
    protected: true, 
    requiresOnboarding: false,
    layout: 'minimal'
  },
];

// Protected routes - require authentication and complete profile
export const protectedRoutes: AppRouteConfig[] = [
  { path: '/dashboard', component: Dashboard, layout: 'protected' },
  { path: '/enhanced-profile', component: EnhancedProfile, layout: 'protected' },
  { path: '/profile', component: EnhancedProfile, layout: 'protected' },
  { path: '/advanced-matching', component: AdvancedMatching, layout: 'protected' },
  { path: '/browse', component: Browse, layout: 'protected' },
  { path: '/matches', component: Matches, layout: 'protected' },
  { path: '/chat', component: Chat, layout: 'protected' },
  { path: '/chat/:matchId', component: Chat, layout: 'protected' },
  { path: '/profile/:userId', component: Profile, layout: 'protected' },
  { path: '/privacy', component: Privacy, layout: 'protected' },
  { path: '/family', component: Family, layout: 'protected' },
  { path: '/guidance', component: Guidance, layout: 'protected' },
  { path: '/admin', component: Admin, layout: 'protected' },
  { path: '/moderation-test', component: ModerationTest, layout: 'protected' },
  { path: '/wali-dashboard', component: WaliDashboard, layout: 'protected' },
  { path: '/match-approval', component: MatchApproval, layout: 'protected' },
  { path: '/family-analytics', component: FamilyAnalyticsPage, layout: 'protected' },
  { path: '/moderation-tests', component: ModerationTests, layout: 'protected' },
  { path: '/faq', component: FAQ, layout: 'protected' },
  { path: '/settings', component: Settings, layout: 'protected' },
  { path: '/islamic-tools', component: IslamicTools, layout: 'protected' },
  { path: '/family-supervision', component: FamilySupervision, layout: 'protected' },
  { path: '/family-notifications', component: FamilyNotifications, layout: 'protected' },
  { path: '/family-access', component: FamilyAccess, layout: 'protected' },
  { path: '/family-portal', component: FamilyAccessPortal, layout: 'protected' },
  { path: '/family-supervision-panel', component: FamilySupervisionPanel, layout: 'protected' },
  { path: '/compatibility-test', component: CompatibilityTest, layout: 'protected' },
  { path: '/compatibility-insights', component: CompatibilityInsightsPage, layout: 'protected' },
];

// Catch all route
export const notFoundRoute: AppRouteConfig = {
  path: '*',
  component: NotFound,
};
export interface RouteConfig {
  path: string;
  component: string;
  label: string;
  requiresAuth: boolean;
  requiresOnboarding?: boolean;
  icon?: string;
  category?: 'main' | 'family' | 'tools' | 'admin' | 'matching';
  roles?: string[];
}

export const routes: RouteConfig[] = [
  // Public routes
  {
    path: '/',
    component: 'Index',
    label: 'Accueil',
    requiresAuth: false,
    category: 'main'
  },
  {
    path: '/auth',
    component: 'Auth',
    label: 'Connexion',
    requiresAuth: false,
    category: 'main'
  },
  {
    path: '/privacy-policy',
    component: 'PrivacyPolicy',
    label: 'Politique de Confidentialité',
    requiresAuth: false,
    category: 'main'
  },

  // Main app routes
  {
    path: '/dashboard',
    component: 'Dashboard',
    label: 'Tableau de Bord',
    requiresAuth: true,
    icon: 'Home',
    category: 'main'
  },
  {
    path: '/enhanced-profile',
    component: 'EnhancedProfile',
    label: 'Mon Profil',
    requiresAuth: true,
    icon: 'User',
    category: 'main'
  },
  {
    path: '/browse',
    component: 'Browse',
    label: 'Découvrir',
    requiresAuth: true,
    icon: 'Search',
    category: 'main'
  },
  {
    path: '/matches',
    component: 'Matches',
    label: 'Mes Matches',
    requiresAuth: true,
    icon: 'Heart',
    category: 'main'
  },
  {
    path: '/chat',
    component: 'Chat',
    label: 'Messages',
    requiresAuth: true,
    icon: 'MessageCircle',
    category: 'main'
  },

  // Matching & Compatibility
  {
    path: '/advanced-matching',
    component: 'AdvancedMatching',
    label: 'Matching Avancé',
    requiresAuth: true,
    icon: 'Zap',
    category: 'matching'
  },
  {
    path: '/compatibility-test',
    component: 'CompatibilityTest',
    label: 'Test de Compatibilité',
    requiresAuth: true,
    icon: 'Target',
    category: 'matching'
  },
  {
    path: '/compatibility-insights',
    component: 'CompatibilityInsights',
    label: 'Mes Insights',
    requiresAuth: true,
    icon: 'BarChart3',
    category: 'matching'
  },

  // Islamic Tools
  {
    path: '/guidance',
    component: 'Guidance',
    label: 'Guide Islamique',
    requiresAuth: true,
    icon: 'BookOpen',
    category: 'tools'
  },
  {
    path: '/islamic-tools',
    component: 'IslamicTools',
    label: 'Outils Islamiques',
    requiresAuth: true,
    icon: 'Compass',
    category: 'tools'
  },

  // Family & Supervision
  {
    path: '/family',
    component: 'Family',
    label: 'Famille',
    requiresAuth: true,
    icon: 'Users',
    category: 'family'
  },
  {
    path: '/wali-dashboard',
    component: 'WaliDashboard',
    label: 'Tableau de Bord Wali',
    requiresAuth: true,
    icon: 'Shield',
    category: 'family',
    roles: ['wali', 'admin']
  },
  {
    path: '/match-approval',
    component: 'MatchApproval',
    label: 'Approbation Matches',
    requiresAuth: true,
    icon: 'CheckCircle',
    category: 'family',
    roles: ['wali', 'admin']
  },
  {
    path: '/family-analytics',
    component: 'FamilyAnalytics',
    label: 'Analytics Famille',
    requiresAuth: true,
    icon: 'TrendingUp',
    category: 'family',
    roles: ['wali', 'admin']
  },
  {
    path: '/family-supervision',
    component: 'FamilySupervision',
    label: 'Supervision Familiale',
    requiresAuth: true,
    icon: 'Eye',
    category: 'family',
    roles: ['wali', 'admin']
  },

  // Settings & Admin
  {
    path: '/settings',
    component: 'Settings',
    label: 'Paramètres',
    requiresAuth: true,
    icon: 'Settings',
    category: 'main'
  },
  {
    path: '/privacy',
    component: 'Privacy',
    label: 'Confidentialité',
    requiresAuth: true,
    icon: 'Lock',
    category: 'main'
  },
  {
    path: '/admin',
    component: 'Admin',
    label: 'Administration',
    requiresAuth: true,
    icon: 'Crown',
    category: 'admin',
    roles: ['admin']
  },
  {
    path: '/faq',
    component: 'FAQ',
    label: 'FAQ',
    requiresAuth: true,
    icon: 'HelpCircle',
    category: 'main'
  }
];

export const getRoutesByCategory = (category: string) => {
  return routes.filter(route => route.category === category);
};

export const getRouteByPath = (path: string) => {
  return routes.find(route => route.path === path);
};

export const getNavigationRoutes = () => {
  return routes.filter(route => route.requiresAuth && route.icon);
};
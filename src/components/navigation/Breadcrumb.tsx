import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

const routeLabels: Record<string, string> = {
  '/dashboard': 'Tableau de Bord',
  '/enhanced-profile': 'Mon Profil',
  '/browse': 'Découvrir',
  '/matches': 'Mes Matches',
  '/chat': 'Messages',
  '/compatibility-test': 'Test de Compatibilité',
  '/compatibility-insights': 'Mes Insights',
  '/advanced-matching': 'Matching Avancé',
  '/guidance': 'Guide Islamique',
  '/islamic-tools': 'Outils Islamiques',
  '/settings': 'Paramètres',
  '/wali-dashboard': 'Tableau de Bord Wali',
  '/match-approval': 'Approbation Matches',
  '/family-analytics': 'Analytics Famille',
  '/family-supervision': 'Supervision Familiale',
  '/privacy': 'Confidentialité',
  '/family': 'Famille',
  '/admin': 'Administration',
  '/faq': 'FAQ'
};

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const getBreadcrumbItems = (): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = [
      { label: 'Accueil', path: '/dashboard' }
    ];

    let currentPath = '';
    pathnames.forEach((pathname, index) => {
      currentPath += `/${pathname}`;
      
      // Skip dynamic segments (like user IDs)
      if (pathname.match(/^[a-f0-9-]{36}$/)) {
        return;
      }

      const label = routeLabels[currentPath];
      if (label) {
        items.push({
          label,
          path: index === pathnames.length - 1 ? undefined : currentPath
        });
      }
    });

    return items;
  };

  const breadcrumbItems = getBreadcrumbItems();

  // Don't show breadcrumb on home page or if only one item
  if (location.pathname === '/dashboard' || breadcrumbItems.length <= 1) {
    return null;
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
      {breadcrumbItems.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          {index > 0 && <ChevronRight className="h-4 w-4" />}
          {item.path ? (
            <Link
              to={item.path}
              className="hover:text-foreground transition-colors"
            >
              {index === 0 && <Home className="h-4 w-4 inline mr-1" />}
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
};

export default Breadcrumb;
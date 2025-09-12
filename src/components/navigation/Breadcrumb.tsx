import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getRouteByPath } from '@/config/routes';
import { useNavigation } from '@/components/navigation/NavigationProvider';
import { Button } from '@/components/ui/button';

interface BreadcrumbItem {
  label: string;
  path?: string;
}


const Breadcrumb = () => {
  const location = useLocation();
  const { canGoBack, goBack } = useNavigation();
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

      const route = getRouteByPath(currentPath);
      if (route) {
        items.push({
          label: route.label,
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
    <div className="flex items-center justify-between mb-6">
      <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
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
      
      {/* Back Button */}
      {canGoBack && (
        <Button
          variant="ghost"
          size="sm"
          onClick={goBack}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
      )}
    </div>
  );
};

export default Breadcrumb;
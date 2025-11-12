// @ts-nocheck
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getRouteByPath, getNavigationRoutes } from '@/config/routes';
import { useNavigation } from '@/components/navigation/NavigationProvider';
import { ArrowRight } from 'lucide-react';
import { Icon } from '@/components/ui/icon';

const NavigationSuggestions = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { navigationHistory } = useNavigation();
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const currentRoute = getRouteByPath(location.pathname);
  const allRoutes = getNavigationRoutes();

  useEffect(() => {
    generateSuggestions();
  }, [location.pathname, navigationHistory]);

  const generateSuggestions = () => {
    const recentRoutes = navigationHistory
      .slice(-5)
      .map((path) => getRouteByPath(path))
      .filter(Boolean);

    // Get frequently visited routes (mock data for now)
    const frequentRoutes = ['/matches', '/chat', '/compatibility-test']
      .map((path) => getRouteByPath(path))
      .filter(Boolean);

    // Get contextual suggestions based on current route
    let contextualRoutes: unknown[] = [];

    if (currentRoute?.category === 'main') {
      contextualRoutes = allRoutes.filter(
        (route) => route.category === 'matching' || route.category === 'tools'
      );
    } else if (currentRoute?.category === 'matching') {
      contextualRoutes = allRoutes.filter(
        (route) => route.category === 'main' && route.path !== '/dashboard'
      );
    }

    const newSuggestions = [
      ...recentRoutes.slice(0, 2).map((route) => ({
        ...route,
        type: 'recent',
        iconName: 'Clock' as const,
      })),
      ...frequentRoutes.slice(0, 2).map((route) => ({
        ...route,
        type: 'frequent',
        iconName: 'TrendingUp' as const,
      })),
      ...contextualRoutes.slice(0, 2).map((route) => ({
        ...route,
        type: 'contextual',
        iconName: 'Star' as const,
      })),
    ]
      .filter((route, index, arr) => arr.findIndex((r) => r?.path === route?.path) === index)
      .filter((route) => route?.path !== location.pathname);

    setSuggestions(newSuggestions.slice(0, 4));
  };

  const getSuggestionLabel = (type: string) => {
    switch (type) {
      case 'recent':
        return 'Récent';
      case 'frequent':
        return 'Populaire';
      case 'contextual':
        return 'Suggéré';
      default:
        return '';
    }
  };

  const getSuggestionColor = (type: string) => {
    switch (type) {
      case 'recent':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-300';
      case 'frequent':
        return 'bg-green-500/10 text-green-700 dark:text-green-300';
      case 'contextual':
        return 'bg-purple-500/10 text-purple-700 dark:text-purple-300';
      default:
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-300';
    }
  };

  if (suggestions.length === 0 || location.pathname === '/dashboard') {
    return null;
  }

  return (
    <Card className="p-4 mb-6 bg-gradient-to-r from-background to-muted/30">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-sm text-muted-foreground">Suggestions de navigation</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSuggestions([])}
          className="h-6 px-2 text-xs"
        >
          Masquer
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {suggestions.map((suggestion, index) => (
          <Button
            key={suggestion.path}
            variant="ghost"
            className={cn(
              'justify-start h-auto p-3 group hover:bg-muted/50',
              'border border-border/50 hover:border-border'
            )}
            onClick={() => navigate(suggestion.path)}
          >
            <div className="flex items-center gap-3 w-full">
              <div className="flex-shrink-0">
                {suggestion.iconName && (
                  <Icon
                    name={suggestion.iconName}
                    className="h-4 w-4 text-muted-foreground group-hover:text-foreground"
                  />
                )}
              </div>

              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">{suggestion.label}</span>
                  <Badge
                    variant="secondary"
                    className={cn('text-xs px-1.5 py-0.5', getSuggestionColor(suggestion.type))}
                  >
                    {getSuggestionLabel(suggestion.type)}
                  </Badge>
                </div>
              </div>

              <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
            </div>
          </Button>
        ))}
      </div>
    </Card>
  );
};

export default NavigationSuggestions;

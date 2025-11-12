import { useState, useEffect } from 'react';
import { useNavigationAnalytics } from '@/hooks/useNavigationAnalytics';

interface NavigationPreferences {
  showKeyboardShortcuts: boolean;
  showNavigationSuggestions: boolean;
  showBreadcrumb: boolean;
  showQuickNavigation: boolean;
  enableTransitions: boolean;
  tourCompleted: boolean;
  favoriteRoutes: string[];
  compactMode: boolean;
}

const defaultPreferences: NavigationPreferences = {
  showKeyboardShortcuts: true,
  showNavigationSuggestions: true,
  showBreadcrumb: true,
  showQuickNavigation: true,
  enableTransitions: true,
  tourCompleted: false,
  favoriteRoutes: [],
  compactMode: false,
};

export const useNavigationPreferences = () => {
  const [preferences, setPreferences] = useState<NavigationPreferences>(defaultPreferences);
  const { trackAction } = useNavigationAnalytics();

  useEffect(() => {
    const saved = localStorage.getItem('navigation_preferences');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPreferences({ ...defaultPreferences, ...parsed });
      } catch (error) {
        console.error('Failed to parse navigation preferences:', error);
      }
    }
  }, []);

  const updatePreference = <K extends keyof NavigationPreferences>(
    key: K,
    value: NavigationPreferences[K]
  ) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    
    localStorage.setItem('navigation_preferences', JSON.stringify(newPreferences));
    
    trackAction('navigation_preference_changed', {
      setting: key,
      value: value,
      timestamp: Date.now()
    });
  };

  const addFavoriteRoute = (route: string) => {
    if (!preferences.favoriteRoutes.includes(route)) {
      const newFavorites = [...preferences.favoriteRoutes, route];
      updatePreference('favoriteRoutes', newFavorites);
    }
  };

  const removeFavoriteRoute = (route: string) => {
    const newFavorites = preferences.favoriteRoutes.filter(r => r !== route);
    updatePreference('favoriteRoutes', newFavorites);
  };

  const toggleFavoriteRoute = (route: string) => {
    if (preferences.favoriteRoutes.includes(route)) {
      removeFavoriteRoute(route);
    } else {
      addFavoriteRoute(route);
    }
  };

  const resetPreferences = () => {
    setPreferences(defaultPreferences);
    localStorage.removeItem('navigation_preferences');
    trackAction('navigation_preferences_reset', { timestamp: Date.now() });
  };

  const shouldShowTour = () => {
    return !preferences.tourCompleted;
  };

  const completeTour = () => {
    updatePreference('tourCompleted', true);
  };

  return {
    preferences,
    updatePreference,
    addFavoriteRoute,
    removeFavoriteRoute,
    toggleFavoriteRoute,
    resetPreferences,
    shouldShowTour,
    completeTour,
  };
};
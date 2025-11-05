// @ts-nocheck
import { createContext, useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { routes, getRouteByPath } from '@/config/routes';

interface NavigationContextType {
  currentRoute: typeof routes[0] | null;
  previousRoute: typeof routes[0] | null;
  navigationHistory: string[];
  canGoBack: boolean;
  goBack: () => void;
  navigateWithTransition: (path: string) => void;
}

const NavigationContext = createContext<NavigationContextType | null>(null);

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
};

interface NavigationProviderProps {
  children: React.ReactNode;
}

export const NavigationProvider = ({ children }: NavigationProviderProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);
  const [previousRoute, setPreviousRoute] = useState<typeof routes[0] | null>(null);

  const currentRoute = getRouteByPath(location.pathname);

  useEffect(() => {
    const currentPath = location.pathname;
    
    setNavigationHistory(prev => {
      const newHistory = [...prev];
      
      // Don't add duplicate consecutive entries
      if (newHistory[newHistory.length - 1] !== currentPath) {
        newHistory.push(currentPath);
        
        // Keep only last 10 entries
        if (newHistory.length > 10) {
          newHistory.shift();
        }
        
        // Set previous route
        if (newHistory.length > 1) {
          const previousPath = newHistory[newHistory.length - 2];
          setPreviousRoute(getRouteByPath(previousPath));
        }
      }
      
      return newHistory;
    });
  }, [location.pathname]);

  const canGoBack = navigationHistory.length > 1;

  const goBack = () => {
    if (canGoBack) {
      navigate(-1);
    }
  };

  const navigateWithTransition = (path: string) => {
    navigate(path);
  };

  const value: NavigationContextType = {
    currentRoute,
    previousRoute,
    navigationHistory,
    canGoBack,
    goBack,
    navigateWithTransition
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

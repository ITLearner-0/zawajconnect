// @ts-nocheck
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getRouteByPath } from '@/config/routes';

interface NavigationEvent {
  route: string;
  timestamp: number;
  user_id?: string;
  route_category?: string;
  previous_route?: string;
  session_id: string;
}

class NavigationAnalytics {
  private events: NavigationEvent[] = [];
  private sessionId: string;
  private previousRoute: string | null = null;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `nav_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  trackPageView(route: string, userId?: string) {
    const routeConfig = getRouteByPath(route);
    
    const event: NavigationEvent = {
      route,
      timestamp: Date.now(),
      user_id: userId,
      route_category: routeConfig?.category,
      previous_route: this.previousRoute,
      session_id: this.sessionId
    };

    this.events.push(event);
    this.previousRoute = route;

    // Store in localStorage for persistence
    this.persistEvents();

    // Log for development
    if (process.env.NODE_ENV === 'development') {
      console.log('Navigation Event:', event);
    }
  }

  trackUserAction(action: string, details?: Record<string, any>) {
    const event = {
      action,
      timestamp: Date.now(),
      session_id: this.sessionId,
      ...details
    };

    // Log user actions
    if (process.env.NODE_ENV === 'development') {
      console.log('User Action:', event);
    }
  }

  private persistEvents() {
    try {
      const storedEvents = JSON.parse(localStorage.getItem('navigation_analytics') || '[]');
      const allEvents = [...storedEvents, ...this.events.slice(-10)]; // Keep last 10 events
      localStorage.setItem('navigation_analytics', JSON.stringify(allEvents.slice(-50))); // Limit storage
    } catch (error) {
      console.error('Failed to persist navigation events:', error);
    }
  }

  getAnalytics() {
    try {
      const storedEvents = JSON.parse(localStorage.getItem('navigation_analytics') || '[]');
      return {
        currentSession: this.events,
        allEvents: storedEvents,
        sessionId: this.sessionId
      };
    } catch (error) {
      console.error('Failed to retrieve navigation analytics:', error);
      return {
        currentSession: this.events,
        allEvents: [],
        sessionId: this.sessionId
      };
    }
  }

  getMostVisitedRoutes() {
    const analytics = this.getAnalytics();
    const routeCounts: Record<string, number> = {};

    analytics.allEvents.forEach((event: NavigationEvent) => {
      routeCounts[event.route] = (routeCounts[event.route] || 0) + 1;
    });

    return Object.entries(routeCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([route, count]) => ({
        route,
        count,
        routeConfig: getRouteByPath(route)
      }));
  }
}

const navigationAnalytics = new NavigationAnalytics();

export const useNavigationAnalytics = () => {
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    navigationAnalytics.trackPageView(location.pathname, user?.id);
  }, [location.pathname, user?.id]);

  return {
    trackAction: navigationAnalytics.trackUserAction.bind(navigationAnalytics),
    getAnalytics: navigationAnalytics.getAnalytics.bind(navigationAnalytics),
    getMostVisited: navigationAnalytics.getMostVisitedRoutes.bind(navigationAnalytics)
  };
};

export default navigationAnalytics;
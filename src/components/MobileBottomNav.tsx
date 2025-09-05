import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  MessageCircle, 
  Search, 
  User, 
  Settings,
  Bell,
  Crown,
  Clock
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  badge?: number;
  premium?: boolean;
}

const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [unreadMessages] = useState(3); // In real app, fetch from API
  const [notifications] = useState(2);

  const navItems: NavItem[] = [
    {
      id: 'browse',
      label: 'Découvrir',
      icon: Search,
      path: '/browse'
    },
    {
      id: 'matches',
      label: 'Matches',
      icon: Heart,
      path: '/matches'
    },
    {
      id: 'chat',
      label: 'Messages',
      icon: MessageCircle,
      path: '/chat',
      badge: unreadMessages
    },
    {
      id: 'islamic-tools',
      label: 'Outils',
      icon: Clock,
      path: '/islamic-tools'
    },
    {
      id: 'profile',
      label: 'Profil',
      icon: User,
      path: '/dashboard'
    }
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard' && location.pathname === '/profile') return true;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Bottom Navigation */}
      <div className="bg-background/95 backdrop-blur-md border-t border-border shadow-lg">
        <div className="grid grid-cols-5 gap-1 p-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                onClick={() => navigate(item.path)}
                className={`relative flex flex-col items-center justify-center h-14 px-2 py-1 ${
                  active 
                    ? 'text-emerald bg-emerald/10'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="relative">
                  <Icon className={`h-5 w-5 ${
                    active ? 'text-emerald' : ''
                  }`} />
                  
                  {/* Badge for notifications/messages */}
                  {item.badge && item.badge > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-4 w-4 p-0 text-xs bg-red-500 text-white flex items-center justify-center">
                      {item.badge > 9 ? '9+' : item.badge}
                    </Badge>
                  )}
                </div>
                
                <span className={`text-xs mt-1 font-medium ${
                  active ? 'text-emerald' : 'text-muted-foreground'
                }`}>
                  {item.label}
                </span>
                
                {/* Active indicator */}
                {active && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 w-6 rounded-full bg-emerald"></div>
                )}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MobileBottomNav;
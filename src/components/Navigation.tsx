import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useMobileNav } from '@/hooks/useMobileNav';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Search, 
  Heart, 
  MessageCircle, 
  Bell, 
  Clock, 
  Home, 
  LogOut,
  Settings,
  Shield,
  Users,
  BookOpen,
  Brain,
  X
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface Notification {
  id: string;
  type: string;
  title: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

interface PrayerTime {
  name: string;
  time: string;
  next?: boolean;
}

interface NavigationProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Navigation = ({ isOpen = true, onClose }: NavigationProps) => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchPrayerTimes();
      setupNotificationSubscription();
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (data) {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.is_read).length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const setupNotificationSubscription = () => {
    if (!user) return;

    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', 
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        }, 
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchPrayerTimes = () => {
    // Simplified prayer times (in a real app, you'd use an API like Aladhan)
    const now = new Date();
    const prayers = [
      { name: 'Fajr', time: '05:30' },
      { name: 'Dhuhr', time: '12:30' },
      { name: 'Asr', time: '15:45' },
      { name: 'Maghrib', time: '18:20' },
      { name: 'Isha', time: '19:45' }
    ];

    const currentTime = now.getHours() * 60 + now.getMinutes();
    let nextPrayerIndex = -1;

    for (let i = 0; i < prayers.length; i++) {
      const [hours, minutes] = prayers[i].time.split(':').map(Number);
      const prayerTime = hours * 60 + minutes;
      
      if (prayerTime > currentTime) {
        nextPrayerIndex = i;
        break;
      }
    }

    const prayerTimesWithNext = prayers.map((prayer, index) => ({
      ...prayer,
      next: index === nextPrayerIndex
    }));

    setPrayerTimes(prayerTimesWithNext);
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
      
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleLinkClick = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    if (onClose) onClose();
  };

  if (!user) return null;

  const navItems = [
    { path: '/', icon: Home, label: 'Accueil' },
    { path: '/dashboard', icon: User, label: 'Mon Profil' },
    { path: '/browse', icon: Search, label: 'Découvrir' },
    { path: '/compatibility-test', icon: Heart, label: 'Test de Compatibilité' },
    { path: '/compatibility-insights', icon: Brain, label: 'Mes Insights' },
    { path: '/matches', icon: Users, label: 'Mes Matches' },
    { path: '/guidance', icon: BookOpen, label: 'Guide islamique' },
    { path: '/islamic-tools', icon: Clock, label: 'Outils islamiques' },
    { path: '/settings', icon: Settings, label: 'Paramètres' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Navigation Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-64 bg-card/95 backdrop-blur-sm border-r border-border/40 z-40 p-4 space-y-6 transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Mobile Close Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute top-4 right-4 lg:hidden"
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-gradient-to-br from-emerald to-emerald-light rounded-full flex items-center justify-center">
            <Heart className="h-5 w-5 text-primary-foreground fill-current" />
          </div>
          <div>
            <h2 className="font-bold text-foreground">NikahConnect</h2>
            <p className="text-xs text-muted-foreground">Matrimonial islamique</p>
          </div>
        </div>

        <Separator />

        {/* Navigation */}
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link key={item.path} to={item.path} onClick={handleLinkClick}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className="w-full justify-start gap-3"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

      <Separator />

      {/* Prayer Times */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-emerald" />
            <h3 className="font-medium text-foreground">Horaires de prière</h3>
          </div>
          <div className="space-y-2">
            {prayerTimes.map((prayer) => (
              <div 
                key={prayer.name} 
                className={`flex justify-between items-center text-sm ${
                  prayer.next ? 'text-emerald font-medium' : 'text-muted-foreground'
                }`}
              >
                <span>{prayer.name}</span>
                <span>{prayer.time}</span>
                {prayer.next && <Badge variant="secondary" className="text-xs">Suivante</Badge>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <div className="relative">
        <Button
          variant="ghost"
          onClick={() => setShowNotifications(!showNotifications)}
          className="w-full justify-start gap-3"
        >
          <div className="relative">
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-4 w-4 p-0 text-xs bg-destructive text-destructive-foreground">
                {unreadCount}
              </Badge>
            )}
          </div>
          Notifications
        </Button>

        {showNotifications && (
          <Card className="absolute top-full left-0 right-0 mt-2 max-h-64 overflow-y-auto z-50">
            <CardContent className="p-2">
              {notifications.length > 0 ? (
                <div className="space-y-2">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-2 rounded-md cursor-pointer hover:bg-accent transition-colors ${
                        !notification.is_read ? 'bg-emerald/10 border-l-2 border-emerald' : ''
                      }`}
                      onClick={() => {
                        if (!notification.is_read) {
                          markNotificationAsRead(notification.id);
                        }
                        setShowNotifications(false);
                      }}
                    >
                      <div className="font-medium text-sm text-foreground">
                        {notification.title}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {notification.content}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-sm text-muted-foreground py-4">
                  Aucune notification
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <Separator />

        {/* User Actions */}
        <div className="space-y-2">
          <Button variant="ghost" className="w-full justify-start gap-3" asChild>
            <Link to="/privacy" onClick={handleLinkClick}>
              <Shield className="h-4 w-4" />
              Confidentialité
            </Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3" asChild>
            <Link to="/family" onClick={handleLinkClick}>
              <Users className="h-4 w-4" />
              Famille
            </Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3" asChild>
            <Link to="/family-supervision" onClick={handleLinkClick}>
              <Shield className="h-4 w-4" />
              Supervision familiale
            </Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3" asChild>
            <Link to="/settings" onClick={handleLinkClick}>
              <Settings className="h-4 w-4" />
              Paramètres
            </Link>
          </Button>
          <Button 
            variant="ghost" 
            onClick={handleSignOut}
            className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </Button>
        </div>

        {/* User Info */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-3 p-2 rounded-md bg-accent/50">
            <div className="h-8 w-8 bg-gradient-to-br from-emerald to-emerald-light rounded-full flex items-center justify-center">
              <span className="text-xs text-primary-foreground font-bold">
                {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0) || '?'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground truncate">
                {user.user_metadata?.full_name || 'Utilisateur'}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {user.email}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navigation;
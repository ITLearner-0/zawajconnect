import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useNotificationCounts } from '@/hooks/useNotificationCounts';
import { supabase } from '@/integrations/supabase/client';
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
  Settings,
  Users,
  BookOpen,
  Brain,
  Shield,
  Award,
  Eye,
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

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

export function AppSidebar() {
  const { user } = useAuth();
  const { isWali, loading: roleLoading } = useUserRole();
  const { counts: notifCounts, markVisitorsRead } = useNotificationCounts(user?.id ?? null);
  const { state } = useSidebar();
  const location = useLocation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [prayerTimes] = useState<PrayerTime[]>([
    { name: 'Fajr', time: '05:30' },
    { name: 'Dhuhr', time: '12:45' },
    { name: 'Asr', time: '15:30', next: true },
    { name: 'Maghrib', time: '18:15' },
    { name: 'Isha', time: '19:45' },
  ]);

  const currentPath = location.pathname;
  const isCollapsed = state === 'collapsed';

  const baseNavItems = [
    { path: '/dashboard', icon: Home, label: 'Tableau de Bord', group: 'main' },
    { path: '/profile', icon: User, label: 'Mon Profil', group: 'main' },
    { path: '/browse', icon: Search, label: 'Découvrir', group: 'main' },
    { path: '/gamification', icon: Award, label: 'Récompenses', group: 'main' },
    {
      path: '/compatibility-test',
      icon: Heart,
      label: 'Test de Compatibilité',
      group: 'compatibility',
    },
    { path: '/advanced-matching', icon: Brain, label: 'Matching Avancé', group: 'compatibility' },
    { path: '/compatibility-insights', icon: Brain, label: 'Mes Insights', group: 'compatibility' },
    { path: '/matches', icon: Users, label: 'Mes Matches', group: 'social' },
    { path: '/visiteurs', icon: Eye, label: 'Visiteurs', group: 'social' },
    { path: '/family', icon: Users, label: 'Famille', group: 'social' },
    { path: '/guidance', icon: BookOpen, label: 'Guide islamique', group: 'resources' },
    { path: '/islamic-tools', icon: Clock, label: 'Outils islamiques', group: 'resources' },
    { path: '/settings', icon: Settings, label: 'Paramètres', group: 'main' },
  ];

  // Add family supervision items for walis
  const waliNavItems = [
    { path: '/wali-dashboard', icon: Shield, label: 'Tableau de Bord Wali', group: 'family' },
    { path: '/match-approval', icon: Heart, label: 'Approbation Matches', group: 'family' },
    { path: '/family-analytics', icon: Brain, label: 'Analytics Famille', group: 'family' },
    { path: '/moderation-tests', icon: Settings, label: 'Tests Modération', group: 'family' },
    { path: '/family-supervision', icon: Users, label: 'Supervision Familiale', group: 'family' },
  ];

  const navItems = isWali ? [...baseNavItems, ...waliNavItems] : baseNavItems;

  const groupedNavItems = {
    main: navItems.filter((item) => item.group === 'main'),
    compatibility: navItems.filter((item) => item.group === 'compatibility'),
    social: navItems.filter((item) => item.group === 'social'),
    family: navItems.filter((item) => item.group === 'family'),
    resources: navItems.filter((item) => item.group === 'resources'),
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      const notifications = (data || []).map((n) => ({
        ...n,
        is_read: n.is_read ?? false,
      }));
      setNotifications(notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? 'font-medium'
      : '';

  // Don't render sidebar if still loading roles to prevent errors
  if (!user || roleLoading) return null;

  return (
    <Sidebar collapsible="icon">
      <SidebarContent
        style={{
          background: 'var(--color-bg-card)',
          borderRight: '1px solid var(--color-border-default)',
        }}
      >
        {/* Logo */}
        <div className={`flex items-center gap-3 p-4 ${isCollapsed ? 'justify-center' : ''}`}>
          <div
            className="h-10 w-10 rounded-full flex items-center justify-center"
            style={{ background: 'var(--color-primary)', color: '#fff' }}
          >
            <Heart className="h-5 w-5 fill-current" />
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="font-bold font-arabic text-lg" style={{ color: 'var(--color-primary)' }}>
                ZawajConnect
              </h2>
              <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                Matrimonial islamique
              </p>
            </div>
          )}
        </div>

        <Separator />

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {groupedNavItems.main.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.path} end className={getNavCls}>
                        <Icon className="h-4 w-4" />
                        {!isCollapsed && <span>{item.label}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Compatibility Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Compatibilité</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {groupedNavItems.compatibility.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.path} className={getNavCls}>
                        <Icon className="h-4 w-4" />
                        {!isCollapsed && <span>{item.label}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Social Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Social</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {groupedNavItems.social.map((item) => {
                const Icon = item.icon;
                const badgeCount =
                  item.path === '/visiteurs'
                    ? notifCounts.visitors
                    : item.path === '/matches'
                      ? notifCounts.matches
                      : 0;

                const handleClick = item.path === '/visiteurs' ? markVisitorsRead : undefined;

                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.path} className={getNavCls} onClick={handleClick}>
                        <Icon className="h-4 w-4" />
                        {!isCollapsed && (
                          <span className="flex-1 flex items-center justify-between">
                            {item.label}
                            {badgeCount > 0 && (
                              <Badge
                                variant="default"
                                className="ml-auto h-5 min-w-[20px] px-1.5 text-[10px] bg-rose-500 hover:bg-rose-500 text-white"
                              >
                                {badgeCount > 99 ? '99+' : badgeCount}
                              </Badge>
                            )}
                          </span>
                        )}
                        {isCollapsed && badgeCount > 0 && (
                          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500" />
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Family Section (Walis only) */}
        {isWali && groupedNavItems.family.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Supervision Familiale</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {groupedNavItems.family.map((item) => {
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton asChild>
                        <NavLink to={item.path} className={getNavCls}>
                          <Icon className="h-4 w-4" />
                          {!isCollapsed && <span>{item.label}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Resources Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Ressources</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {groupedNavItems.resources.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.path} className={getNavCls}>
                        <Icon className="h-4 w-4" />
                        {!isCollapsed && <span>{item.label}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!isCollapsed && (
          <>
            <Separator />

            {/* Prayer Times */}
            <div
              className="mx-4 mb-4 rounded-xl p-4"
              style={{ background: 'var(--color-primary-light)', border: '1px solid var(--color-primary-border)' }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
                <h3 className="font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>
                  Horaires de prière
                </h3>
              </div>
              <div className="space-y-2">
                {prayerTimes.map((prayer) => (
                  <div
                    key={prayer.name}
                    className="flex justify-between items-center text-sm"
                    style={{
                      color: prayer.next ? 'var(--color-primary)' : 'var(--color-text-muted)',
                      fontWeight: prayer.next ? 500 : 400,
                    }}
                  >
                    <span>{prayer.name}</span>
                    <span>{prayer.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Notifications */}
            {notifications.length > 0 && (
              <div
                className="mx-4 mb-4 rounded-xl p-4"
                style={{ background: 'var(--color-bg-subtle)', border: '1px solid var(--color-border-default)' }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Bell className="h-4 w-4" style={{ color: 'var(--color-warning)' }} />
                  <h3 className="font-medium text-sm" style={{ color: 'var(--color-text-primary)' }}>
                    Notifications
                  </h3>
                  <Badge variant="secondary" className="text-xs">
                    {notifications.length}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {notifications.slice(0, 2).map((notification) => (
                    <div key={notification.id} className="text-xs">
                      <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                        {notification.title}
                      </p>
                      <p className="truncate" style={{ color: 'var(--color-text-muted)' }}>
                        {notification.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </SidebarContent>
    </Sidebar>
  );
}

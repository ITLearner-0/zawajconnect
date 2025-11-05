import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
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
  Shield
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
    { path: '/enhanced-profile', icon: User, label: 'Mon Profil', group: 'main' },
    { path: '/browse', icon: Search, label: 'Découvrir', group: 'main' },
    { path: '/compatibility-test', icon: Heart, label: 'Test de Compatibilité', group: 'compatibility' },
    { path: '/advanced-matching', icon: Brain, label: 'Matching Avancé', group: 'compatibility' },
    { path: '/compatibility-insights', icon: Brain, label: 'Mes Insights', group: 'compatibility' },
    { path: '/matches', icon: Users, label: 'Mes Matches', group: 'social' },
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
    { path: '/family-supervision', icon: Users, label: 'Supervision Familiale', group: 'family' }
  ];

  const navItems = isWali
    ? [...baseNavItems, ...waliNavItems]
    : baseNavItems;

  const groupedNavItems = {
    main: navItems.filter(item => item.group === 'main'),
    compatibility: navItems.filter(item => item.group === 'compatibility'),
    social: navItems.filter(item => item.group === 'social'),
    family: navItems.filter(item => item.group === 'family'),
    resources: navItems.filter(item => item.group === 'resources')
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
      const notifications = (data || []).map(n => ({
        ...n,
        is_read: n.is_read ?? false
      }));
      setNotifications(notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/50";

  // Don't render sidebar if still loading roles to prevent errors
  if (!user || roleLoading) return null;

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="bg-card/95 backdrop-blur-sm border-r border-border/40">
        {/* Logo */}
        <div className={`flex items-center gap-3 p-4 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="h-10 w-10 bg-gradient-to-br from-emerald to-emerald-light rounded-full flex items-center justify-center">
            <Heart className="h-5 w-5 text-primary-foreground fill-current" />
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="font-bold text-foreground">ZawajConnect</h2>
              <p className="text-xs text-muted-foreground">Matrimonial islamique</p>
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
            <Card className="mx-4 mb-4">
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
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            {notifications.length > 0 && (
              <Card className="mx-4 mb-4">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Bell className="h-4 w-4 text-gold" />
                    <h3 className="font-medium text-foreground">Notifications</h3>
                    <Badge variant="secondary" className="text-xs">
                      {notifications.length}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {notifications.slice(0, 2).map((notification) => (
                      <div key={notification.id} className="text-xs">
                        <p className="font-medium text-foreground">{notification.title}</p>
                        <p className="text-muted-foreground truncate">{notification.content}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
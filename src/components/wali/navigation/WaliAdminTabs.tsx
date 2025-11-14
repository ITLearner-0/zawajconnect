import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Activity, Shield, AlertCircle } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface WaliAdminTab {
  value: string;
  label: string;
  path: string;
  icon: typeof LayoutDashboard;
}

const tabs: WaliAdminTab[] = [
  {
    value: 'dashboard',
    label: 'Dashboard',
    path: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    value: 'registrations',
    label: 'Inscriptions',
    path: '/admin/wali-registrations',
    icon: FileText,
  },
  {
    value: 'monitoring',
    label: 'Surveillance',
    path: '/admin/wali-monitoring',
    icon: Activity,
  },
  {
    value: 'alerts',
    label: 'Alertes',
    path: '/admin/wali-alerts',
    icon: AlertCircle,
  },
  {
    value: 'audit',
    label: 'Journal d\'audit',
    path: '/admin/wali-audit',
    icon: Shield,
  },
];

export const WaliAdminTabs = () => {
  const location = useLocation();
  const currentTab = tabs.find(tab => location.pathname === tab.path)?.value || 'dashboard';

  return (
    <Tabs value={currentTab} className="w-full">
      <TabsList className="grid w-full grid-cols-5 h-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              asChild
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Link to={tab.path}>
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </Link>
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
};

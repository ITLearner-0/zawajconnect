import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Users, 
  Heart, 
  TrendingUp, 
  Settings,
  Eye,
  Bell,
  LogOut,
  Home
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';

interface WaliSpecificLayoutProps {
  children: React.ReactNode;
}

const WaliSpecificLayout: React.FC<WaliSpecificLayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const waliMenuItems = [
    { 
      path: '/wali-dashboard', 
      icon: Shield, 
      label: 'Tableau de Bord Wali',
      description: 'Vue d\'ensemble de vos supervisions'
    },
    { 
      path: '/match-approval', 
      icon: Heart, 
      label: 'Approbation Matches',
      description: 'Approuver ou rejeter les compatibilités'
    },
    { 
      path: '/family-analytics', 
      icon: TrendingUp, 
      label: 'Analytics Famille',
      description: 'Statistiques et métriques'
    },
    { 
      path: '/moderation-tests', 
      icon: Settings, 
      label: 'Tests Modération',
      description: 'Vérifier les règles islamiques'
    },
    { 
      path: '/family-supervision', 
      icon: Users, 
      label: 'Supervision Familiale',
      description: 'Superviser les conversations'
    }
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-emerald/5">
      <div className="flex">
        {/* Sidebar spécifique aux Walis */}
        <div className="w-80 bg-card/95 backdrop-blur-sm border-r border-border/40 min-h-screen">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
              <div className="h-12 w-12 bg-gradient-to-br from-emerald to-gold rounded-full flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Supervision Familiale</h1>
                <p className="text-sm text-muted-foreground">Tableau de bord Wali</p>
              </div>
            </div>

            {/* User Info */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-gradient-to-br from-gold to-emerald rounded-full flex items-center justify-center">
                    <Shield className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{user?.user_metadata?.full_name || 'Wali'}</p>
                    <Badge className="bg-gold/10 text-gold-dark border-gold/20 text-xs">
                      Tuteur Islamique
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Menu Navigation */}
            <div className="space-y-2">
              {waliMenuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`block w-full p-3 rounded-lg transition-colors ${
                      isActive(item.path)
                        ? 'bg-emerald/10 border border-emerald/20 text-emerald-dark'
                        : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5" />
                      <div className="flex-1">
                        <p className="font-medium">{item.label}</p>
                        <p className="text-xs opacity-70">{item.description}</p>
                      </div>
                    </div>
                  </NavLink>
                );
              })}
            </div>

            {/* Islamic Guidance */}
            <Card className="mt-6">
              <CardContent className="p-4">
                <div className="text-center">
                  <Eye className="h-8 w-8 text-gold mx-auto mb-2" />
                  <p className="text-sm font-medium text-foreground mb-1">Supervision Islamique</p>
                  <p className="text-xs text-muted-foreground">
                    Guidez selon les principes de l'Islam et veillez à la préservation de la pudeur (Haya).
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Footer with logout */}
          <div className="absolute bottom-0 left-0 w-80 p-6 border-t border-border/40">
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="w-full"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};

export default WaliSpecificLayout;
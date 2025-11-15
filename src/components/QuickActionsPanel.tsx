import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Heart, Search, MessageCircle, Settings, Users, Compass } from 'lucide-react';

const QuickActionsPanel = () => {
  const navigate = useNavigate();

  const actions = [
    {
      title: 'Découvrir',
      description: 'Parcourir les profils',
      icon: Search,
      color: 'bg-emerald hover:bg-emerald-dark',
      path: '/browse',
    },
    {
      title: 'Mes Matches',
      description: 'Voir vos compatibilités',
      icon: Heart,
      color: 'bg-gold hover:bg-gold-dark',
      path: '/matches',
    },
    {
      title: 'Messages',
      description: 'Discuter avec vos matches',
      icon: MessageCircle,
      color: 'bg-primary hover:bg-primary-dark',
      path: '/chat',
    },
    {
      title: 'Matching IA',
      description: 'Système avancé',
      icon: Compass,
      color: 'bg-sage hover:bg-sage-dark',
      path: '/advanced-matching',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Actions Rapides
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3">
          {actions.map((action) => (
            <Button
              key={action.title}
              variant="outline"
              onClick={() => navigate(action.path)}
              className="h-auto p-4 flex items-center gap-3 justify-start hover:shadow-md transition-all"
            >
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center ${action.color}`}
              >
                <action.icon className="h-5 w-5 text-white" />
              </div>
              <div className="text-left">
                <div className="font-semibold">{action.title}</div>
                <div className="text-xs text-muted-foreground">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/settings')}
            className="w-full justify-start"
          >
            <Settings className="h-4 w-4 mr-2" />
            Paramètres
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActionsPanel;

import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PremiumFeatureGuardProps {
  children: ReactNode;
  featureName?: string;
}

export const PremiumFeatureGuard = ({ 
  children, 
  featureName = "cette fonctionnalité"
}: PremiumFeatureGuardProps) => {
  const { subscription } = useAuth();
  const navigate = useNavigate();

  // Simplification : vérifier uniquement si subscribed
  if (!subscription.subscribed) {
    return (
      <Card className="border-emerald/20 bg-gradient-to-br from-emerald/5 to-emerald-light/5">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-gradient-to-br from-emerald to-emerald-light rounded-full flex items-center justify-center">
              <Lock className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">
            Fonctionnalité Premium
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            {featureName} est une fonctionnalité exclusive disponible avec le{' '}
            <span className="font-semibold text-emerald">plan Premium</span>.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => navigate('/settings?tab=premium')}
              className="bg-gradient-to-r from-emerald to-emerald-light hover:opacity-90"
            >
              <Crown className="h-4 w-4 mr-2" />
              Passer à Premium
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/')}
            >
              Retour à l'accueil
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
};

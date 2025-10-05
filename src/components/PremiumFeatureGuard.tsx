import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PremiumFeatureGuardProps {
  children: ReactNode;
  feature: string;
  requiresPremium?: boolean;
  requiresFamilyPlus?: boolean;
}

export const PremiumFeatureGuard = ({ 
  children, 
  feature,
  requiresPremium = false,
  requiresFamilyPlus = false
}: PremiumFeatureGuardProps) => {
  const { subscription } = useAuth();
  const navigate = useNavigate();

  // Check if user has required subscription
  const hasPremium = subscription.subscribed && subscription.product_id === 'prod_TB8Q6AILWjCstr';
  const hasFamilyPlus = subscription.subscribed && subscription.product_id === 'prod_TB8QPhRHOsYWAo';

  const hasAccess = () => {
    if (requiresFamilyPlus) {
      return hasFamilyPlus;
    }
    if (requiresPremium) {
      return hasPremium || hasFamilyPlus;
    }
    return true;
  };

  if (hasAccess()) {
    return <>{children}</>;
  }

  const requiredPlan = requiresFamilyPlus ? 'Famille+' : 'Premium';

  return (
    <Card className="border-gold/20 bg-gradient-to-br from-gold/5 to-emerald/5">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 bg-gradient-to-br from-gold to-gold-light rounded-full flex items-center justify-center">
            <Lock className="h-8 w-8 text-primary-foreground" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-gold-dark">
          Fonctionnalité Premium
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-muted-foreground">
          {feature} est une fonctionnalité exclusive disponible avec le plan{' '}
          <span className="font-semibold text-gold">{requiredPlan}</span>.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => navigate('/settings?tab=subscription')}
            className="bg-gradient-to-r from-gold to-gold-light hover:from-gold-dark hover:to-gold text-primary-foreground"
          >
            <Crown className="h-4 w-4 mr-2" />
            Passer à {requiredPlan}
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
};

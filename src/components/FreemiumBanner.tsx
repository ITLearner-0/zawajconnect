import { useAuth } from '@/hooks/useAuth';
import { Sparkles, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const FreemiumBanner = () => {
  const { subscription } = useAuth();
  const navigate = useNavigate();

  if (subscription.subscribed) return null;

  return (
    <div className="bg-gradient-to-r from-emerald/10 via-emerald-light/10 to-emerald/10 border-b border-emerald/20">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-emerald flex-shrink-0" />
            <p className="text-sm">
              <span className="font-medium">Essai gratuit</span> - 5 profils détaillés/jour
              <span className="hidden sm:inline"> | Passez Premium pour un accès illimité</span>
            </p>
          </div>
          <Button
            onClick={() => navigate('/settings?tab=subscription')}
            size="sm"
            className="bg-gradient-to-r from-emerald to-emerald-light hover:opacity-90 flex-shrink-0"
          >
            <Crown className="h-3 w-3 mr-1" />
            Premium
          </Button>
        </div>
      </div>
    </div>
  );
};

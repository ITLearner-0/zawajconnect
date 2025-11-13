import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, Crown, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UpgradeToPremiumModalProps {
  open: boolean;
  onClose: () => void;
  reason?: 'daily_limit' | 'feature_locked';
}

export const UpgradeToPremiumModal = ({
  open,
  onClose,
  reason = 'daily_limit',
}: UpgradeToPremiumModalProps) => {
  const navigate = useNavigate();

  const premiumFeatures = [
    'Profils détaillés illimités',
    'Likes et mises en relation illimités',
    'Messagerie complète',
    'Supervision familiale incluse',
    'Matching avancé avec score de compatibilité',
    'Accès prioritaire aux nouveaux profils',
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Crown className="h-6 w-6 text-emerald" />
            <DialogTitle className="text-2xl">Passez à Premium</DialogTitle>
          </div>
          <DialogDescription>
            {reason === 'daily_limit'
              ? 'Vous avez atteint votre limite quotidienne de 5 profils. Débloquez un accès illimité avec Premium !'
              : 'Cette fonctionnalité est réservée aux membres Premium.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Premium Features */}
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald" />
              Avantages Premium
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {premiumFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-emerald flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <PricingCard
              duration="Engagement 3 mois"
              pricePerMonth="9.99€"
              badge="Essai"
              popular={false}
            />
            <PricingCard
              duration="Engagement 6 mois"
              pricePerMonth="8.33€"
              badge="⭐ Populaire"
              popular={true}
              discount="-17%"
            />
            <PricingCard
              duration="Engagement 12 mois"
              pricePerMonth="6.66€"
              badge="💎 Best Value"
              popular={false}
              discount="-33%"
            />
          </div>

          {/* CTA */}
          <div className="flex gap-3">
            <Button
              onClick={() => {
                onClose();
                navigate('/settings?tab=premium');
              }}
              className="flex-1 bg-gradient-to-r from-emerald to-emerald-light hover:opacity-90"
              size="lg"
            >
              <Crown className="h-4 w-4 mr-2" />
              Voir les plans Premium
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Plus tard
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const PricingCard = ({
  duration,
  pricePerMonth,
  badge,
  popular,
  discount,
}: Record<string, unknown>) => (
  <Card className={`p-4 ${popular ? 'border-2 border-emerald shadow-lg' : ''}`}>
    <div className="text-center space-y-2">
      <div className="text-xs font-medium text-emerald">{badge}</div>
      <div className="text-lg font-bold">{duration}</div>
      <div className="text-2xl font-bold text-emerald">{pricePerMonth}</div>
      <div className="text-xs text-muted-foreground">par mois</div>
      <div className="text-[10px] text-muted-foreground mt-1">Mensuel récurrent</div>
      {discount && <div className="text-xs text-emerald font-medium">{discount}</div>}
    </div>
  </Card>
);

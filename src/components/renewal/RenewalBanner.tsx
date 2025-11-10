import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Clock, Sparkles, Zap, Gift } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface RenewalBannerProps {
  onDismiss?: () => void;
}

const RenewalBanner = ({ onDismiss }: RenewalBannerProps) => {
  const { subscription } = useAuth();
  const [promoCode, setPromoCode] = useState<string>('');
  const [urgency, setUrgency] = useState<'3days' | 'lastday' | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const renew = urlParams.get('renew');
    const code = urlParams.get('code');
    const urgent = urlParams.get('urgent') as '3days' | 'lastday' | null;

    if (renew === 'true') {
      setShowBanner(true);
      if (code) setPromoCode(code);
      if (urgent) setUrgency(urgent);
    }
  }, []);

  useEffect(() => {
    if (!showBanner || !subscription.subscription_end) return;

    const calculateTimeLeft = () => {
      const expiryDate = new Date(subscription.subscription_end!);
      const now = new Date();
      const difference = expiryDate.getTime() - now.getTime();

      if (difference > 0) {
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / (1000 * 60)) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        setTimeLeft({ hours, minutes, seconds });
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [showBanner, subscription.subscription_end]);

  const handleDismiss = () => {
    setShowBanner(false);
    onDismiss?.();
  };

  const handleRenew = () => {
    // Scroll to premium section
    const premiumSection = document.querySelector('[data-section="premium"]');
    if (premiumSection) {
      premiumSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!showBanner) return null;

  const is3Days = urgency === '3days';
  const isLastDay = urgency === 'lastday';

  return (
    <Card
      className={cn(
        'relative overflow-hidden border-2 transition-all duration-500',
        isLastDay && 'animate-pulse border-destructive bg-destructive/5',
        is3Days && 'border-warning bg-warning/5',
        !urgency && 'border-primary bg-primary/5'
      )}
    >
      {/* Background Animation */}
      <div
        className={cn(
          'absolute inset-0 opacity-10',
          isLastDay && 'bg-gradient-to-r from-destructive/20 via-destructive/10 to-destructive/20 animate-[slide-in-right_3s_ease-in-out_infinite]',
          is3Days && 'bg-gradient-to-r from-warning/20 via-warning/10 to-warning/20 animate-[slide-in-right_4s_ease-in-out_infinite]'
        )}
      />

      <div className="relative p-6">
        {/* Close Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="absolute top-4 right-4 h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Header with Icon */}
        <div className="flex items-start gap-4 mb-4">
          <div
            className={cn(
              'p-3 rounded-full',
              isLastDay && 'bg-destructive/10 animate-bounce',
              is3Days && 'bg-warning/10 animate-pulse',
              !urgency && 'bg-primary/10'
            )}
          >
            {isLastDay && <Zap className="h-6 w-6 text-destructive" />}
            {is3Days && <Clock className="h-6 w-6 text-warning" />}
            {!urgency && <Sparkles className="h-6 w-6 text-primary" />}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3
                className={cn(
                  'text-xl font-bold',
                  isLastDay && 'text-destructive',
                  is3Days && 'text-warning',
                  !urgency && 'text-primary'
                )}
              >
                {isLastDay && '🚨 DERNIÈRE CHANCE !'}
                {is3Days && '⚠️ Votre abonnement expire bientôt'}
                {!urgency && '✨ Offre de renouvellement'}
              </h3>
              {urgency && (
                <Badge
                  variant="outline"
                  className={cn(
                    'animate-pulse',
                    isLastDay && 'border-destructive text-destructive',
                    is3Days && 'border-warning text-warning'
                  )}
                >
                  {urgency === 'lastday' ? 'Expire demain !' : 'Expire dans 3 jours'}
                </Badge>
              )}
            </div>

            <p className="text-muted-foreground mb-4">
              {isLastDay &&
                "Votre abonnement Premium expire demain ! Ne perdez pas vos avantages exclusifs. Renouvelez maintenant avec votre remise exclusive."}
              {is3Days &&
                "Votre abonnement Premium expire dans 3 jours. Profitez de notre offre spéciale de renouvellement et continuez à bénéficier de tous vos avantages."}
              {!urgency &&
                "Profitez d'une offre spéciale pour renouveler votre abonnement Premium et continuer à bénéficier de tous les avantages."}
            </p>

            {/* Countdown Timer */}
            {urgency && subscription.subscription_end && (
              <div className="flex items-center gap-4 mb-4">
                <span className="text-sm font-medium text-muted-foreground">
                  Temps restant :
                </span>
                <div className="flex gap-2">
                  {[
                    { value: timeLeft.hours, label: 'H' },
                    { value: timeLeft.minutes, label: 'M' },
                    { value: timeLeft.seconds, label: 'S' },
                  ].map((unit, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        'flex flex-col items-center justify-center min-w-[60px] p-2 rounded-lg border-2',
                        isLastDay && 'border-destructive bg-destructive/5',
                        is3Days && 'border-warning bg-warning/5'
                      )}
                    >
                      <span
                        className={cn(
                          'text-2xl font-bold tabular-nums',
                          isLastDay && 'text-destructive',
                          is3Days && 'text-warning'
                        )}
                      >
                        {String(unit.value).padStart(2, '0')}
                      </span>
                      <span className="text-xs text-muted-foreground">{unit.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Promo Code */}
            {promoCode && (
              <div className="flex items-center gap-3 p-3 bg-accent rounded-lg mb-4">
                <Gift className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Code promo exclusif :</p>
                  <code className="text-lg font-bold text-primary">{promoCode}</code>
                </div>
                <Badge className="bg-primary text-primary-foreground">
                  {isLastDay && 'Jusqu\'à 15% OFF'}
                  {is3Days && 'Jusqu\'à 10% OFF'}
                  {!urgency && 'Jusqu\'à 5% OFF'}
                </Badge>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleRenew}
                size="lg"
                className={cn(
                  'flex-1 font-semibold transition-all duration-300',
                  isLastDay && 'bg-destructive hover:bg-destructive/90 animate-pulse',
                  is3Days && 'bg-warning hover:bg-warning/90 text-warning-foreground',
                  !urgency && 'bg-primary hover:bg-primary/90'
                )}
              >
                {isLastDay && '🔥 Renouveler maintenant !'}
                {is3Days && '⚡ Renouveler avec -10%'}
                {!urgency && '✨ Découvrir l\'offre'}
              </Button>
              <Button variant="outline" onClick={handleDismiss}>
                Plus tard
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default RenewalBanner;

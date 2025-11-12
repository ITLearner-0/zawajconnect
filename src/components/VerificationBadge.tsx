import { Shield, ShieldCheck, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface VerificationBadgeProps {
  verificationScore: number;
  className?: string;
}

const VerificationBadge = ({ verificationScore, className }: VerificationBadgeProps) => {
  const getVerificationStatus = (score: number) => {
    if (score >= 80) {
      return {
        label: 'Vérifié',
        icon: ShieldCheck,
        variant: 'default' as const,
        className: 'bg-emerald/10 text-emerald border-emerald/20',
      };
    } else if (score >= 50) {
      return {
        label: 'Partiellement vérifié',
        icon: Shield,
        variant: 'secondary' as const,
        className: 'bg-gold/10 text-gold border-gold/20',
      };
    } else {
      return {
        label: 'Non vérifié',
        icon: ShieldAlert,
        variant: 'outline' as const,
        className: 'bg-muted/10 text-muted-foreground border-muted-foreground/20',
      };
    }
  };

  const status = getVerificationStatus(verificationScore);
  const Icon = status.icon;

  return (
    <Badge
      variant={status.variant}
      className={cn(status.className, 'text-xs font-medium', className)}
    >
      <Icon className="h-3 w-3 mr-1" />
      {status.label}
    </Badge>
  );
};

export default VerificationBadge;

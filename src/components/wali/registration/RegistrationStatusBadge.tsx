import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, XCircle, Eye } from 'lucide-react';

interface RegistrationStatusBadgeProps {
  status: 'pending' | 'approved' | 'rejected' | 'verified';
  className?: string;
}

export const RegistrationStatusBadge = ({ 
  status, 
  className 
}: RegistrationStatusBadgeProps) => {
  const statusConfig = {
    pending: {
      label: 'En attente',
      icon: Clock,
      variant: 'secondary' as const,
    },
    verified: {
      label: 'Vérifié',
      icon: Eye,
      variant: 'default' as const,
      className: 'bg-blue-500 text-white',
    },
    approved: {
      label: 'Approuvé',
      icon: CheckCircle2,
      variant: 'default' as const,
      className: 'bg-success text-success-foreground',
    },
    rejected: {
      label: 'Rejeté',
      icon: XCircle,
      variant: 'destructive' as const,
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;
  const badgeClassName = 'className' in config ? config.className : '';

  return (
    <Badge 
      variant={config.variant} 
      className={`${badgeClassName} ${className || ''}`}
    >
      <Icon className="mr-1 h-3 w-3" />
      {config.label}
    </Badge>
  );
};

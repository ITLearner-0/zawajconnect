import React, { useEffect, useState } from 'react';
import { CheckCircle, CloudOff, AlertCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SaveStatusIndicatorProps {
  status?: 'idle' | 'saving' | 'saved' | 'error';
  lastSaveTime?: Date | null;
  isOnline?: boolean;
}

export const SaveStatusIndicator: React.FC<SaveStatusIndicatorProps> = ({ 
  status: externalStatus,
  lastSaveTime: externalLastSaveTime,
  isOnline = true
}) => {
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(externalLastSaveTime || null);
  const [status, setStatus] = useState<'saved' | 'saving' | 'error' | 'offline' | 'idle'>(
    externalStatus || 'idle'
  );

  // Update from external props
  useEffect(() => {
    if (externalStatus) setStatus(externalStatus);
  }, [externalStatus]);

  useEffect(() => {
    if (externalLastSaveTime) setLastSaveTime(externalLastSaveTime);
  }, [externalLastSaveTime]);

  useEffect(() => {
    // Listen for custom save events (backward compatibility)
    const handleSaveStart = () => setStatus('saving');
    const handleSaveSuccess = () => {
      setStatus('saved');
      setLastSaveTime(new Date());
    };
    const handleSaveError = () => setStatus('error');

    window.addEventListener('onboarding:save:start', handleSaveStart);
    window.addEventListener('onboarding:save:success', handleSaveSuccess);
    window.addEventListener('onboarding:save:error', handleSaveError);

    return () => {
      window.removeEventListener('onboarding:save:start', handleSaveStart);
      window.removeEventListener('onboarding:save:success', handleSaveSuccess);
      window.removeEventListener('onboarding:save:error', handleSaveError);
    };
  }, []);

  useEffect(() => {
    if (!isOnline) {
      setStatus('offline');
    }
  }, [isOnline]);

  const getStatusContent = () => {
    switch (status) {
      case 'idle':
        return null;
      case 'saving':
        return {
          icon: <Loader2 className="h-3 w-3 animate-spin" />,
          text: 'Sauvegarde...',
          variant: 'secondary' as const
        };
      case 'saved':
        return {
          icon: <CheckCircle className="h-3 w-3" />,
          text: lastSaveTime 
            ? `Sauvé ${formatDistanceToNow(lastSaveTime, { addSuffix: true, locale: fr })}`
            : 'Sauvegardé',
          variant: 'default' as const
        };
      case 'error':
        return {
          icon: <AlertCircle className="h-3 w-3" />,
          text: 'Erreur de sauvegarde',
          variant: 'destructive' as const
        };
      case 'offline':
        return {
          icon: <CloudOff className="h-3 w-3" />,
          text: 'Mode hors ligne',
          variant: 'secondary' as const
        };
      default:
        return null;
    }
  };

  const statusContent = getStatusContent();
  
  if (!statusContent) return null;

  const { icon, text, variant } = statusContent;

  return (
    <div className="flex items-center space-x-2">
      <Badge variant={variant} className="flex items-center space-x-1 text-xs">
        {icon}
        <span>{text}</span>
      </Badge>
      {status === 'offline' && (
        <span className="text-xs text-muted-foreground">
          Données sauvées localement
        </span>
      )}
    </div>
  );
};

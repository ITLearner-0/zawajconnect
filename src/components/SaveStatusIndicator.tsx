import React, { useEffect, useState } from 'react';
import { CheckCircle, CloudOff, Clock, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SaveStatusIndicatorProps {
  hasUnsavedChanges?: boolean;
  isOnline?: boolean;
}

export const SaveStatusIndicator: React.FC<SaveStatusIndicatorProps> = ({ 
  hasUnsavedChanges = false,
  isOnline = true
}) => {
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [status, setStatus] = useState<'saved' | 'saving' | 'error' | 'offline'>('saved');

  useEffect(() => {
    // Listen for custom save events
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
      case 'saving':
        return {
          icon: <Clock className="h-3 w-3 animate-spin" />,
          text: 'Sauvegarde...',
          variant: 'secondary' as const
        };
      case 'saved':
        return {
          icon: <CheckCircle className="h-3 w-3" />,
          text: lastSaveTime ? `Sauvé à ${lastSaveTime.toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}` : 'Sauvegardé',
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
        return {
          icon: <CheckCircle className="h-3 w-3" />,
          text: 'Sauvegardé',
          variant: 'default' as const
        };
    }
  };

  const { icon, text, variant } = getStatusContent();

  return (
    <div className="flex items-center space-x-2">
      <Badge variant={variant} className="flex items-center space-x-1 text-xs">
        {icon}
        <span>{text}</span>
      </Badge>
      {hasUnsavedChanges && status === 'saved' && (
        <Badge variant="outline" className="text-xs">
          Modifications non sauvées
        </Badge>
      )}
      {status === 'offline' && (
        <span className="text-xs text-muted-foreground">
          Les données sont sauvées localement
        </span>
      )}
    </div>
  );
};
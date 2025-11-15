import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface SessionRecoveryModalProps {
  isOpen: boolean;
  onRecover: () => void;
  onIgnore: () => void;
}

export const SessionRecoveryModal = ({
  isOpen,
  onRecover,
  onIgnore,
}: SessionRecoveryModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [hasBackupData, setHasBackupData] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Check if there's backup data using the correct emergency backup format
      const userEmail = user?.email || 'anonymous';
      const sessionId = localStorage.getItem('onboarding_session_id') || 'unknown';
      const today = new Date().toISOString().split('T')[0];

      const backupKeys = [
        `emergency_compatibility_${sessionId}`,
        `emergency_compatibility_${userEmail.replace('@', '_')}`,
        `emergency_compatibility_${today}`,
        `emergency_onboarding_${sessionId}`,
        `emergency_onboarding_${userEmail.replace('@', '_')}`,
        `emergency_onboarding_${today}`,
      ];

      const hasBackup = backupKeys.some((key) => {
        try {
          const backup = localStorage.getItem(key);
          if (backup) {
            const parsed = JSON.parse(backup);
            return parsed.data && Object.keys(parsed.data).length > 0;
          }
        } catch (error) {
          console.error('Error parsing backup for key:', key);
        }
        return false;
      });

      setHasBackupData(hasBackup);
    }
  }, [isOpen, user]);

  const handleRecover = () => {
    if (hasBackupData) {
      toast({
        title: 'Données récupérées',
        description: 'Vos réponses précédentes ont été restaurées avec succès.',
        variant: 'default',
      });
    }
    onRecover();
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Session expirée détectée
          </DialogTitle>
          <DialogDescription className="space-y-2">
            <p>
              Votre session d'authentification a expiré pendant que vous remplissiez le formulaire.
            </p>
            {hasBackupData ? (
              <p className="text-emerald-600 font-medium">
                ✅ Bonne nouvelle ! Nous avons automatiquement sauvegardé vos données.
              </p>
            ) : (
              <p className="text-amber-600">⚠️ Aucune sauvegarde automatique détectée.</p>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2 mt-4">
          <Button onClick={handleRecover} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            {hasBackupData ? 'Récupérer mes données' : 'Continuer quand même'}
          </Button>
          <Button variant="outline" onClick={onIgnore}>
            Recommencer à zéro
          </Button>
        </div>

        <div className="text-xs text-muted-foreground mt-2">
          <p>
            Pour éviter ce problème à l'avenir, nous recommandons de remplir le formulaire par
            étapes et de sauvegarder régulièrement vos progrès.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

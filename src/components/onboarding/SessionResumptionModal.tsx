import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { RefreshCcw, PlayCircle, Clock, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SessionResumptionModalProps {
  open: boolean;
  onContinue: () => void;
  onRestart: () => void;
  savedStep: number;
  totalSteps: number;
  completionPercentage: number;
  lastSaveTime?: Date;
}

export const SessionResumptionModal: React.FC<SessionResumptionModalProps> = ({
  open,
  onContinue,
  onRestart,
  savedStep,
  totalSteps,
  completionPercentage,
  lastSaveTime,
}) => {
  const stepNames = [
    'Informations personnelles',
    'Profil détaillé',
    'Préférences islamiques',
    'Objectifs',
  ];

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Clock className="h-5 w-5 text-primary" />
            Reprendre où vous en étiez ?
          </DialogTitle>
          <DialogDescription>
            Nous avons détecté une session d'inscription en cours
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Progress Overview */}
          <Card className="p-4 bg-muted/50 border-border/50">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progression globale</span>
                <span className="font-semibold text-primary">
                  {completionPercentage}%
                </span>
              </div>
              <Progress value={completionPercentage} className="h-2" />
            </div>
          </Card>

          {/* Current Step */}
          <Card className="p-4 border-primary/20">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Étape en cours</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {savedStep}/{totalSteps} - {stepNames[savedStep - 1] || 'En cours'}
                </p>
              </div>
            </div>
          </Card>

          {/* Last Save Time */}
          {lastSaveTime && (
            <p className="text-xs text-muted-foreground text-center">
              Dernière sauvegarde{' '}
              {formatDistanceToNow(lastSaveTime, { addSuffix: true, locale: fr })}
            </p>
          )}

          {/* Info Box */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              💡 Vos données sont automatiquement sauvegardées. Vous pouvez continuer
              votre inscription ou recommencer si vous préférez.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onRestart}
            className="w-full sm:w-auto"
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            Recommencer
          </Button>
          <Button
            onClick={onContinue}
            className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary/80"
          >
            <PlayCircle className="h-4 w-4 mr-2" />
            Continuer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

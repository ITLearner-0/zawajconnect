import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Send, Shield } from 'lucide-react';
import { ApprovalDecision } from '@/types/match-approval';

interface ApprovalDecisionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  decision: ApprovalDecision;
  onDecisionChange: (decision: ApprovalDecision) => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

const ApprovalDecisionDialog: React.FC<ApprovalDecisionDialogProps> = ({
  open,
  onOpenChange,
  decision,
  onDecisionChange,
  onConfirm,
  isLoading = false
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {decision.approved ? (
              <CheckCircle className="h-5 w-5 text-success" />
            ) : (
              <XCircle className="h-5 w-5 text-destructive" />
            )}
            {decision.approved ? 'Approuver le Match' : 'Refuser le Match'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              {decision.approved ? (
                'Vous autorisez la communication entre ces deux personnes selon les principes islamiques.'
              ) : (
                'Vous refusez ce match. Veuillez expliquer les raisons à votre famille.'
              )}
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Notes pour la famille {decision.approved ? '(optionnel)' : '(obligatoire)'}
            </label>
            <Textarea
              value={decision.notes}
              onChange={(e) => onDecisionChange({ ...decision, notes: e.target.value })}
              placeholder={
                decision.approved 
                  ? "Conditions ou recommandations pour cette communication..."
                  : "Expliquez les raisons de ce refus..."
              }
              rows={4}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              onClick={onConfirm}
              className="flex-1"
              disabled={(!decision.approved && !decision.notes.trim()) || isLoading}
            >
              <Send className="h-4 w-4 mr-2" />
              {isLoading ? 'Traitement...' : 'Confirmer'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApprovalDecisionDialog;
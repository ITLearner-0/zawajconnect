import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

interface SuspendWaliDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  waliUserId: string;
  waliName: string;
  onConfirm: (reason: string, durationDays: number) => void;
}

export const SuspendWaliDialog = ({
  open,
  onOpenChange,
  waliUserId,
  waliName,
  onConfirm,
}: SuspendWaliDialogProps) => {
  const [reason, setReason] = useState('');
  const [durationDays, setDurationDays] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) return;

    setIsSubmitting(true);
    await onConfirm(reason, durationDays);
    setIsSubmitting(false);
    setReason('');
    setDurationDays(30);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Suspendre le Wali</DialogTitle>
          <DialogDescription>
            Vous êtes sur le point de suspendre <strong>{waliName}</strong>. Cette action empêchera
            temporairement le Wali d'accéder à son compte.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="duration">Durée de suspension (jours)</Label>
            <Input
              id="duration"
              type="number"
              min={1}
              max={365}
              value={durationDays}
              onChange={(e) => setDurationDays(parseInt(e.target.value) || 30)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Raison de la suspension *</Label>
            <Textarea
              id="reason"
              placeholder="Expliquez la raison de cette suspension..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              required
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={!reason.trim() || isSubmitting}
          >
            {isSubmitting ? 'Suspension...' : 'Confirmer la Suspension'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

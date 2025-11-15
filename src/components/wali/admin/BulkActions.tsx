import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { WaliRegistration } from '@/hooks/wali/useWaliRegistration';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface BulkActionsProps {
  registrations: WaliRegistration[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onBulkApprove: (ids: string[]) => Promise<void>;
  onBulkReject: (ids: string[], reason: string) => Promise<void>;
}

export const BulkActions = ({
  registrations,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onBulkApprove,
  onBulkReject,
}: BulkActionsProps) => {
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [loading, setLoading] = useState(false);

  const allSelected = selectedIds.length === registrations.length && registrations.length > 0;
  const someSelected = selectedIds.length > 0 && selectedIds.length < registrations.length;

  const handleBulkApprove = async () => {
    setLoading(true);
    try {
      await onBulkApprove(selectedIds);
      setShowApproveDialog(false);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkReject = async () => {
    if (!rejectReason.trim()) return;
    setLoading(true);
    try {
      await onBulkReject(selectedIds, rejectReason);
      setShowRejectDialog(false);
      setRejectReason('');
    } finally {
      setLoading(false);
    }
  };

  if (registrations.length === 0) return null;

  return (
    <>
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={onToggleSelectAll}
                  ref={(el) => {
                    if (el) {
                      (el as any).indeterminate = someSelected;
                    }
                  }}
                />
                <span className="text-sm text-muted-foreground">
                  {selectedIds.length} sélectionné{selectedIds.length > 1 ? 's' : ''}
                </span>
              </div>

              {selectedIds.length > 0 && (
                <Alert className="py-2 px-3 border-primary">
                  <AlertDescription className="text-sm">
                    Actions en masse disponibles pour {selectedIds.length} inscription{selectedIds.length > 1 ? 's' : ''}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="default"
                disabled={selectedIds.length === 0 || loading}
                onClick={() => setShowApproveDialog(true)}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approuver ({selectedIds.length})
              </Button>
              <Button
                size="sm"
                variant="destructive"
                disabled={selectedIds.length === 0 || loading}
                onClick={() => setShowRejectDialog(true)}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Rejeter ({selectedIds.length})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Approve Dialog */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approuver les inscriptions ?</AlertDialogTitle>
            <AlertDialogDescription>
              Vous êtes sur le point d'approuver {selectedIds.length} inscription{selectedIds.length > 1 ? 's' : ''}.
              Cette action enverra des notifications par email aux Walis concernés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkApprove} disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Approuver
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rejeter les inscriptions ?</AlertDialogTitle>
            <AlertDialogDescription>
              Vous êtes sur le point de rejeter {selectedIds.length} inscription{selectedIds.length > 1 ? 's' : ''}.
              Veuillez fournir une raison pour ce rejet.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Raison du rejet..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkReject}
              disabled={loading || !rejectReason.trim()}
              className="bg-destructive hover:bg-destructive/90"
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Rejeter
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

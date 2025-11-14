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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { WaliAdminRole } from '@/hooks/wali/useWaliAdminPermissions';

interface AssignPermissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssign: (userId: string, role: WaliAdminRole, notes?: string) => Promise<boolean>;
}

export const AssignPermissionDialog = ({
  open,
  onOpenChange,
  onAssign,
}: AssignPermissionDialogProps) => {
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState<WaliAdminRole>('viewer');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setSubmitting(true);
    const success = await onAssign(userId, role, notes || undefined);
    setSubmitting(false);

    if (success) {
      setUserId('');
      setRole('viewer');
      setNotes('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Assigner une Permission</DialogTitle>
            <DialogDescription>
              Attribuer un rôle d'administrateur Wali à un utilisateur
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="userId">ID Utilisateur</Label>
              <Input
                id="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="UUID de l'utilisateur"
                required
              />
              <p className="text-xs text-muted-foreground">
                L'UUID de l'utilisateur depuis la table auth.users
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Rôle</Label>
              <Select value={role} onValueChange={(value) => setRole(value as WaliAdminRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Visualiseur (lecture seule)</SelectItem>
                  <SelectItem value="editor">Éditeur (peut modifier)</SelectItem>
                  <SelectItem value="approver">Approbateur (peut approuver/rejeter)</SelectItem>
                  <SelectItem value="super_admin">Super Admin (tous les droits)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optionnel)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Raison de l'attribution de ce rôle..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={submitting || !userId}>
              {submitting ? 'Attribution...' : 'Assigner'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

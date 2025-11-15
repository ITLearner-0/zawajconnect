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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { WaliAdminRole } from '@/hooks/wali/useWaliAdminPermissions';
import { Trash2, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface BulkAssignment {
  email: string;
  role: WaliAdminRole;
  notes?: string;
}

interface BulkAssignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssign: (
    assignments: Array<{ userId: string; role: WaliAdminRole; notes?: string }>
  ) => Promise<{ success: number; failed: number }>;
  onSearchUser: (email: string) => Promise<{ id: string; email: string }[]>;
}

export const BulkAssignDialog = ({
  open,
  onOpenChange,
  onAssign,
  onSearchUser,
}: BulkAssignDialogProps) => {
  const [assignments, setAssignments] = useState<BulkAssignment[]>([{ email: '', role: 'viewer' }]);
  const [submitting, setSubmitting] = useState(false);

  const addAssignment = () => {
    setAssignments([...assignments, { email: '', role: 'viewer' }]);
  };

  const removeAssignment = (index: number) => {
    setAssignments(assignments.filter((_, i) => i !== index));
  };

  const updateAssignment = (index: number, field: keyof BulkAssignment, value: string) => {
    const updated = [...assignments];
    const current = updated[index];
    if (!current) return;

    if (field === 'email') {
      updated[index] = { email: value, role: current.role, notes: current.notes };
    } else if (field === 'role') {
      updated[index] = { email: current.email, role: value as WaliAdminRole, notes: current.notes };
    } else if (field === 'notes') {
      updated[index] = { email: current.email, role: current.role, notes: value };
    }

    setAssignments(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Filter out empty assignments
    const validAssignments = assignments.filter((a) => a.email.trim());
    if (validAssignments.length === 0) return;

    setSubmitting(true);

    // Search for user IDs
    const assignmentsWithIds: Array<{ userId: string; role: WaliAdminRole; notes?: string }> = [];

    for (const assignment of validAssignments) {
      try {
        const results = await onSearchUser(assignment.email);
        const firstResult = results?.[0];
        if (firstResult) {
          assignmentsWithIds.push({
            userId: firstResult.id,
            role: assignment.role,
            notes: assignment.notes || undefined,
          });
        }
      } catch (err) {
        console.error('Error searching user:', err);
      }
    }

    if (assignmentsWithIds.length > 0) {
      await onAssign(assignmentsWithIds);
      setAssignments([{ email: '', role: 'viewer' }]);
      onOpenChange(false);
    }

    setSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Assignation en Masse</DialogTitle>
            <DialogDescription>
              Assignez des rôles à plusieurs utilisateurs simultanément
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {assignments.map((assignment, index) => (
              <div key={index} className="grid gap-3 p-4 border rounded-lg relative">
                {assignments.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={() => removeAssignment(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={assignment.email}
                    onChange={(e) => updateAssignment(index, 'email', e.target.value)}
                    placeholder="nom@exemple.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Rôle</Label>
                  <Select
                    value={assignment.role}
                    onValueChange={(value) => updateAssignment(index, 'role', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewer">Visualiseur</SelectItem>
                      <SelectItem value="editor">Éditeur</SelectItem>
                      <SelectItem value="approver">Approbateur</SelectItem>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Notes (optionnel)</Label>
                  <Textarea
                    value={assignment.notes || ''}
                    onChange={(e) => updateAssignment(index, 'notes', e.target.value)}
                    placeholder="Raison..."
                    rows={2}
                  />
                </div>
              </div>
            ))}

            <Button type="button" variant="outline" className="w-full" onClick={addAssignment}>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un utilisateur
            </Button>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting
                ? 'Attribution...'
                : `Assigner (${assignments.filter((a) => a.email).length})`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

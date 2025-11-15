import { useState, useEffect } from 'react';
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
import { WaliAdminRole, UserSearchResult } from '@/hooks/wali/useWaliAdminPermissions';
import { Search, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface UserSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssign: (userId: string, role: WaliAdminRole, notes?: string) => Promise<boolean>;
  onSearch: (email: string) => Promise<UserSearchResult[]>;
}

export const UserSearchDialog = ({
  open,
  onOpenChange,
  onAssign,
  onSearch,
}: UserSearchDialogProps) => {
  const [searchEmail, setSearchEmail] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);
  const [role, setRole] = useState<WaliAdminRole>('viewer');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setSearchEmail('');
      setSearchResults([]);
      setSelectedUser(null);
      setRole('viewer');
      setNotes('');
    }
  }, [open]);

  const handleSearch = async () => {
    if (!searchEmail || searchEmail.length < 3) return;

    setSearching(true);
    const results = await onSearch(searchEmail);
    setSearchResults(results);
    setSearching(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setSubmitting(true);
    const success = await onAssign(selectedUser.id, role, notes || undefined);
    setSubmitting(false);

    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Rechercher un Utilisateur</DialogTitle>
            <DialogDescription>
              Recherchez un utilisateur par email puis assignez-lui un rôle
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="searchEmail">Email</Label>
              <div className="flex gap-2">
                <Input
                  id="searchEmail"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  placeholder="nom@exemple.com"
                  type="email"
                />
                <Button
                  type="button"
                  onClick={handleSearch}
                  disabled={searching || searchEmail.length < 3}
                >
                  {searching ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-2">
                <Label>Résultats ({searchResults.length})</Label>
                <ScrollArea className="h-[200px] border rounded-md p-2">
                  <div className="space-y-2">
                    {searchResults.map((user) => (
                      <div
                        key={user.id}
                        className={`p-3 rounded-md cursor-pointer transition-colors ${
                          selectedUser?.id === user.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted hover:bg-muted/80'
                        }`}
                        onClick={() => setSelectedUser(user)}
                      >
                        <div className="font-medium">{user.full_name || 'Sans nom'}</div>
                        <div className="text-sm opacity-80">{user.email}</div>
                        <div className="text-xs opacity-60 mt-1">
                          Créé le {new Date(user.created_at).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {selectedUser && (
              <>
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
              </>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={submitting || !selectedUser}>
              {submitting ? 'Attribution...' : 'Assigner'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

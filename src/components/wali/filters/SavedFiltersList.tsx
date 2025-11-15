import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Trash2, Check } from 'lucide-react';
import { SavedFilter } from '@/hooks/wali/useWaliFilters';
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
import { useState } from 'react';

interface SavedFiltersListProps {
  filters: SavedFilter[];
  onLoadFilter: (filter: SavedFilter) => void;
  onDeleteFilter: (id: string) => void;
  onSetDefault: (id: string) => void;
}

export const SavedFiltersList = ({
  filters,
  onLoadFilter,
  onDeleteFilter,
  onSetDefault,
}: SavedFiltersListProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [filterToDelete, setFilterToDelete] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setFilterToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (filterToDelete) {
      onDeleteFilter(filterToDelete);
      setDeleteDialogOpen(false);
      setFilterToDelete(null);
    }
  };

  if (filters.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Filtres Sauvegardés</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Aucun filtre sauvegardé. Configurez des filtres et sauvegardez-les pour y accéder
            rapidement.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Filtres Sauvegardés ({filters.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filters.map((filter) => (
              <div
                key={filter.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2 flex-1">
                  {filter.is_default && (
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{filter.name}</span>
                      {filter.is_default && (
                        <Badge variant="secondary" className="text-xs">
                          Par défaut
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(filter.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => onLoadFilter(filter)}>
                    <Check className="w-4 h-4" />
                  </Button>
                  {!filter.is_default && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onSetDefault(filter.id)}
                      title="Définir comme filtre par défaut"
                    >
                      <Star className="w-4 h-4" />
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => handleDeleteClick(filter.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce filtre ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le filtre sauvegardé sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

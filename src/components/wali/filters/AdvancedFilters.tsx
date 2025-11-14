import { useState } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, X, Save, Star } from 'lucide-react';
import { WaliFilterValues } from '@/hooks/wali/useWaliFilters';
import { SaveFilterDialog } from './SaveFilterDialog';

interface AdvancedFiltersProps {
  filters: WaliFilterValues;
  onFiltersChange: (filters: WaliFilterValues) => void;
  onSaveFilter: (name: string) => void;
  onReset: () => void;
}

export const AdvancedFilters = ({
  filters,
  onFiltersChange,
  onSaveFilter,
  onReset,
}: AdvancedFiltersProps) => {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  const updateFilter = (key: keyof WaliFilterValues, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== undefined && value !== '' && value !== 'all'
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Filtres Avancés
          </CardTitle>
          <div className="flex gap-2">
            {hasActiveFilters && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSaveDialogOpen(true)}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Sauvegarder
                </Button>
                <Button variant="outline" size="sm" onClick={onReset}>
                  <X className="w-4 h-4 mr-2" />
                  Réinitialiser
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="search">Recherche globale</Label>
            <Input
              id="search"
              placeholder="Nom, email, téléphone..."
              value={filters.search || ''}
              onChange={(e) => updateFilter('search', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Statut</Label>
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) => updateFilter('status', value)}
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="approved">Approuvé</SelectItem>
                <SelectItem value="rejected">Rejeté</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="relationship">Relation</Label>
            <Select
              value={filters.relationship || 'all'}
              onValueChange={(value) => updateFilter('relationship', value)}
            >
              <SelectTrigger id="relationship">
                <SelectValue placeholder="Toutes les relations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les relations</SelectItem>
                <SelectItem value="father">Père</SelectItem>
                <SelectItem value="brother">Frère</SelectItem>
                <SelectItem value="uncle">Oncle</SelectItem>
                <SelectItem value="grandfather">Grand-père</SelectItem>
                <SelectItem value="guardian">Tuteur légal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="exemple@email.com"
              value={filters.email || ''}
              onChange={(e) => updateFilter('email', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+33 6 12 34 56 78"
              value={filters.phone || ''}
              onChange={(e) => updateFilter('phone', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateFrom">Date de début</Label>
            <Input
              id="dateFrom"
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => updateFilter('dateFrom', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateTo">Date de fin</Label>
            <Input
              id="dateTo"
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => updateFilter('dateTo', e.target.value)}
            />
          </div>
        </div>
      </CardContent>

      <SaveFilterDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        onSave={onSaveFilter}
      />
    </Card>
  );
};

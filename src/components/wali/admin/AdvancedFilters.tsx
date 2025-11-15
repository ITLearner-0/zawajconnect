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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Filter, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface FilterValues {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  relationship?: string;
  searchQuery?: string;
}

interface AdvancedFiltersProps {
  filters: FilterValues;
  onFiltersChange: (filters: FilterValues) => void;
}

export const AdvancedFilters = ({ filters, onFiltersChange }: AdvancedFiltersProps) => {
  const activeFiltersCount = Object.values(filters).filter((v) => v && v !== 'all').length;

  const handleFilterChange = (key: keyof FilterValues, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value === 'all' ? undefined : value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtres
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px]" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Filtres avancés</h4>
              {activeFiltersCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Réinitialiser
                </Button>
              )}
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="status-filter">Statut</Label>
                <Select
                  value={filters.status || 'all'}
                  onValueChange={(value) => handleFilterChange('status', value)}
                >
                  <SelectTrigger id="status-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="approved">Approuvées</SelectItem>
                    <SelectItem value="verified">Vérifiées</SelectItem>
                    <SelectItem value="rejected">Rejetées</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="relationship-filter">Relation</Label>
                <Select
                  value={filters.relationship || 'all'}
                  onValueChange={(value) => handleFilterChange('relationship', value)}
                >
                  <SelectTrigger id="relationship-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les relations</SelectItem>
                    <SelectItem value="parent">Parent</SelectItem>
                    <SelectItem value="sibling">Frère/Sœur</SelectItem>
                    <SelectItem value="uncle">Oncle/Tante</SelectItem>
                    <SelectItem value="guardian">Tuteur légal</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date-from">Date de début</Label>
                <Input
                  id="date-from"
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date-to">Date de fin</Label>
                <Input
                  id="date-to"
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {filters.status && filters.status !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Statut: {filters.status}
              <button
                onClick={() => handleFilterChange('status', 'all')}
                className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.relationship && filters.relationship !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Relation: {filters.relationship}
              <button
                onClick={() => handleFilterChange('relationship', 'all')}
                className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.dateFrom && (
            <Badge variant="secondary" className="gap-1">
              Depuis: {new Date(filters.dateFrom).toLocaleDateString('fr-FR')}
              <button
                onClick={() => handleFilterChange('dateFrom', '')}
                className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.dateTo && (
            <Badge variant="secondary" className="gap-1">
              Jusqu'au: {new Date(filters.dateTo).toLocaleDateString('fr-FR')}
              <button
                onClick={() => handleFilterChange('dateTo', '')}
                className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

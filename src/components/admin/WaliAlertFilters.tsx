import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Filter, X, Search } from 'lucide-react';

interface Filters {
  riskLevel?: string;
  acknowledged?: boolean;
  dateFrom?: string;
  dateTo?: string;
  searchQuery?: string;
}

interface WaliAlertFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  alertCount: number;
}

const WaliAlertFilters: React.FC<WaliAlertFiltersProps> = ({
  filters,
  onFiltersChange,
  alertCount,
}) => {
  const updateFilter = (key: keyof Filters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(filters).some(
    (key) => filters[key as keyof Filters] !== undefined && filters[key as keyof Filters] !== ''
  );

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">
            Filtres ({alertCount} résultat{alertCount > 1 ? 's' : ''})
          </h3>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="ml-auto gap-2">
              <X className="h-4 w-4" />
              Réinitialiser
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={filters.searchQuery || ''}
              onChange={(e) => updateFilter('searchQuery', e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Risk Level */}
          <Select
            value={filters.riskLevel || 'all'}
            onValueChange={(value) =>
              updateFilter('riskLevel', value === 'all' ? undefined : value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Niveau de risque" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les niveaux</SelectItem>
              <SelectItem value="critical">Critique</SelectItem>
              <SelectItem value="high">Élevé</SelectItem>
              <SelectItem value="medium">Moyen</SelectItem>
              <SelectItem value="low">Faible</SelectItem>
            </SelectContent>
          </Select>

          {/* Acknowledgment Status */}
          <Select
            value={
              filters.acknowledged === undefined
                ? 'all'
                : filters.acknowledged
                  ? 'acknowledged'
                  : 'unacknowledged'
            }
            onValueChange={(value) =>
              updateFilter('acknowledged', value === 'all' ? undefined : value === 'acknowledged')
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="unacknowledged">Non traité</SelectItem>
              <SelectItem value="acknowledged">Traité</SelectItem>
            </SelectContent>
          </Select>

          {/* Date Range */}
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => updateFilter('dateFrom', e.target.value)}
              placeholder="Date début"
            />
            <span className="text-muted-foreground">à</span>
            <Input
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => updateFilter('dateTo', e.target.value)}
              placeholder="Date fin"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WaliAlertFilters;

import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Search, Calendar as CalendarIcon, X, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export interface EmailFilters {
  search: string;
  status: string;
  emailType: string;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy: 'date' | 'status' | 'type';
  sortOrder: 'asc' | 'desc';
}

interface WaliEmailHistoryFiltersProps {
  filters: EmailFilters;
  onFiltersChange: (filters: EmailFilters) => void;
  onReset: () => void;
}

const WaliEmailHistoryFilters: React.FC<WaliEmailHistoryFiltersProps> = ({
  filters,
  onFiltersChange,
  onReset,
}) => {
  const updateFilter = (key: keyof EmailFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const activeFilterCount = [
    filters.search,
    filters.status !== 'all',
    filters.emailType !== 'all',
    filters.dateFrom,
    filters.dateTo,
  ].filter(Boolean).length;

  return (
    <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <h3 className="font-semibold">Filtres</h3>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFilterCount}
            </Badge>
          )}
        </div>
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onReset} className="h-8">
            <X className="h-4 w-4 mr-1" />
            Réinitialiser
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="space-y-2">
          <Label>Rechercher</Label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Sujet ou contenu..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <Label>Statut</Label>
          <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="sent">Envoyé</SelectItem>
              <SelectItem value="delivered">Livré</SelectItem>
              <SelectItem value="opened">Ouvert</SelectItem>
              <SelectItem value="clicked">Cliqué</SelectItem>
              <SelectItem value="failed">Échoué</SelectItem>
              <SelectItem value="bounced">Rebondi</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Email Type Filter */}
        <div className="space-y-2">
          <Label>Type d'email</Label>
          <Select
            value={filters.emailType}
            onValueChange={(value) => updateFilter('emailType', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tous les types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              <SelectItem value="suspension">Suspension</SelectItem>
              <SelectItem value="contact">Contact</SelectItem>
              <SelectItem value="warning">Avertissement</SelectItem>
              <SelectItem value="reactivation">Réactivation</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort */}
        <div className="space-y-2">
          <Label>Trier par</Label>
          <div className="flex gap-2">
            <Select
              value={filters.sortBy}
              onValueChange={(value) => updateFilter('sortBy', value as 'date' | 'status' | 'type')}
            >
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="status">Statut</SelectItem>
                <SelectItem value="type">Type</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')
              }
              title={filters.sortOrder === 'asc' ? 'Croissant' : 'Décroissant'}
            >
              {filters.sortOrder === 'asc' ? '↑' : '↓'}
            </Button>
          </div>
        </div>
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Date de début</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !filters.dateFrom && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateFrom ? (
                  format(filters.dateFrom, 'PPP', { locale: fr })
                ) : (
                  <span>Sélectionner une date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.dateFrom}
                onSelect={(date) => updateFilter('dateFrom', date)}
                initialFocus
                className={cn('p-3 pointer-events-auto')}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>Date de fin</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !filters.dateTo && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateTo ? (
                  format(filters.dateTo, 'PPP', { locale: fr })
                ) : (
                  <span>Sélectionner une date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.dateTo}
                onSelect={(date) => updateFilter('dateTo', date)}
                disabled={(date) => (filters.dateFrom ? date < filters.dateFrom : false)}
                initialFocus
                className={cn('p-3 pointer-events-auto')}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};

export default WaliEmailHistoryFilters;

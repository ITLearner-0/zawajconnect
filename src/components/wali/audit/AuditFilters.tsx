import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Search, X } from 'lucide-react';
import { format } from 'date-fns';
import { AuditFilters as AuditFiltersType } from '@/hooks/wali/useWaliAuditTrail';

interface AuditFiltersProps {
  filters: AuditFiltersType;
  onFiltersChange: (filters: AuditFiltersType) => void;
}

const ACTION_TYPES = [
  { value: 'registration_approved', label: 'Inscription approuvée' },
  { value: 'registration_rejected', label: 'Inscription rejetée' },
  { value: 'registration_viewed', label: 'Inscription consultée' },
  { value: 'notes_updated', label: 'Notes mises à jour' },
  { value: 'comment_added', label: 'Commentaire ajouté' },
  { value: 'comment_updated', label: 'Commentaire modifié' },
  { value: 'comment_deleted', label: 'Commentaire supprimé' },
  { value: 'permission_changed', label: 'Permission modifiée' },
  { value: 'filter_saved', label: 'Filtre sauvegardé' },
];

export const AuditFilters = ({ filters, onFiltersChange }: AuditFiltersProps) => {
  const [localFilters, setLocalFilters] = useState<AuditFiltersType>(filters);

  const handleApply = () => {
    onFiltersChange(localFilters);
  };

  const handleReset = () => {
    const emptyFilters: AuditFiltersType = {};
    setLocalFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const hasActiveFilters = Object.keys(localFilters).some(
    (key) => localFilters[key as keyof AuditFiltersType] !== undefined
  );

  return (
    <Card className="p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Recherche</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Rechercher..."
              className="pl-9"
              value={localFilters.search || ''}
              onChange={(e) => setLocalFilters({ ...localFilters, search: e.target.value })}
            />
          </div>
        </div>

        {/* Action Type */}
        <div className="space-y-2">
          <Label>Type d'action</Label>
          <Select
            value={localFilters.actionType || 'all'}
            onValueChange={(value) =>
              setLocalFilters({
                ...localFilters,
                actionType: value === 'all' ? undefined : value,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Tous les types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              {ACTION_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Start Date */}
        <div className="space-y-2">
          <Label>Date de début</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {localFilters.startDate
                  ? format(localFilters.startDate, 'dd/MM/yyyy')
                  : 'Sélectionner'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={localFilters.startDate}
                onSelect={(date) => setLocalFilters({ ...localFilters, startDate: date })}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* End Date */}
        <div className="space-y-2">
          <Label>Date de fin</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {localFilters.endDate ? format(localFilters.endDate, 'dd/MM/yyyy') : 'Sélectionner'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={localFilters.endDate}
                onSelect={(date) => setLocalFilters({ ...localFilters, endDate: date })}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 justify-end">
        {hasActiveFilters && (
          <Button variant="outline" onClick={handleReset}>
            <X className="h-4 w-4 mr-2" />
            Réinitialiser
          </Button>
        )}
        <Button onClick={handleApply}>
          <Search className="h-4 w-4 mr-2" />
          Appliquer
        </Button>
      </div>
    </Card>
  );
};

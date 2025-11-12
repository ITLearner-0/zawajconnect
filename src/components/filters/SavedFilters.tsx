import React from 'react';
import { Label } from '@/components/ui/label';
import { FilterCriteria } from '@/utils/location';

interface SavedFiltersProps {
  savedFilters: Record<string, FilterCriteria>;
  onLoadFilter: (name: string) => void;
  onDeleteFilter: (name: string) => void;
}

const SavedFilters: React.FC<SavedFiltersProps> = ({
  savedFilters,
  onLoadFilter,
  onDeleteFilter,
}) => {
  if (Object.keys(savedFilters).length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <Label>Filtres Sauvegardés</Label>
      <div className="space-y-2">
        {Object.entries(savedFilters).map(([name, _]) => (
          <div key={name} className="flex items-center justify-between bg-secondary p-2 rounded">
            <span className="text-sm font-medium">{name}</span>
            <div className="space-x-2">
              <button
                onClick={() => onLoadFilter(name)}
                className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded"
              >
                Charger
              </button>
              <button
                onClick={() => onDeleteFilter(name)}
                className="text-xs px-2 py-1 bg-destructive text-destructive-foreground rounded"
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SavedFilters;

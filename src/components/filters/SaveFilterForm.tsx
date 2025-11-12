import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Check, X } from 'lucide-react';

interface SaveFilterFormProps {
  onSave: (name: string) => void;
  onCancel: () => void;
}

const SaveFilterForm: React.FC<SaveFilterFormProps> = ({ onSave, onCancel }) => {
  const [filterName, setFilterName] = useState('');

  const handleSave = () => {
    if (filterName.trim()) {
      onSave(filterName.trim());
      setFilterName('');
    }
  };

  return (
    <div className="space-y-3 border p-3 rounded-md">
      <Label htmlFor="filter-name">Sauvegarder le Filtre Actuel</Label>
      <div className="flex gap-2">
        <Input
          id="filter-name"
          placeholder="Nom du filtre"
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSave()}
        />
        <button
          onClick={handleSave}
          disabled={!filterName.trim()}
          className="p-2 bg-green-500 text-white rounded disabled:bg-gray-400"
        >
          <Check size={16} />
        </button>
        <button onClick={onCancel} className="p-2 bg-destructive text-white rounded">
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default SaveFilterForm;


import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Check, X } from "lucide-react";

interface SaveFilterFormProps {
  filterName: string;
  setFilterName: (name: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

const SaveFilterForm: React.FC<SaveFilterFormProps> = ({ 
  filterName, 
  setFilterName, 
  onSave, 
  onCancel 
}) => {
  return (
    <div className="space-y-3 border p-3 rounded-md">
      <Label htmlFor="filter-name">Save Current Filter</Label>
      <div className="flex gap-2">
        <Input 
          id="filter-name" 
          placeholder="Filter name" 
          value={filterName} 
          onChange={(e) => setFilterName(e.target.value)}
        />
        <button
          onClick={onSave}
          className="p-2 bg-green-500 text-white rounded"
        >
          <Check size={16} />
        </button>
        <button
          onClick={onCancel}
          className="p-2 bg-destructive text-white rounded"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default SaveFilterForm;

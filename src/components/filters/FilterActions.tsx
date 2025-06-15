
import React from "react";
import CustomButton from "@/components/CustomButton";
import { Save } from "lucide-react";

interface FilterActionsProps {
  onReset: () => void;
  onApply: () => void;
  onShowSaveForm: () => void;
  showSaveForm: boolean;
}

const FilterActions: React.FC<FilterActionsProps> = ({
  onReset,
  onApply,
  onShowSaveForm,
  showSaveForm
}) => {
  return (
    <div className="flex justify-between">
      <div className="space-x-2">
        <CustomButton variant="outline" onClick={onReset}>
          Réinitialiser
        </CustomButton>
        <CustomButton onClick={onApply}>
          Appliquer les Filtres
        </CustomButton>
      </div>
      {!showSaveForm && (
        <CustomButton variant="outline" onClick={onShowSaveForm}>
          <Save size={16} className="mr-2" />
          Sauvegarder le Filtre
        </CustomButton>
      )}
    </div>
  );
};

export default FilterActions;

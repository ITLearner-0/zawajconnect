
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
          Reset
        </CustomButton>
        <CustomButton onClick={onApply}>
          Apply Filters
        </CustomButton>
      </div>
      {!showSaveForm && (
        <CustomButton variant="outline" onClick={onShowSaveForm}>
          <Save size={16} className="mr-2" />
          Save Filter
        </CustomButton>
      )}
    </div>
  );
};

export default FilterActions;

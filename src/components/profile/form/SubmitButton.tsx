
import React from 'react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface SubmitButtonProps {
  onSubmit: () => void;
  isSubmitting: boolean;
  isLoading: boolean;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({ onSubmit, isSubmitting, isLoading }) => {
  return (
    <>
      <Separator />
      <div className="flex justify-center">
        <Button
          onClick={onSubmit}
          size="lg"
          className="bg-rose-600 hover:bg-rose-700 text-white px-8 py-3"
          disabled={isSubmitting || isLoading}
        >
          {isSubmitting ? "Sauvegarde en cours..." : "Sauvegarder le Profil"}
        </Button>
      </div>
    </>
  );
};

export default SubmitButton;

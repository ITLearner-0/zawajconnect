
import React from 'react';
import { Button } from '@/components/ui/button';

interface ProfileFormActionsProps {
  onSubmit: () => Promise<boolean>;
  isSubmitting: boolean;
}

const ProfileFormActions: React.FC<ProfileFormActionsProps> = ({ onSubmit, isSubmitting }) => {
  const handleFormSubmit = async () => {
    if (isSubmitting) return;
    
    try {
      const result = await onSubmit();
      return result;
    } catch (error) {
      console.error("ProfileFormActions handleSubmit error:", error);
      return false;
    }
  };

  return (
    <div className="flex justify-center pt-6">
      <Button 
        onClick={handleFormSubmit}
        disabled={isSubmitting}
        size="lg"
        className="bg-rose-600 hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600 text-white px-8 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Sauvegarde en cours..." : "Sauvegarder le profil"}
      </Button>
    </div>
  );
};

export default ProfileFormActions;


import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { setupModerationTables } from '@/utils/database/moderationTables';
import { toast } from 'sonner';

interface SetupButtonProps {
  show: boolean;
  onSetupComplete?: () => void;
}

const SetupButton: React.FC<SetupButtonProps> = ({ show, onSetupComplete }) => {
  const [loading, setLoading] = useState(false);
  
  if (!show) return null;
  
  const handleSetupTables = async () => {
    setLoading(true);
    try {
      const success = await setupModerationTables();
      
      if (success) {
        toast.success('Moderation tables have been set up successfully!');
        // Notify parent component that setup is complete
        if (onSetupComplete) {
          onSetupComplete();
        }
      } else {
        toast.error('Failed to set up moderation tables.');
      }
    } catch (error) {
      console.error('Error setting up moderation tables:', error);
      toast.error('An error occurred while setting up moderation tables.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="mb-6">
      <Button 
        onClick={handleSetupTables} 
        disabled={loading}
        className="flex items-center gap-2"
      >
        {loading ? 'Setting up...' : 'Setup Moderation Tables'}
      </Button>
    </div>
  );
};

export default SetupButton;

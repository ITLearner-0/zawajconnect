
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { setupModerationTables } from '@/utils/database/moderationTables';
import { setupRLSPolicies, checkRLSPolicies } from '@/utils/database/rls';
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
      // Setup moderation tables
      const moderationSuccess = await setupModerationTables();
      
      // Check and setup RLS policies
      const rlsPolicies = await checkRLSPolicies();
      const rlsExist = Object.keys(rlsPolicies).length > 0 && Object.values(rlsPolicies).every(Boolean);
      let rlsSuccess = rlsExist;
      
      if (!rlsExist) {
        rlsSuccess = await setupRLSPolicies();
      }
      
      if (moderationSuccess && rlsSuccess) {
        toast.success('Database tables and security policies have been set up successfully!');
        // Notify parent component that setup is complete
        if (onSetupComplete) {
          onSetupComplete();
        }
      } else {
        toast.error('Failed to complete database setup.');
      }
    } catch (error) {
      console.error('Error setting up database:', error);
      toast.error('An error occurred during database setup.');
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
        {loading ? 'Setting up...' : 'Setup Database & Security'}
      </Button>
    </div>
  );
};

export default SetupButton;


import React from 'react';
import { Button } from '@/components/ui/button';

interface SetupButtonProps {
  show: boolean;
}

const SetupButton: React.FC<SetupButtonProps> = ({ show }) => {
  if (!show) return null;
  
  return (
    <div className="mb-6">
      <Button>
        Setup Moderation Tables
      </Button>
    </div>
  );
};

export default SetupButton;

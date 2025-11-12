import React from 'react';
import { Button } from '@/components/ui/button';
import { Monitor } from 'lucide-react';

interface DevPanelToggleProps {
  onToggle: (show: boolean) => void;
}

const DevPanelToggle = ({ onToggle }: DevPanelToggleProps) => {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => onToggle(true)}
      className="fixed bottom-4 right-4 z-50"
    >
      <Monitor className="h-4 w-4 mr-2" />
      Lazy Loading Debug
    </Button>
  );
};

export default DevPanelToggle;

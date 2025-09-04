import React from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileNavToggleProps {
  onToggle: () => void;
}

const MobileNavToggle = ({ onToggle }: MobileNavToggleProps) => {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onToggle}
      className="fixed top-4 left-4 z-50 lg:hidden bg-card/80 backdrop-blur-sm border-border/50"
    >
      <Menu className="h-4 w-4" />
    </Button>
  );
};

export default MobileNavToggle;
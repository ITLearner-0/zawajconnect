import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Lock } from 'lucide-react';

interface ConversationStatusBadgeProps {
  className?: string;
}

export const ConversationStatusBadge: React.FC<ConversationStatusBadgeProps> = ({ 
  className = '' 
}) => {
  return (
    <Badge 
      variant="secondary" 
      className={`flex items-center gap-1 ${className}`}
    >
      <Lock className="h-3 w-3" />
      En discussion
    </Badge>
  );
};

/**
 * QuickActionsScroll - Horizontal scrolling quick actions for mobile
 * Displays action buttons in a horizontal scrollable container
 * Optimized for touch gestures
 */

import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface QuickAction {
  /** Unique identifier */
  id: string;
  /** Action label */
  label: string;
  /** Lucide icon component */
  icon: LucideIcon;
  /** Click handler */
  onClick: () => void;
  /** Button variant */
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  /** Custom className */
  className?: string;
}

interface QuickActionsScrollProps {
  /** Array of quick actions to display */
  actions: QuickAction[];
  /** Custom className for container */
  className?: string;
}

const QuickActionsScroll = ({ actions, className }: QuickActionsScrollProps) => {
  if (actions.length === 0) return null;

  return (
    <div className={cn('lg:hidden -mx-4 px-4 overflow-x-auto', className)}>
      <div className="flex gap-3 pb-2 min-w-max">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.id}
              variant={action.variant || 'outline'}
              className={cn(
                'whitespace-nowrap flex-shrink-0 touch-manipulation',
                'hover:bg-gray-50 active:bg-gray-100 transition-colors',
                'border-2',
                action.className
              )}
              onClick={action.onClick}
              size="default"
            >
              <Icon className="h-4 w-4 mr-2" />
              {action.label}
            </Button>
          );
        })}
      </div>

      {/* Scroll indicator gradient */}
      <style jsx>{`
        .overflow-x-auto {
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .overflow-x-auto::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default QuickActionsScroll;

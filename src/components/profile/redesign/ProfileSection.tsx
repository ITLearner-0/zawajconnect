import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { collapseVariants } from '@/styles/animations';
import { cn } from '@/lib/utils';

interface ProfileSectionProps {
  /**
   * Icon component to display in the header
   */
  icon: LucideIcon;

  /**
   * Section title
   */
  title: string;

  /**
   * Section content
   */
  children: React.ReactNode;

  /**
   * Whether the section is open by default
   */
  defaultOpen?: boolean;

  /**
   * Accent color for the icon
   */
  accentColor?: 'emerald' | 'gold' | 'rose' | 'sage';

  /**
   * Optional badge/counter to display next to title
   */
  badge?: React.ReactNode;

  /**
   * Optional actions (buttons, etc.) to display in header
   */
  actions?: React.ReactNode;

  /**
   * Custom className for the card
   */
  className?: string;

  /**
   * Whether the section is collapsible
   */
  collapsible?: boolean;
}

/**
 * ProfileSection Component
 *
 * A reusable, collapsible section container for profile content.
 * Features:
 * - Collapsible with smooth animations
 * - Icon with customizable accent color
 * - Optional badge and actions
 * - Responsive design
 */
const ProfileSection = ({
  icon: Icon,
  title,
  children,
  defaultOpen = true,
  accentColor = 'emerald',
  badge,
  actions,
  className,
  collapsible = true,
}: ProfileSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const colorClasses = {
    emerald: {
      bg: 'bg-emerald-100',
      icon: 'text-emerald-600',
      hover: 'group-hover:bg-emerald-200',
    },
    gold: {
      bg: 'bg-gold-100',
      icon: 'text-gold-600',
      hover: 'group-hover:bg-gold-200',
    },
    rose: {
      bg: 'bg-rose-100',
      icon: 'text-rose-600',
      hover: 'group-hover:bg-rose-200',
    },
    sage: {
      bg: 'bg-sage-100',
      icon: 'text-sage-600',
      hover: 'group-hover:bg-sage-200',
    },
  };

  const colors = colorClasses[accentColor];

  const handleToggle = () => {
    if (collapsible) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <Card className={cn('overflow-hidden', className)}>
      {/* Header */}
      <button
        onClick={handleToggle}
        className={cn(
          'group w-full p-6 flex items-center justify-between transition-colors',
          collapsible ? 'hover:bg-gray-50 cursor-pointer' : 'cursor-default'
        )}
        disabled={!collapsible}
        aria-expanded={isOpen}
        aria-label={collapsible ? `${isOpen ? 'Fermer' : 'Ouvrir'} ${title}` : title}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Icon */}
          <div
            className={cn(
              'p-2 rounded-lg transition-colors flex-shrink-0',
              colors.bg,
              collapsible && colors.hover
            )}
          >
            <Icon className={cn('h-5 w-5', colors.icon)} />
          </div>

          {/* Title & Badge */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <h2 className="text-xl font-semibold text-gray-900 truncate">{title}</h2>
            {badge && <div className="flex-shrink-0">{badge}</div>}
          </div>
        </div>

        {/* Actions & Chevron */}
        <div className="flex items-center gap-2 ml-4 flex-shrink-0">
          {actions && <div className="hidden sm:block">{actions}</div>}
          {collapsible && (
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-5 w-5 text-gray-400" />
            </motion.div>
          )}
        </div>
      </button>

      {/* Content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            variants={collapseVariants}
          >
            <div className="px-6 pb-6 border-t border-gray-100">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export default ProfileSection;

// ============================================================================
// InfoGrid Component - For displaying key-value pairs in a grid
// ============================================================================

interface InfoGridProps {
  items: Array<{
    label: string;
    value: React.ReactNode;
    icon?: LucideIcon;
  }>;
  columns?: 1 | 2 | 3;
}

export const InfoGrid = ({ items, columns = 2 }: InfoGridProps) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  };

  return (
    <div className={cn('grid gap-4 mt-4', gridCols[columns])}>
      {items.map((item, index) => (
        <InfoItem key={index} {...item} />
      ))}
    </div>
  );
};

// ============================================================================
// InfoItem Component - Single key-value display
// ============================================================================

interface InfoItemProps {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
}

export const InfoItem = ({ label, value, icon: Icon }: InfoItemProps) => {
  if (!value) return null;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
    >
      <div className="flex items-center gap-2">
        {Icon && (
          <div className="p-1 rounded bg-gray-200">
            <Icon className="h-3 w-3 text-gray-600" />
          </div>
        )}
        <span className="text-sm text-gray-600">{label}</span>
      </div>
      <span className="text-sm font-medium text-gray-900 text-right">{value}</span>
    </motion.div>
  );
};

// ============================================================================
// SectionContent Component - Generic content wrapper with spacing
// ============================================================================

interface SectionContentProps {
  children: React.ReactNode;
  className?: string;
}

export const SectionContent = ({ children, className }: SectionContentProps) => {
  return <div className={cn('space-y-4 mt-4', className)}>{children}</div>;
};

// ============================================================================
// SectionText Component - For text content with proper formatting
// ============================================================================

interface SectionTextProps {
  children: React.ReactNode;
  className?: string;
}

export const SectionText = ({ children, className }: SectionTextProps) => {
  return (
    <p className={cn('text-gray-700 leading-relaxed whitespace-pre-wrap', className)}>
      {children}
    </p>
  );
};

// ============================================================================
// EmptyState Component - For empty sections
// ============================================================================

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState = ({ icon: Icon, title, description, action }: EmptyStateProps) => {
  return (
    <div className="py-12 text-center">
      <div className="max-w-sm mx-auto space-y-4">
        <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
          <Icon className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {description && <p className="text-sm text-gray-600">{description}</p>}
        {action && (
          <button
            onClick={action.onClick}
            className="inline-flex items-center px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
};

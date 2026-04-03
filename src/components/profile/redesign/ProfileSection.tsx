import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, LucideIcon } from 'lucide-react';
import { collapseVariants } from '@/styles/animations';
import { cn } from '@/lib/utils';

interface ProfileSectionProps {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  accentColor?: 'emerald' | 'gold' | 'rose' | 'sage';
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  collapsible?: boolean;
}

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

  const handleToggle = () => {
    if (collapsible) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div
      className={cn('rounded-2xl overflow-hidden', className)}
      style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)' }}
    >
      {/* Header */}
      <button
        onClick={handleToggle}
        className={cn(
          'group w-full p-5 flex items-center justify-between transition-colors',
          collapsible ? 'cursor-pointer' : 'cursor-default'
        )}
        disabled={!collapsible}
        aria-expanded={isOpen}
        aria-label={collapsible ? `${isOpen ? 'Fermer' : 'Ouvrir'} ${title}` : title}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className="p-2 rounded-lg flex-shrink-0"
            style={{ backgroundColor: 'var(--color-primary-light)' }}
          >
            <Icon className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
          </div>

          <div className="flex items-center gap-3 flex-1 min-w-0">
            <h2 className="text-lg font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
              {title}
            </h2>
            {badge && <div className="flex-shrink-0">{badge}</div>}
          </div>
        </div>

        <div className="flex items-center gap-2 ml-4 flex-shrink-0">
          {actions && <div className="hidden sm:block">{actions}</div>}
          {collapsible && (
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-5 w-5" style={{ color: 'var(--color-text-muted)' }} />
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
            <div className="px-5 pb-5" style={{ borderTop: '1px solid var(--color-border-subtle)' }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileSection;

// ============================================================================
// InfoGrid Component
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
    <div className={cn('grid gap-3 mt-4', gridCols[columns])}>
      {items.map((item, index) => (
        <InfoItem key={index} {...item} />
      ))}
    </div>
  );
};

// ============================================================================
// InfoItem Component
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
      className="flex justify-between items-center p-3 rounded-lg transition-colors"
      style={{ backgroundColor: 'var(--color-bg-subtle)' }}
    >
      <div className="flex items-center gap-2">
        {Icon && (
          <div className="p-1 rounded" style={{ backgroundColor: 'var(--color-bg-hover)' }}>
            <Icon className="h-3 w-3" style={{ color: 'var(--color-text-muted)' }} />
          </div>
        )}
        <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{label}</span>
      </div>
      <span className="text-sm font-medium text-right" style={{ color: 'var(--color-text-primary)' }}>{value}</span>
    </motion.div>
  );
};

// ============================================================================
// SectionContent Component
// ============================================================================

interface SectionContentProps {
  children: React.ReactNode;
  className?: string;
}

export const SectionContent = ({ children, className }: SectionContentProps) => {
  return <div className={cn('space-y-4 mt-4', className)}>{children}</div>;
};

// ============================================================================
// SectionText Component
// ============================================================================

interface SectionTextProps {
  children: React.ReactNode;
  className?: string;
}

export const SectionText = ({ children, className }: SectionTextProps) => {
  return (
    <p className={cn('leading-relaxed whitespace-pre-wrap', className)} style={{ color: 'var(--color-text-secondary)' }}>
      {children}
    </p>
  );
};

// ============================================================================
// EmptyState Component
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
        <div
          className="mx-auto w-16 h-16 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'var(--color-bg-subtle)' }}
        >
          <Icon className="h-8 w-8" style={{ color: 'var(--color-text-muted)' }} />
        </div>
        <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>{title}</h3>
        {description && <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{description}</p>}
        {action && (
          <button
            onClick={action.onClick}
            className="inline-flex items-center px-4 py-2 rounded-lg transition-colors"
            style={{ backgroundColor: 'var(--color-primary)', color: '#fff', borderRadius: 'var(--radius-md)' }}
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
};

import React from 'react';
import { cn } from '@/lib/utils';

type ZBadgeVariant = 'success' | 'info' | 'warning' | 'danger' | 'muted' | 'primary';

interface ZBadgeProps {
  children: React.ReactNode;
  variant?: ZBadgeVariant;
  className?: string;
}

const variantClasses: Record<ZBadgeVariant, string> = {
  success: 'bg-[var(--color-success-bg)] text-[var(--color-success)] border-[var(--color-success-border)]',
  info:    'bg-[var(--color-info-bg)] text-[var(--color-info)] border-[var(--color-info-border)]',
  warning: 'bg-[var(--color-warning-bg)] text-[var(--color-warning)] border-[var(--color-warning-border)]',
  danger:  'bg-[var(--color-danger-bg)] text-[var(--color-danger)] border-[var(--color-danger-border)]',
  muted:   'bg-[var(--color-bg-subtle)] text-[var(--color-text-muted)] border-[var(--color-border-subtle)]',
  primary: 'bg-[var(--color-primary-light)] text-[var(--color-primary)] border-[var(--color-primary-border)]',
};

export const ZBadge: React.FC<ZBadgeProps> = ({
  children, variant = 'muted', className,
}) => (
  <span className={cn(
    'inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full border',
    variantClasses[variant],
    className,
  )}>
    {children}
  </span>
);

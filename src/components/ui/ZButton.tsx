import React from 'react';
import { cn } from '@/lib/utils';

type ZButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ZButtonSize = 'sm' | 'md' | 'lg';

interface ZButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ZButtonVariant;
  size?: ZButtonSize;
  children: React.ReactNode;
}

const variantClasses: Record<ZButtonVariant, string> = {
  primary:   'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] border-transparent',
  secondary: 'bg-[var(--color-bg-card)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-subtle)] border-[var(--color-border-default)]',
  ghost:     'bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)] border-transparent',
  danger:    'bg-[var(--color-danger-bg)] text-[var(--color-danger)] hover:bg-red-50 border-[var(--color-danger-border)]',
};

const sizeClasses: Record<ZButtonSize, string> = {
  sm: 'text-xs px-3 py-1.5 rounded-lg',
  md: 'text-sm px-4 py-2 rounded-xl',
  lg: 'text-sm px-5 py-2.5 rounded-xl',
};

export const ZButton: React.FC<ZButtonProps> = ({
  variant = 'secondary', size = 'md', children, className, ...props
}) => (
  <button className={cn(
    'inline-flex items-center justify-center gap-2 font-medium border transition-colors cursor-pointer',
    variantClasses[variant],
    sizeClasses[size],
    className,
  )} {...props}>
    {children}
  </button>
);

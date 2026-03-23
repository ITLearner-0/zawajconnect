import React from 'react';
import { cn } from '@/lib/utils';

interface ZCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  noBorder?: boolean;
}

const paddingMap = { sm: 'p-3', md: 'p-4', lg: 'p-6' };

export const ZCard: React.FC<ZCardProps> = ({
  children, className, padding = 'md', noBorder = false,
}) => (
  <div className={cn(
    'rounded-2xl bg-[var(--color-bg-card)]',
    !noBorder && 'border border-[var(--color-border-default)]',
    paddingMap[padding],
    className,
  )}>
    {children}
  </div>
);

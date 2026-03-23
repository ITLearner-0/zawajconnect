import React from 'react';
import { cn } from '@/lib/utils';

export const ZLabel: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children, className,
}) => (
  <p className={cn(
    'text-[10px] uppercase tracking-[0.05em] text-[var(--color-text-muted)] mb-0.5',
    className,
  )}>
    {children}
  </p>
);

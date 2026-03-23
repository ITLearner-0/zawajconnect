import React from 'react';
import { cn } from '@/lib/utils';

export const ZDivider: React.FC<{ className?: string }> = ({ className }) => (
  <hr className={cn('border-0 border-t border-[var(--color-border-subtle)]', className)} />
);

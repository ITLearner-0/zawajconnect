import React from 'react';
import { cn } from '@/lib/utils';

interface ZProgressBarProps {
  value: number; // 0-100
  color?: 'primary' | 'accent';
  height?: number;
  className?: string;
}

export const ZProgressBar: React.FC<ZProgressBarProps> = ({
  value, color = 'primary', height = 4, className,
}) => (
  <div
    className={cn('rounded-full bg-[var(--color-border-subtle)] overflow-hidden', className)}
    style={{ height }}
  >
    <div
      className="rounded-full transition-all"
      style={{
        width: `${Math.min(100, Math.max(0, value))}%`,
        height,
        background: color === 'primary' ? 'var(--color-primary)' : 'var(--color-accent)',
      }}
    />
  </div>
);

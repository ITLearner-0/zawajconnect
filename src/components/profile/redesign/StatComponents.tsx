/**
 * Reusable Stat Components
 *
 * Collection of components for displaying statistics and metrics
 * across the profile pages.
 */

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// ============================================================================
// Color Configuration
// ============================================================================

type ColorVariant = 'emerald' | 'gold' | 'rose' | 'sage' | 'blue';

const colorClasses = {
  emerald: {
    bg: 'bg-emerald-500',
    bgLight: 'bg-emerald-50',
    bgLighter: 'bg-emerald-100',
    text: 'text-emerald-600',
    textDark: 'text-emerald-700',
    border: 'border-emerald-500',
  },
  gold: {
    bg: 'bg-gold-500',
    bgLight: 'bg-gold-50',
    bgLighter: 'bg-gold-100',
    text: 'text-gold-600',
    textDark: 'text-gold-700',
    border: 'border-gold-500',
  },
  rose: {
    bg: 'bg-rose-500',
    bgLight: 'bg-rose-50',
    bgLighter: 'bg-rose-100',
    text: 'text-rose-600',
    textDark: 'text-rose-700',
    border: 'border-rose-500',
  },
  sage: {
    bg: 'bg-sage-500',
    bgLight: 'bg-sage-50',
    bgLighter: 'bg-sage-100',
    text: 'text-sage-600',
    textDark: 'text-sage-700',
    border: 'border-sage-500',
  },
  blue: {
    bg: 'bg-blue-500',
    bgLight: 'bg-blue-50',
    bgLighter: 'bg-blue-100',
    text: 'text-blue-600',
    textDark: 'text-blue-700',
    border: 'border-blue-500',
  },
};

// ============================================================================
// StatCard - Large stat display card
// ============================================================================

export interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color?: ColorVariant;
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
}

export const StatCard = ({
  icon: Icon,
  label,
  value,
  color = 'emerald',
  trend,
  className,
}: StatCardProps) => {
  const colors = colorClasses[color];

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className={cn(
        'rounded-2xl p-6 transition-shadow',
        className
      )}
      style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)' }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-[var(--color-text-muted)] mb-2">{label}</p>
          <p className={cn('text-3xl font-bold tabular-nums', colors.textDark)}>{value}</p>
          {trend && (
            <p className="text-xs text-[var(--color-text-muted)] mt-2">
              <span className={trend.value >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                {trend.value >= 0 ? '+' : ''}
                {trend.value}%
              </span>{' '}
              {trend.label}
            </p>
          )}
        </div>
        <div className={cn('p-3 rounded-lg', colors.bgLight)}>
          <Icon className={cn('h-6 w-6', colors.text)} />
        </div>
      </div>
    </motion.div>
  );
};

// ============================================================================
// StatItem - Compact stat display
// ============================================================================

export interface StatItemProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color?: ColorVariant;
  index?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const StatItem = ({
  icon: Icon,
  label,
  value,
  color = 'emerald',
  size = 'md',
}: StatItemProps) => {
  const colors = colorClasses[color];

  const sizes = {
    sm: {
      icon: 'h-3 w-3',
      iconContainer: 'w-7 h-7',
      value: 'text-base',
      label: 'text-xs',
    },
    md: {
      icon: 'h-4 w-4',
      iconContainer: 'w-10 h-10',
      value: 'text-lg',
      label: 'text-xs',
    },
    lg: {
      icon: 'h-5 w-5',
      iconContainer: 'w-12 h-12',
      value: 'text-2xl',
      label: 'text-sm',
    },
  };

  const sizeClasses = sizes[size];

  return (
    <motion.div whileHover={{ scale: 1.05, y: -2 }} className="text-center">
      <div
        className={cn(
          'inline-flex items-center justify-center rounded-full mb-2',
          colors.bgLight,
          sizeClasses.iconContainer
        )}
      >
        <Icon className={cn(colors.text, sizeClasses.icon)} />
      </div>
      <div className={cn('font-bold', colors.textDark, sizeClasses.value)}>{value}</div>
      <div className="text-[var(--color-text-muted)] uppercase tracking-wide" style={{ fontSize: '0.7rem' }}>
        {label}
      </div>
    </motion.div>
  );
};

// ============================================================================
// ProgressItem - Progress bar with label and percentage
// ============================================================================

export interface ProgressItemProps {
  label: string;
  percentage: number;
  color?: ColorVariant;
  icon?: LucideIcon;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export const ProgressItem = ({
  label,
  percentage,
  color = 'emerald',
  icon: Icon,
  showPercentage = true,
  size = 'md',
  animated = true,
}: ProgressItemProps) => {
  const colors = colorClasses[color];

  const sizes = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <motion.div whileHover={{ scale: 1.02 }} className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {Icon && (
            <div className={cn('p-1 rounded', colors.bgLighter)}>
              <Icon className={cn('h-3 w-3', colors.text)} />
            </div>
          )}
          <span className="text-sm font-medium text-[var(--color-text-secondary)]">{label}</span>
        </div>
        {showPercentage && (
          <span className="text-sm font-semibold text-[var(--color-text-primary)]">{percentage}%</span>
        )}
      </div>
      <div className={cn('w-full bg-[var(--color-bg-subtle)] rounded-full overflow-hidden', sizes[size])}>
        <motion.div
          initial={animated ? { width: 0 } : { width: `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: animated ? 0.2 : 0 }}
          className={cn('h-full', colors.bg)}
        />
      </div>
    </motion.div>
  );
};

// ============================================================================
// CircularProgress - Circular progress indicator
// ============================================================================

export interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: ColorVariant;
  label?: string;
  showPercentage?: boolean;
}

export const CircularProgress = ({
  percentage,
  size = 120,
  strokeWidth = 8,
  color = 'emerald',
  label,
  showPercentage = true,
}: CircularProgressProps) => {
  const colors = colorClasses[color];
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={colors.text}
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showPercentage && (
          <span className={cn('text-2xl font-bold', colors.textDark)}>{percentage}%</span>
        )}
        {label && <span className="text-xs text-[var(--color-text-muted)] mt-1">{label}</span>}
      </div>
    </div>
  );
};

// ============================================================================
// MetricRow - Row display for metrics
// ============================================================================

export interface MetricRowProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color?: ColorVariant;
  badge?: React.ReactNode;
}

export const MetricRow = ({ icon: Icon, label, value, color = 'sage', badge }: MetricRowProps) => {
  const colors = colorClasses[color];

  return (
    <motion.div
      whileHover={{ x: 4 }}
      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-[var(--color-bg-hover)] transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className={cn('p-2 rounded-lg', colors.bgLight)}>
          <Icon className={cn('h-4 w-4', colors.text)} />
        </div>
        <span className="text-sm text-[var(--color-text-secondary)]">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {badge}
        <span className="text-lg font-semibold text-[var(--color-text-primary)]">{value}</span>
      </div>
    </motion.div>
  );
};

// ============================================================================
// ComparisonBar - Horizontal comparison bar
// ============================================================================

export interface ComparisonBarProps {
  label: string;
  leftValue: number;
  rightValue: number;
  leftLabel?: string;
  rightLabel?: string;
  leftColor?: ColorVariant;
  rightColor?: ColorVariant;
}

export const ComparisonBar = ({
  label,
  leftValue,
  rightValue,
  leftLabel = 'You',
  rightLabel = 'Average',
  leftColor = 'emerald',
  rightColor = 'sage',
}: ComparisonBarProps) => {
  const leftColors = colorClasses[leftColor];
  const rightColors = colorClasses[rightColor];

  const total = leftValue + rightValue;
  const leftPercentage = (leftValue / total) * 100;
  const rightPercentage = (rightValue / total) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-[var(--color-text-secondary)]">{label}</span>
      </div>

      <div className="flex items-center gap-2 h-8 rounded-full overflow-hidden bg-[var(--color-bg-subtle)]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${leftPercentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={cn('h-full', leftColors.bg)}
        />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${rightPercentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={cn('h-full', rightColors.bg)}
        />
      </div>

      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1">
          <div className={cn('w-2 h-2 rounded-full', leftColors.bg)} />
          <span className="text-[var(--color-text-muted)]">{leftLabel}: {leftValue}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[var(--color-text-muted)]">{rightLabel}: {rightValue}</span>
          <div className={cn('w-2 h-2 rounded-full', rightColors.bg)} />
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Helper function to get score color
// ============================================================================

export const getScoreColor = (percentage: number): ColorVariant => {
  if (percentage >= 80) return 'emerald';
  if (percentage >= 60) return 'gold';
  if (percentage >= 40) return 'blue';
  return 'rose';
};

// ============================================================================
// Helper function to format large numbers
// ============================================================================

export const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

/**
 * ZawajConnect Typography System
 *
 * Hierarchical typography system for consistent text styling across the platform.
 */

// ============================================================================
// Font Families
// ============================================================================

export const fontFamily = {
  sans: [
    'Inter',
    'ui-sans-serif',
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Helvetica Neue',
    'Arial',
    'sans-serif',
  ].join(', '),
  arabic: [
    'Cairo',
    'Tajawal',
    'ui-sans-serif',
    'system-ui',
    'sans-serif',
  ].join(', '),
  mono: [
    'ui-monospace',
    'SFMono-Regular',
    'Menlo',
    'Monaco',
    'Consolas',
    'Liberation Mono',
    'Courier New',
    'monospace',
  ].join(', '),
} as const;

// ============================================================================
// Font Sizes
// ============================================================================

export const fontSize = {
  xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px
  sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
  base: ['1rem', { lineHeight: '1.5rem' }],     // 16px
  lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
  xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
  '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px
  '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
  '4xl': ['2.25rem', { lineHeight: '2.5rem' }], // 36px
  '5xl': ['3rem', { lineHeight: '1' }],         // 48px
  '6xl': ['3.75rem', { lineHeight: '1' }],      // 60px
  '7xl': ['4.5rem', { lineHeight: '1' }],       // 72px
  '8xl': ['6rem', { lineHeight: '1' }],         // 96px
  '9xl': ['8rem', { lineHeight: '1' }],         // 128px
} as const;

// ============================================================================
// Font Weights
// ============================================================================

export const fontWeight = {
  thin: '100',
  extralight: '200',
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
} as const;

// ============================================================================
// Line Heights
// ============================================================================

export const lineHeight = {
  none: '1',
  tight: '1.25',
  snug: '1.375',
  normal: '1.5',
  relaxed: '1.625',
  loose: '2',
} as const;

// ============================================================================
// Letter Spacing
// ============================================================================

export const letterSpacing = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0em',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
} as const;

// ============================================================================
// Typography Variants
// ============================================================================

export const typography = {
  // Headings
  h1: {
    className: 'text-3xl md:text-4xl font-bold text-gray-900 tracking-tight',
    style: {
      fontSize: '2.25rem',
      fontWeight: '700',
      lineHeight: '2.5rem',
      letterSpacing: '-0.025em',
    },
    responsive: {
      base: 'text-3xl',
      md: 'md:text-4xl',
    },
  },

  h2: {
    className: 'text-2xl md:text-3xl font-semibold text-gray-800 tracking-tight',
    style: {
      fontSize: '1.875rem',
      fontWeight: '600',
      lineHeight: '2.25rem',
      letterSpacing: '-0.025em',
    },
    responsive: {
      base: 'text-2xl',
      md: 'md:text-3xl',
    },
  },

  h3: {
    className: 'text-xl md:text-2xl font-medium text-gray-800',
    style: {
      fontSize: '1.5rem',
      fontWeight: '500',
      lineHeight: '2rem',
    },
    responsive: {
      base: 'text-xl',
      md: 'md:text-2xl',
    },
  },

  h4: {
    className: 'text-lg font-medium text-gray-700',
    style: {
      fontSize: '1.125rem',
      fontWeight: '500',
      lineHeight: '1.75rem',
    },
  },

  h5: {
    className: 'text-base font-medium text-gray-700',
    style: {
      fontSize: '1rem',
      fontWeight: '500',
      lineHeight: '1.5rem',
    },
  },

  h6: {
    className: 'text-sm font-medium text-gray-700',
    style: {
      fontSize: '0.875rem',
      fontWeight: '500',
      lineHeight: '1.25rem',
    },
  },

  // Body Text
  body: {
    className: 'text-base text-gray-700 leading-relaxed',
    style: {
      fontSize: '1rem',
      fontWeight: '400',
      lineHeight: '1.625rem',
    },
  },

  bodyLarge: {
    className: 'text-lg text-gray-700 leading-relaxed',
    style: {
      fontSize: '1.125rem',
      fontWeight: '400',
      lineHeight: '1.75rem',
    },
  },

  bodySmall: {
    className: 'text-sm text-gray-600 leading-normal',
    style: {
      fontSize: '0.875rem',
      fontWeight: '400',
      lineHeight: '1.5rem',
    },
  },

  // Caption & Labels
  caption: {
    className: 'text-sm text-gray-500',
    style: {
      fontSize: '0.875rem',
      fontWeight: '400',
      lineHeight: '1.25rem',
    },
  },

  captionBold: {
    className: 'text-sm text-gray-600 font-medium',
    style: {
      fontSize: '0.875rem',
      fontWeight: '500',
      lineHeight: '1.25rem',
    },
  },

  label: {
    className: 'text-xs font-medium uppercase tracking-wide text-gray-500',
    style: {
      fontSize: '0.75rem',
      fontWeight: '500',
      lineHeight: '1rem',
      letterSpacing: '0.05em',
      textTransform: 'uppercase' as const,
    },
  },

  // Special Typography
  stat: {
    className: 'text-3xl font-bold tabular-nums',
    style: {
      fontSize: '1.875rem',
      fontWeight: '700',
      lineHeight: '2.25rem',
      fontVariantNumeric: 'tabular-nums',
    },
  },

  statLarge: {
    className: 'text-4xl md:text-5xl font-bold tabular-nums',
    style: {
      fontSize: '2.25rem',
      fontWeight: '700',
      lineHeight: '2.5rem',
      fontVariantNumeric: 'tabular-nums',
    },
    responsive: {
      base: 'text-4xl',
      md: 'md:text-5xl',
    },
  },

  percentage: {
    className: 'text-2xl font-semibold tabular-nums',
    style: {
      fontSize: '1.5rem',
      fontWeight: '600',
      lineHeight: '2rem',
      fontVariantNumeric: 'tabular-nums',
    },
  },

  // Links
  link: {
    className: 'text-emerald-600 hover:text-emerald-700 underline underline-offset-2 transition-colors',
    style: {
      color: '#059669',
      textDecoration: 'underline',
      textUnderlineOffset: '2px',
    },
  },

  linkSubtle: {
    className: 'text-gray-700 hover:text-emerald-600 transition-colors',
    style: {
      color: '#374151',
    },
  },

  // Display Text (Hero sections)
  display: {
    className: 'text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight',
    style: {
      fontSize: '3rem',
      fontWeight: '700',
      lineHeight: '1',
      letterSpacing: '-0.025em',
    },
    responsive: {
      base: 'text-4xl',
      md: 'md:text-5xl',
      lg: 'lg:text-6xl',
    },
  },

  displaySmall: {
    className: 'text-3xl md:text-4xl font-bold text-gray-900 tracking-tight',
    style: {
      fontSize: '1.875rem',
      fontWeight: '700',
      lineHeight: '2.25rem',
      letterSpacing: '-0.025em',
    },
    responsive: {
      base: 'text-3xl',
      md: 'md:text-4xl',
    },
  },

  // Mono (for code or data)
  mono: {
    className: 'font-mono text-sm text-gray-700',
    style: {
      fontFamily: fontFamily.mono,
      fontSize: '0.875rem',
      lineHeight: '1.5rem',
    },
  },

  // Arabic Text Support
  arabic: {
    className: 'text-base text-gray-700 leading-loose',
    style: {
      fontFamily: fontFamily.arabic,
      fontSize: '1rem',
      lineHeight: '2rem',
      direction: 'rtl' as const,
    },
  },
} as const;

// ============================================================================
// Utility Classes for Common Patterns
// ============================================================================

export const textUtilities = {
  truncate: 'truncate overflow-hidden text-ellipsis whitespace-nowrap',
  truncate2Lines: 'line-clamp-2 overflow-hidden text-ellipsis',
  truncate3Lines: 'line-clamp-3 overflow-hidden text-ellipsis',
  noWrap: 'whitespace-nowrap',
  breakWords: 'break-words',
  center: 'text-center',
  left: 'text-left',
  right: 'text-right',
  justify: 'text-justify',
} as const;

// ============================================================================
// Semantic Text Colors
// ============================================================================

export const textColors = {
  // Primary text colors
  primary: 'text-gray-900',
  secondary: 'text-gray-700',
  tertiary: 'text-gray-600',
  muted: 'text-gray-500',
  disabled: 'text-gray-400',

  // Brand colors
  emerald: 'text-emerald-600',
  gold: 'text-gold-600',
  rose: 'text-rose-600',
  sage: 'text-sage-600',

  // Status colors
  success: 'text-emerald-600',
  warning: 'text-gold-600',
  error: 'text-rose-600',
  info: 'text-blue-600',

  // Inverted
  inverse: 'text-white',
} as const;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get typography classes as a string
 */
export const getTypographyClass = (variant: keyof typeof typography): string => {
  return typography[variant].className;
};

/**
 * Combine typography variant with custom classes
 */
export const combineTypography = (variant: keyof typeof typography, customClasses?: string): string => {
  return [typography[variant].className, customClasses].filter(Boolean).join(' ');
};

/**
 * Get responsive typography classes
 */
export const getResponsiveTypography = (variant: keyof typeof typography): string => {
  const config = typography[variant];
  if ('responsive' in config && config.responsive) {
    return Object.values(config.responsive).join(' ');
  }
  return config.className;
};

// ============================================================================
// Export
// ============================================================================

export default {
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
  typography,
  textUtilities,
  textColors,
  getTypographyClass,
  combineTypography,
  getResponsiveTypography,
};

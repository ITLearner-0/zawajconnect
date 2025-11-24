/**
 * ZawajConnect Design System
 *
 * Unified design tokens for the Islamic matrimony platform.
 * Theme: "Islamic Matrimony" - Fusion of Islamic identity and romantic engagement
 */

// ============================================================================
// Color Palette
// ============================================================================

export const colors = {
  // Islamic Identity Colors
  emerald: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981', // Primary - Actions, Success
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
    950: '#022c22',
  },

  gold: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b', // Accent - Premium, Badges, Verification
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },

  // Engagement & Love Colors
  rose: {
    50: '#fff1f2',
    100: '#ffe4e6',
    200: '#fecdd3',
    300: '#fda4af',
    400: '#fb7185',
    500: '#f43f5e', // Engagement - Like, Message, Romance
    600: '#e11d48',
    700: '#be123c',
    800: '#9f1239',
    900: '#881337',
    950: '#4c0519',
  },

  // Neutrality & Balance Colors
  sage: {
    50: '#f6f7f6',
    100: '#e8ebe9',
    200: '#d1d7d3',
    300: '#adb8b3',
    400: '#84a98c', // Subtle backgrounds
    500: '#6b8a74',
    600: '#546f5e',
    700: '#455a4d',
    800: '#394a40',
    900: '#303d36',
    950: '#1a221e',
  },

  // Additional Utility Colors
  cream: {
    50: '#fefdfb',
    100: '#fdfcf8',
    200: '#fbf9f1',
    300: '#f8f5e9',
    400: '#f5f1e1',
    500: '#f2edd9', // Warm backgrounds
  },
} as const;

// ============================================================================
// Color Usage Guidelines
// ============================================================================

export const colorUsage = {
  // Primary Actions
  primary: 'emerald-500',
  primaryHover: 'emerald-600',
  primaryActive: 'emerald-700',

  // Premium/Verification
  accent: 'gold-500',
  accentHover: 'gold-600',
  accentActive: 'gold-700',

  // Engagement Actions
  engagement: 'rose-500',
  engagementHover: 'rose-600',
  engagementActive: 'rose-700',

  // Backgrounds
  backgroundSubtle: 'sage-50',
  backgroundMuted: 'sage-100',
  backgroundWarm: 'cream-50',

  // Status Colors
  success: 'emerald-500',
  warning: 'gold-500',
  error: 'rose-500',
  info: 'sage-500',
} as const;

// ============================================================================
// Spacing Scale
// ============================================================================

export const spacing = {
  // Standard spacing scale (matching Tailwind)
  px: '1px',
  0: '0',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  3.5: '0.875rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  9: '2.25rem',
  10: '2.5rem',
  11: '2.75rem',
  12: '3rem',
  14: '3.5rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  28: '7rem',
  32: '8rem',
  36: '9rem',
  40: '10rem',
  44: '11rem',
  48: '12rem',
  52: '13rem',
  56: '14rem',
  60: '15rem',
  64: '16rem',
  72: '18rem',
  80: '20rem',
  96: '24rem',

  // Semantic spacing
  section: '8', // Space between major sections
  subsection: '6', // Space between subsections
  items: '4', // Space between items
  compact: '2', // Tight spacing for related elements
} as const;

// ============================================================================
// Container Sizes
// ============================================================================

export const containers = {
  sm: 'max-w-2xl', // 672px - Narrow forms
  md: 'max-w-4xl', // 896px - Standard profiles
  lg: 'max-w-6xl', // 1152px - Dashboards
  xl: 'max-w-7xl', // 1280px - Complex layouts
  full: 'max-w-full',
} as const;

// ============================================================================
// Border Radius
// ============================================================================

export const borderRadius = {
  none: '0',
  sm: '0.125rem',
  DEFAULT: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  full: '9999px',
} as const;

// ============================================================================
// Shadows
// ============================================================================

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: '0 0 #0000',

  // Semantic shadows
  card: 'lg',
  cardHover: 'xl',
  dialog: '2xl',
} as const;

// ============================================================================
// Card Variants
// ============================================================================

export const cardVariants = {
  primary: {
    base: 'bg-white rounded-xl shadow-lg border-2 border-emerald-100',
    hover: 'hover:shadow-xl hover:border-emerald-200',
  },
  secondary: {
    base: 'bg-sage-50 rounded-lg border border-sage-200',
    hover: 'hover:bg-sage-100',
  },
  accent: {
    base: 'bg-gradient-to-br from-emerald-50 to-gold-50 rounded-lg border border-gold-200',
    hover: 'hover:from-emerald-100 hover:to-gold-100',
  },
  flat: {
    base: 'bg-white rounded-lg border border-gray-200',
    hover: 'hover:border-gray-300',
  },
  elevated: {
    base: 'bg-white rounded-xl shadow-xl border-0',
    hover: 'hover:shadow-2xl',
  },
} as const;

// ============================================================================
// Button Variants (Custom styles beyond shadcn)
// ============================================================================

export const buttonVariants = {
  primary: {
    base: 'bg-emerald-500 text-white hover:bg-emerald-600 active:bg-emerald-700',
    gradient: 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700',
  },
  accent: {
    base: 'bg-gold-500 text-white hover:bg-gold-600 active:bg-gold-700',
    gradient: 'bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700',
  },
  engagement: {
    base: 'bg-rose-500 text-white hover:bg-rose-600 active:bg-rose-700',
    gradient: 'bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700',
  },
  subtle: {
    base: 'bg-sage-100 text-sage-900 hover:bg-sage-200 active:bg-sage-300',
  },
} as const;

// ============================================================================
// Z-Index Scale
// ============================================================================

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  toast: 1080,
} as const;

// ============================================================================
// Breakpoints
// ============================================================================

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// ============================================================================
// Transitions
// ============================================================================

export const transitions = {
  fast: '150ms',
  base: '200ms',
  slow: '300ms',
  slower: '500ms',

  // Easing functions
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
} as const;

// ============================================================================
// Icon Sizes
// ============================================================================

export const iconSizes = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
  xl: 'h-8 w-8',
  '2xl': 'h-10 w-10',
} as const;

// ============================================================================
// Avatar Sizes
// ============================================================================

export const avatarSizes = {
  xs: 'h-6 w-6',
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
  '2xl': 'h-20 w-20',
  '3xl': 'h-24 w-24',
  '4xl': 'h-32 w-32',
} as const;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get color class name
 */
export const getColorClass = (color: keyof typeof colors, shade: number = 500, prefix: string = 'text') => {
  return `${prefix}-${String(color)}-${shade}`;
};

/**
 * Get background color class
 */
export const getBgColorClass = (color: keyof typeof colors, shade: number = 500) => {
  return getColorClass(color, shade, 'bg');
};

/**
 * Get border color class
 */
export const getBorderColorClass = (color: keyof typeof colors, shade: number = 500) => {
  return getColorClass(color, shade, 'border');
};

// ============================================================================
// Export all tokens
// ============================================================================

export const designSystem = {
  colors,
  colorUsage,
  spacing,
  containers,
  borderRadius,
  shadows,
  cardVariants,
  buttonVariants,
  zIndex,
  breakpoints,
  transitions,
  iconSizes,
  avatarSizes,
} as const;

export default designSystem;

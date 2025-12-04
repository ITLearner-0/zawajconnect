/**
 * ZawajConnect Animation System
 *
 * Reusable animation variants and configurations for Framer Motion and CSS.
 */

import { Variants, Transition } from 'framer-motion';

// ============================================================================
// Animation Durations
// ============================================================================

export const duration = {
  instant: 0.1,
  fast: 0.15,
  normal: 0.2,
  slow: 0.3,
  slower: 0.5,
  slowest: 0.8,
} as const;

// ============================================================================
// Easing Functions
// ============================================================================

export const easing = {
  // Standard easings
  linear: [0, 0, 1, 1],
  easeIn: [0.4, 0, 1, 1],
  easeOut: [0, 0, 0.2, 1],
  easeInOut: [0.4, 0, 0.2, 1],

  // Custom easings
  spring: [0.68, -0.55, 0.265, 1.55], // Bouncy
  smooth: [0.25, 0.46, 0.45, 0.94], // Smooth and natural
  snappy: [0.85, 0, 0.15, 1], // Quick and snappy
} as const;

// ============================================================================
// Spring Configurations
// ============================================================================

export const spring = {
  // Gentle spring
  gentle: {
    type: 'spring' as const,
    stiffness: 100,
    damping: 15,
    mass: 0.8,
  },

  // Default spring
  default: {
    type: 'spring' as const,
    stiffness: 200,
    damping: 20,
    mass: 1,
  },

  // Bouncy spring
  bouncy: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 15,
    mass: 0.8,
  },

  // Stiff spring (minimal bounce)
  stiff: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 30,
    mass: 1,
  },

  // Wobbly spring (pronounced bounce)
  wobbly: {
    type: 'spring' as const,
    stiffness: 180,
    damping: 10,
    mass: 0.5,
  },
} as const;

// ============================================================================
// Common Transition Configs
// ============================================================================

export const transition: Record<string, Transition> = {
  fast: {
    duration: duration.fast,
    ease: easing.easeOut,
  },

  normal: {
    duration: duration.normal,
    ease: easing.easeInOut,
  },

  slow: {
    duration: duration.slow,
    ease: easing.easeOut,
  },

  spring: spring.default,

  springGentle: spring.gentle,

  springBouncy: spring.bouncy,
} as const;

// ============================================================================
// Fade Animations
// ============================================================================

export const fadeVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: transition.normal,
  },
  exit: {
    opacity: 0,
    transition: transition.fast,
  },
};

export const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: transition.normal,
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: transition.fast,
  },
};

export const fadeInDown: Variants = {
  hidden: {
    opacity: 0,
    y: -20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: transition.normal,
  },
  exit: {
    opacity: 0,
    y: 20,
    transition: transition.fast,
  },
};

export const fadeInLeft: Variants = {
  hidden: {
    opacity: 0,
    x: -20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: transition.normal,
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: transition.fast,
  },
};

export const fadeInRight: Variants = {
  hidden: {
    opacity: 0,
    x: 20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: transition.normal,
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: transition.fast,
  },
};

// ============================================================================
// Scale Animations
// ============================================================================

export const scaleVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: transition.spring,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: transition.fast,
  },
};

export const scaleIn: Variants = {
  hidden: {
    scale: 0,
    opacity: 0,
  },
  visible: {
    scale: 1,
    opacity: 1,
    transition: transition.springBouncy,
  },
};

export const scaleOut: Variants = {
  visible: {
    scale: 1,
    opacity: 1,
  },
  exit: {
    scale: 0,
    opacity: 0,
    transition: transition.fast,
  },
};

// ============================================================================
// Slide Animations
// ============================================================================

export const slideInLeft: Variants = {
  hidden: {
    x: '-100%',
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: transition.normal,
  },
  exit: {
    x: '-100%',
    opacity: 0,
    transition: transition.fast,
  },
};

export const slideInRight: Variants = {
  hidden: {
    x: '100%',
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: transition.normal,
  },
  exit: {
    x: '100%',
    opacity: 0,
    transition: transition.fast,
  },
};

export const slideInUp: Variants = {
  hidden: {
    y: '100%',
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: transition.normal,
  },
  exit: {
    y: '100%',
    opacity: 0,
    transition: transition.fast,
  },
};

export const slideInDown: Variants = {
  hidden: {
    y: '-100%',
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: transition.normal,
  },
  exit: {
    y: '-100%',
    opacity: 0,
    transition: transition.fast,
  },
};

// ============================================================================
// Collapse/Expand Animations
// ============================================================================

export const collapseVariants: Variants = {
  collapsed: {
    height: 0,
    opacity: 0,
    overflow: 'hidden',
    transition: transition.normal,
  },
  expanded: {
    height: 'auto',
    opacity: 1,
    overflow: 'visible',
    transition: transition.normal,
  },
};

// ============================================================================
// Stagger Container
// ============================================================================

export const staggerContainer: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

export const staggerContainerFast: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0,
    },
  },
};

export const staggerContainerSlow: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

// Stagger item (use with stagger containers)
export const staggerItem: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
};

// ============================================================================
// Card Animations
// ============================================================================

export const cardHover = {
  scale: 1.02,
  y: -4,
  transition: transition.fast,
};

export const cardTap = {
  scale: 0.98,
  transition: transition.fast,
};

export const cardVariants: Variants = {
  rest: {
    scale: 1,
    y: 0,
  },
  hover: cardHover,
  tap: cardTap,
};

// ============================================================================
// Button Animations
// ============================================================================

export const buttonHover = {
  scale: 1.05,
  transition: transition.fast,
};

export const buttonTap = {
  scale: 0.95,
  transition: transition.fast,
};

export const buttonVariants: Variants = {
  rest: {
    scale: 1,
  },
  hover: buttonHover,
  tap: buttonTap,
};

// ============================================================================
// Icon Animations
// ============================================================================

export const iconSpin: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

export const iconBounce: Variants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export const iconPulse: Variants = {
  animate: {
    scale: [1, 1.1, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// ============================================================================
// Special Animations
// ============================================================================

// Flip animation (for preview mode toggle)
export const flipVariants: Variants = {
  front: {
    rotateY: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: easing.easeInOut,
    },
  },
  back: {
    rotateY: 90,
    opacity: 0,
    transition: {
      duration: 0.6,
      ease: easing.easeInOut,
    },
  },
};

// Shimmer effect for loading states
export const shimmerVariants: Variants = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

// Progress bar fill animation
export const progressFill = (percentage: number): Variants => ({
  initial: {
    width: 0,
  },
  animate: {
    width: `${percentage}%`,
    transition: {
      duration: 1,
      ease: easing.easeOut,
    },
  },
});

// ============================================================================
// Page Transition Animations
// ============================================================================

export const pageTransition: Variants = {
  initial: {
    opacity: 0,
    x: -20,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: transition.normal,
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: transition.fast,
  },
};

// ============================================================================
// Modal/Dialog Animations
// ============================================================================

export const modalBackdrop: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: transition.fast,
  },
  exit: {
    opacity: 0,
    transition: transition.fast,
  },
};

export const modalContent: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: transition.spring,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: transition.fast,
  },
};

// ============================================================================
// Toast/Notification Animations
// ============================================================================

export const toastVariants: Variants = {
  initial: {
    opacity: 0,
    y: -50,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: transition.springBouncy,
  },
  exit: {
    opacity: 0,
    y: -50,
    scale: 0.95,
    transition: transition.fast,
  },
};

// ============================================================================
// CSS Keyframe Animations
// ============================================================================

export const cssKeyframes = `
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  @keyframes bounce {
    0%, 100% {
      transform: translateY(-25%);
      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }
    50% {
      transform: translateY(0);
      animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
  }

  @keyframes shimmer {
    0% {
      background-position: -1000px 0;
    }
    100% {
      background-position: 1000px 0;
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideInRight {
    from {
      transform: translateX(100%);
    }
    to {
      transform: translateX(0);
    }
  }
`;

// ============================================================================
// Animation Utilities
// ============================================================================

/**
 * Create a stagger delay for child elements
 */
export const getStaggerDelay = (index: number, baseDelay: number = 0.1): number => {
  return baseDelay * index;
};

/**
 * Create a custom transition with override options
 */
export const createTransition = (overrides?: Partial<Transition>): Transition => {
  return {
    ...transition.normal,
    ...overrides,
  };
};

/**
 * Create a fade animation with custom settings
 */
export const createFadeVariants = (direction?: 'up' | 'down' | 'left' | 'right'): Variants => {
  const offset = 20;

  const getInitial = () => {
    switch (direction) {
      case 'up':
        return { opacity: 0, y: offset };
      case 'down':
        return { opacity: 0, y: -offset };
      case 'left':
        return { opacity: 0, x: -offset };
      case 'right':
        return { opacity: 0, x: offset };
      default:
        return { opacity: 0 };
    }
  };

  return {
    hidden: getInitial(),
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: transition.normal,
    },
    exit: getInitial(),
  };
};

// ============================================================================
// Export Everything
// ============================================================================

export default {
  duration,
  easing,
  spring,
  transition,
  // Variants
  fadeVariants,
  fadeInUp,
  fadeInDown,
  fadeInLeft,
  fadeInRight,
  scaleVariants,
  scaleIn,
  scaleOut,
  slideInLeft,
  slideInRight,
  slideInUp,
  slideInDown,
  collapseVariants,
  staggerContainer,
  staggerContainerFast,
  staggerContainerSlow,
  staggerItem,
  cardVariants,
  buttonVariants,
  iconSpin,
  iconBounce,
  iconPulse,
  flipVariants,
  shimmerVariants,
  progressFill,
  pageTransition,
  modalBackdrop,
  modalContent,
  toastVariants,
  // Utilities
  getStaggerDelay,
  createTransition,
  createFadeVariants,
  cssKeyframes,
};

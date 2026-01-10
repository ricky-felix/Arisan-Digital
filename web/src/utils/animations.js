/**
 * Animation Utilities for Arisan Digital
 *
 * Centralized animation configurations using Framer Motion
 * All animations use transform and opacity for optimal performance
 * Includes support for reduced motion preferences
 */

// Check if user prefers reduced motion
export const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Animation durations (in seconds)
export const DURATION = {
  fast: 0.15,
  normal: 0.3,
  slow: 0.5,
  slower: 0.7,
};

// Easing functions
export const EASING = {
  easeIn: [0.4, 0, 1, 1],
  easeOut: [0, 0, 0.2, 1],
  easeInOut: [0.4, 0, 0.2, 1],
  spring: { type: 'spring', stiffness: 300, damping: 30 },
  springBounce: { type: 'spring', stiffness: 200, damping: 20 },
};

// Fade animations
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: DURATION.normal, ease: EASING.easeOut },
};

export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: DURATION.normal, ease: EASING.easeOut },
};

export const fadeInDown = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: { duration: DURATION.normal, ease: EASING.easeOut },
};

export const fadeInLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
  transition: { duration: DURATION.normal, ease: EASING.easeOut },
};

export const fadeInRight = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: DURATION.normal, ease: EASING.easeOut },
};

// Scale animations
export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: DURATION.normal, ease: EASING.easeOut },
};

export const scaleInBounce = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
  transition: { ...EASING.springBounce, duration: DURATION.slow },
};

// Hover animations for buttons
export const buttonHover = {
  scale: 1.02,
  transition: { duration: DURATION.fast, ease: EASING.easeOut },
};

export const buttonTap = {
  scale: 0.98,
  transition: { duration: DURATION.fast, ease: EASING.easeIn },
};

// Link hover animations
export const linkHover = {
  x: 3,
  transition: { duration: DURATION.fast, ease: EASING.easeOut },
};

// Card hover animations
export const cardHover = {
  y: -4,
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
  transition: { duration: DURATION.normal, ease: EASING.easeOut },
};

export const cardTap = {
  scale: 0.98,
  transition: { duration: DURATION.fast, ease: EASING.easeIn },
};

// Stagger children animations
export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.normal, ease: EASING.easeOut },
  },
};

// Scroll reveal animations with viewport detection
export const scrollReveal = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-100px', amount: 0.2 },
  transition: { duration: DURATION.slow, ease: EASING.easeOut },
};

export const scrollRevealLeft = {
  initial: { opacity: 0, x: -40 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true, margin: '-100px', amount: 0.2 },
  transition: { duration: DURATION.slow, ease: EASING.easeOut },
};

export const scrollRevealRight = {
  initial: { opacity: 0, x: 40 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true, margin: '-100px', amount: 0.2 },
  transition: { duration: DURATION.slow, ease: EASING.easeOut },
};

export const scrollRevealScale = {
  initial: { opacity: 0, scale: 0.9 },
  whileInView: { opacity: 1, scale: 1 },
  viewport: { once: true, margin: '-100px', amount: 0.2 },
  transition: { duration: DURATION.slow, ease: EASING.easeOut },
};

// Loading state animations
export const pulse = {
  initial: { opacity: 0.6 },
  animate: {
    opacity: [0.6, 1, 0.6],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export const spin = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

// Navigation animations
export const slideDown = {
  initial: { opacity: 0, y: -10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: DURATION.normal, ease: EASING.easeOut },
};

export const slideUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
  transition: { duration: DURATION.normal, ease: EASING.easeOut },
};

// Modal/Dialog animations
export const modalBackdrop = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: DURATION.fast },
};

export const modalContent = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 20 },
  transition: { duration: DURATION.normal, ease: EASING.easeOut },
};

/**
 * Gets animation variants with reduced motion support
 * Returns static values if user prefers reduced motion
 */
export const getAnimationVariants = (variants) => {
  if (prefersReducedMotion()) {
    return {
      initial: { opacity: 1 },
      animate: { opacity: 1 },
      exit: { opacity: 1 },
      whileInView: { opacity: 1 },
      transition: { duration: 0 },
    };
  }
  return variants;
};

/**
 * Custom hook-friendly function to create stagger animations
 */
export const createStaggerAnimation = (itemCount, baseDelay = 0.1) => {
  return {
    container: {
      animate: {
        transition: {
          staggerChildren: baseDelay,
          delayChildren: baseDelay,
        },
      },
    },
    item: (index) => ({
      initial: { opacity: 0, y: 20 },
      animate: {
        opacity: 1,
        y: 0,
        transition: {
          duration: DURATION.normal,
          ease: EASING.easeOut,
          delay: index * baseDelay,
        },
      },
    }),
  };
};

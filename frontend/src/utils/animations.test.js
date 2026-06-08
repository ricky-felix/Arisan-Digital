/**
 * animations.js exports plain objects and constants — no Framer Motion
 * runtime behavior is under test here (that is a browser animation concern).
 * We verify the exported shapes so refactors can't silently break consumers.
 */

import {
  DURATION,
  EASING,
  fadeIn,
  fadeInUp,
  fadeInDown,
  fadeInLeft,
  fadeInRight,
  scaleIn,
  scaleInBounce,
  buttonHover,
  buttonTap,
  linkHover,
  cardHover,
  cardTap,
  staggerContainer,
  staggerItem,
  staggerItemLeft,
  staggerItemRight,
  staggerItemScale,
  scrollReveal,
  scrollRevealLeft,
  scrollRevealRight,
  scrollRevealScale,
  pulse,
  spin,
  slideDown,
  slideUp,
  modalBackdrop,
  modalContent,
  createStaggerAnimation,
} from './animations';

// ── DURATION ──────────────────────────────────────────────────────────────────

describe('DURATION', () => {
  it('exposes fast, normal, slow, slower numeric values', () => {
    expect(typeof DURATION.fast).toBe('number');
    expect(typeof DURATION.normal).toBe('number');
    expect(typeof DURATION.slow).toBe('number');
    expect(typeof DURATION.slower).toBe('number');
  });

  it('values are in ascending order (fast < normal < slow < slower)', () => {
    expect(DURATION.fast).toBeLessThan(DURATION.normal);
    expect(DURATION.normal).toBeLessThan(DURATION.slow);
    expect(DURATION.slow).toBeLessThan(DURATION.slower);
  });
});

// ── EASING ────────────────────────────────────────────────────────────────────

describe('EASING', () => {
  it('easeIn, easeOut, easeInOut are 4-element arrays', () => {
    expect(Array.isArray(EASING.easeIn)).toBe(true);
    expect(EASING.easeIn).toHaveLength(4);
    expect(Array.isArray(EASING.easeOut)).toBe(true);
    expect(EASING.easeOut).toHaveLength(4);
    expect(Array.isArray(EASING.easeInOut)).toBe(true);
    expect(EASING.easeInOut).toHaveLength(4);
  });

  it('spring is an object with type "spring"', () => {
    expect(EASING.spring).toMatchObject({ type: 'spring' });
  });

  it('springBounce has lower stiffness than spring', () => {
    expect(EASING.springBounce.stiffness).toBeLessThan(EASING.spring.stiffness);
  });
});

// ── Fade variants ─────────────────────────────────────────────────────────────

describe('fadeIn', () => {
  it('starts at opacity 0 and animates to opacity 1', () => {
    expect(fadeIn.initial.opacity).toBe(0);
    expect(fadeIn.animate.opacity).toBe(1);
    expect(fadeIn.exit.opacity).toBe(0);
  });
});

describe('fadeInUp', () => {
  it('starts with opacity 0 and positive y offset', () => {
    expect(fadeInUp.initial.opacity).toBe(0);
    expect(fadeInUp.initial.y).toBeGreaterThan(0);
    expect(fadeInUp.animate.opacity).toBe(1);
    expect(fadeInUp.animate.y).toBe(0);
  });

  it('exits with negative y offset (upward)', () => {
    expect(fadeInUp.exit.y).toBeLessThan(0);
  });
});

describe('fadeInDown', () => {
  it('starts with negative y offset (enters from top)', () => {
    expect(fadeInDown.initial.y).toBeLessThan(0);
    expect(fadeInDown.animate.y).toBe(0);
  });
});

describe('fadeInLeft', () => {
  it('starts from the left (negative x)', () => {
    expect(fadeInLeft.initial.x).toBeLessThan(0);
    expect(fadeInLeft.animate.x).toBe(0);
  });
});

describe('fadeInRight', () => {
  it('starts from the right (positive x)', () => {
    expect(fadeInRight.initial.x).toBeGreaterThan(0);
    expect(fadeInRight.animate.x).toBe(0);
  });
});

// ── Scale variants ────────────────────────────────────────────────────────────

describe('scaleIn', () => {
  it('starts below 1 scale and animates to scale 1', () => {
    expect(scaleIn.initial.scale).toBeLessThan(1);
    expect(scaleIn.animate.scale).toBe(1);
  });
});

describe('scaleInBounce', () => {
  it('starts at scale 0.8 (more dramatic)', () => {
    expect(scaleInBounce.initial.scale).toBe(0.8);
  });
});

// ── Interaction variants ──────────────────────────────────────────────────────

describe('buttonHover', () => {
  it('slightly scales up on hover', () => {
    expect(buttonHover.scale).toBeGreaterThan(1);
  });
});

describe('buttonTap', () => {
  it('slightly scales down on tap', () => {
    expect(buttonTap.scale).toBeLessThan(1);
  });
});

describe('linkHover', () => {
  it('nudges right on hover', () => {
    expect(linkHover.x).toBeGreaterThan(0);
  });
});

describe('cardHover', () => {
  it('lifts card upward (negative y)', () => {
    expect(cardHover.y).toBeLessThan(0);
  });

  it('includes a boxShadow string', () => {
    expect(typeof cardHover.boxShadow).toBe('string');
    expect(cardHover.boxShadow.length).toBeGreaterThan(0);
  });
});

describe('cardTap', () => {
  it('scales down on tap', () => {
    expect(cardTap.scale).toBeLessThan(1);
  });
});

// ── Stagger variants ──────────────────────────────────────────────────────────

describe('staggerContainer', () => {
  it('has empty initial and animate.transition.staggerChildren', () => {
    expect(staggerContainer.initial).toEqual({});
    expect(staggerContainer.animate.transition.staggerChildren).toBeTypeOf('number');
  });
});

describe('staggerItem', () => {
  it('starts invisible at y offset', () => {
    expect(staggerItem.initial.opacity).toBe(0);
    expect(staggerItem.initial.y).toBeGreaterThan(0);
  });
});

describe('staggerItemLeft', () => {
  it('starts off-screen to the left', () => {
    expect(staggerItemLeft.initial.x).toBeLessThan(0);
  });
});

describe('staggerItemRight', () => {
  it('starts off-screen to the right', () => {
    expect(staggerItemRight.initial.x).toBeGreaterThan(0);
  });
});

describe('staggerItemScale', () => {
  it('starts at less than full scale', () => {
    expect(staggerItemScale.initial.scale).toBeLessThan(1);
  });
});

// ── Scroll reveal variants ────────────────────────────────────────────────────

describe('scrollReveal', () => {
  it('has viewport.once: true', () => {
    expect(scrollReveal.viewport.once).toBe(true);
  });

  it('starts below (positive y) and reveals to y:0', () => {
    expect(scrollReveal.initial.y).toBeGreaterThan(0);
    expect(scrollReveal.whileInView.y).toBe(0);
  });
});

describe('scrollRevealLeft', () => {
  it('starts off left and reveals to x:0', () => {
    expect(scrollRevealLeft.initial.x).toBeLessThan(0);
    expect(scrollRevealLeft.whileInView.x).toBe(0);
  });
});

describe('scrollRevealRight', () => {
  it('starts off right and reveals to x:0', () => {
    expect(scrollRevealRight.initial.x).toBeGreaterThan(0);
    expect(scrollRevealRight.whileInView.x).toBe(0);
  });
});

describe('scrollRevealScale', () => {
  it('starts below scale 1', () => {
    expect(scrollRevealScale.initial.scale).toBeLessThan(1);
    expect(scrollRevealScale.whileInView.scale).toBe(1);
  });
});

// ── Looping variants ──────────────────────────────────────────────────────────

describe('pulse', () => {
  it('animates opacity as an array (keyframes)', () => {
    expect(Array.isArray(pulse.animate.opacity)).toBe(true);
    expect(pulse.animate.opacity.length).toBeGreaterThan(1);
  });

  it('repeats infinitely', () => {
    expect(pulse.animate.transition.repeat).toBe(Infinity);
  });
});

describe('spin', () => {
  it('rotates to 360 degrees', () => {
    expect(spin.animate.rotate).toBe(360);
  });

  it('repeats infinitely with linear ease', () => {
    expect(spin.animate.transition.repeat).toBe(Infinity);
    expect(spin.animate.transition.ease).toBe('linear');
  });
});

// ── Slide variants ────────────────────────────────────────────────────────────

describe('slideDown', () => {
  it('starts at negative y (above) and slides to 0', () => {
    expect(slideDown.initial.y).toBeLessThan(0);
    expect(slideDown.animate.y).toBe(0);
  });
});

describe('slideUp', () => {
  it('starts at positive y (below) and slides to 0', () => {
    expect(slideUp.initial.y).toBeGreaterThan(0);
    expect(slideUp.animate.y).toBe(0);
  });
});

// ── Modal variants ────────────────────────────────────────────────────────────

describe('modalBackdrop', () => {
  it('fades in from opacity 0', () => {
    expect(modalBackdrop.initial.opacity).toBe(0);
    expect(modalBackdrop.animate.opacity).toBe(1);
  });
});

describe('modalContent', () => {
  it('enters from below and at small scale', () => {
    expect(modalContent.initial.scale).toBeLessThan(1);
    expect(modalContent.initial.y).toBeGreaterThan(0);
    expect(modalContent.animate.scale).toBe(1);
    expect(modalContent.animate.y).toBe(0);
  });
});

// ── createStaggerAnimation ────────────────────────────────────────────────────

describe('createStaggerAnimation', () => {
  it('returns an object with container and item keys', () => {
    const result = createStaggerAnimation(5);
    expect(result).toHaveProperty('container');
    expect(result).toHaveProperty('item');
  });

  it('container has staggerChildren in transition', () => {
    const result = createStaggerAnimation(3, 0.15);
    expect(result.container.animate.transition.staggerChildren).toBe(0.15);
  });

  it('item is a function returning an animation object', () => {
    const result = createStaggerAnimation(3, 0.1);
    const itemAnim = result.item(0);
    expect(itemAnim).toHaveProperty('initial');
    expect(itemAnim).toHaveProperty('animate');
    expect(itemAnim.initial.opacity).toBe(0);
    expect(itemAnim.animate.opacity).toBe(1);
  });

  it('item delay scales with index', () => {
    const result = createStaggerAnimation(3, 0.1);
    const item0 = result.item(0);
    const item2 = result.item(2);
    expect(item2.animate.transition.delay).toBeGreaterThan(item0.animate.transition.delay);
  });

  it('uses default baseDelay of 0.1 when not provided', () => {
    const result = createStaggerAnimation(3);
    expect(result.container.animate.transition.staggerChildren).toBe(0.1);
  });
});

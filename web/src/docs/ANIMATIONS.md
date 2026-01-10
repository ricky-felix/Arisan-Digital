# Micro-Animations Implementation Guide

## Overview

This project implements a comprehensive micro-animations system using Framer Motion and CSS animations. All animations are designed to be performant (using transform and opacity) and accessible (respecting reduced-motion preferences).

## Animation Utilities

### Location: `src/utils/animations.js`

This file contains pre-configured animation variants for Framer Motion:

#### Fade Animations
- `fadeIn` - Simple fade in
- `fadeInUp` - Fade in from below
- `fadeInDown` - Fade in from above
- `fadeInLeft` - Fade in from left
- `fadeInRight` - Fade in from right

#### Scale Animations
- `scaleIn` - Scale from 95% to 100%
- `scaleInBounce` - Scale with bounce effect

#### Scroll Reveal Animations
- `scrollReveal` - Fade in from below on scroll
- `scrollRevealLeft` - Fade in from left on scroll
- `scrollRevealRight` - Fade in from right on scroll
- `scrollRevealScale` - Scale in on scroll

#### Interactive Animations
- `buttonHover` - Subtle scale on hover
- `buttonTap` - Scale down on click
- `linkHover` - Slide right on hover
- `cardHover` - Lift up on hover

#### Stagger Animations
- `staggerContainer` - Container for staggered children
- `staggerItem` - Individual stagger item

### Usage Example

```jsx
import { motion } from "framer-motion";
import { scrollReveal, buttonHover, buttonTap } from "../utils/animations";

function MyComponent() {
  return (
    <motion.div {...scrollReveal}>
      <motion.button whileHover={buttonHover} whileTap={buttonTap}>
        Click me
      </motion.button>
    </motion.div>
  );
}
```

## CSS Animations

### Location: `src/index.css`

CSS-based animations for components that don't use Framer Motion:

#### Interactive Elements
All buttons and links have smooth transitions:
- Hover: `translateY(-1px)` lift effect
- Active: Reset to `translateY(0)`
- Opacity changes for feedback

#### Card Animations
Cards with `.card-hover` or `[data-card="true"]`:
- Hover: Lift up 4px with shadow
- Smooth transitions for all properties

#### Scroll Reveal Classes
- `.scroll-reveal` - Fade in from below
- `.scroll-reveal-left` - Fade in from left
- `.scroll-reveal-right` - Fade in from right
- `.scroll-reveal-scale` - Scale in

Add `.is-visible` class via JavaScript to trigger animation.

#### Stagger Classes
- `.stagger-item` - Automatic stagger on children (nth-child based)

#### Loading Animations
- `.loading-pulse` - Pulsing opacity
- `.loading-spin` - Rotating spinner

### Usage Example

```jsx
// Using CSS classes
<div className="card-hover">
  <h2>Hover me!</h2>
</div>

// Using data attribute
<div data-card="true">
  <h2>I'll lift on hover too!</h2>
</div>

// Stagger children
<div>
  <div className="stagger-item">Item 1</div>
  <div className="stagger-item">Item 2</div>
  <div className="stagger-item">Item 3</div>
</div>
```

## Custom Hooks

### Location: `src/hooks/useScrollAnimation.js`

React hooks for scroll-triggered animations:

#### `useScrollAnimation(options, triggerOnce)`
Returns `{ ref, isVisible }` to detect viewport intersection.

```jsx
import { useScrollAnimation } from "../hooks/useScrollAnimation";

function MyComponent() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <div ref={ref}>
      {isVisible ? "I'm visible!" : "Waiting..."}
    </div>
  );
}
```

#### `useScrollReveal(animationClass, options)`
Automatically adds animation class when element enters viewport.

```jsx
import { useScrollReveal } from "../hooks/useScrollAnimation";

function MyComponent() {
  const { ref } = useScrollReveal("scroll-reveal");

  return <div ref={ref}>I'll animate on scroll!</div>;
}
```

#### `useStaggerAnimation(itemCount)`
Adds stagger effect to children automatically.

```jsx
import { useStaggerAnimation } from "../hooks/useScrollAnimation";

function MyList({ items }) {
  const { containerRef } = useStaggerAnimation(items.length);

  return (
    <div ref={containerRef}>
      {items.map(item => <div key={item.id}>{item.text}</div>)}
    </div>
  );
}
```

## Performance Best Practices

### 1. Use Transform and Opacity Only
All animations use `transform` and `opacity` for 60fps performance:
- ✅ `transform: translateY(-4px)`
- ✅ `opacity: 0.8`
- ❌ `margin-top: -4px`
- ❌ `width: 100%`

### 2. Use `will-change` Sparingly
Only on elements that will definitely animate:
```css
button:not(:disabled) {
  will-change: transform;
}
```

### 3. Lazy Load Images
Images have automatic fade-in animation on load.

### 4. Viewport-based Triggers
Scroll animations only trigger when 20% visible:
```js
viewport: { once: true, margin: "-100px", amount: 0.2 }
```

## Accessibility

### Reduced Motion Support

All animations respect `prefers-reduced-motion: reduce`:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }

  /* Keep only opacity for feedback */
  button:hover {
    transform: none;
    opacity: 0.8;
  }
}
```

### JavaScript Detection

```js
import { prefersReducedMotion, getAnimationVariants } from "../utils/animations";

const variants = getAnimationVariants(scrollReveal);
// Returns static values if user prefers reduced motion
```

## Component Examples

### Button with Hover Animation

```jsx
import { motion } from "framer-motion";
import { buttonHover, buttonTap } from "../utils/animations";

<motion.button
  whileHover={buttonHover}
  whileTap={buttonTap}
>
  Click me
</motion.button>
```

### Card with Scroll Reveal

```jsx
import { motion } from "framer-motion";
import { scrollReveal, cardHover } from "../utils/animations";

<motion.div
  {...scrollReveal}
  whileHover={cardHover}
  className="border border-gray-200 p-6"
>
  <h3>Card Title</h3>
  <p>Card content</p>
</motion.div>
```

### Staggered List

```jsx
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "../utils/animations";

<motion.div
  variants={staggerContainer}
  initial="initial"
  whileInView="animate"
  viewport={{ once: true }}
>
  {items.map(item => (
    <motion.div key={item.id} variants={staggerItem}>
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

### Section with Left-Right Animation

```jsx
import { motion } from "framer-motion";
import { scrollRevealLeft, scrollRevealRight } from "../utils/animations";

<section>
  <motion.div {...scrollRevealLeft}>
    <h2>Title</h2>
  </motion.div>
  <motion.div {...scrollRevealRight}>
    <p>Content</p>
  </motion.div>
</section>
```

## Animation Timeline

### Page Load
1. Hero section fades in (0ms)
2. Navigation slides down (100ms)
3. Content sections stagger in as user scrolls

### Scroll
- Elements animate when 20% visible
- Only animate once (viewport: { once: true })
- Stagger children with 100ms delay

### Interactions
- Button hover: Instant (0ms delay)
- Button press: 150ms duration
- Card hover: 300ms duration
- Link hover: Fast (150ms duration)

## Browser Support

- Modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Intersection Observer required for scroll animations
- Framer Motion handles feature detection
- Graceful degradation for older browsers

## Testing

### Visual Testing
1. Check all animations play smoothly
2. Verify no layout shift during animations
3. Test on mobile devices

### Performance Testing
1. Use Chrome DevTools Performance tab
2. Check for 60fps during animations
3. Monitor memory usage

### Accessibility Testing
1. Enable "Reduce Motion" in OS settings
2. Verify animations are minimal/disabled
3. Test keyboard navigation with focus states

## Troubleshooting

### Animations Not Playing
- Check Framer Motion is imported correctly
- Verify variants are spread correctly `{...scrollReveal}`
- Ensure `viewport` prop is set for scroll animations

### Performance Issues
- Reduce number of simultaneous animations
- Check for expensive CSS properties (avoid width, height, margin)
- Use `will-change` only when necessary

### Reduced Motion Not Working
- Check media query in CSS
- Test `prefersReducedMotion()` function returns correct value
- Verify `getAnimationVariants()` is used for dynamic animations

## Future Enhancements

- [ ] Add loading skeleton animations
- [ ] Implement page transition animations
- [ ] Add gesture-based animations (swipe, pinch)
- [ ] Create animation playground component
- [ ] Add more easing curve options

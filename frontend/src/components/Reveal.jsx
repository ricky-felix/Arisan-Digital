"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { staggerContainer } from "../utils/animations";

/**
 * Scroll-reveal container that plays its entrance exactly once and never blinks.
 *
 * Uses the `useInView` hook instead of the `whileInView` prop. The difference
 * matters on mobile: the first scroll gesture collapses the browser address bar,
 * which resizes the visual viewport. That resize fires while the entering
 * section sits right at the `amount` threshold, so `whileInView` sees the element
 * drop back under the threshold and then cross it again (enter -> leave -> enter)
 * and replays the entrance — a visible blink. `whileInView`'s internal `once`
 * latch does not reliably win that race.
 *
 * `useInView` with `once: true` latches to `true` on the first crossing and then
 * disconnects its observer; the value lives in React state and can never flip
 * back on a later resize or re-render, so the reveal runs once and stays put.
 *
 * Drop-in for the previous outer container:
 *   <motion.div variants={staggerContainer} initial="initial"
 *     whileInView="animate" viewport={{ once: true, amount: 0.2 }}>
 * becomes
 *   <Reveal>
 *
 * Children using `variants={staggerItem}` (etc.) still inherit the animation
 * state via framer-motion variant propagation, exactly as before.
 */
export function Reveal({
  children,
  className,
  variants = staggerContainer,
  amount = 0.2,
  as = "div",
  ...rest
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount });
  const MotionTag = motion[as];

  return (
    <MotionTag
      ref={ref}
      className={className}
      variants={variants}
      initial="initial"
      animate={inView ? "animate" : "initial"}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}

export default Reveal;

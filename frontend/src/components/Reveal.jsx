"use client";

import React, { useEffect, useRef, useState } from "react";

/**
 * Scroll-reveal container that plays its entrance exactly once and never blinks.
 *
 * A single IntersectionObserver watches the group; the first time it crosses the
 * `amount` threshold it adds the `is-visible` class and disconnects. Descendant
 * elements tagged with the CSS reveal classes (`reveal-up`, `reveal-left`,
 * `reveal-right`, `reveal-scale`, `reveal-slide-left` — see index.css) transition
 * to their resting state together.
 *
 * This replaces the previous framer-motion implementation. Because the observer
 * fires once and is then torn down, the entrance can never replay on a later
 * resize — which on mobile (address-bar collapse resizing the visual viewport)
 * was what made the old `whileInView` reveal fire twice and blink.
 *
 * Usage:
 *   <Reveal className="container mx-auto">
 *     <div className="reveal-left">…</div>
 *     <div className="reveal-right" style={{ "--reveal-delay": "0.1s" }}>…</div>
 *   </Reveal>
 */
export function Reveal({
  children,
  className = "",
  amount = 0.2,
  as: Tag = "div",
  ...rest
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // If IntersectionObserver is unavailable, reveal immediately so content is
    // never stuck hidden.
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        if (entries[0].isIntersecting) {
          setVisible(true);
          obs.disconnect(); // once — latched, can never revert (no blink)
        }
      },
      { threshold: amount }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [amount]);

  return (
    <Tag
      ref={ref}
      className={`reveal-group${visible ? " is-visible" : ""}${className ? ` ${className}` : ""}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export default Reveal;

/**
 * Custom hook for scroll-triggered animations using Intersection Observer
 * Provides better performance than scroll event listeners
 */

import { useEffect, useRef, useState } from 'react';

/**
 * Hook to detect when an element enters the viewport
 * @param {Object} options - Intersection Observer options
 * @param {boolean} triggerOnce - Whether to trigger animation only once
 * @returns {Object} - { ref, isVisible }
 */
export const useScrollAnimation = (options = {}, triggerOnce = true) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Default options
    const defaultOptions = {
      threshold: 0.2,
      rootMargin: '-50px',
      ...options,
    };

    // Create Intersection Observer
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsVisible(true);

          // Unobserve after first trigger if triggerOnce is true
          if (triggerOnce) {
            observer.unobserve(entry.target);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      });
    }, defaultOptions);

    observer.observe(element);

    // Cleanup
    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [options.threshold, options.rootMargin, triggerOnce]);

  return { ref, isVisible };
};

/**
 * Hook to add scroll animation class to element
 * @param {string} animationClass - CSS class to add when visible
 * @param {Object} options - Intersection Observer options
 * @returns {Object} - { ref }
 */
export const useScrollReveal = (animationClass = 'scroll-reveal', options = {}) => {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Add initial animation class
    element.classList.add(animationClass);

    const defaultOptions = {
      threshold: 0.2,
      rootMargin: '-50px',
      ...options,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, defaultOptions);

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [animationClass, options.threshold, options.rootMargin]);

  return { ref };
};

/**
 * Hook for staggered children animations
 * @param {number} itemCount - Number of children to animate
 * @returns {Object} - { containerRef }
 */
export const useStaggerAnimation = (itemCount = 0) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const children = Array.from(container.children);
    if (children.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Add stagger class to children
            children.forEach((child, index) => {
              child.classList.add('stagger-item');
              child.style.animationDelay = `${index * 0.1}s`;
            });
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '-50px',
      }
    );

    observer.observe(container);

    return () => {
      if (container) {
        observer.unobserve(container);
      }
    };
  }, [itemCount]);

  return { containerRef };
};

export default useScrollAnimation;

/**
 * Smooth scroll to anchor with offset for fixed navbar
 * @param {Event} e - Click event
 * @param {string} targetId - ID of target element
 * @param {Function} callback - Optional callback after scroll
 */
export const handleAnchorClick = (e, targetId, callback) => {
  e.preventDefault();
  const element = document.getElementById(targetId);
  if (element) {
    const offset = 80; // Height of fixed navbar (64px/16px = 4rem + padding)
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });

    // Execute callback after scroll animation
    if (callback) {
      setTimeout(() => callback(), 300);
    }
  }
};

/**
 * Get active section based on scroll position
 * @param {Array<string>} sectionIds - Array of section IDs to track
 * @returns {string} ID of active section
 */
export const getActiveSection = (sectionIds) => {
  const scrollPosition = window.scrollY + 100;

  for (let i = sectionIds.length - 1; i >= 0; i--) {
    const section = document.getElementById(sectionIds[i]);
    if (section && section.offsetTop <= scrollPosition) {
      return sectionIds[i];
    }
  }

  return sectionIds[0];
};

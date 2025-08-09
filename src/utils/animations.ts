// Animation variants with reduced motion support
const prefersReducedMotion =
  typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

// Helper to respect reduced motion preferences
const getReducedMotion = (normalDuration: number) => {
  return prefersReducedMotion
    ? { duration: 0.1 }
    : { duration: normalDuration };
};

export const fadeInUp = {
  initial: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: prefersReducedMotion ? 0 : -20 },
  transition: { duration: getReducedMotion(0.3).duration, ease: "easeOut" },
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: getReducedMotion(0.2).duration },
};

export const slideInFromRight = {
  initial: { opacity: 0, x: prefersReducedMotion ? 0 : 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: prefersReducedMotion ? 0 : 50 },
  transition: { duration: getReducedMotion(0.3).duration, ease: "easeOut" },
};

export const slideInFromLeft = {
  initial: { opacity: 0, x: prefersReducedMotion ? 0 : -50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: prefersReducedMotion ? 0 : -50 },
  transition: { duration: getReducedMotion(0.3).duration, ease: "easeOut" },
};

export const scaleIn = {
  initial: { opacity: 0, scale: prefersReducedMotion ? 1 : 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: prefersReducedMotion ? 1 : 0.9 },
  transition: { duration: getReducedMotion(0.2).duration, ease: "easeOut" },
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: prefersReducedMotion ? 0.01 : 0.1,
    },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: getReducedMotion(0.3).duration },
};

export const bounceIn = {
  initial: { opacity: 0, scale: prefersReducedMotion ? 1 : 0.3 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: prefersReducedMotion
      ? { duration: 0.1 }
      : { type: "spring", stiffness: 300, damping: 20 },
  },
  exit: { opacity: 0, scale: prefersReducedMotion ? 1 : 0.3 },
};

export const slideUp = {
  initial: { opacity: 0, y: prefersReducedMotion ? 0 : 100 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: prefersReducedMotion ? 0 : 100 },
  transition: { duration: getReducedMotion(0.4).duration, ease: "easeOut" },
};

export const rotateIn = {
  initial: { opacity: 0, rotate: prefersReducedMotion ? 0 : -180 },
  animate: { opacity: 1, rotate: 0 },
  exit: { opacity: 0, rotate: prefersReducedMotion ? 0 : 180 },
  transition: { duration: getReducedMotion(0.5).duration, ease: "easeOut" },
};

export const pulseAnimation = {
  animate: prefersReducedMotion
    ? {}
    : {
        scale: [1, 1.05, 1],
        transition: {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        },
      },
};

export const hoverScale = {
  whileHover: prefersReducedMotion ? {} : { scale: 1.02 },
  whileTap: prefersReducedMotion ? {} : { scale: 0.98 },
  transition: { duration: getReducedMotion(0.2).duration },
};

export const cardHover = {
  whileHover: prefersReducedMotion
    ? {}
    : {
        y: -5,
        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
        transition: { duration: 0.2 },
      },
};

export const buttonPress = {
  whileTap: prefersReducedMotion ? {} : { scale: 0.95 },
  transition: { duration: getReducedMotion(0.1).duration },
};

// New animations for enhanced UI
export const listItemEnter = {
  initial: { opacity: 0, height: 0, scale: prefersReducedMotion ? 1 : 0.8 },
  animate: { opacity: 1, height: "auto", scale: 1 },
  exit: { opacity: 0, height: 0, scale: prefersReducedMotion ? 1 : 0.8 },
  transition: { duration: getReducedMotion(0.3).duration, ease: "easeInOut" },
};

export const toastEnter = {
  initial: {
    opacity: 0,
    y: prefersReducedMotion ? 0 : 50,
    scale: prefersReducedMotion ? 1 : 0.8,
  },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: {
    opacity: 0,
    y: prefersReducedMotion ? 0 : 20,
    scale: prefersReducedMotion ? 1 : 0.9,
  },
  transition: { duration: getReducedMotion(0.3).duration, ease: "easeOut" },
};

export const syncingOverlay = {
  initial: { opacity: 0, backdropFilter: "blur(0px)" },
  animate: { opacity: 1, backdropFilter: "blur(4px)" },
  exit: { opacity: 0, backdropFilter: "blur(0px)" },
  transition: { duration: getReducedMotion(0.3).duration },
};

export const shimmer = {
  animate: prefersReducedMotion
    ? {}
    : {
        x: ["-100%", "100%"],
        transition: {
          repeat: Infinity,
          repeatType: "loop" as const,
          duration: 2,
          ease: "easeInOut",
        },
      },
};

export const focusRing = {
  initial: { boxShadow: "0 0 0 0 rgba(66, 153, 225, 0)" },
  animate: { boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.5)" },
  exit: { boxShadow: "0 0 0 0 rgba(66, 153, 225, 0)" },
  transition: { duration: getReducedMotion(0.2).duration },
};

export const successAnimation = {
  initial: { scale: prefersReducedMotion ? 1 : 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: prefersReducedMotion
    ? { duration: 0.1 }
    : { type: "spring", stiffness: 400, damping: 10 },
};

export const errorAnimation = {
  initial: { x: 0 },
  animate: prefersReducedMotion
    ? {}
    : { x: [-5, 5, -5, 5, 0], transition: { duration: 0.4 } },
};

export const undoAnimation = {
  initial: { opacity: 0, x: prefersReducedMotion ? 0 : -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: prefersReducedMotion ? 0 : -20 },
  transition: { duration: getReducedMotion(0.2).duration },
};

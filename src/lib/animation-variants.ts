import type { Variants, Transition } from "framer-motion";

// ─── Spring Physics Presets ──────────────────────────────────────────

export const springBouncy: Transition = {
  type: "spring",
  stiffness: 350,
  damping: 20,
  mass: 0.8,
};

export const springGentle: Transition = {
  type: "spring",
  stiffness: 200,
  damping: 20,
  mass: 1,
};

export const springSnappy: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 25,
  mass: 0.5,
};

export const springTransition: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 24,
};

// ─── Variant Definitions ─────────────────────────────────────────────

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { ...springGentle },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4 },
  },
};

export const slideFromLeft: Variants = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { ...springBouncy },
  },
};

export const slideFromRight: Variants = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { ...springBouncy },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { ...springBouncy },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 260, damping: 20 },
  },
};

// ─── Hero Stagger Variants ───────────────────────────────────────────

export const heroStaggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export const heroWordReveal: Variants = {
  hidden: { opacity: 0, y: 30, rotateX: 10 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { ...springBouncy },
  },
};

export const heroFadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { ...springGentle },
  },
};

// ─── Scroll Reveal (bouncy slide-up) ─────────────────────────────────

export const revealOnScroll: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { ...springBouncy },
  },
};

// ─── Parallax-Aware Scroll Reveal ─────────────────────────────────────

export const revealOnScrollParallax: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { ...springBouncy },
  },
};

export const revealOnScrollParallaxIntense: Variants = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { ...springBouncy },
  },
};

// ─── Magnetic Hover Offset ───────────────────────────────────────────

export const magneticTransition: Transition = {
  type: "spring",
  stiffness: 150,
  damping: 15,
  mass: 0.1,
};

// ─── Default Fallback ────────────────────────────────────────────────

export const defaultTransition = {
  duration: 0.5,
  ease: [0.25, 0.46, 0.45, 0.94] as const,
};

// ─── Mobile-Specific (compressed, lighter) ───────────────────────────

export const mobileVariants: Record<string, Variants> = {
  fadeUp: {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.25 },
    },
  },
};

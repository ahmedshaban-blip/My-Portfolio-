import type { Variants, Transition } from "framer-motion";

// ─── 90Hz-safe professional motion ───────────────────────────────────
// Transform + opacity only. Tween-based (predictable frame cost vs springs).
// Subtle distances, short durations, light stagger.

export const easeProfessional = [0.22, 1, 0.36, 1] as const;

export const durationFast = 0.3;
export const durationBase = 0.45;
export const durationSlow = 0.6;

export const springBouncy: Transition = {
  type: "tween",
  duration: durationBase,
  ease: easeProfessional,
};

export const springGentle: Transition = {
  type: "tween",
  duration: durationBase,
  ease: easeProfessional,
};

export const springSnappy: Transition = {
  type: "tween",
  duration: durationFast,
  ease: easeProfessional,
};

export const springTransition: Transition = {
  type: "tween",
  duration: durationFast,
  ease: easeProfessional,
};

// ─── Variant Definitions ─────────────────────────────────────────────

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: durationBase, ease: easeProfessional },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: durationFast, ease: "easeOut" },
  },
};

export const slideFromLeft: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: durationBase, ease: easeProfessional },
  },
};

export const slideFromRight: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: durationBase, ease: easeProfessional },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: durationFast, ease: easeProfessional },
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
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: durationFast, ease: easeProfessional },
  },
};

// ─── Hero Stagger Variants ───────────────────────────────────────────

export const heroStaggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const heroWordReveal: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: durationBase, ease: easeProfessional },
  },
};

export const heroFadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: durationBase, ease: easeProfessional },
  },
};

// ─── Scroll Reveal (subtle slide-up, once-only) ───────────────────────

export const revealOnScroll: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: durationBase, ease: easeProfessional },
  },
};

// ─── Parallax-Aware Scroll Reveal ─────────────────────────────────────
// Kept for API compatibility. No scroll-linked motion — same subtle reveal.

export const revealOnScrollParallax: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: durationBase, ease: easeProfessional },
  },
};

export const revealOnScrollParallaxIntense: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: durationBase, ease: easeProfessional },
  },
};

// ─── Magnetic Hover Offset ───────────────────────────────────────────

export const magneticTransition: Transition = {
  type: "tween",
  duration: 0.2,
  ease: "easeOut",
};

// ─── Default Fallback ────────────────────────────────────────────────

export const defaultTransition = {
  duration: durationFast,
  ease: easeProfessional,
};

// ─── Mobile-Specific (compressed, lighter) ───────────────────────────

export const mobileVariants: Record<string, Variants> = {
  fadeUp: {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.25, ease: "easeOut" },
    },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.97 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.25, ease: "easeOut" },
    },
  },
};

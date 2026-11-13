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

// ─── Motion system: the plate and the index rule ─────────────────────
// One authored moment, then quiet feedback.
//
// THE PLATE — a project's media leaves its index card and lands in the case
// sheet as one shared element (`layoutId="plate-<slug>"`). It is the only
// morph on the site: the index and the case are the same artefact seen twice.
//
// THE INDEX RULE — the copper fill that travels between the Mobile / Web
// collections, and between navbar sections. Same material, same curve, so the
// two read as one mechanism measuring the page.
//
// Everything else stays quiet: chips arrive as a list, a screenshot enters
// from the side you asked for, sections fade in place.

export const easeInk = easeProfessional;

/** Shared-element travel: long enough to follow, short enough to stay snappy. */
export const plateTransition: Transition = {
  type: "tween",
  duration: 0.28,
  ease: easeInk,
};

/** The index rule gliding between two states of the same control. */
export const indexRuleTransition: Transition = {
  type: "tween",
  duration: 0.24,
  ease: easeInk,
};

/** Sheets and overlays: opacity only, so nothing fights the travelling plate. */
export const sheetTransition: Transition = {
  type: "tween",
  duration: 0.16,
  ease: "easeOut",
};

/** A screenshot entering from the direction of travel. */
export const stepTransition: Transition = {
  type: "tween",
  duration: 0.2,
  ease: easeInk,
};

/** Extra list items joining a visible list — capped so the tail never waits. */
export function listEntryDelay(index: number, step = 0.02, cap = 0.12): number {
  return Math.min(index * step, cap);
}

// ─── Magnetic Hover Offset ───────────────────────────────────────────

// `magneticTransition` was removed: `Magnetic` uses plain CSS/inline transforms
// now, so no framer-motion transition described this behaviour.
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

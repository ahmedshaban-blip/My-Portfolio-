import type { Variants, Transition } from "framer-motion";

// ─── 90Hz-safe professional motion ───────────────────────────────────
// Transform + opacity only. Tween-based (predictable frame cost vs springs).
// Subtle distances, short durations, light stagger.

export const easeProfessional = [0.22, 1, 0.36, 1] as const;

export const durationFast = 0.3;
export const durationBase = 0.45;

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

// ─── Section arrival: the sheet, then the cards on it ────────────────
// A section reveals as ONE arrival, not as N independent triggers: the
// container is the scroll trigger, the cards are the list that lands on it.
// That is why the cards are children rather than each owning `whileInView` —
// sibling cards firing off their own viewport intersection is what made the
// grids look like a slideshow instead of a section.
//
// The stagger is capped by `staggerCap` so a 12-card grid finishes behind the
// fold rather than trailing a slow tail; `staggerChildren` stays small because
// 6% per sibling is already ~0.4s across a 3-column row.

/** Cards on a section: same 16px rise as a section, so the sheet stays one plane. */
export const sectionStagger: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
};

/**
 * A card inside a revealed section. Identical geometry to `revealOnScroll` —
 * a card must not rise further than the section carrying it, or the plane
 * visibly separates.
 */
export const sectionCard: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: durationBase, ease: easeProfessional },
  },
};

/**
 * Viewport contract for a section's arrival.
 *
 * `amount` is intentionally 0.01 rather than 0.25: on a 140vh section, 25%
 * visible means the visitor is already a screen into it before the header
 * moves. The section should start arriving as it crosses the fold.
 * The negative bottom margin holds the trigger just below the fold so the
 * visitor sees the motion rather than its aftermath.
 */
export const sectionViewport = {
  once: true,
  amount: 0.01,
  margin: "0px 0px -12% 0px",
} as const;

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

// ─── Scroll Reveal (subtle slide-up, once-only) ───────────────────────

export const revealOnScroll: Variants = {
  hidden: { opacity: 0, y: 16 },
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

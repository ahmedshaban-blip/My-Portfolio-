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

// ─── Directional arrival ─────────────────────────────────────────────
// The same arrival as `revealOnScroll`, aimed from the side the content
// actually lives on. Direction is information, not decoration:
//
//   RIGHT — a section's opening column enters from its reading origin.
//   LEFT  — the opposing column of a split arrives from the other side, so
//           the two halves read as one composition closing on the centre.
//   DOWN  — a cascade in time order (a timeline) descends into place.
//   UP    — the default rise; the sheet itself crossing the fold.
//
// Geometry is identical across all four (same 16px offset, same duration,
// same curve), so the page keeps ONE arrival speed. Only the axis changes —
// a mixed-direction page must not also be a mixed-tempo page.
//
// PERFORMANCE: `x`/`y` and `opacity` only — both composited, neither drives
// layout. Distances stay at 16px so nothing travels far enough to expose a
// repaint edge, and `once` viewports mean each element animates exactly one
// time per page load.

/** Travel distance for a directional arrival. Shared so all axes match. */
const revealOffset = 16;

/** Content entering from its reading origin (the left gutter) — moves right. */
export const revealFromRight: Variants = {
  hidden: { opacity: 0, x: -revealOffset },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: durationBase, ease: easeProfessional },
  },
};

/** The opposing column — enters from the right edge, closing on the centre. */
export const revealFromLeft: Variants = {
  hidden: { opacity: 0, x: revealOffset },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: durationBase, ease: easeProfessional },
  },
};

/** A descending cascade: time-ordered content settles downward. */
export const revealFromTop: Variants = {
  hidden: { opacity: 0, y: -revealOffset },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: durationBase, ease: easeProfessional },
  },
};

/**
 * The default rise. Named explicitly for call sites that pick a direction
 * from data, so `revealFromDown` and `revealOnScroll` stay one concept.
 */
export const revealFromDown: Variants = revealOnScroll;

/**
 * Mobile directional arrivals: shorter throw, tighter curve.
 *
 * PERFORMANCE: a 16px horizontal travel on a 360px viewport is ~4.5% of the
 * width and re-rasterizes a wider band than the vertical equivalent. Halving
 * it keeps the direction legible while roughly halving the moved area.
 */
export const mobileDirectional: Record<"right" | "left" | "top" | "down", Variants> = {
  right: {
    hidden: { opacity: 0, x: -8 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" } },
  },
  left: {
    hidden: { opacity: 0, x: 8 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" } },
  },
  top: {
    hidden: { opacity: 0, y: -8 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
  },
  down: {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
  },
};

/** A direction name, used by reveal wrappers and section variants. */
export type RevealDirection = "up" | "down" | "left" | "right";

/** Resolve a direction to its desktop variant, defaulting to the rise. */
export function directionVariant(direction: RevealDirection = "up"): Variants {
  switch (direction) {
    case "down":
      return revealFromTop;
    case "left":
      return revealFromLeft;
    case "right":
      return revealFromRight;
    default:
      return revealFromDown;
  }
}

/** Resolve a direction to its compressed mobile variant. */
export function directionVariantMobile(direction: RevealDirection = "up"): Variants {
  switch (direction) {
    case "down":
      return mobileDirectional.top;
    case "left":
      return mobileDirectional.left;
    case "right":
      return mobileDirectional.right;
    default:
      return mobileDirectional.down;
  }
}

// ─── Motion system: the plate and the index rule ─────────────────────
// One authored moment, then quiet feedback.
//
// THE PLATE — a project's media leaves its index card and lands in the case
// sheet as one shared element (`layoutId="plate-<slug>"`). It is the only
// morph on the site: the index and the case are the same artefact seen twice.
//
// THE INDEX RULE — the bordeaux fill that travels between the Mobile / Web
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

import { motion, type Variants } from "framer-motion";
import { useAnimationContext } from "@/hooks/useAnimationContext";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  sectionCard,
  sectionStagger,
  sectionViewport,
  directionVariant,
  directionVariantMobile,
  type RevealDirection,
} from "@/lib/animation-variants";

/**
 * A section's own arrival.
 *
 * One trigger for the whole section: the container intersects, and everything
 * inside it — heading and cards alike — is choreographed from that single
 * moment. Cards are wrapped in `SectionItem` (or any element carrying
 * `sectionCard` variants) so they arrive as a list on the section rather than
 * each one running its own scroll listener.
 *
 * `SectionItem` faces each card: a split layout passes `left` or `right` so a
 * column's cards enter from that column's own side of the page.
 *
 * The default state is already-visible content: `hidden` is applied only when
 * motion is on, so a failed script or a reduced-motion visitor gets the page.
 */
export function SectionReveal({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const { reducedMotion } = useAnimationContext();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  // Direction lives on the children (see `SectionItem`), not here: the
  // container must stay a pure stagger root, or its own transform would
  // compound with each child's and double the travel.
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={sectionViewport}
      variants={sectionStagger}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * One card inside a `SectionReveal`. Geometry matches the section's own rise
 * so the group reads as a single plane of paper, not as nested animations.
 */
export function SectionItem({
  variants,
  direction = "up",
  className,
  children,
}: {
  variants?: Variants;
  direction?: RevealDirection;
  className?: string;
  children: React.ReactNode;
}) {
  const { reducedMotion } = useAnimationContext();
  const isMobile = useIsMobile();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  // A card rises with its section by default; a split layout passes `left` or
  // `right` so a column's cards enter from that column's side.
  //
  // Mobile must route through `directionVariantMobile` for EVERY direction,
  // including `up`. Falling back to `mobileVariants.fadeUp` for `up` would
  // give it a 10px throw while its siblings throw 8px — mixed tempo inside a
  // single staggered grid. `directionVariantMobile("up")` already resolves to
  // the same rise at the shared 8px mobile distance.
  const resolved =
    variants ??
    (isMobile
      ? directionVariantMobile(direction)
      : direction === "up"
        ? sectionCard
        : directionVariant(direction));

  return (
    <motion.div variants={resolved} className={className}>
      {children}
    </motion.div>
  );
}

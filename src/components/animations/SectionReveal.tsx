import { motion, type Variants } from "framer-motion";
import { useAnimationContext } from "@/hooks/useAnimationContext";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  sectionCard,
  sectionStagger,
  sectionViewport,
  mobileVariants,
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
  className,
  children,
}: {
  variants?: Variants;
  className?: string;
  children: React.ReactNode;
}) {
  const { reducedMotion } = useAnimationContext();
  const isMobile = useIsMobile();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={variants ?? (isMobile ? mobileVariants.fadeUp : sectionCard)}
      className={className}
    >
      {children}
    </motion.div>
  );
}

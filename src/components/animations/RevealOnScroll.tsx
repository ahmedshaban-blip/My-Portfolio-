import { motion, type Variants } from "framer-motion";
import { useAnimationContext } from "@/hooks/useAnimationContext";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  sectionViewport,
  directionVariant,
  directionVariantMobile,
  type RevealDirection,
} from "@/lib/animation-variants";

interface RevealOnScrollProps {
  variants?: Variants;
  delay?: number;
  /**
   * Which way the content arrives. Direction encodes where the content sits:
   * a left-hand column comes from `right` (its reading origin), the opposing
   * column from `left`, a header band from `down`, the default rise from `up`.
   * Ignored when an explicit `variants` is passed.
   */
  direction?: RevealDirection;
  /** @deprecated No scroll-linked motion — kept for API compatibility. */
  parallax?: number;
  className?: string;
  children: React.ReactNode;
}

export function RevealOnScroll({
  variants,
  delay = 0,
  direction = "up",
  className,
  children,
}: RevealOnScrollProps) {
  const { reducedMotion } = useAnimationContext();
  const isMobile = useIsMobile();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  // Mobile keeps animation, but lighter/faster and with a shorter throw.
  const base =
    variants ??
    (isMobile ? directionVariantMobile(direction) : directionVariant(direction));
  const customVariants: Variants =
    delay !== 0
      ? {
          hidden: base.hidden,
          visible: {
            ...(typeof base.visible === "object" ? base.visible : {}),
            transition: {
              ...((typeof base.visible === "object" &&
              "transition" in (base.visible as object)
                ? ((base.visible as { transition?: object }).transition ?? {})
                : {}) as object),
              delay: Math.min(delay, 0.2),
            },
          },
        }
      : base;

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={sectionViewport}
      variants={customVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

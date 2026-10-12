import { motion, type Variants } from "framer-motion";
import { useAnimationContext } from "@/hooks/useAnimationContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { revealOnScroll, mobileVariants } from "@/lib/animation-variants";

interface RevealOnScrollProps {
  variants?: Variants;
  delay?: number;
  /** @deprecated No scroll-linked motion — kept for API compatibility. */
  parallax?: number;
  className?: string;
  children: React.ReactNode;
}

export function RevealOnScroll({
  variants,
  delay = 0,
  className,
  children,
}: RevealOnScrollProps) {
  const { reducedMotion } = useAnimationContext();
  const isMobile = useIsMobile();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  // Mobile keeps animation, but lighter/faster.
  const base = variants ?? (isMobile ? mobileVariants.fadeUp : revealOnScroll);
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
      viewport={{ once: true, amount: 0.25, margin: "0px 0px -40px 0px" }}
      variants={customVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

import { motion, type Variants } from "framer-motion";
import { useAnimationContext } from "@/context/AnimationContext";
import { revealOnScroll, springBouncy } from "@/lib/animation-variants";

interface RevealOnScrollProps {
  variants?: Variants;
  delay?: number;
  parallax?: number;
  className?: string;
  children: React.ReactNode;
}

export function RevealOnScroll({
  variants = revealOnScroll,
  delay = 0,
  parallax = 0,
  className,
  children,
}: RevealOnScrollProps) {
  const { reducedMotion } = useAnimationContext();
  const effectiveParallax = reducedMotion ? 0 : parallax;

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const customVariants: Variants =
    effectiveParallax !== 0
      ? {
          hidden: { opacity: 0, y: 50 + effectiveParallax * 30 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { ...springBouncy, delay },
          },
        }
      : variants;

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={customVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

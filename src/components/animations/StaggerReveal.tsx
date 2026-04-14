import { motion, type Variants } from "framer-motion";
import { useMemo } from "react";
import { useAnimationContext } from "@/hooks/useAnimationContext";
import { heroStaggerContainer, heroWordReveal } from "@/lib/animation-variants";

interface StaggerRevealProps {
  children: string;
  className?: string;
  variants?: Variants;
  childVariants?: Variants;
  delay?: number;
  staggerDelay?: number;
  as?: "div" | "h1" | "h2" | "p" | "span";
  mode?: "word" | "letter";
}

const motionComponents = {
  div: motion.div,
  h1: motion.h1,
  h2: motion.h2,
  p: motion.p,
  span: motion.span,
} as const;

export function StaggerReveal({
  children,
  className,
  variants = heroStaggerContainer,
  childVariants = heroWordReveal,
  delay,
  staggerDelay,
  as = "div",
  mode = "word",
}: StaggerRevealProps) {
  const { reducedMotion } = useAnimationContext();

  const items = useMemo(
    () => (mode === "letter" ? children.split("") : children.split(" ")),
    [children, mode]
  );

  if (reducedMotion) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  const containerVariants: Variants =
    delay !== undefined || staggerDelay !== undefined
      ? {
          hidden: {},
          visible: {
            transition: {
              staggerChildren: staggerDelay ?? (mode === "letter" ? 0.03 : 0.12),
              delayChildren: delay ?? 0.3,
            },
          },
        }
      : variants;

  const Comp = motionComponents[as];

  return (
    <Comp
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={className}
    >
      {items.map((item, i) => (
        <motion.span
          key={`${item}-${i}`}
          variants={childVariants}
          className="inline-block"
          style={{
            transformOrigin: "bottom",
            whiteSpace: mode === "letter" ? "pre" : undefined,
          }}
        >
          {item}
          {mode === "word" && i < items.length - 1 ? "\u00A0" : ""}
        </motion.span>
      ))}
    </Comp>
  );
}

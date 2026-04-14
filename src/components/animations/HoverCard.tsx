import { motion } from "framer-motion";
import { useAnimationContext } from "@/hooks/useAnimationContext";
import { cn } from "@/lib/utils";
import { springBouncy } from "@/lib/animation-variants";

interface HoverCardProps {
  scale?: number;
  className?: string;
  children: React.ReactNode;
}

export function HoverCard({ scale = 1.04, className, children }: HoverCardProps) {
  const { reducedMotion } = useAnimationContext();

  return (
    <motion.div
      whileHover={reducedMotion ? undefined : { scale, y: -4, transition: { type: "tween", ease: "easeOut", duration: 0.2 } }}
      whileTap={reducedMotion ? undefined : { scale: 0.97, transition: { type: "tween", ease: "easeOut", duration: 0.1 } }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}

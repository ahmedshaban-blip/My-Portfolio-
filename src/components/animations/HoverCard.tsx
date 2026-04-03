import { motion } from "framer-motion";
import { useAnimationContext } from "@/context/AnimationContext";
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
      whileHover={reducedMotion ? undefined : { scale, y: -4, transition: springBouncy }}
      whileTap={reducedMotion ? undefined : { scale: 0.97, transition: springBouncy }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}

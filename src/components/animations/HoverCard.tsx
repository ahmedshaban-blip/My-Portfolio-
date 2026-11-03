import { motion } from "framer-motion";
import { useAnimationContext } from "@/hooks/useAnimationContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { hasFinePointer } from "@/lib/pointer";
import { cn } from "@/lib/utils";

interface HoverCardProps {
  scale?: number;
  className?: string;
  children: React.ReactNode;
}

export function HoverCard({ scale = 1.02, className, children }: HoverCardProps) {
  const { reducedMotion } = useAnimationContext();
  const isMobile = useIsMobile();
  const interactive = !reducedMotion && !isMobile && hasFinePointer() && scale !== 1;

  return (
    <motion.div
      whileHover={interactive ? { scale, y: -2, transition: { type: "tween", ease: "easeOut", duration: 0.2 } } : undefined}
      whileTap={interactive ? { scale: 0.98, transition: { type: "tween", ease: "easeOut", duration: 0.1 } } : undefined}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}

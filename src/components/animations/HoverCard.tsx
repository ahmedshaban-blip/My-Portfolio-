import { motion } from "framer-motion";
import { useAnimationContext } from "@/hooks/useAnimationContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface HoverCardProps {
  scale?: number;
  className?: string;
  children: React.ReactNode;
}

export function HoverCard({ scale = 1.02, className, children }: HoverCardProps) {
  const { reducedMotion } = useAnimationContext();
  const isMobile = useIsMobile();
  const finePointer =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const interactive = !reducedMotion && !isMobile && finePointer && scale !== 1;

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

import { useRef, useCallback, type MouseEvent } from "react";
import { motion } from "framer-motion";
import { useAnimationContext } from "@/hooks/useAnimationContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { magneticTransition } from "@/lib/animation-variants";

function hasFinePointer() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

interface MagneticProps {
  children: React.ReactNode;
  strength?: number;
  className?: string;
  radius?: number;
}

export function Magnetic({
  children,
  strength = 0.3,
  className,
  radius = 200,
}: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const offsetRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef(0);
  const styleRef = useRef<CSSStyleDeclaration | null>(null);
  const { reducedMotion } = useAnimationContext();
  const isMobile = useIsMobile();
  // Desktop-only interaction: no magnetic pull on touch / coarse pointers.
  const finePointer = hasFinePointer();
  const interactive = !reducedMotion && !isMobile && finePointer;

  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (!interactive || !ref.current) return;

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < radius) {
          const factor = 1 - dist / radius;
          offsetRef.current = {
            x: dx * strength * factor,
            y: dy * strength * factor,
          };
        } else {
          offsetRef.current = { x: 0, y: 0 };
        }

        el.style.transform = `translate(${offsetRef.current.x}px, ${offsetRef.current.y}px)`;
      });
    },
    [interactive, strength, radius]
  );

  const handleMouseLeave = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (ref.current) {
      ref.current.style.transform = "translate(0px, 0px)";
    }
  }, []);

  if (!interactive) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.02 }}
      transition={magneticTransition}
    >
      {children}
    </motion.div>
  );
}

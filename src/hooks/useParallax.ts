import { useEffect, useRef } from "react";
import { useAnimationContext } from "@/context/AnimationContext";

interface UseParallaxOptions {
  speed?: number;
  disabled?: boolean;
}

export function useParallax<T extends HTMLElement = HTMLDivElement>({
  speed = 0.3,
  disabled = false,
}: UseParallaxOptions = {}) {
  const ref = useRef<T>(null);
  const { reducedMotion } = useAnimationContext();
  const isDisabled = disabled || reducedMotion;
  const rafRef = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el || isDisabled) return;

    const handleScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight;
        const center = rect.top + rect.height / 2;
        const dist = (center - vh / 2) / vh;
        el.style.transform = `translateY(${dist * speed * 100}px)`;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, [speed, isDisabled]);

  return { ref };
}

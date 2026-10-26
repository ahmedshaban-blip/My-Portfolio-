import { useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import { AnimationContext } from "@/context/animation-context-store";

const STORAGE_KEY = "prefers-reduced-motion";

export function AnimationProvider({ children }: { children: ReactNode }) {
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window === "undefined") return false;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) return stored === "true";
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  const toggleReducedMotion = useCallback(() => {
    setReducedMotion((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("reduced-motion", reducedMotion);
    document.documentElement.style.scrollBehavior = reducedMotion ? "auto" : "";
  }, [reducedMotion]);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => {
      if (localStorage.getItem(STORAGE_KEY) === null) {
        setReducedMotion(e.matches);
      }
    };
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  const value = useMemo(
    () => ({ reducedMotion, toggleReducedMotion }),
    [reducedMotion, toggleReducedMotion]
  );

  return (
    <AnimationContext.Provider value={value}>
      {children}
    </AnimationContext.Provider>
  );
}


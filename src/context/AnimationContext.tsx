import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef, type ReactNode } from "react";

interface AnimationContextValue {
  reducedMotion: boolean;
  toggleReducedMotion: () => void;
  activeSection: string;
  setActiveSection: (id: string) => void;
  scrolled: boolean;
}

const AnimationContext = createContext<AnimationContextValue | null>(null);

const STORAGE_KEY = "prefers-reduced-motion";

export function AnimationProvider({ children }: { children: ReactNode }) {
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window === "undefined") return false;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) return stored === "true";
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  const [activeSection, setActiveSection] = useState("home");
  const [scrolled, setScrolled] = useState(false);
  const scrollTick = useRef(false);

  const toggleReducedMotion = useCallback(() => {
    setReducedMotion((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollTick.current) return;
      scrollTick.current = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 10);
        scrollTick.current = false;
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    () => ({ reducedMotion, toggleReducedMotion, activeSection, setActiveSection, scrolled }),
    [reducedMotion, toggleReducedMotion, activeSection, scrolled]
  );

  return (
    <AnimationContext.Provider value={value}>
      {children}
    </AnimationContext.Provider>
  );
}

export function useAnimationContext() {
  const ctx = useContext(AnimationContext);
  if (!ctx) throw new Error("useAnimationContext must be used within AnimationProvider");
  return ctx;
}

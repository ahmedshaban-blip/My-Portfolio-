import { createContext } from "react";

export interface AnimationContextValue {
  reducedMotion: boolean;
  toggleReducedMotion: () => void;
  activeSection: string;
  setActiveSection: (id: string) => void;
  scrolled: boolean;
}

export const AnimationContext = createContext<AnimationContextValue | null>(null);

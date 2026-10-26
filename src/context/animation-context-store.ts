import { createContext } from "react";

export interface AnimationContextValue {
  reducedMotion: boolean;
  toggleReducedMotion: () => void;
}

export const AnimationContext = createContext<AnimationContextValue | null>(null);

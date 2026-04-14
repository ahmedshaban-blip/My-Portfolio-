import { useContext } from "react";
import { AnimationContext } from "@/context/animation-context-store";

export function useAnimationContext() {
  const ctx = useContext(AnimationContext);
  if (!ctx) throw new Error("useAnimationContext must be used within AnimationProvider");
  return ctx;
}

/**
 * PERFORMANCE: `matchMedia` is evaluated once per module instead of on every
 * render of every interactive component (Magnetic / HoverCard are mounted
 * dozens of times per section, and each render used to re-run the query).
 */
let finePointer: boolean | null = null;

export function hasFinePointer(): boolean {
  if (finePointer === null) {
    finePointer =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  }
  return finePointer;
}

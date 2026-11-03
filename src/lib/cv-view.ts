import type { CVTrack } from "@/config/cv";

/**
 * Helpers used only by the `/cv` reader page.
 *
 * PERFORMANCE: these live here rather than in `@/config/cv` (or `@/lib/cv-link`)
 * so Rollup keeps them in the `/cv` lazy chunk instead of the home page's entry
 * bundle.
 */

export const CV_TRACKS: readonly CVTrack[] = ["flutter", "frontend"];
export const DEFAULT_CV_TRACK: CVTrack = "flutter";

/** Type guard for untrusted input (URL params, API payloads). */
export const isCVTrack = (value: unknown): value is CVTrack =>
  value === "flutter" || value === "frontend";

/**
 * Validates an untrusted `?track=` value and falls back to `DEFAULT_CV_TRACK`.
 * Never throws and never returns `undefined`.
 */
export const parseCVTrack = (value: string | null | undefined): CVTrack =>
  isCVTrack(value) ? value : DEFAULT_CV_TRACK;

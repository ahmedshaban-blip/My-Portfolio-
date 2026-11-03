import type { CVTrack } from "@/config/cv";

/**
 * Helpers used only by the `/cv` in-browser reader page.
 *
 * PERFORMANCE: these live here rather than in `@/config/cv` (or `@/lib/utils`)
 * so Rollup keeps them in the `/cv` lazy chunk instead of the home page's entry
 * bundle. The one helper the home page does need, `getCVPageUrl`, is in
 * `@/lib/cv-link` instead.
 */

/** Same-origin URL that renders the PDF in-page instead of downloading it. */
export const getCVViewUrl = (track: CVTrack) => `/api/download-cv?track=${track}&mode=view`;

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

/**
 * Opens the CV PDF in a new tab so the browser's native viewer renders it
 * in-page. Used by the mobile fallback, where an embedded iframe would not
 * work; the inline endpoint is always served by the same origin.
 */
export function openCV(track: CVTrack): void {
  window.open(getCVViewUrl(track), "_blank", "noopener,noreferrer");
}

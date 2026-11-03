import type { CVTrack } from "@/config/cv";

/**
 * CV actions the home page needs (Hero + Navbar), so they are intentionally
 * part of the entry bundle. Page-only parsing helpers live in `@/lib/cv-view`
 * so they stay inside the lazily loaded `/cv` chunk.
 */

/** Same-origin URL that renders the PDF in-page instead of downloading it. */
export const getCVViewUrl = (track: CVTrack) => `/api/download-cv?track=${track}&mode=view`;

/**
 * Opens the CV PDF in a new tab so the browser's native viewer renders it.
 * This is the same mechanism the mobile fallback uses.
 */
export function openCV(track: CVTrack): void {
  window.open(getCVViewUrl(track), "_blank", "noopener,noreferrer");
}

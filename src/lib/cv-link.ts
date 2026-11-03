import type { CVTrack } from "@/config/cv";

/**
 * Shareable link to the in-browser CV reader.
 *
 * PERFORMANCE: this lives in its own module (not in `@/lib/cv-view`) because the
 * home page's Hero and Navbar need it, so Rollup inlines it into the entry
 * bundle — while every `/cv`-only helper stays in the lazily loaded reader chunk.
 */
export const getCVPageUrl = (track: CVTrack) => `/cv?track=${track}`;

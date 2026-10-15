// Single place to tune analytics behaviour — frontend and API both read this.
// After changing numbers here, commit + Deploy (API changes need a deployment).
export const ANALYTICS_CONFIG = {
  /** Rows shown in the dashboard "Live feed" card (scrollable past this height). */
  feedVisibleCount: 15,
  /** Rows fetched from Redis per stats request (buffer above visible). */
  feedFetchCount: 20,
  /** Rows kept in Redis (older ones are trimmed away). */
  feedStoredCount: 50,
  /** Owner rows fetched per stats request. */
  ownerFeedFetchCount: 6,
  /** Max height (px) of the scrollable feed list. */
  feedMaxHeightPx: 420,
} as const;

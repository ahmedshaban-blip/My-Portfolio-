# Bug Fix Log: Read CVs In-Browser (cv-reader)

Source of findings: `.agents/workspace/cv-reader/architecture.md` (revision 2) and
`.agents/workspace/cv-reader/tasks.json` (TASK-01…TASK-12).

Human decisions locked at Gate 1 / Gate 2:
1. Dedicated shareable page `/cv?track=flutter|frontend` (default `flutter`).
2. `api/download-cv.ts` gains `mode=view` → `Content-Disposition: inline`.
3. Mobile / coarse-pointer → fallback actions instead of a broken embed.
4. **Separate** view counters (`v:cvview:*` family), downloads untouched.
5. `vercel.json` rewrite hardened to `/((?!api/).*)`.
6. Views shown in their **own card**; range requests are not counted.

## Landed changes

### Serverless API (`api/`)
- **`download-cv.ts`** — added `mode` to the request type; `isViewMode = rawMode === "view"`.
  Disposition is now `` `${isViewMode ? "inline" : "attachment"}; filename="…"` ``.
  Counting uses a single derived namespace `const ns = isViewMode ? "cvview" : "cv"`,
  so a view can never write a download key and vice versa. Added
  `X-Content-Type-Options: nosniff`. Requests carrying a `Range` header are not
  counted, because a PDF viewer issues extra ranged fetches while paging and
  would otherwise inflate one view into many.
- **`visit-stats.ts`** — added a `cvViews` block (identical shape to `cv`:
  per-track all-time total, summed 14-day unique, 14-day daily series) and the
  matching pipelined reads (`v:cvview:*`, `v:cvviewday:*:d`) plus
  `pfcount v:cvviewuniq:*:d`. Additive and backward-compatible.
- **`visit-reset.ts`** — `v:cv:*` also matches `v:cvview:*`, so resetting
  downloads would silently wipe views. Added a distinct `cvviews` scope and
  widened the scope guard. `cv` itself is byte-for-byte unchanged.

### Shared config / helpers
- **`src/config/cv.ts`** — added `CV_TRACKS`, `DEFAULT_CV_TRACK`, `isCVTrack`,
  `parseCVTrack`, `getCVViewUrl`, `getCVPageUrl`. Existing exports untouched.
- **`src/lib/utils.ts`** — added `openCV(track)` (new tab, native viewer).
  `downloadCV` untouched.

### UI
- **`src/pages/CVView.tsx`** (new) — the `/cv` page. Track is derived from
  `?track`; an unusable value shows a polite notice and normalizes the URL.
  Falls back to actions on mobile/coarse-pointer or on embed failure.
- **`src/components/cv/CVViewer.tsx`** (new) — the titled iframe + loading state.
- **`src/components/cv/CVFallback.tsx`** (new) — "Open PDF" / "Download" card.
- **`src/components/cv/CVTrackTabs.tsx`** (new) — Flutter/Frontend switcher.
- **`src/App.tsx`** — lazy `/cv` route declared **above** `path="*"`; otherwise
  the catch-all `NotFound` would shadow it.
- **`src/components/Hero.tsx`** / **`Navbar.tsx`** — added a "Read CV" link to
  `/cv?track=flutter` in the Hero CV group, the desktop navbar, and the mobile
  menu (closing the menu on tap). Both existing download paths are unchanged.
- **`AnalyticsSection.tsx`** — new "CV views" card plus a third
  "Reset CV views" button; the existing reset remains downloads-only.
- **`src/lib/analytics.ts`**, **`src/hooks/use-visits-analytics.ts`** — added
  `CvViewTrack` and an **optional** `cvViews` so a stale API response cannot
  crash the dashboard.
- **`vercel.json`** — `/(.*)` → `/((?!api/).*)`.

## Verification

- `npx eslint src --ext .ts,.tsx` → exit 0, no output.
- `npx tsc --noEmit -p tsconfig.app.json --ignoreDeprecations 5.0` → only the
  pre-existing `@supabase/supabase-js` TS2307 error.
- `npx tsc --noEmit -p tsconfig.node.json` → exit 0.
- `npm run build` → success. `CVView` ships as its own 5.5 kB chunk, so the home
  page entry bundle is unchanged.

Runtime checks against the built preview and the local API are recorded in
`reports/e2e-verification.md`.

## Review-loop fix (after the performance audit)

**PERF-01 — the `/cv` helpers leaked into the home page entry bundle.**
The performance agent measured the entry chunk at 108.57 kB vs the 105.61 kB
pre-feature baseline (+2.96 kB raw / +0.75 kB gzip) and traced it to the new
reader helpers being inlined into the already-hot `@/config/cv` and
`@/lib/utils` modules.

Fixed by splitting the helpers:
- `src/lib/cv-view.ts` — **`/cv`-chunk only**: `getCVViewUrl`, `CV_TRACKS`,
  `DEFAULT_CV_TRACK`, `isCVTrack`, `parseCVTrack`, `openCV`.
- `src/lib/cv-link.ts` — **entry-safe, one function**: `getCVPageUrl`, the only
  helper Hero/Navbar need.

Re-measured: `mode=view` is no longer present in the entry chunk at all, and the
entry dropped from 108 622 B to **108 371 B**. The residual ~2.7 kB over the
pre-feature baseline is the unavoidable cost of the requested entry points (the
`getCVPageUrl` helper plus the `BookOpen` icon and two `<Link>` wrappers in Hero
and Navbar) — it cannot be removed without deleting the affordances themselves.

## Notes / limitations

- **No automated test runner exists in this repo** (no `test` script, no
  vitest/jest config, no `*.test.*`/`*.spec.*` files), so TASK-12 is manual
  verification only. No suite was invented and none was weakened.
- The Redis keys are **empty on first deploy**: historical visits have no view
  data and none can be reconstructed without fabricating numbers, so the new
  card honestly starts at zero.

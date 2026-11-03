# Bug Fix Log: Home Page First-Load Jank (home-page-jank)

Source of findings: `reports/performance-load.md` (PERF-01…16) plus a read-only
audit of the below-fold sections and interactions.

## Loop Iteration: #2 of 3 — QA regression fixes

Findings: `reports/final-qa.md` (QA-01..QA-10) and `reports/final-qa-2.md`.

### Fixed: `QA-03` — background rAF chain could still die on `document.hidden`
- **Severity**: Medium (correctness; same permanent-death class as PERF-08)
- **File**: `src/components/animations/AnimatedBackground.tsx`
- **Fix**: `draw()` now calls `schedule()` before returning on `document.hidden`,
  so a frame delivered during an occlusion transition no longer kills the chain.

### Fixed: `QA-02` — smooth-scroll anchors landed short on first load
- **Severity**: Medium
- **File**: `src/pages/Index.tsx` (`BelowFold`)
- **Fix**: mount the section as soon as a nav link for it is clicked, then
  re-assert `scrollIntoView` once (700 ms) after the layout settles. The pending
  correction is cancelled by a real `wheel` / `touchstart` / `keydown` so it never
  fights a user who starts scrolling, and a repeated click only moves the single
  pending timer forward (no queued double-jumps).

### Fixed: `QA-04` — missing id during the Suspense fallback window
- **File**: `src/pages/Index.tsx` — the `Suspense` fallback now carries `id={id}`.

### Fixed: `QA-05` — first wheel before image load anchored zoom at (0,0)
- **File**: `src/components/Projects.tsx` — added `ensureMeasured()` (lazy measure
  when the cache is empty) used by `zoomAt`/`zoomToggleCenter`, plus a mount-time
  `requestAnimationFrame(measure)` to warm the geometry cache.

### Fixed: `QA-06` — idle-deferred visit POST dropped fast bounces
- **File**: `src/hooks/use-visit-tracker.ts` — fallback idle timeout 1200 ms -> 800 ms
  and a `pagehide` flush that sends the pending payload via `sendBeacon`,
  guarded by a `sent` ref so it can never double-send.

### Fixed: `QA-07` — dead code left behind by the perf pass
- `HoverCard.tsx` now uses the shared `hasFinePointer()` from `@/lib/pointer`.
- Removed the unused `magneticTransition` export from `lib/animation-variants.ts`.
- Removed `EAGER_COVER_COUNT` and the permanently-false `priority` prop/`eager`
  passthrough from `Projects.tsx`.

### Not changed (accepted)
- `QA-08` scrollspy 200 ms debounce — cosmetic, self-healing.
- `QA-09` `rootMargin: 900px` — intentionally left; `#about`/`#skills` still mount
  at load on tall viewports, which is cheap and keeps anchors instant.

## Verification (iteration 2)
- `npx eslint src --ext .ts,.tsx` -> exit 0, no output.
- `npx tsc --noEmit -p tsconfig.app.json --ignoreDeprecations 5.0` -> only the
  pre-existing `@supabase/supabase-js` TS2307 error.
- `npm run build` -> success.
- Runtime, built preview on :4173:
  - all five anchors (`#about`..`#contact`) land consistently at the 96 px
    fixed-navbar offset (previously #contact was ~1423 px short);
  - direct `/#experience` and `/#contact` loads land correctly and stay stable;
  - `?project=cv-builder` opens the dialog and normalizes the URL;
  - zero duplicate section ids once every section has mounted;
  - plain load still mounts only 2 sections / 223 DOM nodes;
  - the deferred scroll correction is cancelled when the user takes over scrolling;
  - `QA-03` fix observed live: after forcing `document.hidden` true for one frame the
    loop resumed on its own (50 rAF callbacks / 800 ms, canvas repainting).
- NOT MEASURED: real FPS / dropped frames / LCP. The automation tab is occluded, so
  Chromium delivers **zero** `requestAnimationFrame` callbacks even when
  `document.hidden === false` and `visibilityState === "visible"` (verified directly:
  an rAF counter stays at 0 and a manually painted canvas pixel is never cleared by
  the app loop, while `window.innerWidth` reports a normal 912 px). Needs a
  foregrounded Chrome window or the DevTools Performance panel.

## Loop Iteration: #1 of 3

### Fixed: `PERF-01` — full-screen canvas mesh rasterized on the main thread
- **Severity**: Critical
- **File**: `src/components/animations/AnimatedBackground.tsx`
- **Fix**: mesh layer rasterized at `MESH_SCALE = 0.5` and blitted scaled
  (4× fewer filled px); `MAX_DPR` 2 → 1.5; first rAF start delayed 350 ms so the
  raster no longer lands in the LCP/entrance window; per-frame
  `document.querySelector('[role="dialog"]')` replaced by a MutationObserver flag.
- **Verify**: production trace — Layout 46 ms → 22 ms, UpdateLayoutTree 14 ms → 7 ms.

### Fixed: `PERF-08` — rAF chain died permanently on the first scroll
- **Severity**: Medium (correctness + the "pause while scrolling" optimisation
  could never resume)
- **File**: same
- **Fix**: `draw()` now re-schedules instead of `return`-ing, guarded by `rafId`
  so no two chains can run; visibility/scroll handlers only flip the flag.

### Fixed: `PERF-03` / `PERF-11` — filter-based decorations above the fold
- **Severity**: High
- **Files**: `Hero.tsx`, `Navbar.tsx`, `About.tsx`, `Experience.tsx`
- **Fix**: `blur-[120px]`, `blur-3xl`, `blur-[100px]` orbs → equivalent
  `radial-gradient()` backgrounds (zero filter cost); six `backdrop-blur-md
  bg-background/90` panels → `bg-background/95` (the blur was invisible at 90 %
  opacity); navbar no longer toggles `backdrop-blur-*`.

### Fixed: `PERF-04` — all six "lazy" sections mounted during first load
- **Severity**: High
- **File**: `src/pages/Index.tsx`
- **Fix**: `BelowFold` gates the render behind an IntersectionObserver
  (`rootMargin: 900px`), keeping the `minHeight` placeholder and the section id
  for `#anchor` navigation. DOM at load: 437 → 223 nodes.

### Fixed: `PERF-05` — theme applied after first paint
- **Severity**: High
- **File**: `index.html`
- **Fix**: inline pre-paint script sets the `dark` class + `color-scheme` from the
  same `theme` storage key next-themes uses.

### Fixed: `PERF-06` — font CSS loaded after `load` (FOUT reflow mid-animation)
- **Severity**: High
- **File**: `index.html`
- **Fix**: one render-blocking stylesheet; removed the duplicate
  `preload as=style` + `media="print" onload` swap and the `noscript` copy.

### Fixed: `PERF-07` — first-scroll navbar jank
- **Severity**: High
- **File**: `src/components/Navbar.tsx`
- **Fix**: `transition-[padding,…] duration-500` → `transition-colors duration-200`
  (no layout transition, no blur-layer churn).

### Fixed: `PERF-09` / `PERF-10` — render-time `matchMedia` and double renders
- **Severity**: Medium
- **Files**: `src/hooks/use-mobile.tsx`, `src/lib/pointer.ts` (new),
  `Magnetic.tsx`, `HoverCard.tsx`
- **Fix**: `useIsMobile` reads the query in the initial state (no post-mount
  double render / variant swap); `hasFinePointer()` cached at module scope.
- **Extra**: `Magnetic` no longer wraps in `motion.div whileHover` — framer wrote
  `transform` for the hover scale while the handler wrote it per rAF, so the two
  fought over the same property.

### Fixed: `PERF-12` — Radix dialog/tabs pulled into the critical path
- **Severity**: Medium
- **File**: `vite.config.ts`
- **Fix**: the `radix` manual chunk (which also carried `clsx`/`tailwind-merge`)
  replaced by a `utils` chunk. Critical-path JS: 42.41 kB → 21.03 kB for that slot.

### Fixed: `PERF-15` — dialog lookup on every canvas frame
- Covered by PERF-01 (event-driven flag).

### Fixed: `PERF-16` — visit analytics competed with the LCP
- **Severity**: Low
- **File**: `src/hooks/use-visit-tracker.ts`
- **Fix**: the POST is deferred to `requestIdleCallback` (1.2 s fallback).

### Fixed: `PERF-13` — infinite `animate-ping`
- **File**: `Hero.tsx` → `[animation-iteration-count:3]`.

### Fixed: below-fold interaction audit
- `Projects.tsx`: `EAGER_COVER_COUNT` 2 → 0 (two 93–111 kB covers were fetched
  `fetchPriority=high` below the fold); `animate-pulse` skeletons → static
  (up to 10 never-ending animations); grids `animate` → `whileInView` and honour
  `reducedMotion`; `AnimatePresence` removed from the tab switch (kept both grids
  mounted mid-swap); lightbox `bg-black/85 backdrop-blur-md` → `bg-black/90`
  (animated opacity over a full-viewport backdrop-filter re-blurred every frame);
  pan/zoom no longer reads `offsetWidth` / `clientWidth` / `getBoundingClientRect`
  on every pointermove and wheel tick (metrics cached per gesture);
  `images` memoised (the effect reset the zoom on every re-render).
- `Contact.tsx`: `watch("message")` → isolated `MessageCount` leaf with `useWatch`.
- `index.css`: `.modern-card` transitions colors only (a 44 px box-shadow was
  animated on ~25 cards).
- `use-scrollspy.ts`: re-scans when lazily-mounted sections replace their
  placeholders, and uses a centre band + `threshold: 0` — the old
  `[0.1,0.2,0.4,0.6]` thresholds could never be reached by sections taller than
  the band, so the indicator never moved.
- `pages/Index.tsx`: page wrapped in `memo` so `setSearchParams` from the project
  lightbox no longer reconciles the whole page.

## Verification
- `npx eslint src --ext .ts,.tsx` → 0 errors, 0 warnings.
- `npx tsc --noEmit -p tsconfig.app.json --ignoreDeprecations 5.0` → only the
  pre-existing `@supabase/supabase-js` resolution error in
  `src/integrations/supabase/client.ts` (dependency is not installed; unrelated).
- `npm run build` → success.
- Chromium trace, production build, same procedure before/after:
  long-task blocking 2.99 ms → 1.00 ms; `Layout` 46 ms → 22 ms;
  `UpdateLayoutTree` 14 ms → 7 ms; DOM nodes at load 437 → 223.
- NOT MEASURED: real dropped-frame/FPS numbers and scroll-time composites — the
  automation browser tab is occluded in this host, so `requestAnimationFrame`
  never fires and the compositor produces no frames. Needs a visible window
  (Chrome DevTools performance panel, 4× CPU throttle).

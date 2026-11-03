# Final QA Verification Report: Home Page First-Load Jank (`home-page-jank`)

Scope: post-implementation regression audit of the landed performance fix set (16 modified files + `src/lib/pointer.ts`), against the pre-fix baseline in the working tree (`HEAD = ea1224f`, "Update Design colors"). Read-only review — this agent modified no source, test, or config file. Only this report was written.

## 1. Definitive Verdict

- **Verdict**: **PASS WITH NOTES** — the fix set is shippable; 2 Medium follow-ups (`QA-02`, `QA-03`) should be landed before merge, 4 Low/Info items are optional.
- **Strict-reading note**: under a literal "any regression ⇒ FAIL" reading the gate is **FAIL**, because `QA-02` is a genuine new behaviour risk introduced by deferred mounting (smooth-scroll anchor landing) and `QA-03` is a real (narrow) loop-death path. I did not escalate to a rollback: the only *deterministic* regression I found (`QA-01`, shareable `?project=slug` deep links) **was fixed in the working tree at 11:15:04 while this audit was running**, and reverting the set would restore all 16 `PERF-*` defects found by `performance-load.md`.
- **Parity Status**: Static gates green. Runtime parity **partially verified by code-path analysis only** — no browser is attached to this session.
- **Snapshot this report is pinned to**: latest source write `src/components/animations/HoverCard.tsx` @ 11:16:32 ESP, 03 Nov 2026. Gates re-run at 11:17. **The tree was edited three times during the audit** (11:12:29 `use-scrollspy.ts`, 11:15:04 `Index.tsx`, 11:16:32 `HoverCard.tsx`) — see `QA-10`.
- **MEASURED**: ESLint, TypeScript, production build, built-HTML chunk graph, preview HTTP response.
- **NOT MEASURED**: LCP / CLS / INP / frame times, actual anchor landing positions, deep-link behaviour in a browser. Reason: `browser.tabs.list` → `browser.disconnected` (no desktop browser/CDP endpoint) and no headless-Chrome trace harness on this host. Every runtime claim below is derived from a named code path plus arithmetic on real configured values — nothing is fabricated.

## 2. Gate Results (real, final re-run on the pinned snapshot)

| Check | Baseline / Expected | Current Value | Result |
| :--- | :--- | :--- | :--- |
| **Test Files SHA256** | n/a | No test files exist (no `test` script, no `*.test.*` / `*.spec.*`, no vitest/jest config) | N/A |
| **Total Test Count** | n/a | 0 (suite does not exist) | N/A |
| **Line Coverage** | n/a | NOT MEASURED (no runner) | N/A |
| **Golden / visual parity** | n/a | NOT MEASURED (no browser) | N/A |
| **Code formatting** | Not a configured gate | `prettier` absent from devDependencies | N/A |
| **Static analysis (ESLint)** | 0 problems | `npx eslint src --ext .ts,.tsx` → **exit 0, no output** | PASS |
| **Type check** | 0 new errors | `npx tsc --noEmit -p tsconfig.app.json --ignoreDeprecations 5.0` → exit 2, **1 error**: `src/integrations/supabase/client.ts(2,30) TS2307: Cannot find module '@supabase/supabase-js'` | PASS (pre-existing, §3) |
| **Production build** | Succeeds | `npm run build` → **exit 0**, `✓ built in 14.16s` | PASS |
| **Preview server** | Serves app | `npm run preview -- --port 4188` → **HTTP 200**, 3171 B `index.html` | PASS |

### Bundle output (measured; current tree)

| File | Raw | Gzip | Critical path? |
| :--- | ---: | ---: | :--- |
| `assets/index-*.js` (entry) | 105.61 kB | 32.48 kB | yes (`<script type=module>`) |
| `assets/react-*.js` | 160.33 kB | 52.41 kB | yes (`modulepreload`) |
| `assets/motion-*.js` | 128.91 kB | 42.52 kB | yes (`modulepreload`) |
| `assets/utils-*.js` (clsx + tailwind-merge + cva) | 21.03 kB | 7.14 kB | yes (`modulepreload`) |
| `assets/index-*.css` | 85.69 kB | 14.33 kB | yes (render-blocking) |
| **Critical total** | **501.57 kB** | **148.88 kB** | |

Pre-fix baseline as measured by `performance-load.md`: 544.40 kB / 162.02 kB → **−42.83 kB raw / −13.14 kB gzip**. The baseline figure is quoted, not re-measured: rebuilding the pre-fix tree needs `git checkout`, which G1 forbids.

`radix` chunk is gone (intended). The replacement `utils` chunk **is** emitted as `<link rel="modulepreload">` in `dist/index.html` — verified in the built HTML, so the `manualChunks` change adds **no** request waterfall to the critical path.

## 3. Pre-existing Issues (explicitly NOT regressions)

- **`TS2307` @ `src/integrations/supabase/client.ts:2`** — `@supabase/supabase-js` is missing from `package.json`; the file is untouched by this change set (`git diff` clean). Makes `tsc` exit non-zero regardless of this work.
- **First theme-toggle click is a no-op for a system-dark visitor** — `Navbar.tsx:32` toggles from `theme` (`"system"`) instead of `resolvedTheme`, so the first click sets `"dark"` on an already-dark page. Untouched here; only more noticeable because `index.html` now paints dark pre-paint.
- **`renderMesh` / `paint` have no `try/catch`** — an invalid `addColorStop` colour (e.g. `oklch()` on a browser without canvas colour-syntax support) throws inside the rAF callback and kills the loop. Same shape as before; see `QA-03`.
- **`sonner` is still bundled into the entry chunk** — `PERF-12`'s second half was not implemented. Remaining finding from `performance-load.md`, not a regression.
- **`nav` padding snaps** (`py-5`→`py-3`), `.modern-card:hover` shadow appears without a transition, `ProjectImage` skeleton no longer pulses. Documented, intended paint-only trades; visual parity intentionally not preserved.

## 4. Finding Table

| ID | Severity | Status | Category | File | Line | Description | Required Fix |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `QA-01` | High | **FIXED in tree** (was the only deterministic regression) | Feature regression | `src/pages/Index.tsx` | 106-110, 113 | `?project=<slug>` deep link did not open the lightbox on load: `Projects` initialises `open` from `searchParams` **at mount**, but the section only mounted when its placeholder entered the 900 px band. Placeholder top ≈ `hero(≥100vh) + 60vh + 60vh = 2.2V`, intersecting only when `2.2V − V ≤ 900` → **`V ≤ 750 px`**; for any desktop window taller than ~750 px the dialog never initialised at load and the URL silently kept the param. **Resolved at 11:15:04** by `forceMount`: `<BelowFold id="projects" forceMount={new URLSearchParams(window.location.search).has("project")}>` + `useState(forceMount)`. Verified by reading the new code: mount is immediate ⇒ `open`/`selected`/`tab` all initialise from the URL on the first render; URL writes are unchanged. Runtime confirmation still blocked (no browser). | Landed. Keep the `forceMount` path when refactoring `BelowFold`. |
| `QA-02` | **Medium** | OPEN | Navigation regression | `src/pages/Index.tsx` (deferred mount) + `src/index.css:154` | 40-70 | Smooth-scroll destinations to the two deepest anchors (`#experience`, `#contact`) can land short of / past the target on first load. The browser computes the destination once at click time from *placeholder* heights (`120vh` fixed); `#projects` and `#experience` mount and resize **during** the animation (they enter the 900 px headroom band mid-scroll) and nothing re-asserts the scroll, leaving an error of `Δ(projects) + Δ(experience)` real-vs-placeholder height. `#about`/`#skills` are unaffected (mounted at load, before any click); `#projects` is affected only if the user clicks before those two settle. Derived from code + layout arithmetic; magnitude unmeasured (no browser). | Mount on navigation intent and re-assert: in `BelowFold`, `useEffect` on `[id]` that (a) `setMounted(true)` when `window.location.hash === '#'+id`, (b) captures `document.addEventListener("click", e => e.target.closest('a[href="#'+id+'"]') && setMounted(true), true)`. Then mount **all** sections once on the first nav click before scrolling (`forceMount`-style `mountAll()`), or re-run `el.scrollIntoView({behavior:"auto"})` on `scrollend`/400 ms if the section top moved > 8 px. |
| `QA-03` | **Medium** | OPEN | Correctness / loop lifetime | `src/components/animations/AnimatedBackground.tsx` | 214-217, 292-299 | The rAF chain can still die permanently: `draw()` early-returns on `document.hidden` **without** re-scheduling, and `handleVisibilityChange` only flips `isAnimatingRef` — nothing restarts the chain. If a single frame is delivered after `document.hidden` flips (queued frame for the current tick, BFCache/occlusion transition), the background freezes until the effect remounts (route change / resize deps). Same death class as `PERF-08`; the scroll path is correctly fixed (`schedule()` on every early return). | `if (document.hidden) { schedule(); return; }` — browsers pause rAF while hidden, so the extra scheduling is free and the chain survives. Belt-and-braces: expose `restartRef.current = schedule` from the loop effect and call it from `visibilitychange` when `!document.hidden`. |
| `QA-04` | Low | OPEN | Anchor gap | `src/pages/Index.tsx` | 62 | The wrapper drops `id` the instant `mounted` flips, but the `Suspense` fallback carries no `id`, so during the chunk fetch there is **no** element with that id: `getElementById` → `null`, an anchor click is a no-op, and `useScrollSpy.connect()` sees 5 of 6 ids (self-heals on the next rescan). | `<Suspense fallback={<div id={id} style={{ minHeight }} aria-hidden="true" />}>` — guarantees the id exists exactly once at all times. |
| `QA-05` | Low | OPEN | Zoom anchoring | `src/components/Projects.tsx` | 496-513, 543-562 | `metrics` starts at zeros; `clampPan` returns its input unchanged while `imgW === 0` and `zoomAt` anchors around `(0,0)` instead of the stage centre. `onLoad={measure}` covers the normal path, but a wheel event before the image load event (slow image, cached-race) zooms to a wrong anchor with no clamping until the next pointerdown/resize. The pre-fix code read layout live, so this is new (small) exposure. | `useEffect(() => { const r = requestAnimationFrame(measure); return () => cancelAnimationFrame(r); }, [measure]);` and have `zoomAt`/`clampPan` lazily `measure()` once when `metrics.current.imgW === 0`. |
| `QA-06` | Low | OPEN | Analytics | `src/hooks/use-visit-tracker.ts` | 25-33, 193-200 | The `/api/track-visit` POST is now idle-deferred (`timeout: 2500`); a bounce in < 1.2 s (no `requestIdleCallback` → `setTimeout` fallback) or a tab closed inside the idle window is never counted — `keepalive` cannot help a request that never started. Analytics only, no user-facing impact. | Keep the deferral; add `window.addEventListener("pagehide", send, { once: true })` behind a `sent` flag and lower the fallback to ~800 ms. |
| `QA-07` | Low | OPEN (partly fixed in tree) | Dead code / doc drift | `src/lib/animation-variants.ts`, `src/components/Projects.tsx` | 166 / 156 | `magneticTransition` is now an unused export (its only consumer, `Magnetic`, dropped `whileHover`). `EAGER_COVER_COUNT = 0` keeps a `priority={index < 0}` indirection that is permanently `false`. No runtime effect; neither `noUnusedLocals` nor `@typescript-eslint/no-unused-vars` is enabled, so no gate will ever flag it. (`HoverCard.tsx` was still calling `matchMedia` per render when this audit started; it was routed through `hasFinePointer()` at 11:16:32 — that half is resolved.) | Delete the `magneticTransition` export and the `EAGER_COVER_COUNT`/`priority` indirection, or enable `noUnusedLocals` in `tsconfig.app.json` to stop the drift. |
| `QA-08` | Low | OPEN | UX latency | `src/hooks/use-scrollspy.ts` | 61-73 | The rescan is debounced 200 ms, so when a placeholder is swapped for the real `<section>` the nav indicator can hold the previous value for up to 200 ms before the observer's initial callback recovers it. Cosmetic only. | Acceptable. If visible: run `connect()` immediately on the first mutation batch and debounce only subsequent ones. |
| `QA-09` | Info | OPEN | Perf expectation | `src/pages/Index.tsx` | 52 | `rootMargin: "900px 0px"` is larger than needed for the first two sections: `#about` intersects at any viewport height and `#skills` for `V < 1500 px`, so **both still fetch, parse and mount during the hero animation**. Only `#projects`, `#experience`, `#contact`, `#footer` are genuinely deferred. Not a regression — less of the `PERF-04` win than claimed. | Optional: `rootMargin: "600px 0px"` (as `PERF-04` specified) or mount `#about` eagerly and start deferring at `#skills`. |
| `QA-10` | Info | — | Process | working tree | — | The tree changed three times during this audit (`use-scrollspy.ts` 11:12:29, `Index.tsx` 11:15:04, `HoverCard.tsx` 11:16:32). All gates were re-run on the final snapshot and the timings recorded, so the report can be tied to a tree state. | Land all edits before requesting final QA; a mid-audit fix can mask or move a finding. |

## 5. Adversarial Question-by-Question Answers

1. **Can every `#about/#skills/#projects/#experience/#contact` anchor still reach its section, and does the nav active indicator still update?**
   *Reach*: yes. The `BelowFold` wrapper carries the id while unmounted, so `getElementById` always resolves and the native jump lands on the wrapper top, which is the same y as the real section top. No duplicate ids in any commit (`id={mounted ? undefined : id}`; the real `<section>` keeps its own). Two caveats: `QA-02` (landing drift on the two deepest anchors on first load) and `QA-04` (zero-id window during chunk fetch).
   *Indicator*: yes — and it now actually works, which it did not before (`PERF-14`: the old effect ran once when only `#home` existed and never re-ran, pinning `activeId` to `"home"`). The re-scan logic is sound: `connect()` early-returns only on an identical element set, `disconnect()` clears `observed` first, and the "pending timer" guard prevents debounce starvation. `threshold: 0` + thin ±45 % band + "topmost intersecting entry" is the correct model for sections taller than the band (a ratio threshold can never fire for them — that was the reported bug). Cost: `QA-08`. Accepted side effect: the `layoutId` indicator now FLIPs on every section change (as `PERF-14` warned) — once per change, not per frame.
2. **Does `memo(Index)` break router-dependent behaviour? Does the `?project=slug` deep link still open and still update the URL?**
   `memo(Index)` is safe: `Index` takes no props and subscribes to no router context; `useLocation`/`useNavigate`/`useSearchParams` live in `use-visit-tracker`, `use-secret-hotkey`, `NotFound` and `Projects` — all below the memo boundary, still re-rendering on their own. Hero/Navbar/sections contain no router hook (grep-verified). URL **writing** works (`handleSelect` / `handleTabChange` / `handleOpenChange` are inside `Projects`). Deep-link **opening on load** was broken and is now fixed via `forceMount` (`QA-01`).
3. **Deferred mount: CLS, failure to mount, reduced motion, anchor jump to `#contact`?**
   *Failure to mount*: no. `IntersectionObserver` always delivers an initial entry, so "already in view / tall window" is covered, and `typeof IntersectionObserver === "undefined"` falls back to `setMounted(true)`.
   *CLS*: placeholders differ from real content heights, so document height changes as sections mount — but mounts happen in the 900 px band **below** the viewport, so nothing visible moves and no `layout-shift` entries should be produced for the visible region. The scrollbar thumb length changes (not CLS). Unmeasured — no browser.
   *Reduced motion*: identical mount logic; `scroll-behavior: auto` makes jumps instant, which removes the `QA-02` mid-animation problem for those users (they land on the placeholder top, which is the correct offset) but keeps the "sections above never mount, then expand when you scroll up" behaviour.
   *Jump straight to `#contact`*: the jump finds the placeholder and lands correctly; risk is `QA-02` for smooth scroll on deep links and `QA-04` inside the chunk window.
4. **Does the inline theme script agree with `next-themes`?**
   Yes. `App.tsx` renders `<ThemeProvider attribute="class" defaultTheme="system" enableSystem>` with no `storageKey` ⇒ next-themes' default key is `"theme"` and its values are exactly `"light" | "dark" | "system"`, which is what `index.html` reads. The script's resolution matches next-themes (`stored === "dark"`, or `null`/`"system"` + `prefers-color-scheme`) and it also sets `style.colorScheme`, which `enableColorScheme` (default `true`) would set anyway. No hydration mismatch is possible: the class is applied to `<html>` while React renders only into `#root`. Only divergence: a corrupted storage value (e.g. `"blue"`) resolves to *light* in the script but *system* in next-themes — unreachable in normal use. `localStorage` failure is caught on both sides.
5. **Projects: tabs still mount/animate, stale props, metric cache, `zoomed` reset?**
   *Tabs*: `Radix TabsContent` unmounts inactive content (no `forceMount`) and remounts on activation, so content still mounts; `initial="hidden"` + `whileInView="visible"` gives an entrance animation on each activation (the IO delivers its initial entry, so an already-visible grid animates). `asChild` still receives exactly one `motion.div`. What is lost is the cross-fade **out** of the previous grid — intended.
   *Stale props/imports*: `AnimatePresence` is still imported **and used** for the dialog + lightbox portals (lines 1247/1356). No unused identifier found; ESLint clean.
   *Metric cache*: `QA-05` — correct after `onLoad` / pointerdown / resize, wrong for a wheel before the first `measure()`.
   *`zoomed` reset*: correct, and the memoised `images` is a **fix**, not a regression. Deps are unchanged (`[safeIndex, images, resetView]`); previously `images` was a fresh array every render, so the effect ran on every render and `setZoomed(true)` immediately triggered `resetView()` — i.e. zoom could not persist. Now the deps are stable and the reset fires only when `safeIndex` changes.
6. **AnimatedBackground loop lifetime / restart / concurrent chains / theme invalidation?**
   *Scroll pause*: fixed correctly — every early return re-schedules, `schedule()` guards on `rafId` so only one chain can exist, and `draw()` zeroes `rafId` before re-scheduling (no double-schedule).
   *350 ms start*: `setTimeout(schedule, 350)` then the chain runs; cleanup clears the timer and the pending frame.
   *Tab visibility*: `QA-03` — the one remaining permanent-death path.
   *Theme change*: still invalidated. `MutationObserver` on `documentElement` with `attributeFilter: ["class"]` nulls `meshRef`, and `paint()` additionally re-checks `isDark` / size / `reduced` before blitting. `MESH_SCALE` is applied consistently (`mw`/`mh` for gradient centres, radius and `fillRect`; blitted with `drawImage(layer, 0, 0, w, h)`), so the 0.5× raster upscales correctly.
7. **Contact counter while typing / is `control` returned by `useForm`?**
   Yes and yes. `useForm<ContactForm>` is destructured with `control`, and `MessageCount` calls `useWatch({ control, name: "message" })`; it is declared at module scope (stable identity), so only the counter re-renders per keystroke. `MESSAGE_MAX` is a module const resolved at render time — no TDZ issue. ESLint/TS clean.
8. **A11y / behaviour after removing `backdrop-blur` and `whileHover` on `Magnetic`?**
   *Contrast improved, not degraded*: navbar when scrolled `bg-background/95` + `shadow-lg` (blur was invisible at 95 % opacity anyway), hero badges `/90 + blur` → `/95`, BackToTop `bg-background/90 + blur` → solid `bg-background`, lightbox `bg-black/85 + blur` → `bg-black/90`. No text sits on a transparent surface that relied on the blur; the nav's unscrolled state was already `bg-transparent backdrop-blur-none`, unchanged.
   *`Magnetic`*: all four call sites (Hero primary CTA, Hero CV button, Hero social link, Contact submit) carry their own inner hover CSS (`hover:shadow-*`, `hover:-translate-y-0.5`, `hover:scale-110`), so hover feedback survives and the wrapper no longer fights framer-motion for `transform` (inner element animates its own transform — different node, no conflict). No a11y attribute lived on the wrapper.
   *Residual (pre-existing)*: `hasFinePointer()` is cached for the module lifetime, so a hybrid device that gains a mouse after load keeps the coarse-pointer branch until reload.

## 6. Protected Fixes Verification (`performance-load.md` → landed)

- [x] `PERF-02` — hero `<h1>` transform-only (`heroWordRise`: `y` only, no `opacity`); `StaggerReveal` honours `childVariants`, so the LCP text is opaque on frame 1.
- [x] `PERF-03` — zero `backdrop-blur` left in Hero/Navbar, replaced by more opaque fills.
- [x] `PERF-04` — below-fold sections mount on approach (side effects: `QA-01` fixed, `QA-02`/`QA-09` open).
- [x] `PERF-05` — pre-paint inline theme script present and consistent with next-themes.
- [x] `PERF-06` — one render-blocking font link; `media="print"` swap + duplicate preload/`noscript` removed.
- [x] `PERF-07` — navbar `transition-colors duration-200`, no padding transition, no blur toggle.
- [x] `PERF-08` — scroll-pause no longer kills the loop (visibility path still can: `QA-03`).
- [x] `PERF-09` — `useIsMobile` reads `matchMedia` during the first render.
- [x] `PERF-10` — `hasFinePointer` module-cached for **both** `Magnetic` and `HoverCard` (the second landed at 11:16:32).
- [x] `PERF-11` — `blur-[120px]` / `blur-3xl` replaced by radial gradients; `shadow-2xl` → `shadow-xl`.
- [x] `PERF-12` (first half) — `radix` manualChunk removed, `utils` chunk added and `modulepreload`ed (no waterfall). Second half (`sonner` out of the entry) **not** done — remaining finding, not a regression.
- [x] `PERF-13` — `animate-ping` capped at 3 iterations.
- [x] `PERF-14` — scrollspy re-scans on DOM growth (and now genuinely works).
- [x] `PERF-15` — per-frame `document.querySelector` replaced by a `MutationObserver`-maintained flag.
- [x] `PERF-16` — visit POST deferred to idle (`QA-06` for the analytics-loss trade-off).

## 7. Rollback Status

- Rollback Triggered: **NO**.
- Rationale: no regression is severe enough to justify restoring 16 `PERF-*` defects. The single deterministic regression (`QA-01`) is already fixed in the tree; the two Medium items are a navigation-landing drift (`QA-02`) and a narrow loop-death path (`QA-03`), both ≤ 10-line patches in `src/pages/Index.tsx` and `src/components/animations/AnimatedBackground.tsx`.
- Escalation: none — no rollback loop was needed, no baseline artifact is missing, and no test suite existed to be weakened.
- Suggested next step: `bug-fixer` iteration #1 for `QA-02` + `QA-03` (plus `QA-04`/`QA-05` while in those files), then a browser-attached re-run of this agent to convert the unmeasured runtime claims into measurements.

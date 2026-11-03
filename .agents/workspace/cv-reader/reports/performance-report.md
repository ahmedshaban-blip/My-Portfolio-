# Performance Audit Report: Read CVs In-Browser (cv-reader)

Scope: the 16 files listed in `.agents/workspace/cv-reader/feature-files.json`.
Agent spec `.agent/agents/performance.md` targets Flutter (`BlocBuilder`,
`ListView.builder`, `Isolate.run`, 60 FPS frame budget). Its **spirit** is
applied to this React 18 + Vite + TS + Vercel project as:
rebuild isolation → component-scoped state; list virtualization → no unbounded
DOM; rebuild traps → no effect/render loops; image caching → no new eager image;
off-main-thread → no new heavy synchronous work on the main thread; bundle
budget → route-level code-split.

## 1. Executive Summary

- **Overall Verdict**: **PASS**
- **Max Severity Detected**: **Low**
- **Home-page first paint**: **not regressed** by any new paint hazard
  (no `backdrop-blur`, no `filter: blur`, no infinite animation, no new canvas,
  no new eager image). One real, low-severity bundle note (PERF-01).
- **`/cv` ships as its own lazy chunk**: confirmed — `CVView-Ca9kdTQu.js`,
  **5.60 kB / 2.21 kB gzip**, fetched only on `/cv`.

The single item worth a decision is **PERF-01**: the entry chunk is **not**
byte-identical to the pre-feature baseline; measured **108.57 kB / 33.23 kB
gzip** vs. the known baseline **105.61 kB / 32.48 kB gzip** = **+2.96 kB raw
(+0.75 kB gzip)**. The architecture's §10 claim that "the home bundle and first
paint are untouched" is **not literally true** — the delta is small and
attributable to the new CV helpers being inlined into the entry chunk via the
already-hot `@/config/cv` and `@/lib/utils` modules. This is a Low finding.

## 2. Static & Architectural Performance Checks

| Area | Check Performed | Status | Findings |
| :--- | :--- | :--- | :--- |
| **Route code-split** | `/cv` uses `lazy(() => import("./pages/CVView"))` + `<Suspense fallback={null}>` above the `*` catch-all | PASS | `src/App.tsx:18,41-48`. Chunk `CVView-Ca9kdTQu.js` = 5.60 kB / 2.21 kB gzip. Radix `tabs` (16.38 kB / 5.74 kB gzip) is a **separate shared async chunk**, not the entry. |
| **Home entry bundle** | Real `npm run build`, entry = `index-CVeDg2mg.js` (modulepreloaded in `dist/index.html`) | **LOW** | 108.57 kB/33.23 kB gzip vs. baseline 105.61/32.48 → **+2.96 kB / +0.75 kB** (PERF-01). |
| **Backdrop-blur** | Grep all `src/**/*.tsx` for `backdrop-blur` | PASS | New `/cv` files: none. Remaining hits are pre-existing `Projects.tsx`/`DateRangePicker.tsx` or **comments recording removed blurs** (`Navbar.tsx:102`, `Hero.tsx:77-79`). Navbar/`glass-effect` remain blur-free (`index.css:104-108`). |
| **Filter blur** | Grep for `filter: blur(` | PASS | New files: none. `Hero.tsx:78` is a comment explaining the removal. |
| **Infinite animation** | Grep for `animate-pulse`/`animate-[…]`/`animation: infinite` | PASS | New `/cv` files: none. `Projects.tsx:109` is a comment about replacing `animate-pulse` with a static placeholder. |
| **New spinner** | `CVViewer.tsx:36` `Loader2 animate-spin` | PASS (info) | A bounded spinner that unmounts on `onLoad`. It is on the `/cv` chunk only. `prefers-reduced-motion` handling: not overridden locally, but Tailwind's `animate-spin` is not reduced-motion-gated here. Low; acceptable for a load indicator. |
| **Full-page canvas** | Grep `<canvas` | PASS | Only the pre-existing `AnimatedBackground.tsx:323`; not added by this feature and not part of `/cv`. |
| **New eager image** | Diff of `Hero.tsx`/`Navbar.tsx` | PASS | Additions are `lucide-react` icons (`BookOpen`) + `react-router-dom` `<Link>` — both already in the entry; no `<img>`, no new asset. |
| **Layout shift (iframe)** | `CVViewer` wrapper `h-[75vh] min-h-[480px]` + absolutely-positioned spinner overlay | PASS | `CVView.tsx:120` reserves height; `CVViewer.tsx:29,32` the spinner is `absolute inset-0`, so it overlays rather than pushes → **no reserved-space shift** when it disappears. |
| **`matchMedia` read once** | `hasFinePointer()` in `useEffect(..., [])`, `useIsMobile()` reads during first render | PASS | `CVView.tsx:26,39-41`. Neither is read in render loop or per-scroll. `pointer.ts:6-15` and `use-mobile.tsx:13-17` are module/first-render cached. |
| **Rebuild isolation** | Only page state is URL-derived `track` + 3 booleans; no context/provider wrapping added | PASS | `CVView.tsx:24-58`. No new global provider. `setSearchParams` on tab change re-renders the page only. |
| **Analytics double-map** | `data.cvViews ?? []` referenced 4× in one render | PASS (info) | See §3 / PERF-03. Cost is O(2) per reference; negligible. |
| **Payload / buffering** | `mode=view` handler buffers the whole PDF via `arrayBuffer()` before `send()` | **Identical to existing behaviour** | `api/download-cv.ts:58` is **unchanged** by this feature. The download path already buffered the full file. Not a regression. See §3 / PERF-04. |
| **No new dependency** | `git diff -- package.json package-lock.json` | PASS | Empty. No new vendor chunk; `vite.config.ts` untouched. |

## 3. Findings & Remediation Plan

| ID | Severity | File:line | Issue Description | Required Fix |
| :--- | :--- | :--- | :--- | :--- |
| `PERF-01` | Low | `src/config/cv.ts:49-53`, `src/lib/utils.ts:40-47` | The entry chunk grew **+2.96 kB raw / +0.75 kB gzip** (108.57/33.23 vs. baseline 105.61/32.48). Cause: `getCVPageUrl`/`getCVViewUrl`/`parseCVTrack`/`isCVTrack` live in `@/config/cv`, and `openCV`/`getCVViewUrl` in `@/lib/utils` — both modules are imported by the home-page `Hero`/`Navbar`, so the whole module (including the `/cv`-only helpers and the `mode=view` string) is pulled into the entry. Verified: the built entry contains the literals `mode=view`, `/cv?track`, `CV actions`, `Read CV`×3. | Either (a) accept: the delta is <1 kB gzip and cost is one-time parse work; or (b) move the `/cv`-only helpers (`getCVViewUrl`, `openCV`, `parseCVTrack`, `isCVTrack`) into a separate module (e.g. `src/lib/cv-view.ts`) imported only from `src/pages/CVView.tsx` and `src/components/cv/*`, so the entry keeps only `getCVPageUrl`. (b) is the only way to make §10's "entry bundle untouched" literally true. Not urgent. |
| `PERF-02` | Low | `src/components/cv/CVViewer.tsx:36` | `Loader2 … animate-spin` is an infinite CSS animation while the PDF loads. It unmounts on `onLoad`, so it is bounded — but it is **not** gated by `prefers-reduced-motion`, unlike the page's framer-motion entrance which is (`CVView.tsx:65`). | Optional: gate with `motion-reduce:animate-none` (Tailwind) or swap for a static indicator when `reducedMotion` is true. Cosmetic; the animation is tiny and short-lived. |
| `PERF-03` | Low (informational, **no action**) | `src/components/admin/AnalyticsSection.tsx:480,483,505,509` | `data.cvViews ?? []` is evaluated four times in one render (two `.length`, two `.map`/`.reduce`). Cost is a null-coalesce + 2-element array access, ≤ a few nanoseconds; the list is length ≤ 2. **Not** a meaningful cost — flagged only because it was asked. The admin dashboard is PIN-gated and not on the public path. | None. If desired, hoist `const cvViews = data.cvViews ?? [];` once at the top of the component for readability. |
| `PERF-04` | Low (informational, **not a regression**) | `api/download-cv.ts:58` | `mode=view` streams **the same buffered payload** as the existing download path — the handler does `Buffer.from(await cloudinaryResponse.arrayBuffer())` then `response.status(200).send(fileBuffer)`. This buffers the entire PDF in the function's memory before responding, and disables streaming/range responses. **This line is unchanged by this feature**; the download path already behaved identically. So it is **identical to existing behaviour, not a new regression.** | To improve both paths equally (out of scope here): stream `cloudinaryResponse.body` to the response instead of buffering, and honour `Range`. Explicitly flagged as pre-existing, not introduced. |

## 4. Measured Build Output (G10 — real output)

`npm run build` (vite 5.4.21, 2999 modules, built in 31.90 s):

```
dist/index.html                          3.17 kB │ gzip:  1.37 kB
dist/assets/index-DKepWAzG.css          86.13 kB │ gzip: 14.40 kB
dist/assets/CVView-Ca9kdTQu.js           5.60 kB │ gzip:  2.21 kB   ← /cv page + components/cv/*
dist/assets/tabs-HFgcSmcd.js            16.38 kB │ gzip:  5.74 kB   ← Radix Tabs (async, not entry)
dist/assets/utils-CfDMlrKu.js           21.03 kB │ gzip:  7.14 kB
dist/assets/index-CVeDg2mg.js          108.57 kB │ gzip: 33.23 kB   ← ENTRY (modulepreloaded)
dist/assets/CVDashboard-C89hQC38.js    125.41 kB │ gzip: 38.89 kB
dist/assets/motion-DrXZSHm2.js         128.91 kB │ gzip: 42.52 kB
dist/assets/react-BPiTN2aQ.js          162.55 kB │ gzip: 53.11 kB
```

- Entry is confirmed by `dist/index.html`: `src="/assets/index-CVeDg2mg.js"`
  and raw byte length **108 616** (`Get-Item … .Length`).
- Baseline in the task brief: entry `index-*.js` = **105.61 kB raw / 32.48 kB gzip**
  → measured delta **+2.96 kB raw / +0.75 kB gzip** (PERF-01).

## 5. Command Results (G10)

| # | Command | Result | Summary |
| --- | --- | --- | --- |
| P-1 | `npm run build` | PASS | Success; chunk sizes captured in §4. `CVView` is its own 5.60 kB chunk. |
| P-2 | `Get-Content dist/index.html` (entry resolution) | PASS | Entry = `index-CVeDg2mg.js`; confirmed it is the modulepreloaded entry. |
| P-3 | `(Get-Item dist/assets/index-CVeDg2mg.js).Length` | PASS | `108616` bytes raw. |
| P-4 | Grep distinct entry literals (`Read CV`, `CV actions`, `/cv?track`, `mode=view`) | PASS | `Read CV`×3, `CV actions`×2, `/cv?track`×1, `mode=view` present → the new CV helpers are inlined into the entry (basis for PERF-01). |
| P-5 | Grep `src/**/*.tsx` for `backdrop-blur\|filter: blur\|animate-[\|animate-spin\|animate-pulse\|<canvas\|will-change` | PASS | Only benign hits; new `/cv` files contribute a single bounded `animate-spin` (PERF-02). Navbar/Hero hits are comments about *removed* hazards. |
| P-6 | `git diff --stat` + `git diff -- package.json package-lock.json` | PASS | No dependency change, no `vite.config.ts` change → no new vendor chunk. |
| P-7 | `npx eslint src --ext .ts,.tsx` | PASS | exit 0, no output. |
| P-8 | Runtime layout-shift measurement (CLS in a headless browser) | **NOT MEASURED** | No headless-browser/measurement harness is configured in this repo, and `/api/download-cv` cannot be served by `vite preview`, so the iframe never renders locally. Layout safety argued statically from the reserved `h-[75vh] min-h-[480px]` wrapper + absolute spinner (`CVView.tsx:120`, `CVViewer.tsx:29,32`). |
| P-9 | Real frame-time / Long Task profiles on the home page | **NOT MEASURED** | No Flutter/dart MCP or browser profiler wired into this audit; the spec's `integration_test/perf` path does not exist in a React project. Home-page paint safety argued statically (P-5). |
| P-10 | PDF payload transfer size over the wire | **NOT MEASURED** | Handlers are unreachable via `vite preview`; Cloudinary assets not fetched locally. Behaviour compared at source level only (PERF-04). |

## 6. Open Questions

- Accept PERF-01's +0.75 kB gzip, or split the CV-only helpers out of the
  entry-reachable modules? Low either way.
- Is streaming `api/download-cv` (both modes) worth a separate, future task?
  Out of scope for this feature; flagged in PERF-04.

## 7. Verdict

**PASS.** No Critical or High performance hazard. The `/cv` feature is fully
route-code-split (5.60 kB / 2.21 kB gzip), reserving iframe height so the
spinner causes no layout shift, and it introduces none of the home-page paint
hazards that were recently fixed. The only concrete, measured finding is a
**+0.75 kB gzip** entry-bundle growth (PERF-01, Low); the frame-budget items
are argued statically because no runtime profiler exists in this repo.

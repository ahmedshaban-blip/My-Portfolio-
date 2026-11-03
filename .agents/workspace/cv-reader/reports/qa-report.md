# QA Audit Report: Read CVs In-Browser (cv-reader)

- **Agent**: `qa` (spec `.agent/agents/qa.md`, Flutter spec adapted to React 18 + Vite + TS per `.agent/agents/final-qa.md` reporting standard)
- **Date**: 2026-11-03
- **Repo**: `D:\MyPotfolio\my-portfolio`
- **Scope reviewed**: 4 created + 12 modified files, read-only. No source or test file was edited.
- **Iteration**: #1 of 3

---

## 1. Executive Verdict

- **Verdict**: **PASS WITH NOTES**
- **Summary**: All four quality gates behave as claimed (ESLint exit 0 with no output; `tsc -p tsconfig.node.json` exit 0; `tsc -p tsconfig.app.json` emits only the pre-existing `@supabase/supabase-js` TS2307; `npm run build` exit 0 with `CVView` in its own 5.60 kB chunk). Every invariant in the feature brief was verified by direct source reading: the `/cv` route is declared above `path="*"`, `?track=` cannot crash / redirect / disagree with the address bar, the `ns` namespace truly separates `v:cvview:*` from `v:cv:*`, the `visit-reset.ts` globs are structurally non-overlapping (glob logic inspected, not just literals), `cvViews` is optional end-to-end, and `showFallback` can never render both the iframe and the fallback. Six notes are recorded, all rated **low**; the most concrete is a missing-growth guard in `CVTrackTabs` that trusts the Radix value (medium theoretical, low practical). No critical or high findings. Runtime-only behaviours (live iframe rendering, real Redis numbers, cold `/cv` load on Vercel) are marked **NOT MEASURED** with reasons — `vite preview` cannot execute the serverless handlers.
- **Critical/High findings**: **0**

---

## 2. Quality Gates — Real Command Output

All commands run from `D:\MyPotfolio\my-portfolio` on Node v26.13.0, npm 11.20.0.

| # | Command | Exit | Observed output | Verdict |
| :-- | :--- | :-- | :--- | :--- |
| G1 | `npx eslint src --ext .ts,.tsx` | **0** | (no output — zero warnings, zero errors) | PASS |
| G2 | `npx tsc --noEmit -p tsconfig.app.json --ignoreDeprecations 5.0` | **2** | `src/integrations/supabase/client.ts(2,30): error TS2307: Cannot find module '@supabase/supabase-js' or its corresponding type declarations.` — **only** this error | PASS (pre-existing, not a regression) |
| G3 | `npx tsc --noEmit -p tsconfig.node.json` | **0** | (no output) | PASS |
| G4 | `npm run build` | **0** | `✓ built in 8.78s`; `assets/CVView-Ca9kdTQu.js` = 5.60 kB (gzip 2.21 kB) | PASS |

### Pre-existing classification of G2 (evidence, not assertion)

- `git status --porcelain` shows `src/integrations/supabase/client.ts` as **unmodified** (not in the changed set).
- `git log --oneline -1 -- src/integrations/supabase/client.ts` → `e9e8b7f feat(initial-setup)…` (tracked before this feature).
- `Test-Path node_modules/@supabase/supabase-js` → `False` (the module is genuinely absent from the repo; this predates cv-reader).
- `git diff --stat` (12 modified files) touches nothing under `src/integrations/`.

**Conclusion**: the TS2307 is a pre-existing repo condition, not introduced by cv-reader. Classified **pre-existing**, correctly excluded from the regression verdict.

---

## 3. Findings Table

| ID | Severity | File:line | Description | Exact required fix |
| :--- | :--- | :--- | :--- | :--- |
| `QA-01` | **Low** | `src/pages/CVView.tsx:39-41` | `coarsePointer` is read in an effect (`setCoarsePointer(!hasFinePointer())`) while `isMobile` is read synchronously on first render. On a first-render desktop machine with a coarse pointer (e.g. a touch laptop) the page paints the iframe for one frame, then swaps to the fallback. One-frame layout shift only; no correctness impact (an iframe render on a coarse-pointer desktop is harmless). | Optional: initialise state lazily, `useState(() => !hasFinePointer())`, matching `useIsMobile`'s documented "read during first render" pattern. Not required for PASS. |
| `QA-02` | **Low** | `src/components/cv/CVTrackTabs.tsx:20` | `onValueChange={(next) => onChange(next as CVTrack)}` casts without a guard. Safe today because Radix only emits values present in `CV_TRACKS`, and `CVView.handleTrackChange` re-keys through `setSearchParams` → `parseCVTrack`. The cast is the only unguarded trust boundary in the client path. | Use the existing guard: `onChange(next) => { if (isCVTrack(next)) onChange(next); }` and drop the `as CVTrack` cast. |
| `QA-03` | **Low** | `src/pages/CVView.tsx:96-104` | The notice renders an apostrophe in the string literal `"We couldn't find that CV track, so the Flutter CV is shown instead."` The locked copy in `architecture.md` §6/§8 is `"We couldn't find that CV track, showing the Flutter CV instead."` (no `so`). Functionally equivalent; wording diverges from the approved spec. | Align the string with the architecture copy, or update architecture.md to the shipped wording. Cosmetic. |
| `QA-04` | **Low** | `api/download-cv.ts:66-67` | `isRangeRequest` treats a `Range: bytes=0-` header as "not counted". A viewer that always sends an initial ranged request for the first byte window would undercount the view. Deliberate, documented choice (bug-fix-log: "range requests are not counted"); strictly better than the over-count risk it replaces. | None. Recorded so the number is read as a deliberate lower bound, not an exact count (matches architecture §12b risk 3). |
| `QA-05` | **Low** | `src/components/Navbar.tsx:2`, `src/components/Hero.tsx:1` | `BookOpen` is a newly added lucide import in both files. Verified **no new chunk and no entry-bundle growth**: Navbar already imported `Eye` from `lucide-react` before this feature (confirmed via `git show HEAD:src/components/Navbar.tsx`), so the lucide barrel/cache was already in the entry graph and the new icon rides along. `dist/assets/index-*` (home entry) is unchanged in kind. | None. Evidence recorded to pre-empt a false "bundle regression" flag. |
| `QA-06` | **Low** | `src/components/admin/AnalyticsSection.tsx:480-481` | The "CV views" card and the `cv` "downloads" card are two separate `<Card>`s (the views card is new). The architecture §7.8 dream text (`📄 CV views & downloads`, `Inline views vs. downloads · last 14 days`, `0 views · 0 unique viewers` line) is therefore not the shipped UI. Shipped: `Eye CV views` / `Reads in the browser, no download · last 14 days` with `N unique viewers`. This matches the **locked Gate-2 decision** recorded in `bug-fix-log.md` ("Views shown in their own card"), so it is intentional divergence from an earlier draft. | None. Report only so the architecture document is understood to be superseded by the Gate-2 decision on this point. |

**Totals**: critical 0 · high 0 · medium 0 · low 6.

---

## 4. Item-by-Item Verification

### 4.1 Route correctness — `/cv` above `path="*"` (Item 1) — **PASS**

- `src/App.tsx:18` declares `const CVView = lazy(() => import("./pages/CVView"));` alongside the existing `CVDashboard` / `NotFound` lazy consts.
- `src/App.tsx:41-48` declares `<Route path="/cv" element={<Suspense fallback={null}><CVView /></Suspense>} />`.
- The marker comment `{/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}` is at line 40; the `/cv` route is at lines 41-48; `path="*"` is at lines 49-56. **`/cv` is strictly above the catch-all — verified by line order.**
- `?track=frontend` survival: React Router v6 matches on `pathname` only; the query string is not part of route matching, so `/cv?track=frontend` resolves to the same `/cv` route. Parameter retention is handled by `useSearchParams()` in `CVView.tsx:24,28`. **PASS.**
- Lazy import resolves at build time — proven by G4 (`CVView-Ca9kdTQu.js` emitted as its own chunk).

### 4.2 Param handling — crash / undefined / redirect / disagreement (Item 2) — **PASS**

Hardened attacker model: `?track=` can be `abc`, `?track=`, `?track=a&track=b`, `?TRACK=`, `javascript:...`, `//evil.com`, an encoded `%2F%2Fevil.com`, or absent.

- **No crash / no undefined**: `parseCVTrack(raw)` (`src/config/cv.ts:66-67`) is total — `isCVTrack` is a literal-union guard, and everything else returns `DEFAULT_CV_TRACK = "flutter"`. `CV_CONFIG[track]` therefore always resolves; `label` is never `undefined`.
- **No open redirect**: the iframe `src` (`getCVViewUrl`), the tabs' `Link`s (`getCVPageUrl`), and the download URL (`getCVDownloadUrl`) are all built by **template-literal helpers in `src/config/cv.ts`** with a `CVTrack`-typed argument. No component accepts a raw string into a URL. A `javascript:` / `//evil.com` / protocol-relative payload in `?track=` never survives `parseCVTrack` and is never concatenated into any `href` / `src`. **Same-origin guaranteed by construction.**
- **Multi-value `?track=a&track=b`**: `URLSearchParams.get` returns the first value only, so no array reaches the guard; `a` is invalid → clamps to `flutter`.
- **URL-vs-display agreement (the subtle one)**: `rawTrack === null` (bare `/cv`) → no effect runs → address bar stays `/cv`, the Flutter CV is shown. The brief's concern was that a **derived** `invalidTrack` boolean would flip back to `false` the instant the URL was normalized. That is exactly the bug the E2E report says was found and fixed; the shipped code **latches in state**:

  ```
  const [invalidTrack, setInvalidTrack] = useState(false);          // :32
  useEffect(() => {                                                  // :44-49
    if (rawTrack !== null && !isCVTrack(rawTrack)) {
      setInvalidTrack(true);
      setSearchParams({ track: DEFAULT_CV_TRACK }, { replace: true });
    }
  }, [rawTrack, setSearchParams]);
  ```

  I traced the re-run semantics adversarially. After the replace, `rawTrack` becomes `"flutter"`, the effect re-runs, `isCVTrack("flutter")` is `true`, and it **does not touch `setInvalidTrack`** — the `true` is never reset. The notice survives. **Confirmed: the latch cannot re-show spuriously and cannot un-show.**

- **Latched flag cannot leak between tracks**: deliberately latched `true`, it would persist across a subsequent tab switch — but `handleTrackChange` (`CVView.tsx:54-58`) **explicitly** calls `setInvalidTrack(false)` (alongside `setEmbedFailed(false)`) before `setSearchParams({ track: next })`. So the notice is cleared the moment the user picks a real track. Verified: the flag can only be set by an actual invalid `?track=` in the URL, and is cleared by the single user action that changes the track. **No leak.**
- **Not-in-`useState` for the track itself**: the selected track is URL-derived (`track = parseCVTrack(rawTrack)`, line 29) — matches architecture §2.3 and §5. The two `useState` calls are non-track concerns (`invalidTrack`, `embedFailed`), plus `coarsePointer` (see QA-01).

### 4.3 API contract — `mode=view` vs download (Item 3) — **PASS**

- `api/download-cv.ts:36` parses `mode` array-safely; `:39` `const isViewMode = rawMode === "view";` — fail-safe: anything other than the literal `"view"` (absent, `"download"`, `"VIEW"`, `"view "`, an array) is treated as a download.
- **View never changes download behaviour**: the only conditional uses of `isViewMode` are (a) the counting namespace `:78` and (b) the disposition `:92-95`. The 400/500/`!cloudinaryResponse.ok` early returns (`:42-56`) are mode-independent.
- **No cross-write — proven structurally, not by eye**: `const ns = isViewMode ? "cvview" : "cv";` (`:78`), then all three keys are built from the **same** `ns`:
  ```
  .incr(`v:${ns}:${track}`)
  .incr(`v:${ns}day:${track}:${day}`)
  .pfadd(`v:${ns}uniq:${track}:${day}`, visitor)
  .expire(`v:${ns}day:${track}:${day}`, …)
  .expire(`v:${ns}uniq:${track}:${day}`, …)
  ```
  There is **no branch** inside the pipeline that could write the other family; the namespace is a single source of truth for all five calls. `ns="cvview"` ⇒ only `v:cvview:*`; `ns="cv"` ⇒ only `v:cv:*`. **No fallthrough, no double count, no shared key.**
- **TTL symmetry**: `90 * 24 * 60 * 60` applied to both `dayKey` and `uniqKey` in both branches — identical to the pre-existing download TTL.
- **`Range` skip is correct and symmetric**: `isRangeRequest` is computed **outside** the namespace branch (`:66-67`) and the pipeline is gated by `&& !isRangeRequest` (`:71`), so the guard applies to **both** families. Symmetric, as the brief requires. Range is derived from `request.headers?.range` with an array-safe unwrap; the `VercelRequest` headers record already has an index signature so no type change was needed. (Behaviour note: QA-04.)
- Purely additive headers: `X-Content-Type-Options: nosniff` now set on **both** responses (`:97`); `Content-Type` stays `application/pdf`; `Cache-Control` stays `no-store`.

### 4.4 Reset scopes — glob/SCAN analysis (Item 4) — **PASS**

`api/visit-reset.ts`:
```
cv:      ["v:cv", "v:cv:*", "v:cvday:*", "v:cvuniq:*"]                       // :25
cvviews: ["v:cvview", "v:cvview:*", "v:cvviewday:*", "v:cvviewuniq:*"]       // :28
```

I inspected the **matching logic**, not just the literals. `deletePatterns` (`:31-56`) splits patterns into exact keys (`!p.endsWith("*")` → `redis.del(...)`) and globs (`p.endsWith("*")` → `SCAN MATCH` → chunked `DEL`). The two families never share a key name:

- **Does `cv` delete any `v:cvview:*`?** Exhaustively:
  - `"v:cv"` (exact) matches only the literal key `v:cv`. `v:cvview:flutter` ≠ `v:cv`. ✗
  - `"v:cv:*"` (glob) requires the pattern `v:cv:` — i.e. a literal colon at position 5. The key `v:cvview:flutter` has `v` `i` at that position (`v:cvview:…`), and `i ≠ :`. ✗
  - `"v:cvday:*"` requires `v:cvday:` (colon at index 7). `v:cvviewday:flutter:…` has `v` at index 7. ✗
  - `"v:cvuniq:*"` requires `v:cvuniq:` (colon at index 8). `v:cvviewuniq:…` has `v` at index 8. ✗
  - **Result: `cv` scope cannot delete a single `v:cvview*` key.**
- **Does `cvviews` delete any `v:cv:*`?** Every `cvviews` pattern begins with the literal prefix `v:cvview`. A `v:cv:*`-family key (`v:cv:flutter`, `v:cvday:flutter:…`, `v:cvuniq:flutter:…`) would have to *begin* with `v:cvview` to match, which it does not (`v:cv:` ≠ `v:cvvi`). **Result: `cvviews` scope cannot delete a single `v:cv*` key.**
- `"v:cvview"` is an exact key (no trailing `*`) — it can only ever target the literal `v:cvview`, which is not a key the handler writes (the handler writes `v:cvview:<track>`); harmless.
- **The one genuine trap in the glob space** would be a widened glob like `v:cv*` — that *would* match both families and wipe everything in one confirm. The shipped list contains **no** such pattern. `cv` remains downloads-only, matching the pre-feature list byte-for-byte (`["v:cv", "v:cv:*", "v:cvday:*", "v:cvuniq:*"]`), so the existing reset's behaviour is unchanged.
- **Scope guard**: `:77` `if (scope !== "visits" && scope !== "cv" && scope !== "cvviews")` → 400 with the updated message. Unknown scopes cannot reach `deletePatterns`; `SCOPES[scope]` is only indexed after this gate, so no `undefined` patterns array can reach `deletePatterns`.
- Auth path (`:64-68`), method guard (`:59-62`), env guard (`:70-74`) and response shape are unchanged; `cvviews` introduces no new auth surface.
- **NOT MEASURED (runtime)**: the destructive behaviour against a live Redis. `vite preview` does not execute serverless handlers and no scratch Redis is provisioned. The E2E report documents a *static contract harness* (`verify-download-cv.mjs`) asserting the glob disjointness — that is corroborating static evidence, not a live `SCAN`/`DEL` run. Classification: **static analysis PASS; behavioural reset NOT MEASURED**.

### 4.5 Backward compatibility — `cvViews` optional end-to-end (Item 5) — **PASS**

Traced a stale / field-less `/api/visit-stats` payload through every consumer:

1. **Producer** (`api/visit-stats.ts:300-307, 377-387, 466`): the `cvview` reads are appended **after** the existing `v:cvday:*` loop, and the consumer cursor (`:291-307`) is written in the **same order** — I matched the pairs: `hourTotals` → cvTotalFlutter → cvTotalFrontend → 14×(cvDaily flutter/frontend) → cvViewsTotalFlutter → cvViewsTotalFrontend → 14×(cvViewsDaily). Order is in lockstep, so the pre-existing `cv` numbers cannot be shifted by the insertion. New fields are additive; `cv` is untouched (`:364-374` unchanged shape). `pfcount` calls carry `.catch(() => 0)` (`:359-360`), so a Redis hiccup on the new keys cannot 500 the endpoint.
2. **Type** (`src/lib/analytics.ts:44-46`): `cv: CvTrack[];` is required; `cvViews?: CvViewTrack[];` is **optional**. A stale payload without the field is type-legal. `CvViewTrack = CvTrack` (`:19`) is a pure alias, so the same renderers work.
3. **Hook** (`src/hooks/use-visits-analytics.ts:50`): `cvViews?: CvViewTrack[];` — optional in `StatsResponse`. `:131` `cvViews: (json.cvViews ?? []) as CvViewTrack[],` — the `?? []` is the stale-server guard. A missing field yields `[]`, never `undefined` and never a throw.
4. **Rendering** (`AnalyticsSection.tsx:480, 483, 505, 509`): every read is `(data.cvViews ?? [])` defensively. `.length === 0` renders the honest empty state; `.length === 2` guards the ratio/insight line; the `.reduce` runs over a guaranteed array. A missing / stale `cvViews` renders the empty card, never throws.
5. **Failure path** (`use-visits-analytics.ts:156-161`): a failed request returns `buildEmptyAnalytics`, whose skeleton seeds **both** `cv` and `cvViews` to two zero tracks (`analytics.ts:88-89`).

**Conclusion**: `cvViews` is optional at every hop; a stale API response (or a stale client bundle) cannot crash the dashboard. **PASS.**

### 4.6 Entry points — Hero + Navbar desktop + mobile (Item 6) — **PASS**

- **Hero** (`src/components/Hero.tsx:167-197`): the group `role="group"` was renamed `"Download CV"` → `"CV actions"` (`:167`). A third control — `<Button asChild variant="outline"><Link to={getCVPageUrl("flutter")}>… BookOpen … Read CV</Link></Button>` — sits between the Flutter download button (`:176-188`) and the Frontend download link (`:189-196`). Uses the `<Link>` form, so **no `useNavigate` was added** to Hero (matches architecture §6 preferred form; Hero had no router hook).
- **Navbar desktop** (`Navbar.tsx:146-170`): a `<Button asChild size="sm" variant="outline">…<Link to={getCVPageUrl("flutter")}>Read CV</Link></Button>` is placed **before** the existing Flutter CV download `Button` (`:154-161`). The Flutter `Button` and the Frontend download `<button>` (`:162-169`) are present and unchanged.
- **Navbar mobile** (`Navbar.tsx:217-241`): the group `aria-label` is `"CV actions"`; the new ghost Read CV `<Link … onClick={() => setIsOpen(false)}>` (`:218-222`) is at the **top** of the group, and **both** download buttons (`:223-229`, `:233-240`) retain their own `setIsOpen(false)`.
- **Both existing downloads preserved**: `handleDownloadCV` (`Hero.tsx:60-62`, `Navbar.tsx:73-75`) still calls `downloadCV`, which is unchanged (`src/lib/utils.ts:28-38`) and still uses the mode-less `getCVDownloadUrl` (`src/config/cv.ts:47`). A grep of the diff confirms `getCVDownloadUrl` was **not** given a `mode` param, so the default disposition stays `attachment`.
- **Mobile menu still closes**: the new Read CV control calls `setIsOpen(false)` explicitly; the two downloads already did. **PASS.**
- Accessibility: the Read CV `Link`s carry `title="Read the CV in your browser"` and visible text; the group labels are `"CV actions"`.

### 4.7 Regression risk to the home page (Item 7) — **PASS**

- **`/cv` is its own lazy chunk**: G4 emitted `assets/CVView-Ca9kdTQu.js` = **5.60 kB (gzip 2.21 kB)**, separate from `assets/index-*.js` (the home entry). The import is `lazy(() => import("./pages/CVView"))` inside `<Suspense fallback={null}>`, so the page + `components/cv/*` + Radix `tabs` chunk is fetched only on navigation to `/cv`.
- **No new vendor chunk**: G4's asset list shows no newly-introduced shared chunk; `tabs-HFgcSmcd.js` (16.38 kB) is the pre-existing Radix tabs module that the lazy chunk reuses.
- **No entry-bundle growth from the new icon**: Navbar already imported `Eye` from `lucide-react` at HEAD (verified: `git show HEAD:src/components/Navbar.tsx` → `import { Menu, X, Download, Moon, Sun, Eye } from "lucide-react";`), so the barrel was already in the entry graph; the added `BookOpen` rides the existing module. Hero's added `BookOpen` comes from the same already-present `lucide-react` import line. **No new heavy module is pulled into the entry bundle.**
- **`getCVPageUrl` is a pure string helper** in the already-loaded `@/config/cv` — no new import pulls anything heavy.
- **Mobile `useIsMobile` on first render** (`src/hooks/use-mobile.tsx:17`): `useState<boolean>(readIsMobile)` uses the lazy-initialiser form, so the media query is read **during the first render**, not from a post-mount effect. `readIsMobile` (`:6-11`) guards `typeof window === "undefined"` and `typeof window.matchMedia !== "function"` — it returns `false` (never throws) in a non-DOM environment. No double render, no animation-variant swap after first paint. **PASS.**
- **NOT MEASURED (runtime)**: an actual Lighthouse / first-paint comparison against a pre-feature build. Justification for not measuring: the build's chunk graph is byte-level evidence that no new entry-bundle module was added, and running a full perf comparison is the `performance` agent's remit, not QA's. `git show`-based baseline for the icon claim used. **NOT MEASURED with reason.**

### 4.8 Accessibility (Item 8) — **PASS WITH NOTES**

- **Iframe `title`**: `CVViewer.tsx:43` `title={`${label} — inline PDF viewer`}` → e.g. "Flutter Developer CV — inline PDF viewer" (matches architecture §9 exactly; corroborated by E2E-06).
- **Iframe focusability**: the architecture §9 asks for `tabIndex={0}` so keyboard users can enter the PDF embed. The shipped iframe (`CVViewer.tsx:40-51`) does **not** carry an explicit `tabIndex`. **Note**: `<iframe>` is a natively focusable element per HTML, so keyboard users can still Tab into it; the explicit attribute is recommended-but-redundant. Recorded as an observation; no severity assigned.
- **Track tabs keyboard**: `CVTrackTabs.tsx:18-33` uses Radix `Tabs`/`TabsList`/`TabsTrigger` with `value` / `onValueChange`, no `TabsContent`. Radix supplies `role="tablist"`, `role="tab"`, `aria-selected`, roving tabindex and arrow-key navigation. Each trigger has **visible text** (`CV_CONFIG[option].label`) — no icon-only trigger. E2E-05 confirms two `role="tab"` with correct `data-state`.
- **Fallback aria-labels**: `CVFallback.tsx:48` `aria-label={`Open ${label} in a new tab`}` and `:57` `aria-label={`Download ${label}`}` — both name the track. Both are real `<Button>`s.
- **Notice `role="status"`**: `CVView.tsx:99` `role="status"` (polite) on the invalid-track notice — announced without stealing focus. Correct.
- **Focus order**: `Back to portfolio` link precedes `<h1>` → `CVTrackTabs` → viewer/fallback → `Download CV` action. The architecture's stated "h1 → tabs → viewer → actions → back link" is slightly different in order (the back link is first, before the h1). Functionally fine — it is a predictable, document-order-natural sequence — but the back link being the first focusable element means a keyboard user tabbing one stop past the address bar lands on "Back to portfolio" before the page `h1`/tabs. **Observation only.**
- **Reduced motion**: `CVView.tsx:65` `initial={reducedMotion ? "visible" : "hidden"}` — matches the `Hero.tsx` pattern exactly. No motion is required to operate the page.
- **Loading state**: `CVViewer.tsx:30-39` uses `role="status" aria-live="polite"` for the spinner label.

### 4.9 Quality gates (Item 9) — **PASS**

See Section 2. ESLint clean; node tsc clean; app tsc only the pre-existing supabase TS2307; build success with the `CVView` chunk. Re-ran all four on the working tree on 2026-11-03.

### 4.10 Mobile / coarse-pointer fallback — mutual exclusion (Item 10) — **PASS**

- **Branch condition** (`CVView.tsx:51`): `const showFallback = isMobile || coarsePointer || embedFailed;`
  - `isMobile` = `useIsMobile()` → `(max-width: 767px)`.
  - `coarsePointer` = `!hasFinePointer()` → negated `(hover: hover) and (pointer: fine)`.
  - `embedFailed` = set by `CVViewer.onError` (`:121`).
- **Mutual exclusion — proven by the JSX shape** (`:110-124`): the branch is a **ternary**:
  ```
  {showFallback ? (
    <CVFallback … />
  ) : (
    <CVViewer … onError={() => setEmbedFailed(true)} />
  )}
  ```
  A ternary renders exactly **one** branch. It is **structurally impossible** for both the iframe and the fallback to appear in the same render — the fallback is not an overlay, and the iframe is not also conditionally rendered elsewhere. There is no independent `{!showFallback && <CVViewer/>}` alongside a `{embedFailed && <CVFallback/>}`.
- **`reason` is chosen correctly**: `reason={embedFailed ? "load-error" : "coarse-pointer"}` (`:114`) — a load failure takes precedence, so a mobile user whose iframe would also have failed sees the honest "can't be displayed" copy. (Note: `embedFailed` can only become `true` while the iframe branch is mounted, i.e. off the fallback path — consistent.)
- **Re-entry**: `handleTrackChange` resets `embedFailed` (`:55`), so switching tracks re-attempts the embed.
- **NOT MEASURED (runtime)**: real touch-device rendering and the `Open PDF` new-tab behaviour. E2E-07 (recorded) shows that at 702px width the iframe is absent and both fallback buttons render — corroborating evidence, but I did not re-execute it and I cannot exercise a real coarse-pointer device in this session. **NOT MEASURED with reason**; static proof of mutual exclusion stands on its own.

---

## 5. Additional Adversarial Checks

| Check | Method | Result |
| :--- | :--- | :--- |
| `?track=` with a URL/redirect payload (`//evil.com`, `javascript:`, `%2F%2F`) | Traced `parseCVTrack` → `isCVTrack` (literal union) → all URLs built by config helpers | Cannot reach any URL. **PASS** |
| `?mode=VIEW` / `?mode=view ` / `?mode[]=view` | Traced `rawMode === "view"` (strict, array-unwrapped) | Treated as download. Fail-safe. **PASS** |
| Cross-family write via the pipeline | Traced `ns` used by all 5 pipeline calls | Single namespace, no branch. **PASS** |
| Reset glob collision via a widened pattern | Inspected the shipped `SCOPES` literals and the `deletePatterns` split | No `v:cv*`, `v:cvview*`-only scopes. **PASS** |
| Cursor desync between `visit-stats` producer and consumer after the additive reads | Matched every `pipe.get` / `pipe.pfcount` in order against every `next()` | In lockstep; `cv` numbers not shifted. **PASS** |
| Duplicate `invalidTrack` notice after switching tabs | Traced `handleTrackChange` → `setInvalidTrack(false)` | Cleared on switch. **PASS** |
| Notice leaking across a track change | Same trace | Latched only by an invalid URL; cleared by the only track-changing action. **PASS** |
| Both iframe and fallback rendering simultaneously | Inspected the ternary JSX | Structurally impossible. **PASS** |
| `CVView` present in the home entry bundle | G4 asset list | `CVView` is a separate 5.60 kB chunk. **PASS** |
| `@supabase/supabase-js` error is a regression | `git status` + `git log` + `Test-Path` | Pre-existing, untouched file, module not installed. **PASS** |

---

## 6. NOT MEASURED (policy G10)

| Item | Why not measured |
| :--- | :--- |
| Live `Content-Disposition: inline` from `/api/download-cv?mode=view` over the wire | `vite preview` does not execute Vercel serverless handlers; no deployment credentials in this session. Verified at the code and contract-harness level only. |
| Real Redis increment separation (`v:cvview:*` vs `v:cv:*`) and the destructive reset behaviour | No scratch Redis / Upstash credentials. Glob-disjointness verified statically; the reset SQL/scan behaviour is **not** runtime-verified by this agent. |
| Actual PDF pixels inside the iframe | The embed points at an endpoint that cannot be served locally; the E2E report records the same limitation. |
| Real admin "CV views" numbers against a populated store | Upstash is unconfigured locally; the card was verified to render the honest zero/empty state (`buildEmptyAnalytics`). |
| Home-page first-paint / Lighthouse before-vs-after | Out of QA remit (belongs to `performance`); the no-entry-bundle-growth claim is supported by the chunk graph instead. |
| Cold `/cv` load on Vercel (functions-before-rewrites resolution) | Requires a deployed environment; `vercel.json` is syntax-valid and the pattern is a negative lookahead, verified by reading. |
| Real touch-device fallback branch + `Open PDF` new-tab | No physical coarse-pointer device in this session. |

---

## 7. Definition-of-Done Traceability (React adaptation)

- [x] Static analyzer executed and recorded — `npx eslint src --ext .ts,.tsx` exit 0, no output.
- [x] Type checks executed and recorded — node exit 0; app exit 2 with the **pre-existing** supabase TS2307 only.
- [x] Build executed and recorded — exit 0; `CVView` in its own chunk.
- [x] Routing / param / API-contract / reset-scope / backward-compat / entry-point / fallback invariants cross-referenced against the brief and `architecture.md` §3, §5, §6, §7.5, §7.6, §7.7, §9, §10, §11, §12b.
- [x] No `.test.*` / `.spec.*` suite exists in this repo (matches `tasks.json` `adaptation_note`); per G10 no automated suite was fabricated.
- [x] Residual-mock check: no `mock` / `dummy` / hardcoded analytics values found in the new UI; `buildEmptyAnalytics` seeds honest zeros, and `architecture §7.9` documents the deliberate no-backfill stance.
- [x] Read-only respected — only this report was written; no source or test file was touched; no git write commands were executed (only `git status` / `git log` / `git show`, all read-only).
- [x] `qa-report.md` written with an explicit verdict.
- **Report only per the subagent brief** — the handoff JSON (`07-qa.json`) was **not** written (the brief restricts the write scope to `reports/qa-report.md`). The orchestrator can derive the handoff from this report.

---

## 8. Verdict Rationale

**PASS WITH NOTES.**

Zero critical/high findings. Every hard invariant the brief asked me to attack held under direct source inspection:

1. `/cv` is above `path="*"` (line-verified) and survives `?track=`.
2. `?track=` cannot crash, produce `undefined`, open a redirect, or disagree with the address bar; the latched `invalidTrack` flag cannot re-show spuriously and cannot leak between tracks.
3. `mode=view` changes only disposition and the counting namespace; the single `ns` derivation makes cross-writes structurally impossible; the `Range` skip is symmetric.
4. The `cv` and `cvviews` globs are provably disjoint by character-position analysis of the SCAN patterns — neither can delete the other's keys.
5. `cvViews` is optional at every hop; a stale payload renders honest zeros without throwing.
6. Hero, Navbar desktop and Navbar mobile all gain a Read affordance; both existing downloads are untouched; the mobile menu still closes.
7. `/cv` ships as its own 5.60 kB lazy chunk; the entry bundle gains no new module; `useIsMobile` reads on first render.
8. `iframe title`, tab keyboard semantics, fallback `aria-label`s and the notice's `role="status"` are all present.
9. ESLint 0 · node tsc 0 · app tsc 1 pre-existing error · build success.
10. The iframe and the fallback are rendered by a ternary — mutual exclusion is structural.

The six findings are all **low**: two are cosmetic/wording, one is a redundant-cast hardening, one is a documented deliberate under-counting choice, one is a verified non-regression recorded to pre-empt a false flag, and one is an architecture-vs-Gate-2-decision documentation mismatch. None blocks acceptance.

**Recommended next step**: `security` and `performance` audits in parallel. The runtime checks in Section 6 (live inline disposition, real Redis separation, cold `/cv` on Vercel) must be executed on a deployed preview before the human considers the counter numbers trustworthy; until then, the reset-isolation invariant rests on static proof.

# Architecture Specification: Read CVs In-Browser (cv-reader)

> **REVISION 2 (Gate 2 answers applied).** Two changes vs. the first draft:
> 1. **Views get SEPARATE Redis counters** (the human chose option 2, *not* the
>    originally recommended option 1). Inline views are recorded in their own
>    `v:cvview:*` key family; download keys are untouched. See **§7.4–§7.7**.
> 2. **`vercel.json` hardening is APPROVED** — the `/((?!api/).*)` negative-lookahead
>    rewrite is now in scope, not merely recommended. See **§7.3**.
>
> Consequence: `api/visit-stats.ts`, `api/visit-reset.ts`,
> `src/components/admin/AnalyticsSection.tsx`, `src/hooks/use-visits-analytics.ts`
> and `src/lib/analytics.ts` moved from "out of scope" to **in scope**.
> See **§7.8** for the new risk this larger surface introduces.

## 1. System Overview & Pattern Alignment

- **Path**: **Path B** (Existing UI / route reuse). The feature extends the
  existing `Hero`/`Navbar` CV affordances, the existing `api/download-cv.ts`
  serverless handler, the existing `lazy()` page-route convention, and — as of
  REVISION 2 — the existing admin analytics pipeline (`visit-stats` →
  `use-visits-analytics` → `AnalyticsSection`). No new screen system, no new
  design language, no new admin route.
- **Architecture Pattern (React adaptation of Clean Architecture)**: the repo is
  a Vite + React 18 SPA, so the Flutter layering maps as follows:
  - **Config / domain constants** → `src/config/cv.ts` (single source of truth
    for tracks, labels, URLs). Treated as the "domain" layer.
  - **Services / helpers** → `src/lib/*` (`utils.ts`, `pointer.ts`). Pure,
    framework-agnostic, no React imports. Treated as the "data/utility" layer.
  - **Hooks** → `src/hooks/*` (state + platform capability detection).
    Treated as the "logic" layer.
  - **UI** → `src/components/**` and `src/pages/**`. Consumes only the above.
    Never re-implements track validation or URL construction inline.
- **Rule preserved from `CONVENTIONS` spirit**: UI must not hardcode what the
  config layer already owns. Every `/cv?track=` URL and every
  `api/download-cv?...` URL is built by an exported helper in
  `src/config/cv.ts`, never string-concatenated inside a component.

### Files to CREATE

| Path | Purpose |
| --- | --- |
| `src/pages/CVView.tsx` | The `/cv` shareable page (route-level lazy chunk). |
| `src/components/cv/CVViewer.tsx` | The embedded-PDF / mobile-fallback branch renderer. |
| `src/components/cv/CVTrackTabs.tsx` | Flutter / Frontend track switcher bound to the URL. |
| `src/components/cv/CVFallback.tsx` | The "Open PDF" + "Download" fallback card (mobile / load failure). |

### Files to MODIFY

| Path | Change |
| --- | --- |
| `api/download-cv.ts` | Add `mode=view` support; parse `mode`; set `inline` vs `attachment` disposition. Counting block **branches**: views → `v:cvview:*`, downloads → `v:cv:*` (see §7). |
| `api/visit-stats.ts` | **REVISION 2 — new.** Read the `v:cvview:*` family and add an additive `cvViews` field to the JSON response (§7.5). |
| `api/visit-reset.ts` | **REVISION 2 — new.** Add a `cvviews` reset scope and extend the `cv` scope's key list (§7.6). |
| `src/lib/analytics.ts` | **REVISION 2 — new.** Add `CvViewTrack` type, `cvViews` on `AnalyticsData`, and the empty-state skeleton (§7.7). |
| `src/hooks/use-visits-analytics.ts` | **REVISION 2 — new.** Add `cvViews` to `StatsResponse` and pass it through `mapStatsResponse` (§7.7). |
| `src/components/admin/AnalyticsSection.tsx` | **REVISION 2 — new.** Show views alongside downloads; add the third reset scope (§7.6, §7.7). |
| `src/config/cv.ts` | Add `getCVViewUrl(track)`, `getCVPageUrl(track)`, `isCVTrack(x)`, `parseCVTrack(param)`. |
| `src/lib/utils.ts` | Add `openCV(track)` (in-tab view) beside the existing `downloadCV`. |
| `src/App.tsx` | Declare the lazy `/cv` route before the `*` catch-all. |
| `src/components/Hero.tsx` | Add a "Read" affordance next to the existing Flutter CV download button; keep download intact. |
| `src/components/Navbar.tsx` | Add a "Read" affordance in desktop actions and in the mobile dropdown; keep both existing downloads intact. |
| `vercel.json` | **APPROVED (REVISION 2).** Change the SPA rewrite `source` to `/((?!api/).*)` so it can never shadow `/api/*` (see §7.3). |

### Approved Packages

- **Existing packages utilized**: `react-router-dom` (`useSearchParams`,
  `Link`), `framer-motion` (reduced-motion-aware entrance), `lucide-react`
  (icons), `@radix-ui/react-tabs` (track switcher), `tailwind-merge`/`clsx`
  (via `cn`).
- **New packages requested (requires Gate 2 approval): NONE.** Zero new
  dependencies. The embed is a plain `<iframe>`; there is no PDF.js-style
  renderer to justify.

---

## 2. Layer Design & File Contracts

### 2.1 Config Layer — `src/config/cv.ts` (MODIFY)

Additive only; existing exports (`CVTrack`, `CV_CONFIG`, `CLOUDINARY_CLOUD_NAME`,
`getCloudinaryRawUrl`, `getCloudinaryUploadEndpoint`, `getCVDownloadUrl`) are
untouched so `CVDashboard.tsx` and `utils.ts` keep working.

```ts
export const CV_TRACKS: readonly CVTrack[] = ["flutter", "frontend"] as const;
export const DEFAULT_CV_TRACK: CVTrack = "flutter";

/** Type guard for untrusted input (URL params, API payloads). */
export const isCVTrack = (value: unknown): value is CVTrack =>
  value === "flutter" || value === "frontend";

/**
 * Validates an untrusted `?track=` value and falls back to DEFAULT_CV_TRACK.
 * Never throws; never returns undefined.
 */
export const parseCVTrack = (value: string | null | undefined): CVTrack =>
  isCVTrack(value) ? value : DEFAULT_CV_TRACK;

/** Absolute page path for a shareable CV link. e.g. "/cv?track=frontend" */
export const getCVPageUrl = (track: CVTrack): string => `/cv?track=${track}`;

/**
 * Same-origin inline-view URL served by the serverless handler.
 * e.g. "/api/download-cv?track=flutter&mode=view"
 */
export const getCVViewUrl = (track: CVTrack): string =>
  `/api/download-cv?track=${track}&mode=view`;
```

> Note: `getCVDownloadUrl` stays exactly as-is (`/api/download-cv?track=<t>`,
> no `mode`) so the default remains `attachment`.

**Written by**: `data`.

### 2.2 Utility Layer — `src/lib/utils.ts` (MODIFY)

Additive only. `downloadCV(type)` and its Cloudinary-reachability +
local-fallback logic are unchanged.

```ts
/**
 * Opens the CV in-page. On fine-pointer desktop the /cv page owns the
 * experience; callers that only need the raw PDF use getCVViewUrl directly.
 * This helper is for the mobile fallback "Open PDF" action: it opens the
 * inline endpoint in a new tab so the native PDF viewer takes over.
 */
export function openCV(type: CVTrack): void;
```

Implementation contract: `window.open(getCVViewUrl(type), "_blank",
"noopener,noreferrer")`. Must NOT reuse `downloadCV`'s HEAD-reachability probe
that path is only needed to decide the local static fallback for *downloads*;
a *view* always goes through the endpoint and surfaces the endpoint's JSON error
for a human to act on. (Rationale recorded in `open_questions`.)

**Written by**: `ui-binding`.

### 2.3 Logic Layer — reuse existing hooks (NO new hook)

- **Mobile / coarse-pointer detection**: reuse `useIsMobile()` from
  `src/hooks/use-mobile.tsx` (`(max-width: 767px)`, read during first render)
  **AND** `hasFinePointer()` from `src/lib/pointer.ts`
  (`(hover: hover) and (pointer: fine)`, module-cached). The fallback branch is
  taken when `isMobile === true || hasFinePointer() === false`. Using both
  covers phones (narrow) and coarse-pointer tablets where the width media query
  alone would miss.
- **Motion**: reuse `useAnimationContext()` (`{ reducedMotion }`) and the
  variants in `src/lib/animation-variants.ts` (`fadeUp`, `staggerContainer`,
  `staggerItem`). When `reducedMotion` is true, mount with `initial="visible"`
  (the existing Hero pattern) so nothing animates.

No new state-management primitive is introduced: the only page state is which
track is selected, and that is **URL-derived** (see §5), not `useState`.

### 2.4 UI Layer — `src/pages/CVView.tsx` (CREATE)

Route-level page component. Default export, so `lazy(() => import("./pages/CVView"))`
works.

```tsx
const CVView = (): JSX.Element  // default export
```

Responsibilities:
1. Read `?track` via `useSearchParams()`; `const track = parseCVTrack(searchParams.get("track"))`.
2. If the raw param is present but invalid (`searchParams.get("track") !== null && !isCVTrack(raw)`),
   render the inline invalid-track notice (§6) **plus** the default-track viewer,
   and normalize the URL with `setSearchParams({ track: DEFAULT_CV_TRACK }, { replace: true })`.
3. Compose `<CVTrackTabs>` + a mobile-aware branch rendering either
   `<CVViewer>` (fine-pointer) or `<CVFallback>` (coarse-pointer).
4. Own the page `<h1>`, the "Download this CV" action (delegates to the existing
   `downloadCV(track)`), and a "Back to portfolio" `Link` to `/`.
5. **Below-the-fold deferral is N/A** — this page is small and the PDF iframe is
   the primary content. It is deferred entirely by the route chunk.

### 2.5 UI Layer — `src/components/cv/CVViewer.tsx` (CREATE)

```tsx
type CVViewerProps = {
  track: CVTrack;
  className?: string;
  /** Bubbled up so CVView can show the fallback actions. */
  onError?: () => void;
};
const CVViewer = ({ track, className, onError }: CVViewerProps): JSX.Element
```
- Renders the single `<iframe>` that embeds the CV.

### 2.6 UI Layer — `src/components/cv/CVFallback.tsx` (CREATE)

```tsx
type CVFallbackProps = {
  track: CVTrack;
  /** "coarse-pointer" | "load-error" — drives the copy only. */
  reason: "coarse-pointer" | "load-error";
  className?: string;
};
const CVFallback = ({ track, reason, className }: CVFallbackProps): JSX.Element
```
- Renders the Card with the track label and two real actions:
  - **Open PDF** → `openCV(track)` (new tab, native viewer).
  - **Download** → `downloadCV(track)` (existing behaviour, preserved).
- Both buttons are real `<button>`/`<a>` with visible English text and an
  `aria-label` that names the track.

### 2.7 UI Layer — `src/components/cv/CVTrackTabs.tsx` (CREATE)

```tsx
type CVTrackTabsProps = {
  track: CVTrack;
  onChange: (next: CVTrack) => void;
  className?: string;
};
const CVTrackTabs = ({ track, onChange, className }: CVTrackTabsProps): JSX.Element
```
- Thin wrapper over `src/components/ui/tabs.tsx` (`Tabs`/`TabsList`/`TabsTrigger`)
  listing `CV_TRACKS` with `CV_CONFIG[t].label`. No `TabsContent` — the content
  is the shared viewer, so `Tabs` is used as a value + `onValueChange` control.
  Each trigger is keyboard-reachable (Radix handles roving tabindex + arrow keys).

---

## 3. Dependency Injection & Routing

- **No DI container** in this project — modules are imported directly. The
  "binding" is: components import helpers from `@/config/cv` and `@/lib/utils`;
  they never construct URLs inline.
- **Route Declaration** — `src/App.tsx`, inserted **above** the `*` catch-all,
  matching the `CVDashboard`/`NotFound` lazy convention exactly:

```tsx
const CVView = lazy(() => import("./pages/CVView"));
// ...
<Route
  path="/cv"
  element={
    <Suspense fallback={null}>
      <CVView />
    </Suspense>
  }
/>
```

- **Catch-all safety**: `NotFound` is `path="*"`, so `/cv` MUST be declared
  before it. `/cv?track=frontend` resolves to the same route (query strings are
  not part of route matching).
- **Shareability**: because it is a real SPA route served by `index.html`
  (see §7), a cold visit to `https://<host>/cv?track=flutter` renders the page
  directly, which is exactly the recruiter use case.

---

## 4. Error Mapping Strategy

The endpoint returns JSON errors today: `400 {error:"Invalid CV track."}`,
`500 {error:"Cloudinary cloud name is not configured."}`,
`4xx/5xx {error:"CV file is not available."}`. Contract for this feature:

- **Invalid `?track=`** → never reaches the endpoint. `parseCVTrack` clamps to
  `flutter`; the page renders a dismissible inline notice and a valid viewer.
- **PDF not available / Cloudinary down** → an `<iframe>` silently shows
  nothing, so the page MUST NOT rely on the iframe to surface failure. The
  page renders `<CVFallback reason="load-error">` when the viewer reports an
  error, so the user always gets working "Open PDF" / "Download" actions.
- **No global error UI is introduced.** Failures are local to the page.

---

## 5. The `/cv` Page

- **Route**: `/cv` in `src/App.tsx` (lazy, `Suspense fallback={null}`).
- **Param parsing / validation** (safe default):
  - `const [searchParams, setSearchParams] = useSearchParams();`
  - `const raw = searchParams.get("track");`
  - `const track = parseCVTrack(raw);` → unknown/absent/multi-value all become
    `"flutter"`. (`URLSearchParams.get` returns the first value; a `?track=a&track=b`
    never produces an array here, so no array handling is needed.)
  - The page never throws on bad input and never renders an empty screen.
- **Exact source URL used for the iframe**: `getCVViewUrl(track)` →
  `/api/download-cv?track=<track>&mode=view` (same-origin). The iframe is keyed
  by track so switching tracks forces a fresh load:
  `key={getCVViewUrl(track)}`.
- **Track switching**: `CVTrackTabs.onChange` calls
  `setSearchParams({ track: next })` (push, not replace) so back/forward and
  copy-link both keep working.
- **Mobile fallback branch**:
  ```
  const isMobile = useIsMobile();          // max-width: 767px
  const coarse = !hasFinePointer();        // hover:hover & pointer:fine
  const showFallback = isMobile || coarse;
  ```
  When `showFallback` is true, `<CVFallback reason="coarse-pointer">` renders
  instead of the iframe — no broken embedded viewer on mobile/coarse pointers.

---

## 6. Entry Points

All entry points preserve the existing download behaviour byte-for-byte and
only *add* a read affordance that navigates to `/cv?track=...`.

### `src/components/Hero.tsx` (MODIFY)
- Add a third control inside the existing `role="group" aria-label="Download CV"`
  row (rename the group label to `"CV actions"` for accuracy), between the
  Flutter download button and the Frontend download link:
  - A `Button asChild variant="ghost"` wrapping
    `<Link to={getCVPageUrl(track)}>` — "Read CV" with an `Eye`/`BookOpen` icon
    from `lucide-react` (icons are already imported from there).
- Because there is one shared `handleDownloadCV(type)`, add a sibling
  `const handleReadCV = (type: CVTrack) => navigate(getCVPageUrl(type))` using
  `useNavigate()` from `react-router-dom` — Hero currently uses no router hook,
  so this is the single addition. (Alternative, and preferred: render the read
  affordance as a `<Link>` so no `useNavigate` is needed; either is acceptable,
  the `<Link>` form is smaller.)
- The `Download` buttons and `downloadCV(type)` calls are unchanged.

### `src/components/Navbar.tsx` (MODIFY)
- **Desktop actions block** (`hidden md:flex`): add one text button
  "Read CV" that navigates to `getCVPageUrl("flutter")`, placed before the
  existing Flutter CV download `Button`. Existing `Flutter CV` download button
  and `Frontend CV` download link stay exactly as they are.
- **Mobile dropdown block**: inside the existing
  `role="group" aria-label="Download CV"` (rename label to `"CV actions"`), add
  a ghost `Button` at the top of the group:
  "Read CV" → `navigate(getCVPageUrl("flutter"))` then `setIsOpen(false)`.
  The two existing download buttons below it are unchanged.
- Navbar has no router hook today; add `const navigate = useNavigate();` (or
  render a `Link` styled like the existing text button). The mobile menu's
  `setIsOpen(false)` on click must be preserved for the new control too, so the
  menu closes when a user taps "Read CV".

### `downloadCV` — unchanged
`src/lib/utils.ts#downloadCV` and its Cloudinary HEAD probe + local static
fallback are untouched. `getCVDownloadUrl` still emits `mode`-less URLs, so the
existing downloads keep returning `Content-Disposition: attachment`.

---

## 7. The Endpoint + Analytics Changes (`download-cv`, `visit-stats`, `visit-reset`)

Scope note (REVISION 2): §7.1–§7.2 are the `api/download-cv.ts` contract;
§7.3 is the approved `vercel.json` hardening; §7.4–§7.5 are the separated
counting design; §7.6 is the reset scope; §7.7–§7.8 are the stats payload and
the dashboard card; §7.9 is the honest no-backfill statement.

### 7.1 Query contract

| Param | Values | Default | Behaviour |
| --- | --- | --- | --- |
| `track` | `flutter` \| `frontend` | none → `400` (unchanged) | Selects the file. Identical semantics to today. |
| `mode` | `view` \| `download` \| absent | `download` | `view` → `inline` disposition; anything else → `attachment`. Unknown values are treated as `download` (fail-safe to the existing behaviour). |

Parsing rule (mirrors the existing `track` handling):
```ts
const rawMode = Array.isArray(request.query?.mode) ? request.query?.mode[0] : request.query?.mode;
const isViewMode = rawMode === "view";
```
The `VercelRequest["query"]` type must gain `mode?: string | string[];`
alongside the existing `track?: string | string[];`.

### 7.2 Exact headers

- **View (`mode=view`)** — inline, so Chrome/Edge/Firefox render the PDF
  in-page:
  ```
  Content-Type: application/pdf
  Content-Disposition: inline; filename="<fileName>"
  Cache-Control: no-store
  X-Content-Type-Options: nosniff
  ```
- **Download (default)** — identical to today's output; only the existing two
  lines plus the (new) nosniff hardening:
  ```
  Content-Type: application/pdf
  Content-Disposition: attachment; filename="<fileName>"
  Cache-Control: no-store
  X-Content-Type-Options: nosniff
  ```

Recommended single-line change: compute
`const disposition = isViewMode ? "inline" : "attachment";` then
`response.setHeader("Content-Disposition", \`${disposition}; filename="${cvFile.fileName}"\`);`.
Everything else in the handler (400/500 paths, Cloudinary fetch, buffer
conversion, `response.status(200).send(fileBuffer)`) is unchanged.

### 7.2b How the route is reached

`/cv` renders `<iframe src="/api/download-cv?track=flutter&mode=view">` from the
same origin. Vercel resolves filesystem/API functions **before** applying the
rewrites in `vercel.json`, which is why `downloadCV()`'s call to
`/api/download-cv` already works today despite the `/(.*) → /index.html`
rewrite.

### 7.3 `vercel.json` — APPROVED hardening

**Status: approved at Gate 2.** Apply it. Current file (verified, 8 lines):

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

Replace **only** the `source` value with the negative-lookahead pattern:

```json
{
  "rewrites": [
    {
      "source": "/((?!api/).*)",
      "destination": "/index.html"
    }
  ]
}
```

- The `source` value is exactly `/((?!api/).*)`; `destination` stays `/index.html`.
- `/api/*` still resolves: the pattern is a *negative* lookahead, so any path
  beginning with `api/` is **excluded** from the SPA rewrite. Those requests fall
  through to the serverless functions in `api/` exactly as they do today.
- Non-API deep links (`/cv`, `/cv?track=frontend`, `/dashboard`, …) still rewrite
  to `/index.html`, which is what keeps `/cv` cold-visit shareable (§3, §5).
- Config-only change; **no handler contract changes.** This is defence-in-depth:
  it makes the intent explicit rather than relying on Vercel's
  functions-before-rewrites resolution order.

### 7.4 Redis counting — SEPARATED VIEW / DOWNLOAD KEYS

**Gate 2 decision: option 2 — separate view counters.** Inline views are recorded
in their own key family. Download keys keep working *exactly* as today.

Existing download keys (must not change behaviour), from `api/download-cv.ts`
lines 67–71:

| Key | Type | TTL | Written by |
| --- | --- | --- | --- |
| `v:cv:<track>` | counter (INCR) | none (all-time) | download only |
| `v:cvday:<track>:<day>` | counter (INCR) | 90 days | download only |
| `v:cvuniq:<track>:<day>` | HyperLogLog (PFADD) | 90 days | download only |

New view keys, mirroring the naming convention exactly (`v:cv` → `v:cvview`,
`v:cvday` → `v:cvviewday`, `v:cvuniq` → `v:cvviewuniq`), with the **same 90-day
TTL** as the existing day keys:

| Key | Type | TTL | Written by |
| --- | --- | --- | --- |
| `v:cvview:<track>` | counter (INCR) | none (all-time) | view only |
| `v:cvviewday:<track>:<day>` | counter (INCR) | `90 * 24 * 60 * 60` seconds | view only |
| `v:cvviewuniq:<track>:<day>` | HyperLogLog (PFADD) | `90 * 24 * 60 * 60` seconds | view only |

`<track>` ∈ `flutter | frontend` (the existing closed union).
`<day>` = `new Date().toISOString().slice(0, 10)` — the same UTC day derivation
the handler already uses at line 62.

**No all-time-unique key is added.** Consistent with the existing design, the
"unique" figure is computed by summing 14 daily `PFCOUNT`s in
`api/visit-stats.ts` (lines 342–343) — there is no `v:cvuniq:all` today and there
must not be a `v:cvviewuniq:all` either.

### 7.5 Exact `api/download-cv.ts` change

Current counting block (lines 55–76) computes `day`, `visitor`, then pipelines.
Revised block — the `day` / `visitor` derivation is unchanged; only the key
prefix is selected by mode:

```ts
  // Count the successful delivery (never blocks/fails the file itself).
  // Gate 2 (option 2): views and downloads are counted in SEPARATE key families.
  try {
    const redisUrl = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
    if (redisUrl && redisToken) {
      const { Redis } = await import("@upstash/redis");
      const redis = new Redis({ url: redisUrl, token: redisToken });
      const day = new Date().toISOString().slice(0, 10);
      const rawIp = request.headers?.["x-forwarded-for"];
      const ip = (Array.isArray(rawIp) ? rawIp[0] : rawIp ?? "").split(",")[0].trim() || "unknown";
      const visitor = createHash("sha1").update(ip).digest("hex");

      // "cv" = downloads (unchanged). "cvview" = inline views (new).
      const ns = isViewMode ? "cvview" : "cv";
      const totalKey = `v:${ns}:${track}`;
      const dayKey = `v:${ns}day:${track}:${day}`;
      const uniqKey = `v:${ns}uniq:${track}:${day}`;

      await redis.pipeline()
        .incr(totalKey)
        .incr(dayKey)
        .pfadd(uniqKey, visitor)
        .expire(dayKey, 90 * 24 * 60 * 60)
        .expire(uniqKey, 90 * 24 * 60 * 60)
        .exec();
    }
  } catch {
    // Analytics must never break the file.
  }
```

**Invariants — both directions are hard requirements:**

- A **view** (`mode=view` ⇒ `isViewMode === true` ⇒ `ns === "cvview"`) writes
  **only** `v:cvview:<track>`, `v:cvviewday:<track>:<day>`,
  `v:cvviewuniq:<track>:<day>`. It **NEVER** touches `v:cv:<track>`,
  `v:cvday:<track>:<day>` or `v:cvuniq:<track>:<day>`.
- A **download** (no `mode`, `mode=download`, or any unknown value ⇒
  `isViewMode === false` ⇒ `ns === "cv"`) writes **only** `v:cv:*`. It **NEVER**
  touches any `v:cvview*` key.
- The two key families share **no** key names, so the pipeline of one can never
  mutate the other. There is no fallthrough and no double-count.

**When does the view increment?** On the **inline response only** — i.e. exactly
when `mode=view` produced a successful Cloudinary fetch (`cloudinaryResponse.ok`)
and the handler is about to `send()` the buffer with
`Content-Disposition: inline`. There is **no** second, separate view counter:
the `/cv` page's iframe load *is* the view, and it is the same single request
that gets counted.

Consequences to implement deliberately (all are existing behaviour, restated
because the counting now matters more):

- The `400` (invalid track), `500` (no cloud name) and non-`ok` Cloudinary
  responses all `return` **before** the counting block (lines 37–51), so a failed
  view is not counted — same as a failed download today.
- `mode=view` opens the PDF in the browser's PDF viewer. Some browsers fire a
  **ranged** follow-up request (`Range:` header) for large PDFs. Those are
  separate function invocations and each one that reaches line 55 will `INCR`
  again, inflating `v:cvview:*`. This risk is **identical to the existing
  download counter** (a download re-fetched twice counts twice) and is therefore
  accepted as pre-existing behaviour, not a regression — but it is more likely to
  be exercised by inline viewing than by downloads.
  **Mitigation (RECOMMENDED, small and self-contained):** count only when the
  request is not a range continuation —
  `const isRangeRequest = String(request.headers?.["range"] ?? "").length > 0;`
  `const shouldCount = !isRangeRequest;` and skip the counting `try` block when
  `!shouldCount`. Apply the **same** guard to downloads so the two families stay
  semantically comparable. If the implementer prefers the smallest possible diff,
  omitting the guard leaves the download counter's existing semantics intact and
  only makes the view number a slight over-count; flag whichever is chosen.
  `range` must be added to the `VercelRequest["headers"]` usage (it is already an
  index-signature record, so no type change is required).

Header/disposition code (lines 78–82) is otherwise unchanged; the only earlier
edit is at line 79:

```ts
  response.setHeader("Content-Type", "application/pdf");
  response.setHeader("Content-Disposition", `${isViewMode ? "inline" : "attachment"}; filename="${cvFile.fileName}"`);
  response.setHeader("Cache-Control", "no-store");
```

### 7.6 `api/visit-reset.ts` change — a THIRD scope, and what `cv` now means

**This is the largest new risk of the revision and is specified explicitly.**
Current `SCOPES` (lines 20–23) is:

```ts
const SCOPES = {
  visits: [...],
  cv: ["v:cv", "v:cv:*", "v:cvday:*", "v:cvuniq:*"],
} as const;
```

**Critical:** the `cv` scope's glob `"v:cv:*"` is `v:` + `cv:` + anything. It does
**not** match `v:cvview:*` (that would require the literal prefix `v:cv:`; the
actual key is `v:cvview:`). Likewise `v:cvday:*` / `v:cvuniq:*` do not match
`v:cvviewday:*` / `v:cvviewuniq:*`. So after this revision the existing `cv`
scope **still deletes downloads only** — which is the safe outcome, but it is
now an *implicit* one that a future edit could easily break. Make it explicit:

```ts
const SCOPES = {
  visits: [...],                                   // unchanged
  cv: ["v:cv", "v:cv:*", "v:cvday:*", "v:cvuniq:*"],       // downloads ONLY (unchanged behaviour)
  cvviews: ["v:cvview:*", "v:cvviewday:*", "v:cvviewuniq:*"], // views ONLY (new)
} as const;
```

And extend the scope guard (lines 70–73):

```ts
  const scope = request.body?.scope;
  if (scope !== "visits" && scope !== "cv" && scope !== "cvviews") {
    return response.status(400).json({ error: "Invalid scope. Use 'visits', 'cv' or 'cvviews'." });
  }
```

- The `cv` scope is **downloads only**, exactly as today. Its resolved key list is
  unchanged, so its behaviour is byte-for-byte identical.
- The new `cvviews` scope is **views only**. It cannot delete a download key:
  every pattern it holds begins with the literal `v:cvview`.
- **No pattern overlap:** `v:cv:*` cannot match `v:cvview:*`, and `v:cvview*`
  cannot match `v:cv:*`. Deleting one scope can never wipe the other.
- Both scopes keep using the existing `deletePatterns()` SCAN+DEL helper
  (lines 25–49) and the same `ADMIN_PIN` auth (lines 58–62) — no new auth path,
  no new env var.
- **Regression test the implementer must be able to state out loud:** "deleting
  `cv` leaves `v:cvview:*` intact, and deleting `cvviews` leaves `v:cv:*`
  intact." If a hidden in-app test harness exists, cover this; otherwise verify
  manually against a scratch Redis before deploy.

The `AnalyticsSection` reset UI therefore gains a **third** button rather than
repurposing the existing one (see §7.7).

### 7.7 `api/visit-stats.ts` + analytics client changes

#### `api/visit-stats.ts` — additive `cvViews`

`visit-stats.ts` is a **PIN-gated endpoint**, not public: line 80–84 rejects
anything without `Authorization: Bearer <ADMIN_PIN>` with `401`. Nothing new is
exposed and no new field is sensitive — the new numbers are two integers plus a
14-element integer series, exactly the shape of the existing `cv` field. No
visitor identifier, IP, or IP-derived hash is returned (`visitor` is only ever
written into the HyperLogLog inside `download-cv.ts` and is never read out by
`visit-stats.ts`).

Extend the batched pipeline (after lines 201–206) with the mirror reads:

```ts
    pipe.get(`v:cvview:flutter`);
    pipe.get(`v:cvview:frontend`);
    for (const d of cvDays) {
      pipe.get(`v:cvviewday:flutter:${d}`);
      pipe.get(`v:cvviewday:frontend:${d}`);
    }
```

The cursor order must stay in lockstep: these reads are appended **after** the
existing `v:cvday:*` loop, so the existing `next()` sequence for
`cvTotalFlutter`/`cvTotalFrontend`/`cvDailyFlutter`/`cvDailyFrontend`
(lines 285–292) is unaffected. Then consume the new reads and extend the
`Promise.all` at lines 335–344 with the two unique-view `PFCOUNT` groups:

```ts
      Promise.all(cvDays.map((d) => redis.pfcount(`v:cvviewuniq:flutter:${d}`).catch(() => 0))),
      Promise.all(cvDays.map((d) => redis.pfcount(`v:cvviewuniq:frontend:${d}`).catch(() => 0))),
```

then build a **new** field **beside** `cv`, leaving `cv` untouched (lines 346–357):

```ts
    // CV inline views per track: all-time total + unique (14d) + daily series (14d).
    // Mirrors the `cv` (downloads) shape exactly. Added in REVISION 2.
    const cvViews = ([
      { track: "flutter",  total: cvViewTotalFlutter,  uniq: cvViewUniqFlutter,  series: cvViewDailyFlutter },
      { track: "frontend", total: cvViewTotalFrontend, uniq: cvViewUniqFrontend, series: cvViewDailyFrontend },
    ] as const).map((t) => ({
      track: t.track,
      total: t.total,
      unique: t.uniq.reduce((s, v) => s + (Number(v) || 0), 0),
      daily: cvDays.map((date, i) => ({ date, value: t.series[i] ?? 0 })),
    }));
```

and add it to the response object (line 435 area):

```ts
      cv,
      cvViews,      // ← additive; existing consumers ignore it
```

**Contract (backward-compatible by construction):**

- `GET /api/visit-stats` is **additive only**. No existing field is renamed,
  removed, retyped, or reordered-in-meaning. A stale client that has not yet
  been redeployed simply never reads `cvViews`; nothing it does read changed.
- `cv` keeps meaning exactly "downloads". Same two tracks, same
  `{ track, total, unique, daily: [{ date, value }] }` shape.
- `cvViews` has the **identical** shape with the identical key names, so the same
  rendering component and the same TS type can be reused via a type alias
  (§7.7 client side).
- The new reads are wrapped in `.catch(() => 0)` / the existing outer `try`, so a
  Redis hiccup on the new keys cannot 500 the endpoint.
- `cvDays` is reused unchanged from line 159 (`dayKeys.slice(-14)`) — both series
  are 14 days and aligned by date, so their bars line up.

#### Client data layer (these files were **not** in the original write scope)

Three small additive edits keep the client in sync. Without them `cvViews` never
reaches the UI.

**`src/lib/analytics.ts`** (line 17 and line 42, plus `buildEmptyAnalytics` line 84):

```ts
export type CvTrack = { track: "flutter" | "frontend"; total: number; unique: number; daily: { date: string; value: number }[] };
/** Same shape as CvTrack — views vs downloads are distinguished by the field name. */
export type CvViewTrack = CvTrack;
```

add to `AnalyticsData` (next to `cv: CvTrack[];`):

```ts
  cvViews: CvViewTrack[];
```

and to `buildEmptyAnalytics`'s returned object (next to the `cv` fallback, so the
honest zero state covers views too):

```ts
    cvViews: (["flutter", "frontend"] as const).map((track) => ({ track, total: 0, unique: 0, daily: [] })),
```

**`src/hooks/use-visits-analytics.ts`**:

- Add to `StatsResponse` (next to `cv: CvTrack[];`, line 48):
  `cvViews: CvTrack[];` — **but treat it as optional and default it**, because a
  browser holding an old bundle (or a cached response) may see a payload without
  the field. Make it `cvViews?: CvTrack[];`.
- In `mapStatsResponse` (next to line 127) add:
  `cvViews: (json.cvViews ?? []) as CvTrack[],`
  The `?? []` is the stale-server guard; `buildEmptyAnalytics` supplies the
  two-track zero skeleton if the request fails outright.
- Import `CvViewTrack` alongside the existing `CvTrack` import (lines 3–15) if
  the alias is preferred for readability; `CvTrack` alone is type-compatible.

**`src/components/admin/AnalyticsSection.tsx`** — see §7.8 for the card + reset
UI. Nothing else in the component changes.

### 7.8 `AnalyticsSection.tsx` — the "CV downloads" card and the reset flow

#### The card (current: lines 402–446)

The card is now **"CV views & downloads"** and each of the two track blocks shows
both numbers. Keep the existing structure (one `<Card>`, two per-track
`<div>`s) — do **not** add a second card, so the dashboard keeps its
`lg:grid-cols-2` rhythm with the "Top countries" card it sits beside.

Exact copy and values:

- `CardTitle`: `📄 CV views & downloads` — keeps the existing `FileDown` icon;
  switch to a paired icon (`Eye` + `FileDown`) only if both fit the header
  without wrapping. `Eye` is **already imported** at line 3.
- `CardDescription`: `Inline views vs. downloads · last 14 days`
- Empty state (when both lists are all-zero):
  `No views or downloads recorded yet.` (replaces "No downloads recorded yet.")
- Per track block, the big number stays the **downloads** total (unchanged
  line 419) and a **second** line is added beneath the existing "unique
  downloaders" line (line 421):

  ```
  <div className="num text-2xl font-extrabold">{c.total.toLocaleString()}</div>          // downloads (unchanged)
  <div className="num text-xs text-muted-foreground">{c.unique.toLocaleString()} unique downloaders</div>
  // NEW — view line, e.g.
  <div className="num text-xs text-muted-foreground">
    {v.total.toLocaleString()} views · <Eye className="inline h-3 w-3" /> {v.unique.toLocaleString()} unique viewers
  </div>
  ```

  Labels are exactly **"unique downloaders"** (unchanged) and **"unique viewers"**
  (new), with the view total labelled **"views"**. `v` is the matching entry from
  `data.cvViews` found by `track` — look it up defensively:
  `const v = data.cvViews.find((x) => x.track === c.track) ?? { total: 0, unique: 0, daily: [] };`
  so a missing/stale `cvViews` renders `0 views · 0 unique viewers` instead of
  throwing.
- The existing 14-bar sparkline (lines 422–431) keeps showing **downloads** —
  bar heights must stay comparable to before. **If** a views sparkline is wanted,
  it goes directly under it as a second `.flex h-10` row using the *same* `max`
  scale basis per series, `bg-accent/40` (views) vs the existing
  `bg-primary/80` / `bg-accent/80` (downloads), with `title` text prefixed
  `views — `. Optional; not required for correctness. Do not change the download
  bar colours or the per-track colour mapping.
- The existing "💡 … takes N% of downloads" insight (lines 435–444): **keep it
  computed from downloads only**, and reword the noun to
  `"${lead.track} CV takes ${share}% of downloads — order it first on the site."`
  (already says "downloads"). Do **not** blend views into this percentage, or the
  number stops meaning anything. Optionally add a parallel sentence for views;
  if added, it must be a separate sentence about views, never a mixed share.

#### The reset flow (current: `resetScope` line 81, `handleReset` 85–109, buttons 481–504)

`handleReset`'s `scope` union widens from `"visits" | "cv"` to
`"visits" | "cv" | "cvviews"`, matching `api/visit-reset.ts` §7.6:

```ts
  const [resetScope, setResetScope] = useState<"visits" | "cv" | "cvviews" | null>(null);
  const handleReset = async (scope: "visits" | "cv" | "cvviews") => { /* body unchanged */ };
```

The Danger zone gains a **third** button next to the two existing ones
(lines 482–501). The existing "Reset CV downloads" button is **NOT** repurposed —
its `onClick`, its `resetScope === "cv"` confirm styling, its request body and
its destructive semantics are unchanged, so it keeps clearing downloads only:

| Button | `scope` sent | Confirm label | Idle label |
| --- | --- | --- | --- |
| Reset visits history | `"visits"` | `Click again to confirm visits reset` (unchanged) | `Reset visits history` (unchanged) |
| Reset CV downloads | `"cv"` | `Click again to confirm CV reset` (unchanged) | `Reset CV downloads` (unchanged) |
| **Reset CV views (NEW)** | `"cvviews"` | `Click again to confirm CV views reset` | `Reset CV views` |

The new button copies the existing pattern exactly: `variant={resetScope === "cvviews" ? "destructive" : "outline"}`, `size="sm"`, `disabled={resetBusy}`, `className="rounded-full"`. It shares the single `resetBusy` / `resetMsg` state, so the two-button-confirm window is per-scope and the busy lock is global — same as today.

**Decision (explicit, per the Gate 2 instruction to be unambiguous):** resetting
views is a **separate scope**, not part of the `cv` scope. The alternative —
making `cv` wipe both families — is **rejected** because (a) it silently changes
the meaning of an existing admin action, and (b) it removes the ability to clear
one series while keeping the other, which is precisely what separated counters
were chosen for. `cv` stays downloads-only; `cvviews` is views-only; there is no
combined "reset both" scope. An admin who wants both clears them with two
confirms.

### 7.9 Migration / backfill — views start at zero (honest statement, policy G10)

**There is no backfill. Views start from zero at the moment this ships, and the
dashboard will show that honestly.**

- `v:cvview:*`, `v:cvviewday:*` and `v:cvviewuniq:*` **do not exist** in Redis
  today (verified: the only CV keys written anywhere in `api/` are `v:cv:*`,
  `v:cvday:*`, `v:cvuniq:*` in `download-cv.ts` lines 67–71, and those are the
  only ones `visit-reset.ts` line 22 knows about). Nothing writes the view family
  before deploy, so there is no history to read.
- Historical view counts **cannot be reconstructed.** The download counters
  (`v:cv:*`) are the *only* candidate source, and copying them would be a
  **fabrication**: every past download would be silently re-labelled as a view,
  producing a fake number in an admin dashboard. Per policy **G10** this is
  refused. No script, no one-off `INCRBY`, no seeding.
- Therefore: the first day after deploy, the views card legitimately reads
  `0 views · 0 unique viewers` while the downloads card shows its real all-time
  total. That asymmetry is the **correct** representation of reality, not a bug,
  and must not be "fixed" by seeding.
- The 90-day TTL means the two series also age identically going forward; a view
  recorded today expires on the same schedule as a download recorded today.
- **No Redis schema migration is needed** — these are new keys with no existing
  type to change, no `MIGRATE`, no key rename.
- **Rollout note for the human:** because the `cv` reset scope's globs
  (`v:cv:*`, `v:cvday:*`, `v:cvuniq:*`) deliberately do not match the new family,
  any *pre-existing* download history survives untouched, and any old deployment
  that is still live during a rolling deploy keeps writing `v:cv:*` exactly as
  before. Backward and forward compatible without a flag day.

---

## 8. Error / Empty States

| Situation | What the user sees |
| --- | --- |
| `?track=` absent | Flutter CV, no notice (silent default). |
| `?track=abc` (invalid) | Inline non-blocking notice bar: "We couldn't find that CV track, showing the Flutter CV instead." Rendered above the viewer; URL replaced with `?track=flutter`. |
| Fine-pointer desktop, PDF loads | Embedded viewer fills the content card. |
| Fine-pointer desktop, PDF fails (`onError`) | `<CVFallback reason="load-error">`: "This CV can't be displayed here. Open it in a new tab or download it." + Open PDF + Download. |
| Mobile / coarse pointer | `<CVFallback reason="coarse-pointer">`: "Open or download this CV." + Open PDF + Download (never a broken iframe). |
| Cloudinary unconfigured (endpoint 500) | Same as "PDF fails": fallback actions shown; "Open PDF" surfaces the endpoint's JSON error text in a new tab (no silent dead end). |

---

## 9. Accessibility

- The iframe MUST have a descriptive `title`: ``title={`${CV_CONFIG[track].label} — inline PDF viewer`}``.
- The track switcher reuses Radix `Tabs`: roving tabindex, arrow-key
  navigation, `role="tablist"`, and `aria-selected` come free. Each
  `TabsTrigger` has visible text (`CV_CONFIG[t].label`); no icon-only trigger.
- Fallback actions are real controls. `CVFallback` buttons carry
  `aria-label` naming the track, e.g.
  `aria-label={`Open ${CV_CONFIG[track].label} in a new tab`}` and
  `aria-label={`Download ${CV_CONFIG[track].label}`}`.
- The invalid-track notice uses `role="status"` (polite) so it is announced
  without stealing focus.
- Focus order is: page `<h1>` → track tabs → viewer/fallback → actions →
  back-to-portfolio link. The viewer iframe is focusable via `tabIndex={0}` so
  keyboard users can enter and scroll the PDF embed.
- Reduced motion: `useAnimationContext().reducedMotion` gates the entrance
  variants; `initial={reducedMotion ? "visible" : "hidden"}` exactly as
  `Hero.tsx` does. No motion is required to operate the page.

---

## 10. Performance Constraints (do NOT reintroduce home-page jank)

- **Route-level code-split**: `CVView` is loaded with
  `lazy(() => import("./pages/CVView"))` in `src/App.tsx`, matching the
  `CVDashboard`/`NotFound` convention, wrapped in `<Suspense fallback={null}>`.
  Its chunk (page + `components/cv/*` + Radix Tabs) is fetched only when the
  user navigates to `/cv`, so the home bundle and first paint are untouched.
- **Home page first paint untouched**: the Hero/Navbar additions are inline
  `<Link>`/`Button` (icons already imported from `lucide-react`). No new import
  pulls a heavy module into the entry bundle. `getCVPageUrl` is a pure string
  helper in the already-loaded `@/config/cv`.
- **Do not add** `backdrop-blur-*`, `filter: blur()`, large box-shadow
  transitions, or infinite `animate-*` to the new page. Use `bg-background/95`
  and `radial-gradient()` for any decoration, per the home-page-jank fixes.
- **Motion rules**: transform/opacity only, tween-based variants from
  `animation-variants.ts`, short durations; respect `reducedMotion`.
- **No layout thrash**: the page reads `matchMedia` through
  `useIsMobile()`/`hasFinePointer()` (both read once / cached), never in a
  render loop and never per-scroll.
- **No new vendor chunk**: no `vite.config.ts` change is needed; Radix Tabs is
  already a dependency and lands in the `/cv` async chunk, not the entry.

---

## 11. Security Notes

- **Same-origin inline PDF**: `Content-Disposition: inline` served from our own
  origin is rendered by the browser's PDF viewer. Because the response is
  `application/pdf` (never `text/html`) and we add `X-Content-Type-Options:
  nosniff` (recommended in §7), the bytes cannot be sniffed into a scriptable
  HTML document. This is the reason the nosniff header is worth adding, even
  though it is not strictly required by the feature.
- **Iframe sandboxing**: the PDF embed is same-origin and same-file, so it does
  not need `sandbox` (adding `sandbox` to a PDF embed is unnecessary and can
  break the built-in viewer). It MUST have `title` (§9) and should carry
  `referrerPolicy="no-referrer"` to avoid leaking the referring URL. The
  **"Open PDF"** action opens `_blank` with `rel="noreferrer noopener"`.
- **`X-Frame-Options` / CSP**: neither is currently set anywhere in the repo
  (verified: no `X-Frame-Options`, `Content-Security-Policy`, or `headers`
  block in `vercel.json`/`index.html`). The feature therefore needs **no**
  header relaxation to embed the PDF — same-origin framing is not blocked by a
  `SAMEORIGIN` default because no such default is configured. If a global CSP
  is added later, `frame-src 'self'` and `object-src 'self'` must include the
  same origin for this page to keep working; noted for the security review.
- **No new npm packages** → no new supply-chain surface. Zero-dependency by
  design.
- **No user-controlled redirect**: `track` is clamped to a closed union before
  it reaches any URL, so `?track=` cannot be used to steer the iframe or the
  fetch to an arbitrary destination. `mode` is likewise clamped to a boolean
  (`=== "view"`).
- **Analytics**: the existing SHA-1-hashed-IP `pfadd` visitor logic is unchanged
  in mechanism; it now targets the `cvview` family for views and the `cv` family
  for downloads (§7.4). The new `/cv` route adds no *additional* tracking: the
  iframe load is the single counted request. The hash is written into a
  HyperLogLog and is never returned by any endpoint — `visit-stats.ts` only ever
  reads back aggregate `PFCOUNT` integers.
- **New keys, no new exposure**: `GET /api/visit-stats` stays `ADMIN_PIN`-gated
  (401 without the bearer PIN, line 82) and the new `cvViews` field carries two
  integers and a 14-element integer series per track — no identifiers, no IPs, no
  per-visitor data. The `/cv` page itself is public by design (it must be, to be
  shareable); the PDF was already publicly downloadable.
- **`api/visit-reset.ts` scope separation is a security-relevant invariant**, not
  just an analytics one: the `cv` and `cvviews` scopes must never share a glob
  (§7.6). A mistake there would let an admin action delete the wrong counter
  family. The patterns are specified literally and the two families share no key
  prefix.

---

## 12. Native Permissions / DB Migrations / Env

Adapting the Flutter spec sections to this web project:

- **Native permissions**: N/A (web app, no AndroidManifest/Info.plist).
- **Local DB & migrations**: N/A for the client (no client database). Redis
  gains **three new keys per track** (`v:cvview:*`, `v:cvviewday:*`,
  `v:cvviewuniq:*`, §7.4). There is **no schema migration and no backfill**: the
  keys are new, nothing writes them before deploy, and historical views are
  unreconstructible (§7.9). Views start at zero on deploy, honestly.
- **Environment configuration**: **no new keys.** The page reuses
  `VITE_CLOUDINARY_CLOUD_NAME` (client) and the server's
  `CLOUDINARY_CLOUD_NAME`/`VITE_CLOUDINARY_CLOUD_NAME` +
  `UPSTASH_REDIS_REST_URL`/`_TOKEN` (or `KV_REST_API_*`) — the same Redis
  credentials already used by `download-cv.ts`, `visit-stats.ts` and
  `visit-reset.ts`. No `.env.example` change.

---

## 12b. NEW Risks Introduced by the Separated-Counter Scope

REVISION 2 grew the write surface from 11 files to 16. These are the new risks,
ranked.

1. **Wrong-family reset (HIGH — the reason §7.6 is written out longhand).**
   `api/visit-reset.ts` is the only destructive path that touches these keys. The
   danger is a future/lazy edit that widens `cv` to `v:cvview*` "to include
   views", or a glob typo like `v:cv*` which **would** match both families and
   wipe everything in one confirm. Mitigation: the two scopes are specified as
   literal, non-overlapping patterns; `cv` is explicitly documented as
   downloads-only and the new scope is a *separate* button rather than a
   widened one. Verified invariant: no pattern in `cv` matches any `v:cvview*`
   key and vice versa.
2. **Stale-client / stale-server skew (MEDIUM).** The admin bundle and the
   serverless function deploy together on Vercel, but a browser can hold an old
   bundle in cache, and `/api/visit-stats` responses are cached by TanStack Query
   for `staleTime: 60_000` + `refetchInterval: 60_000`. If the client has
   `cvViews` but the server predates the revision, `json.cvViews` is `undefined`.
   Mitigation: `cvViews?:` optional in `StatsResponse` and `?? []` in
   `mapStatsResponse`, plus a per-track `?? { total: 0, unique: 0, daily: [] }`
   lookup in the card. Nothing throws.
3. **View over-counting from ranged PDF requests (MEDIUM).** Inline viewing is
   more likely than a download to trigger follow-up `Range:` requests, each of
   which can `INCR` `v:cvview:*` again, drifting the new number above the true
   figure. Mitigation: the optional `range` guard in §7.5. If omitted, the number
   is a reach *proxy* (as the download number already is) and must be read as
   such — it is not an exact count either way.
4. **Two counters that can legitimately disagree (LOW, by design).** After this
   ship, `views ≠ downloads` and either can exceed the other — a recruiter may
   view and never download, or hard-download from a direct link without ever
   visiting `/cv`. The dashboard copy must not imply one is a subset of the
   other (it does not: two separate lines, two separate labels).
5. **Historical asymmetry (LOW, unavoidable).** Downloads show real all-time
   history; views show zero until the first post-deploy view. Anyone reading the
   dashboard the week after launch could misread this as broken tracking.
   Mitigation: §7.9 is the canonical explanation; the empty state text says
   "No views or downloads recorded yet." and the views line renders honest zeros
   rather than hiding the field.
6. **Six extra files in scope (LOW process risk).** `visit-stats.ts`,
   `visit-reset.ts`, `AnalyticsSection.tsx`, `use-visits-analytics.ts` and
   `lib/analytics.ts` were not in the original authorized write scope. They are
   now listed in `feature-files.json` (16 entries) so no implementer edits them
   without authorization. The extra edits are additive; no existing export is
   renamed or removed.

---

- [ ] `api/download-cv.ts` honours `mode=view` → `inline`, default unchanged.
- [ ] View counting writes **only** `v:cvview:*` / `v:cvviewday:*` /
      `v:cvviewuniq:*`; download counting writes **only** `v:cv:*` /
      `v:cvday:*` / `v:cvuniq:*`. No cross-writes in either direction (§7.5).
- [ ] The 90-day TTL is applied to both new day/uniq keys, matching the existing
      `90 * 24 * 60 * 60` values.
- [ ] `api/visit-stats.ts` returns the new additive `cvViews` field in the same
      shape as `cv`; `cv` is untouched; a payload without `cvViews` still renders
      (stale-client guard).
- [ ] `api/visit-reset.ts` accepts `scope: "cvviews"` and the `cv` scope still
      deletes downloads only. Verified: resetting `cv` leaves `v:cvview:*`
      intact, and resetting `cvviews` leaves `v:cv:*` intact.
- [ ] `src/lib/analytics.ts` + `src/hooks/use-visits-analytics.ts` carry
      `cvViews` through with a safe default.
- [ ] `AnalyticsSection` card shows views and downloads side by side with the
      labels "unique downloaders" / "unique viewers"; the third reset button
      ("Reset CV views") exists with a two-click confirm.
- [ ] `/cv` route declared before `*`; cold direct visit renders the page.
- [ ] `?track` parsed/validated with `flutter` default; invalid shows a notice
      and normalizes the URL.
- [ ] iframe src is `getCVViewUrl(track)`; iframe has `title`.
- [ ] Mobile/coarse-pointer branch renders `CVFallback`, never a broken embed.
- [ ] Hero + Navbar (desktop AND mobile menu) gain "Read CV" without altering
      either existing download path.
- [ ] `vercel.json` `source` is exactly `/((?!api/).*)`; `/api/download-cv`
      still resolves and `/cv` still rewrites to `/index.html`.
- [ ] `/cv` ships as its own lazy chunk; no entry-bundle growth.
- [ ] Zero new npm dependencies.
- [ ] No backfill/seeding was performed; views legitimately start at zero (§7.9).
- [ ] `npx eslint src --ext .ts,.tsx` clean on touched files; `npm run build` passes.

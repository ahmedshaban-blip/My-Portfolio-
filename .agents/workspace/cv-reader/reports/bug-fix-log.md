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

## Iteration 3 — "Read CV" dropdown → open in new tab (user request)

The user asked for **Read CV to open a dropdown** to choose Flutter / Frontend,
then open the chosen CV **in a new tab** (the same behaviour the mobile fallback
already had), instead of navigating to the `/cv` page.

### Fixed: entry-bundle regression from Radix `DropdownMenu`
The first implementation reused `@radix-ui/react-dropdown-menu`, which is not
used anywhere in the entry path today. Measured: the entry chunk jumped
**108 371 B → 193 190 B raw (+84.8 kB, ~ +27 kB gzip)** — a first-paint
regression on the home page this feature must never cause.

Replaced with a hand-rolled menu (`CVReadMenu.tsx`) matching the codebase's
existing navbar-menu pattern: `role="menu"` / `role="menuitem"`,
`aria-haspopup` + `aria-expanded`, Escape closes and restores focus, ArrowUp/Down
cycle items, click-away dismisses, reduced-motion-aware entrance. Measured cost:
**111 305 B raw (+2.93 kB vs. pre-dropdown, ~29× cheaper than the Radix
version)**.

### Changed
- `src/components/cv/CVReadMenu.tsx` (new) — the dropdown; picking a track calls
  `openCV(track)` → `window.open("/api/download-cv?track=<t>&mode=view",
  "_blank", "noopener,noreferrer")`, i.e. the same inline endpoint the `/cv`
  viewer uses. Optionally calls `onOpened` so the mobile menu closes.
- `src/lib/cv-link.ts` — now the entry-safe actions module: `getCVViewUrl` +
  `openCV` (Hero/Navbar need them). The unused `getCVPageUrl` was removed.
- `src/lib/cv-view.ts` — now strictly page-only: `CV_TRACKS`,
  `DEFAULT_CV_TRACK`, `isCVTrack`, `parseCVTrack`.
- `CVViewer`/`CVFallback` import `getCVViewUrl`/`openCV` from `@/lib/cv-link`.
- `Hero.tsx` + `Navbar.tsx` (desktop **and** mobile menu) render `<CVReadMenu/>`;
  the mobile one passes `onOpened={() => setIsOpen(false)}`.
- The `/cv` page is unchanged and remains reachable by its shareable URL.

### Verified live (built preview :4177, viewport 702px)
- Desktop navbar trigger: menu opens (`aria-haspopup="menu"`, 2 items with the
  "Opens in a new tab" hint); picking Flutter fired
  `window.open("/api/download-cv?track=flutter&mode=view","_blank","noopener,noreferrer")`
  and the menu closed.
- Hero trigger: same; picking Frontend fired the `track=frontend&mode=view` URL.
- Escape closed the open menu.
- Mobile menu: Read CV opened the dropdown inside it, picking Flutter fired the
  same `window.open`, and the mobile menu closed afterwards.
- `/cv?track=flutter` still renders (h1 + both tabs); home console: 0 errors.

## Iteration 4 — Hero "CV actions" rearrangement (desktop only, user request)

The user flagged the Hero CV group (`Read CV / Flutter CV / Frontend CV`) as
visually unbalanced on desktop and asked for a desktop-only rearrangement.

**Root cause of the ugliness (measured at 1112px):** two heavy `h-14` outline
pills followed by a small underlined text link — three actions of mismatched
size and weight in one row, with the two *download* actions separated by the
*read* action.

**New desktop arrangement (sm+):**
```
[ Read CV ▾ ]   │   [ ⬇ Flutter CV ·RECOMMENDED· ]  [ ⬇ Frontend CV ]
```
- a desktop-only hairline divider (`hidden sm:block h-10 w-px`) splits "read"
  from the "download" pair, so the two downloads read as one family;
- the Frontend CV link is promoted to a matching pill on desktop
  (`sm:h-14 sm:rounded-full sm:border`) while mobile keeps its quiet text link;
- all three pills are `h-14` with a uniform 14px label — measured in the live
  DOM: `56px/56px/56px`, one row at the same y, divider visible.

**Mobile untouched:** still stacked Read CV → Flutter CV → Frontend CV (text
link) → caption; the divider is display:none below `sm`.

### Fixed while verifying: the dropdown trigger ignored consumer size classes
The CVReadMenu `Button` had a hardcoded
`className="w-full rounded-full border-border/60"` — the `className` prop was
applied to the wrapper `div` instead, so `h-12 sm:h-14 px-6` never reached the
trigger. Measured in the live DOM: "Read CV" rendered **40px tall beside
56px siblings** — worse than the original complaint. Fixed by merging
`className` into the Button (`cn("w-full rounded-full border-border/60",
className)`) and keeping the wrapper a fixed `relative` box. Re-measured: trigger
56px, same row. Regression-guarded in `verify-cvview-branch.mjs` (3 new checks).

## Iteration 5 — one CV dropdown, zero clutter (user request)

The user still found the hero CV row crowded ("مش عاوز الزحمة دي") and chose
the "everything in one dropdown" option: a single `[CV ▾]` pill that holds
both actions for both tracks.

**Resulting layout** (measured live at 1112px): the hero CTA area is now
`[ View Projects ]  [ CV ▾ ]` — two pills, both 56px, **0 stray CV buttons**
(previously 4). The navbar desktop row dropped from 3 CV controls to 1, and the
mobile menu from 3 to 1 (its caption now explains read vs download).

**The menu** — two labelled groups, four items:

```
FLUTTER DEVELOPER CV
  ↗ Read in a new tab   (no download)
  ⬇ Download PDF
FRONTEND DEVELOPER CV
  ↗ Read in a new tab   (no download)
  ⬇ Download PDF
```

Keyboard semantics unchanged (role=menu/menuitem, Escape refocuses, Arrow
cycling, click-away), reduced-motion aware, and still hand-rolled — zero new
dependencies.

**Verified live** (built preview, user's 1112px tab):
- hero buttons: `[View Projects 56px] [CV 56px]`, downloads count = 0;
- menu groups: "Flutter Developer CV" / "Frontend Developer CV" with 4 items;
- Read → Frontend fired `window.open("/api/download-cv?track=frontend&mode=view",
  "_blank", "noopener,noreferrer")`;
- Download → Flutter created an anchor with `download="Ahmed_Shaban_Flutter_CV.pdf"`
  pointing at `/api/download-cv?track=flutter` — the Cloudinary HEAD probe
  succeeded, so the **counted API download URL** is used, not the local fallback
  (earlier empty capture was a harness timing race against that probe);
- `/cv` unchanged; contract + branch harnesses green; entry chunk **109 798 B**
  (slightly below the previous 111 305 B — removing two pills outweighed the
  download wiring).

**Scope note:** the mobile menu and desktop navbar were given the same single-
menu treatment so read/download stay consistent everywhere; the `cv` counters,
reset scopes, and the `/cv` shareable page are untouched.

## Iteration 6 — the dropdown was clipped (user: "في جزء من ال Dropdown menu مقصوص")

**Root cause (found, not guessed):** `src/components/Hero.tsx` rendered
`<section id="home" … overflow-hidden>` — a leftover from the gradient orbs
(`top-[-10%] left-[-10%]`), which cropped any affordance opening past the
hero's bottom edge. The CV menu opens downward from a CTA row that sits near
the fold, so its lower part (the Frontend group) was cut off.

**Fix — two layers:**
1. *Structural:* the orbs + gradient overlay moved into their own
   `absolute inset-0 overflow-hidden pointer-events-none` wrapper, and the
   section is now `overflow-visible`. The decoration keeps its original
   clipping; real UI is never cropped again. Verified no horizontal scrollbar
   appears (orbs still contained) with the menu open at 574px.
2. *Behavioural:* the menu now measures the viewport on open
   (`useLayoutEffect`) and flips **above** the trigger when there is more room
   above than below (`bottom-[calc(100%+0.5rem)]`, with the entrance animation
   direction matching). Reset on close so the next open re-measures.

**Verified live** (user's tab, 574×678 — a size where trimming is most likely):
- hero `overflow === "visible"`; menu opened with all 4 items;
- menu rect 419→638 — fully inside the viewport; a probe pixel at the menu's
  bottom edge resolves to menu content (`bottomEdgeHitsMenu: true`), which is
  impossible while clipped;
- `scrollWidth 565 ≤ innerWidth 574` with the menu open — no h-scrollbar;
- Escape closes and returns focus to the trigger.

Guarded in `verify-cvview-branch.mjs`: hero must not carry `overflow-hidden`,
orbs must live in the clipping wrapper, menu must contain the drop-up logic.

## Iteration 7 — the two CV sections must be recognizable at a glance

The user pointed at the two muted uppercase labels ("FLUTTER DEVELOPER CV" /
"FRONTEND DEVELOPER CV") and the bare "CV" trigger: both needed to *show* the
two sections instantly.

**In the menu** — each group header is now a real section marker instead of a
look-alike muted line:
- a tinted icon chip in the track's colour: Flutter = `Smartphone` on
  `primary` tint, Frontend = `Globe` on `accent` tint;
- the label promoted from 11px muted to 11px bold `text-foreground`;
- a right-aligned role chip ("Mobile" / "Web") in the same tint;
- the divider between groups tightened (`mt-1.5 border-t`). Headers are
  `aria-hidden` — screen readers announce the group's `aria-label`, avoiding a
  double read.

**On the trigger** — a `chips` prop renders two mini track chips inside the pill:
`[ CV  (Flutter) (Frontend) ▾ ]`, tinted to match the menu sections, so the
who-choice is visible without opening anything. Applied to the Hero and the
mobile menu (where the full-width pill has room); the compact navbar keeps the
plain "CV" label.

**Verified live** (user's tab): trigger text reads `CV Flutter Frontend`; both
headers carry visible tinted icons ("primary" / "accent") with the "Mobile" /
"Web" hints, 4 items, menu inside the viewport; console clean.

## Iteration 8 — trigger hover hid the chips (user: "اللون مش مناسب عند hover وكلمات مش ظاهرة")

The outline variant's default hover is `hover:bg-accent hover:text-accent-
foreground` — an **orange** fill. On it: the accent-tinted *Frontend* chip
(accent text on accent fill) vanished entirely and the *Flutter* chip lost its
contrast (screenshot confirmed the Frontend chip unreadable).

**Fix (`CVReadMenu` trigger):** explicit neutral hover
(`hover:bg-secondary/60 hover:text-foreground`) plus a persistent "open" state
(`bg-secondary/60 text-foreground border-primary/40`) so the control reads as
active while its menu shows. `tailwind-merge` drops the variant's orange hover
from the final class list — verified in the live DOM:
`hover:bg-accent: false`, `hover:text-accent-foreground: false`,
`hover:bg-secondary/60: true`.

Chip readability math on the new fill: Frontend chip text `oklch(0.76 0.11 72)`
over `secondary/60` (`oklch(0.27 …)` dark fill) — the same-hue-on-same-hue
collision is gone.

Verified live: classes as above on the rendered trigger (hero + mobile menu —
same component), zero console errors. Harness extended with three guards:
neutral hover present, orange hover absent, persistent open-state classes, and
the corrected consumer-className merge check (the multi-line `cn` rewrite had
outdated one regex).

## Notes / limitations

- **No automated test runner exists in this repo** (no `test` script, no
  vitest/jest config, no `*.test.*`/`*.spec.*` files), so TASK-12 is manual
  verification only. No suite was invented and none was weakened.
- The Redis keys are **empty on first deploy**: historical visits have no view
  data and none can be reconstructed without fabricating numbers, so the new
  card honestly starts at zero.

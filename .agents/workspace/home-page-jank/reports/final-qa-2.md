# Final QA Re-Verification Report: Home Page First-Load Jank (`home-page-jank`)

Scope: RE-VERIFICATION round on the now-stable working tree (HEAD = `ea1224f`, "Update Design colors", with the perf fix set modified and uncommitted). Read-only review. Prior audit: `.agents/workspace/home-page-jank/reports/final-qa.md`. This agent modified no source, test, or config file; only this report was written.

Method: direct source reading of the 8 named files plus targeted greps for removed symbols, callers, and anchor wiring. No browser attached. MEASURED: nothing at runtime this round. NOT MEASURED: LCP / CLS / INP, real anchor landing positions, deep-link behaviour in a browser. All claims below are derived from the named code path only; anything I could not confirm by reading code is labelled UNVERIFIED.

## 1. Verdict

- Verdict: PASS WITH NOTES. QA-01, QA-02, QA-03, QA-04, QA-05, QA-06, QA-07 are FIXED in the current tree. QA-08 was not re-read this round (OUT OF SCOPE). QA-09 is STILL PRESENT (intentional). One new Low-severity bug found (NEW-01).
- The QA-02 fix is real and present but introduces the specific edge cases asked about, see section 3; they are bounded and Low, not blockers.

## 2. Per-Finding Re-Verification (QA-01 .. QA-09)

| ID | Prior status | Current status | Evidence |
| :--- | :--- | :--- | :--- |
| QA-01 | FIXED in tree | FIXED | see below |
| QA-02 | OPEN (Medium) | FIXED (with bounded caveats) | see below |
| QA-03 | OPEN (Medium) | FIXED | see below |
| QA-04 | OPEN (Low) | FIXED (partially verified) | see below |
| QA-05 | OPEN (Low) | FIXED | see below |
| QA-06 | OPEN (Low) | FIXED | see below |
| QA-07 | OPEN (partly) | FIXED | see below |
| QA-08 | OPEN (Low) | NOT VERIFIED / OUT OF SCOPE | `use-scrollspy.ts` not in required read list; not re-read. UNVERIFIED. |
| QA-09 | OPEN (Info) | STILL PRESENT (intentional) | see below |

### QA-01, deep link `?project=slug` to FIXED

`src/pages/Index.tsx:137-138` computes `projectDeepLink` from `window.location.search`, and `:150` passes it into `forceMount`:

    const projectDeepLink =
      typeof window !== "undefined" && new URLSearchParams(window.location.search).has("project");
    ...
    <BelowFold id="projects" minHeight="120vh" forceMount={projectDeepLink}>

`BelowFold` seeds `useState` from it at `:35-40`:

    const [mounted, setMounted] = useState(
      forceMount ||
        (typeof window !== "undefined" && window.location.hash === `#${id}`)
    );

Because `mounted` is `true` on the first render for the `#projects` node, `Projects` mounts immediately, so its `useState` initializers at `src/components/Projects.tsx:1039-1050` read `searchParams` on first render and open the lightbox. This is the claim, and it holds by code reading. UNVERIFIED in a browser, but the mount is unconditional for the deep-link case, no IO/height dependency remains.

### QA-02, smooth-scroll anchor drift to FIXED (with bounded caveats, see section 3)

`src/pages/Index.tsx:70-86` adds the navigation-intent mount + re-assert:

    useEffect(() => {
      const anchor = `#${id}`;
      const onClick = (event: MouseEvent) => {
        const target = (event.target as HTMLElement | null)?.closest?.(`a[href="${anchor}"]`);
        if (!target) return;
        setMounted(true);
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduceMotion) return;
        window.setTimeout(() => {
          document.getElementById(id)?.scrollIntoView({ behavior: "auto", block: "start" });
        }, 700);
      };
      document.addEventListener("click", onClick, true);
      return () => document.removeEventListener("click", onClick, true);
    }, [id]);

This matches the prior report recommendation: capture-phase listener, `setMounted(true)` on nav-link intent, re-assert `scrollIntoView({behavior:"auto"})` after 700ms, and skip the re-assert under reduced motion (where `index.css:160-162,181` forces `scroll-behavior: auto`, so the browser already lands correctly).

The three specific concerns raised for this round are addressed in section 3. Net: the primary drift (destination computed from placeholder heights) is resolved because the section is mounted at click time before the browser computes the jump. Caveats exist but are Low.

### QA-03, background rAF loop death on `document.hidden` to FIXED

`src/components/animations/AnimatedBackground.tsx:214-222`:

    const draw = (timestamp: number) => {
      rafId = 0;
      if (document.hidden) {
        schedule();
        return;
      }
      ...

It now re-schedules instead of returning, exactly the prescribed fix. `schedule()` (`:164-167`) guards on `stopped || rafId`, and `draw` zeroes `rafId` before re-scheduling at `:215`, so no double-chain. The scroll-pause (`:234-237`) and throttle (`:226-229`) early-returns also re-schedule. `handleVisibilityChange` (`:297-304`) still only flips `isAnimatingRef` + resets `lastFrameTimeRef`; that is now safe because the chain never dies.

### QA-04, zero-`id` window during chunk fetch to FIXED (partially verified)

`src/pages/Index.tsx:88-96`. The mount flip keeps the id reachable because the wrapper only drops the id when `mounted` is true, and when mounted the real `<section id="...">` supplies the id:

    <div ref={hostRef} id={mounted ? undefined : id} style={mounted ? undefined : { minHeight }}>
      {mounted && <Suspense fallback={<div style={{ minHeight }} aria-hidden="true" />}>{children}</Suspense>}
    </div>

Note: the prior recommendation was to put `id={id}` on the fallback; the landed implementation instead relies on the child `<section>` owning the id once mounted. I confirmed the deferred child `Projects` declares its own id at `Projects.tsx:1160` (`<section id="projects">`). Caveat: I did NOT read About/Skills/Experience/Contact/Footer this round, so I could NOT verify by reading that all five carry matching ids on their root `<section>`. If any child lacks the id, there is still a zero-id window for that section. Labeled PARTIALLY VERIFIED; QA-04 is fixed for `#projects` (confirmed), the other four are assumed by symmetry, not verified. This is the one item where the `id`-on-fallback approach would have been strictly safer.

### QA-05, zoom anchoring before first `measure()` to FIXED

`src/components/Projects.tsx:511-515` adds `ensureMeasured`, and `zoomAt` calls it at `:552`:

    const ensureMeasured = useCallback(() => {
      if (metrics.current.imgW === 0 || metrics.current.width === 0) measure();
      return metrics.current;
    }, [measure]);
    ...
    const r = ensureMeasured();   // line 552, inside zoomAt

And `:670-673` warms the cache via rAF:

    useEffect(() => {
      const raf = requestAnimationFrame(measure);
      return () => cancelAnimationFrame(raf);
    }, [measure]);

`onLoad={measure}` is still present at `:801`, and `onStagePointerDown` still calls `measure()` at `:583`. So a wheel/pinch before load now measures lazily and anchors around the real stage centre. FIXED.

### QA-06, analytics loss on short bounce to FIXED

`src/hooks/use-visit-tracker.ts:36` lowers the fallback to 800ms (`window.setTimeout(fn, 800)`), and `:148-161` adds a `pagehide` flush behind the `sent` flag:

    const onPageHide = () => {
      flushEngagement();
      if (!sent.current && pendingHit.current) {
        sent.current = true;
        try {
          const blob = new Blob([pendingHit.current], { type: "application/json" });
          navigator.sendBeacon?.("/api/track-visit", blob);
        } catch { /* ... */ }
      }
    };

`pendingHit` is set at `:213` alongside `sent.current = false`, and cleared at `:218` when the idle callback fires. This matches the recommended fix. FIXED.

### QA-07, dead code / doc drift to FIXED

- `magneticTransition`: removed. `src/lib/animation-variants.ts:166-167` is now only a comment documenting the removal; grep finds no `export const magneticTransition` and no consumer.
- `EAGER_COVER_COUNT` / `priority` indirection: removed. Grep for `EAGER_COVER_COUNT` matches only the two report artifacts (`.agents/...`), not source. The cover path uses `eager` (a real prop with the default `false`, `Projects.tsx:53,58`) plus `fetchPriority` (`:136`).
- `HoverCard.tsx:16` now routes through `hasFinePointer()`, no per-render `matchMedia`.

All three sub-parts resolved. FIXED.

### QA-09, `rootMargin: "900px 0px"` larger than needed to STILL PRESENT (intentional)

`src/pages/Index.tsx:58` is unchanged: `{ rootMargin: "900px 0px" }`. The task states QA-09 was intentionally not changed, and the code confirms it. Also note `minHeight` values: `#about`/`#skills` = `60vh` (`:144,147`), differing from the prior report arithmetic which assumed larger placeholders, but that does not change the conclusion that `#about` and `#skills` still mount during the hero window on most viewports. STILL PRESENT, as intended.

## 3. Answers to the Three Specific Questions

### Q1. Can the QA-02 click listener double-fire or leak, and can its 700ms `scrollIntoView` fight the user scrolling?

Double-fire: NO across sections, but YES for duplicate anchors to one section.
Each `BelowFold` registers exactly one listener per `id` in its own effect (`Index.tsx:70-86`), keyed on `[id]`. There are six distinct ids, six distinct listeners. For a single nav click, only the listener whose `anchor` matches the clicked link passes the `closest()` check (`:73-74`), so exactly one `scrollIntoView` is scheduled. No cross-section double-fire.

However, the handler is a capture-phase listener on `document` matched purely by CSS selector `a[href="#<id>"]`. Any element that renders such an anchor, not just the Navbar, will trigger `setMounted(true)` + the 700ms re-assert. Two concrete exposures:
- The Hero does not use anchor hrefs (it uses `onClick={() => scrollToSection("projects")}`, `Hero.tsx:158`), so it is unaffected.
- Any future duplicate `a[href="#projects"]` (e.g. a footer nav, an in-card "see projects" link, or the same anchor clicked twice in quick succession) will schedule multiple independent 700ms timeouts. The listener effect does not cancel a previously scheduled timeout, because the timeout handle is a local that is never stored. So rapidly clicking `#projects` three times schedules three queued `scrollIntoView` calls at t+700, t+700+d, t+700+2d. That is NEW-01 below.

Leak: NO. The effect returns `document.removeEventListener("click", onClick, true)` (`:85`) with matching `id` and capture flag, and `[id]` is a stable string, so the listener is registered once and removed on unmount. The only uncleaned resource is the `setTimeout` handle (see NEW-01): if the component unmounts inside the 700ms window, the timeout still fires and calls `document.getElementById(id)?.scrollIntoView(...)`. For an unmounted section `getElementById` returns `null` and the optional chain makes it a no-op, so no throw and no DOM write; the leak is only a pending timer.

Fighting the user scroll: YES, a narrow but real window. The 700ms `scrollIntoView({behavior:"auto", block:"start"})` is unconditional once scheduled (no "did the user start scrolling?" guard, no `scrollend` canceller). If the user clicks a nav link and then immediately starts wheel/drag scrolling within those 700ms, the timer will yank the viewport back to the section top. For `#experience`/`#contact` (the long scrolls) 700ms can elapse before the smooth scroll even finishes, and a user who grabs the wheel mid-flight gets overridden. Magnitude: one forced jump, low frequency. This is a UX wart, not a correctness bug, and is the direct trade of the recommended fix (the fix text literally says "re-assert"). Recommended hardening (not landed): store and `clearTimeout` the handle, cancel on `wheel`/`touchstart`/`pointerdown`, and/or use `scrollend`.

### Q2. Is `location.hash` read in the `useState` initializer safe for SSR/hydration?

Safe as written, for this app actual usage. `Index.tsx:39` guards with `typeof window !== "undefined"`. This is a Vite SPA (`BrowserRouter`, mounts to `#root`); there is no SSR, so there is no server render to mismatch against. The `typeof window` guard is therefore belt-and-braces, not load-bearing. Same guard pattern at `:138` for `URLSearchParams(window.location.search)`.

Two theoretical notes, neither a current bug:
- If this were ever server-rendered, the initializer would produce `false` on the server and a possibly-`true` value on the client during hydration, which WOULD be a hydration mismatch for the `mounted` subtree. The pattern is SSR-hostile even though the guard makes it SSR-safe (it prevents the throw, not the mismatch). If SSR is ever added, this must move into an effect or a `useSyncExternalStore`.
- The hash is read once at initial mount. A client-side hash change after mount (e.g. a same-page link typed into the address bar, or a programmatic `location.hash` write) will NOT re-seed `mounted`. `BelowFold` has no `hashchange` listener. For deep links this is fine (the browser loads the URL once), but a same-page `#experience` typed into the address bar after load will not force-mount that section; it relies on the QA-02 click listener or the IO. Low impact. Labeled UNVERIFIED for exact `hashchange` behaviour (not tested at runtime).

Verdict: safe for SSR/hydration in the current SPA. No fix required now.

### Q3. Did removing `EAGER_COVER_COUNT` / the `priority` prop leave dead code or break any caller?

No dead code, no broken callers.
- `EAGER_COVER_COUNT`: zero source references (grep hits only the two report files). Fully removed.
- `priority` on `ProjectImage`: gone from the prop type (`Projects.tsx:49-59`) and from every call site (`:183`, `:919`, `:978`). Replacements (`eager` default `false`, `fetchPriority`) are self-consistent: `eager` is optional with a default, so all three call sites compile without passing it. A stale `priority={...}` prop passed to a component that no longer declares it would be a TS excess-property error for explicit JSX attributes; none exist.
- The remaining `loading="eager"` / `fetchPriority="high"` literals are legitimate: `Projects.tsx:393-394` (the inline viewer active image, intentionally eager) and `Hero.tsx:270` (LCP hero image). These are not the removed indirection.
- `magneticTransition`: no remaining import (grep clean); `animation-variants.ts` still exports everything else unchanged.

No `noUnusedLocals` gate is enabled (per prior report), so a future re-introduction of an unused symbol would not be caught, but as of this snapshot the tree is clean.

## 4. New Bug Found This Round

### NEW-01, QA-02 re-assert timer is neither cancellable nor user-interruptible (Low)
`src/pages/Index.tsx:80-82`. The `window.setTimeout(...)` handle is never stored, so:
1. Repeated clicks on the same-section anchor schedule multiple pending 700ms `scrollIntoView` calls (duplicate-anchor double-fire, see Q1). Last-writer wins, but each fires.
2. The timer is not cancelled on unmount or on user scroll input, so it can override a user who starts scrolling within 700ms, and it survives the component unmount (harmless no-op via `?.`).
Suggested: keep a `useRef<number>` handle, `clearTimeout` it at the start of `onClick` and in the effect cleanup, and add a `{ once: true }` `wheel`/`touchstart`/`pointerdown` canceller.

Not present in the prior final-qa.md finding list; introduced by the QA-02 fix.

## 5. Items I Could NOT Verify by Reading Code (explicitly labelled)

- QA-04 for `#about` / `#skills` / `#experience` / `#contact` / `#footer`: I only confirmed `<section id="projects">` (`Projects.tsx:1160`). The other five child components were outside the required read list; if any lacks the matching id on its root, the zero-id window persists for that anchor. PARTIALLY VERIFIED.
- QA-08 (`use-scrollspy.ts` 200ms debounce): file not re-read this round. UNVERIFIED.
- All runtime claims (anchor landing positions, deep-link opening in a browser, rAF survival across a real `visibilitychange`, analytics POST delivery): code-path analysis only, no browser attached. UNVERIFIED.
- `index.css` reduced-motion behaviour used to justify the QA-02 early-return: read at `:154-183`, confirmed `scroll-behavior: auto !important` under both `html.reduced-motion` and `@media (prefers-reduced-motion: reduce)`. VERIFIED.

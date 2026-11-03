# Context Pack: Home Page First-Load Jank (home-page-jank)

## Executive Architectural Summary
- **Selected Path**: Path B (existing UI, behaviour-preserving).
- **Problem**: dropped frames / jank while opening the site (first paint, hero
  entrance, first scroll, section mounts, first interactions).
- **Approach**: remove work from the critical path and from the compositor —
  no redesign, no package changes, no URL/animation contract changes.

## Approved Changes & Contracts
- **Below-fold mounting**: sections now mount when the placeholder is within
  900 px of the viewport; the wrapper carries the section id until mount, so
  `#about…#contact` anchors keep working.
- **Theme**: pre-paint inline script in `index.html` (storage key `theme`,
  values `light|dark|system`) — must stay in sync with `next-themes`.
- **Background**: canvas keeps the same visual (mesh + 5 floating snippets),
  mesh rasterized at half resolution, DPR capped at 1.5, loop starts after 350 ms.
- **Sections**: `pages/Index.tsx` is `memo`ised — anything that must react to a
  router change has to live inside a component that reads the router itself.
- **Approved Packages**: none added, none removed.

## Active Findings & Open Issues
- `src/integrations/supabase/client.ts` imports `@supabase/supabase-js`, which is
  not in `package.json` (pre-existing; breaks `tsc` only, the app never imports
  that file).
- Real FPS / dropped-frame numbers are NOT MEASURED: the automation browser tab
  is occluded on this host (`requestAnimationFrame` never fires), so only
  main-thread trace metrics and build sizes are objective.

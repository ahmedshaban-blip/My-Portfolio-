# Mobile card: square cover leaves a dead band on desktop

**Status: fixed** in `src/components/Projects.tsx` (`ProjectCard`).

## Summary

On the desktop grid, a mobile project whose cover is square (`enjez-mobile`,
1280×1280) rendered its media panel at a fixed 224×224, while the card itself
grew to ~400px tall to fit the copy beside it. The cover did not fill the card's
height, leaving a **~176px dead band** under it.

## Measured before (desktop, viewport 1043×678)

| Box | Size |
| --- | --- |
| Card | 489 × 400 |
| Media panel | 224 × 224 |
| Cover image | 223 × 223 |
| Dead band under panel | **176** |

The panel's `aspect-ratio: 1280 / 1280` combined with `sm:w-56` (224px) fixed
its height at 224px. The card is a `sm:flex-row`, so its height came from the
taller `CardHeader` at ~400px, and `self-start` stopped the panel from
stretching.

Only square covers showed it: portrait covers are 9:16, so at `sm:w-56` their
panel was ~398px tall and happened to match the card.

## Cause

Three things had to agree, and none of them did:

1. The panel kept its own `aspect-ratio` at `sm+` instead of taking the row's
   height.
2. The media `<button>` inside was `items-center` with no `flex-1`, so it did
   not claim the panel's leftover height.
3. The inner `ProjectImage` set `[&_img]:object-contain`, which sat closer to
   the `<img>` than the plate's rule and won — so a square source stayed 1:1
   even once the panel was full height.

## Fix

- The panel keeps its source ratio **only while stacked** (phone widths), via a
  `--media-aspect` CSS variable on `aspect-[var(--media-aspect)]`. From `sm` up,
  `sm:aspect-auto` + `sm:h-auto` + `sm:self-stretch` let the row set its height.
- The media button gained `flex-1` and `items-stretch`, so it fills the panel.
- The cover is `object-contain` while stacked and `object-cover` on `sm+`, so it
  fills the full-height panel at any source ratio. Both the `selected` and
  default branches use the same classes.

## Measured after

| Box | Size | Gap under image |
| --- | --- | --- |
| Card | 489 × 398 | — |
| Panel | 224 × 397 | — |
| Cover (all four mobile cards) | 223 × 397 | **0** |

Web cards are unchanged (487 × 274, `aspect-video`, `object-cover`).

## Behaviour below `sm`

Unchanged: the panel still takes the source's ratio and the cover is
`object-contain`, so a phone-width card shows the whole screenshot.

# Design

Visual system design documentation for Ahmed Shaban's portfolio, outlining color strategy, custom typography, spacing, and interactive layout components.

Token values below are the ones shipped in `src/index.css`. Keep the two in step: a palette change that lands only in the CSS makes this file lie.

---

## 🎨 Color Strategy: Ink & Violet

The site is designed dark-first, after the reference: a **pure black ground**, a **violet accent**, and a **fan of hairline ellipses** that sweeps across every band. Light mode is the same system authored on paper — white ground, near-black ink, the same violet darkened until it clears AA.

The palette comes from the reference's swatches. It is not a two-hue scheme dressed up as one: the violet carries every action (buttons, links, focus, active state, eyebrows), the neutrals (pure greys) carry all structure, and the remaining swatches are **materials** the UI borrows rather than roles it assigns.

| Swatch | Value | Where it is used |
| --- | --- | --- |
| black | `#000000` | Page ground (dark) |
| white | `#FFFFFF` | Page ink (dark), ground (light) |
| `#9C83FF` | accent | Primary fill, links, eyebrows, focus ring |
| `#2E2E2E` | hairline | Borders, inputs, the fan's stroke |
| `#1A1A1A` / `#0E0E0E` | surfaces | Secondary fill, cards |
| `#A3A3A3` / `#6B6B6B` | muted ink | Body copy, metas, dates |
| `#0ACF83` | green | Success only (Play badges, the A+ mark) |
| `#F24E1E`, `#FF7262`, `#C11E1E`, `#1ABCFE`, `#A259FF` | material | The single gradient, the Figma mark, chart series |

### 🌗 Theme Mappings

#### Dark Mode (the reference's own ground)
- **Background:** Pure black (`0 0 0`)
- **Foreground:** White (`1 0 0`)
- **Primary / Accent:** `#9C83FF` (`oklch(0.6884 0.1772 290.4)`)
- **Accent strong:** `#B3A1FF` — text on an accent-tinted fill
- **Card / Popover:** `#0E0E0E` / `#0A0A0A`
- **Muted foreground:** `#A3A3A3`
- **Border / input:** `#2E2E2E`
- **Ring line:** `#2E2E2E` (the fan's stroke)

#### Light Mode (Paper Fan)
- **Background:** White (`1 0 0`)
- **Foreground:** `#0A0A0A` (`oklch(0.145 0 0)`)
- **Primary / Accent:** `#6B46E0` (`oklch(0.5283 0.22 287.3)`)
- **Accent strong:** the same `#6B46E0`
- **Card / Popover:** `#FAFAFA` / `#FFFFFF`
- **Muted foreground:** `#6B6B6B`
- **Border / input:** `#E1E1E1`
- **Ring line:** `#E9E9E9`

#### Data Series (both themes)
Same three categorical marks, stepped by lightness so no two share a role:

- **Light:** `--chart-1` violet `#6B46E0`, `--chart-2` orange `#F24E1E`, `--chart-3` green `#0A8F5B`
- **Dark:** `--chart-1` `#9C83FF`, `--chart-2` `#F24E1E`, `--chart-3` `#0ACF83`

Consume them as `oklch(var(--chart-N))` so the series follows the live theme.

### Contrast Rules

WCAG AA is a hard floor, not an aspiration. Two consequences worth knowing before adding a chip or badge:

- **Body and small text ≥ 4.5:1; large text and non-text glyphs ≥ 3:1.** Re-check after any token change, in both themes — the two themes are not symmetric, and **light mode is the tighter of the two**. `#9C83FF` measures 2.6:1 on white, which is why the light theme darkens the accent to `#6B46E0` (5.9:1) instead of reusing the reference's own value.
- **Never place accent text on a fill tinted with that same accent.** A self-tint lifts the ground toward the text, so the tighter the fill, the worse it reads. Use `text-accent-strong` on any `bg-accent/*` fill — in dark that is the lifted `#B3A1FF`, one step above `--accent`, solved so it clears 4.5:1 at `/20` on black.

### Named Rules

**The One Accent Rule.** Dark mode's accent is a button fill *and* a link/text colour at once: black on `#9C83FF` measures 14.6:1, so the accent needs no lightening for text. Reserve the tinted fills (`bg-primary/10`–`/20`) for chips and marks, where `--accent-strong` carries the label.

**The One Copy Rule.** No token value is restated in TypeScript. The fan's stroke, the mesh, the floating snippets, the gradient and the chart series all read the live custom properties. A second copy drifts silently, and the drift is invisible until someone opens the theme the copy was not written for.

### Surface Rules
- **Flat, always.** The reference has no drop shadows and no glass. Depth is a hairline border plus the fan behind the section — never a blur on a content panel.
- Text emphasis uses solid colour; the palette gradient (`.text-gradient`, `.bg-palette-gradient`) is reserved for one heading word and never for body copy.
- Blur is reserved for the sticky navigation and functional overlays.

---

## 🌀 The Fan (Concentric Rings)

The reference's signature material is a fan of 100 hairline ellipses that runs edge to edge behind every band. It is authored in `src/components/decor/ConcentricRings.tsx`, *not* pasted as 100 positioned nodes.

Recovered geometry: the reference's 100 pills (`754.31 × 1814.50`, `1px #2E2E2E`, `transform-origin: top left`, rotated −74° → +25°) are one gesture — every top-left pivot lies on a single circle, **centre (1051.44, 1014.44), radius 982.5**, advanced 1° per ring, with the ring's own rotation offset from its orbit angle by a constant **247.28°**. The component evaluates that closed form once at module load and emits one SVG:

- one element instead of 100 positioned divs,
- a computed `viewBox` so it covers any viewport (`preserveAspectRatio="xMidYMid slice"`),
- `vector-effect: non-scaling-stroke` so the hairline stays exactly 1px however far it is stretched — which is what makes it read as line art rather than a blur.

The layer is `fixed` behind the content ([`src/pages/Index.tsx`](src/pages/Index.tsx)) and reads `--ring-line`, so it inverts with the theme.

---

## ✍️ Typography

Two voices, two jobs, straight from the reference:

- **Display:** `Poppins` 700 — the hero name and the two-line wordmark. (`--font-display`, and `h1`.)
- **Body & headings:** `Inter` 400–800 — all prose, labels, controls and section headings. (`--font-body`, and `h2`, which is uppercase at weight 800.)
- **Section rhythm:** every band opens with a centred uppercase `h2` and, *below it*, a small accent eyebrow (`.uv-label`: Inter 500, 11px, `0.6em` tracking, uppercase). The label under the heading — "Explore Now" — is the reference's own device.
- Body measure stays near 65–75ch. `table`, `.num` and `.tabular-nums` set `font-variant-numeric: tabular-nums`.
- **Fallback stack:** the system sans chain, so a failed font fetch degrades to platform sans rather than a serif.

---

## 💫 Interactive Motion

- **Entrance Animations:** staggered reveals from `framer-motion`. `StaggerReveal` splits headings word-by-word, `RevealOnScroll` fades a block in on approach, `SectionReveal` wraps whole sections. The hero's own children use `heroElementFadeUp` (opacity + 16px y).
- **Micro-interactions:** `Magnetic` applies pointer-following translation to social links and primary buttons; `HoverCard` lifts cards on hover.
- **Canvas Particle Flow:** `AnimatedBackground` paints a cached radial-gradient mesh plus up to 5 floating code snippets, throttled to ~20fps and capped at 1.5 DPR. It skips entirely below 768px and while scrolling, a dialog is open, or the tab is hidden. It runs at low opacity (0.32) so the fan stays the dominant background material.
- **Reduced motion:** honored at three levels — the OS `prefers-reduced-motion` query, the in-app `ReducedMotionToggle` in the navbar (adds `.reduced-motion`, which collapses animation and transition durations), and `useAnimationContext`, which lets components skip physics-driven motion directly.

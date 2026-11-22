# Design

Visual system design documentation for Ahmed Shaban's portfolio, outlining color strategy, custom typography, spacing, and interactive layout components.

Token values below are the ones shipped in `src/index.css`. Keep the two in step: a palette change that lands only in the CSS makes this file lie.

---

## 🎨 Color Strategy: Bordeaux & Bone

We reject generic blue-slate templates, neon gradients, gradient text, and decorative glassmorphism. The palette takes its cues from a wine-cellar ledger, oxblood ink, and near-black zinc: tinted neutrals, a deliberate bordeaux primary, and a bordeaux accent one step lighter. Tokens use OKLCH for predictable perceptual contrast across themes.

The two hues are deliberately close — primary sits at hue 352 and accent at 355. They are not a two-color scheme. Primary carries structure (buttons, links, focus, active state); accent marks secondary emphasis (the CV menu's Frontend track, section eyebrows, ambient glows). Neutrals are tinted toward the zinc hue in dark mode and toward rose paper in light, so nothing reads as a pure gray.

### 🌗 Theme Mappings

#### Light Mode (Rose Paper)
- **Background:** Faint rose paper (`oklch(0.982 0.003 350)`)
- **Foreground:** Cool zinc ink (`oklch(0.215 0.008 320)`)
- **Primary:** Deep bordeaux (`oklch(0.415 0.145 352)`)
- **Accent:** Bordeaux (`oklch(0.47 0.155 355)`)
- **Accent strong:** Text on accent-tinted fills (`oklch(0.41 0.15 352)`)
- **Card:** Raised white (`oklch(0.999 0.001 340)`)
- **Muted foreground:** `oklch(0.52 0.014 330)`
- **Border / input:** `oklch(0.912 0.006 330)`

#### Dark Mode (Violet-Cast Zinc)
- **Background:** Near-black zinc (`oklch(0.16 0.008 310)`)
- **Foreground:** Bone white (`oklch(0.968 0.006 340)`)
- **Primary:** Bright bordeaux (`oklch(0.64 0.165 355)`)
- **Accent:** Bordeaux (`oklch(0.67 0.17 358)`)
- **Accent strong:** Tracks accent; dark already passes every tint density (`oklch(0.67 0.17 358)`)
- **Card Panels:** Lifted zinc charcoal (`oklch(0.2 0.012 310)`)
- **Muted foreground:** `oklch(0.715 0.01 320)`
- **Border / input:** `oklch(0.29 0.015 310)`

#### Data Series (both themes)
A chart needs categorical steps, not two near-identical accent reds doing the job of one. Same bordeaux family, separated by lightness, with a near-neutral third step:

- **Light:** `--chart-1` `oklch(0.42 0.145 352)`, `--chart-2` `oklch(0.58 0.115 355)`, `--chart-3` `oklch(0.72 0.03 330)`
- **Dark:** `--chart-1` `oklch(0.67 0.17 358)`, `--chart-2` `oklch(0.52 0.145 355)`, `--chart-3` `oklch(0.84 0.03 320)`

Consume them as `oklch(var(--chart-N))` so the series follows the live theme. Apply the value as an inline declaration rather than the `stroke` presentation attribute: a CSS declaration is the unambiguous path for `var()` substitution, and the slice colour is a token reference.

### Contrast Rules

WCAG AA is a hard floor, not an aspiration. Two consequences worth knowing before adding a chip or badge:

- **Body and small text ≥ 4.5:1; large text and non-text glyphs ≥ 3:1.** Re-check after any token change, in both themes — the two themes are not symmetric, and light mode is the tighter of the two.
- **Never place accent text on a fill tinted with that same accent.** `bg-accent/10 text-accent-strong` measures 7.75:1 and `/20` 6.54:1 in light, 5.38:1 and 4.64:1 in dark. The self-tint lifts the background toward the text, so the tighter the fill, the worse it reads. Use `text-accent-strong` on any `bg-accent/*` fill. The same pattern with `bg-primary/*` currently passes, but it is the same trap and should be treated the same way.

### Named Rules

**The Two-Job Primary Rule.** In dark mode `--primary` is a button fill *and* a link/text colour at once, so its lightness stays at or above 0.62. Depth in this world lives in the grounds, the neutrals, and the light theme — never darken the dark-theme primary to chase "deep", because it breaks link contrast at the same time.

**The One Copy Rule.** No token value is restated in TypeScript. The canvas mesh, the floating snippets, and the chart series all read the live custom properties. A second copy drifts silently, and the drift is invisible until someone opens the theme that the copy was not written for.

### Surface Rules
- Text emphasis uses solid color, never gradient fills. (`.text-gradient` is vestigial — it sets a solid `--primary`, no gradient.)
- Cards use opaque tinted surfaces and quiet borders instead of default blur.
- Ambient color stays low-opacity and must not compete with text.
- Blur is reserved for functional overlays and sticky navigation.

---

## ✍️ Typography

- **Headings & Main Labels:** `Plus Jakarta Sans`, 400–800, loaded from Google Fonts with `display=swap` and a preconnect pair. Tracking floor is `-0.04em`; displays use `tracking-tight`.
- **Body Text:** `Plus Jakarta Sans` — the `sans` stack also lists Inter, but only Plus Jakarta Sans is fetched, so Inter never renders. Keep body measure near 65–75ch.
- **Data & Code:** the `mono` stack names `JetBrains Mono` then `Fira Code`; **neither is imported**, so figures fall back to the platform mono (ui-monospace / Menlo / Consolas). The canvas background uses the same stack for its floating snippets. If a true mono voice matters, self-host JetBrains Mono — do not add a second Google Fonts request for it.
- `.num` and `.tabular-nums` both set `font-variant-numeric: tabular-nums`. `.num` marks figures in data surfaces (counts, timestamps, percentages); `.tabular-nums` is generic. `table` gets it automatically.
- **Fallback stack** (no self-hosted faces): the system sans chain, so a failed font fetch degrades to platform sans rather than a serif.

---

## 💫 Interactive Motion

- **Entrance Animations:** staggered reveals from `framer-motion`. `StaggerReveal` splits headings word-by-word, `RevealOnScroll` fades a block in on approach, `SectionReveal` wraps whole sections. The hero's own children use `heroElementFadeUp` (opacity + 16px y).
- **Micro-interactions:** `Magnetic` applies pointer-following translation to social links and primary buttons; `HoverCard` lifts cards on hover.
- **Canvas Particle Flow:** `AnimatedBackground` paints a cached radial-gradient mesh plus up to 5 floating code snippets, throttled to ~20fps and capped at 1.5 DPR. It skips entirely below 768px and while scrolling, a dialog is open, or the tab is hidden.
- **Reduced motion:** honored at three levels — the OS `prefers-reduced-motion` query, the in-app `ReducedMotionToggle` in the navbar (adds `.reduced-motion`, which collapses animation and transition durations), and `useAnimationContext`, which lets components skip physics-driven motion directly.

# Design

Visual system design documentation for Ahmed Shaban's portfolio, outlining color strategy, custom typography, spacing, and interactive layout components.

Token values below are the ones shipped in `src/index.css`. Keep the two in step: a palette change that lands only in the CSS makes this file lie.

---

## 🎨 Color Strategy: Midnight Zinc & Burnished Copper

We reject generic blue-slate templates, neon gradients, gradient text, and decorative glassmorphism. The palette takes its cues from warm archival paper, oxidized copper, and near-black zinc: tinted neutrals, a deliberate copper primary, and a deeper copper accent. Tokens use OKLCH for predictable perceptual contrast across themes.

The two hues are deliberately close — primary sits at hue 38 and accent at 41. They are not a two-color scheme. Primary carries structure (buttons, links, focus, active state); accent marks secondary emphasis (the CV menu's Frontend track, section eyebrows, ambient glows). Neutrals are tinted toward the zinc hue in dark mode and toward paper in light, so nothing reads as a pure gray.

### 🌗 Theme Mappings

#### Light Mode (Warm Paper)
- **Background:** Warm paper (`oklch(0.983 0.002 67.8)`)
- **Foreground:** Warm near-black ink (`oklch(0.216 0.006 56)`)
- **Primary:** Deep copper (`oklch(0.53 0.174 38.4)`)
- **Accent:** Copper (`oklch(0.54 0.194 41.1)`)
- **Accent strong:** Text on accent-tinted fills (`oklch(0.48 0.194 41.1)`)
- **Card:** Raised white (`oklch(1 0 89.9)`)
- **Muted foreground:** `oklch(0.537 0.012 58.1)`
- **Border / input:** `oklch(0.913 0.009 84.6)`

#### Dark Mode (Green-Black Zinc)
- **Background:** Near-black zinc (`oklch(0.166 0.006 300.9)`)
- **Foreground:** Soft mineral white (`oklch(0.973 0.009 67.7)`)
- **Primary:** Bright copper (`oklch(0.758 0.159 55.9)`)
- **Accent:** Copper (`oklch(0.705 0.187 47.6)`)
- **Accent strong:** Tracks accent; dark already passes every tint density (`oklch(0.705 0.187 47.6)`)
- **Card Panels:** Lifted zinc charcoal (`oklch(0.204 0.01 294.7)`)
- **Muted foreground:** `oklch(0.716 0.009 56.3)`
- **Border / input:** `oklch(0.295 0.018 294.4)`

### Contrast Rules

WCAG AA is a hard floor, not an aspiration. Two consequences worth knowing before adding a chip or badge:

- **Body and small text ≥ 4.5:1; large text and non-text glyphs ≥ 3:1.** Re-check after any token change, in both themes — the two themes are not symmetric, and light mode is the tighter of the two.
- **Never place accent text on a fill tinted with that same accent.** `bg-accent/10 text-accent` measured 4.47:1, `/15` 4.17:1, and `/20` 3.83:1: the self-tint lifts the background toward the text, so the tighter the fill, the worse it reads. Use `text-accent-strong` on any `bg-accent/*` fill. The same pattern with `bg-primary/*` currently passes, but it is the same trap and should be treated the same way.

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

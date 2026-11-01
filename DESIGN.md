# Design

Visual system design documentation for Ahmed Shaban's portfolio, outlining color strategy, custom typography, spacing, and interactive layout components.

---

## 🎨 Color Strategy: Archival Emerald & Oxidized Brass

We reject generic blue-slate templates, neon gradients, gradient text, and decorative glassmorphism. The palette takes its cues from archival paper, oxidized brass, and green-black lacquer: tinted neutrals, a deliberate emerald primary, and a restrained bronze accent. Tokens use OKLCH for predictable perceptual contrast across themes.

### 🌗 Theme Mappings

#### Light Mode (Archival Paper)
- **Background:** Warm green-tinted paper (`oklch(0.965 0.008 145)`)
- **Foreground:** Green-black ink (`oklch(0.235 0.018 155)`)
- **Primary:** Deep lacquer emerald (`oklch(0.43 0.11 158)`)
- **Accent:** Oxidized brass (`oklch(0.48 0.105 68)`)
- **Card:** Soft raised paper (`oklch(0.985 0.006 145)`)

#### Dark Mode (Green-Black Lacquer)
- **Background:** Deep green-black lacquer (`oklch(0.145 0.012 155)`)
- **Foreground:** Soft mineral white (`oklch(0.91 0.012 145)`)
- **Primary:** Clear mineral emerald (`oklch(0.74 0.115 158)`)
- **Accent:** Burnished brass (`oklch(0.76 0.11 72)`)
- **Card Panels:** Lifted green charcoal (`oklch(0.185 0.014 155)`)

### Surface Rules
- Text emphasis uses solid color, never gradient fills.
- Cards use opaque tinted surfaces and quiet borders instead of default blur.
- Ambient color stays low-opacity and must not compete with text.
- Blur is reserved for functional overlays and sticky navigation.

---

## ✍️ Typography

- **Headings & Main Labels:** `Plus Jakarta Sans` (rich tracking-tight bold sans)
- **Code & Snippets:** `JetBrains Mono` or `Fira Code` (technical monospaced precision)
- **Body Text:** `Plus Jakarta Sans` or `Inter` (high-readability, fluid-scaled, max 70ch line-width)

---

## 💫 Interactive Motion

- **Entrance Animations:** Staggered spring-motion reveals.
- **Micro-interactions:** Magnetic hover states on social links and primary action buttons.
- **Canvas Particle Flow:** Slow-fps background rendering of code snippets with matching theme-mode color gradients.

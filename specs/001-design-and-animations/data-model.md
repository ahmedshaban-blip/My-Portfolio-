# Data Model: UX Design & Interactive Animations

**Goal**: Define the state and content structures for the portfolio's animated UI.

## UI State (Client-Side)

### AnimationContext
Shared state across the application to manage movement preferences and active sections.

| Field | Type | Description | Default |
|-------|------|-------------|---------|
| `reducedMotion` | `boolean` | User's choice to simplify/disable movement. | `false` |
| `activeSection` | `string` | The section currently in view (Hero, About, etc.). | `"hero"` |
| `scrolled` | `boolean` | Tracks if the user has scrolled past 10 pixels. | `false` |

### Scroll Config
Settings for the "Hybrid Scroll Snap" logic.

| Property | Type | Description |
|----------|------|-------------|
| `snapSections` | `string[]` | IDs of high-impact sections: `["hero", "projects"]`. |
| `momentumEnabled` | `boolean` | `true`. |

## Entity Definitions

### ProjectCard
Fields used for the animated showcase.

| Field | Type | Requirement |
|-------|------|-------------|
| `id` | `uuid` | Primary Key |
| `title` | `string` | Unique name |
| `description` | `string` | Short summary |
| `thumbnail` | `url` | Display image |
| `techStack` | `string[]` | List of tags |
| `links` | `json` | `{ repo: url, live: url }` |

## Interaction Logic

### ScrollReveal Variants
Pre-defined Framer Motion variant objects for consistency.

- **FadeUp**: `{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }`
- **FadeIn**: `{ initial: { opacity: 0 }, animate: { opacity: 1 } }`
- **Stagger**: `{ initial: {}, animate: { transition: { staggerChildren: 0.1 } } }`

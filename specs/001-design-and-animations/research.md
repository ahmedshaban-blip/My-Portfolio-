# Research: UX Design & Interactive Animations

**Status**: Complete
**Goal**: Identify the most performant and accessible patterns for portfolio animations.

## Decisions

### 1. Primary Animation Framework
- **Decision**: Framer Motion 10+
- **Rationale**: Highly optimized React-first API. Supports `whileInView`, `layout` transitions, and easy integration with Tailwind.
- **Alternatives**: GSAP (more powerful but heavier and less direct React integration), CSS-only (lacks complex event triggers like scroll-into-view without JS).

### 2. Scroll Reveal Pattern
- **Decision**: `whileInView` with `viewport` configuration.
- **Rationale**: Efficiently triggers animations as elements enter the viewport. Can be easily configured to trigger once or repeatedly.
- **Alternatives**: Custom Intersection Observer hook (redundant when Framer Motion provides it built-in).

### 3. Mobile Animation Treatment
- **Decision**: Simplified variants + reduced interaction.
- **Rationale**: Complex hover states don't exist on touch. Disabling expensive effects (like custom cursors or large-scale transforms) on mobile prevents frame drops.
- **Alternatives**: Disabling ALL animations on mobile (too "static" for a modern portfolio).

### 4. Accessibility Strategy
- **Decision**: Context API for a global "Reduced Motion" toggle.
- **Rationale**: Allows the state to be synced across all animated components effortlessly. Initialized via user choice and stored in localStorage.
- **Alternatives**: Direct `window.matchMedia('(prefers-reduced-motion)').matches` (good but user asked for a *manual toggle*).

## Best Practices

- **Avoid Layout Thrashing**: Animate `transform` (scale, translate) and `opacity` instead of width, height, or margins.
- **Micro-tasks**: Use `staggerChildren` for lists (e.g., project card grids) to make reveals feel organic.
- **Lazy Load Animations**: Ensure large assets (like hero images) load before/during the animation to prevent "blank reveal."

## Performance Checklist

- [ ] Use `motion.div` instead of standard `div` where necessary.
- [ ] Implement `AnimatePresence` for smooth layout shifts.
- [ ] Verify that scroll-linked animations are non-blocking.

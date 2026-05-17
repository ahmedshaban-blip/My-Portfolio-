# Developer Guide: UX Design & Interactive Animations

**Goal**: How to use and maintain the new animation and design patterns in the portfolio.

## 🏃 Getting Started

### 1. Requirements
Ensure you have the primary animation library installed:
```bash
npm install framer-motion
```

### 2. Creating Animated Sections
Use the `motion` wrapper for section entries:
```tsx
import { motion } from 'framer-motion';

const Section = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      {/* Content */}
    </motion.section>
  );
};
```

### 3. Handling Reduced Motion
Always check for the `reducedMotion` state:
```tsx
const { reducedMotion } = useAnimationContext();

// Disable complex effects if true
<Card isAnimated={!reducedMotion} />
```

## 🛠️ Components Checklist

### Interactive Project Cards
- [ ] Implement `whileHover={{ scale: 1.05 }}` on Card.
- [ ] Add `layoutId` for smooth tab transitions in the Projects view.

### Navbar Scroll Tracking
- [ ] Use `IntersectionObserver` to detect active section.
- [ ] Apply `active` styles to the corresponding `NavLink`.

## 🎨 Best Practices

- **Consistency**: Use `framer-motion` for all JS-driven animations.
- **Micro-animations**: Use `<AnimatePresence>` for items entering/leaving the DOM (e.g., project filters).
- **Fallback**: Ensure the site is fully functional and readable even if JavaScript is disabled.

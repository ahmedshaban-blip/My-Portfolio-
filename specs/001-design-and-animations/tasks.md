# Tasks: UX Design & Interactive Animations (Super-Vibrant Upgrade)

**Input**: Design documents from `specs/001-design-and-animations/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md

**Tests**: Manual visual validation and scroll-performance checks at each checkpoint.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Project root**: `d:\MyPotfolio\my-portfolio\`
- **Source**: `src/`
- **Components**: `src/components/`
- **Animations**: `src/components/animations/`
- **Hooks**: `src/hooks/`
- **Context**: `src/context/`

---

## Phase 1: Setup (Visual Depth & Foundations)

**Purpose**: Project initialization and basic "attractive" baseline

- [x] T001 [P] Install `framer-motion` and `lucide-react`
- [x] T002 [P] Create `src/components/animations/` directory
- [x] T003 [P] Create `src/lib/animation-variants.ts` with **Spring Physics** presets (bouncy transitions)
- [x] T004 [P] Create `src/components/animations/AnimatedBackground.tsx` for high-impact moving gradients or mesh shapes
- [x] T005 [P] Create `src/hooks/useParallax.ts` to calculate scroll-offset based translation
- [x] T010 Add `AnimatedBackground` to the root layout in `src/App.tsx` or `main.tsx` (pinned behind all content)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [x] T006 Create `src/context/AnimationContext.tsx` to manage `reducedMotion` and `activeSection` state
- [x] T007 Implement `useAnimationContext` hook in `src/hooks/useAnimationContext.tsx`
- [x] T008 [P] Add global smooth-scrolling rules to `src/index.css`
- [x] T009 [P] Wrap the application with `AnimationProvider` in `src/main.tsx`

**Checkpoint**: Foundation ready - super-vibrant story work can now begin.

---

## Phase 3: User Story 1 - Vibrant Hero Reveal (Priority: P1) 🎯 MVP

**Goal**: High-impact, highly visible entrance for the Hero section.

**Independent Test**: Refresh page. The Name and Title should reveal with a letter-by-letter or word-by-word sequence.

### Implementation for User Story 1

- [x] T011 [P] [US1] Create `src/components/animations/StaggerReveal.tsx` for children-sequential entrance
- [x] T012 [US1] Implement **Letter-by-Letter** staggered text reveal for the main heading in `src/components/Hero.tsx`
- [x] T013 [US1] Add a synchronized "Fade-Up" animation to the Hero subtext and primary CTA with high-frequency spring bounce

---

## Phase 4: User Story 2 - Interactive Project Showcase (Priority: P1)

**Goal**: Bouncy, interactive project cards.

**Independent Test**: Hover over project cards. They should "pop" with visible scale/elevation changes.

### Implementation for User Story 2

- [x] T014 [P] [US2] Create `src/components/animations/HoverCard.tsx` using spring-bouncy presets
- [x] T015 [US2] Apply `HoverCard` to project instances in `src/components/Projects.tsx`
- [x] T016 [US2] Implement `layoutId` and `AnimatePresence` for smooth tab transitions in `src/components/Projects.tsx`

---

## Phase 5: User Story 3 - Interactive Feedback & Magnetic Pull (Priority: P2)

**Goal**: Buttons and Navbar that feel highly interactive and clear.

**Independent Test**: Buttons should follow the cursor (Magnetic) and Navbar should update automatically.

### Implementation for User Story 3

- [x] T017 [P] [US3] Create `src/components/animations/Magnetic.tsx` wrapper for pointer-follow movement with a magnetic-strength variable
- [x] T018 [US3] Wrap primary buttons in `Hero.tsx` and `Contact.tsx` with `Magnetic` component
- [x] T019 [US3] Implement `IntersectionObserver` in `src/components/Navbar.tsx` for active link highlights
- [x] T020 [US3] Add a smooth sliding indicator to the active link in `src/components/Navbar.tsx`

---

## Phase 6: User Story 4 - High-Visibility Parallax & Reveal (Priority: P2)

**Goal**: Sections reveal with parallax movement for extra depth.

**Independent Test**: Scrolling down reveals About/Skills sections with a clear "pop" and slight parallax offset.

### Implementation for User Story 4

- [x] T021 [P] [US4] Create `src/components/animations/RevealOnScroll.tsx` utilizing bouncy slide-up variants and **Parallax intensity settings**
- [x] T022 [US4] Apply `RevealOnScroll` to `About.tsx`, `Experience.tsx`, and `Skills.tsx`
- [x] T023 [US4] Implement `ReducedMotionToggle` in `src/components/mode-toggle.tsx` to allow manual user control

---

## Phase 7: Polish & All-Size Performance Audit

**Purpose**: Final optimizations and responsiveness check

- [x] T024 [P] Audit `src/lib/animation-variants.ts` to ensure staggers and parallax are simplified for mobile and non-high-frequency-refresh screens
- [x] T025 Run final performance audit emphasizing 60fps across all breakpoints and ensuring zero horizontal scrollbars on ultra-wide screens

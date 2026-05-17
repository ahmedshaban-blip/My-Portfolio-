<!--
Version change: [PROJECT_NAME] Constitution -> Ahmed Shaban's Developer Portfolio Constitution
Modified principles:
- [PRINCIPLE_1_NAME] -> I. Mobile-First & Responsive Excellence
- [PRINCIPLE_2_NAME] -> II. Modern Component-Based Architecture
- [PRINCIPLE_3_NAME] -> III. Utility-First Styling (Tailwind CSS)
- [PRINCIPLE_4_NAME] -> IV. High-Performance Development (Vite)
- [PRINCIPLE_5_NAME] -> V. Clean Code & Type Safety
Added sections:
- Technical Stack & Constraints
- Development Lifecycle & Standards
Templates requiring updates:
- .specify/memory/constitution.md (✅ updated)
Follow-up TODOs: None
-->

# Ahmed Shaban's Developer Portfolio Constitution

## Core Principles

### I. Mobile-First & Responsive Excellence (Highest Priority)
Every UI component and layout MUST be designed with a mobile-first approach, ensuring seamless responsiveness across all screen sizes—from small smartphones to ultra-wide desktop monitors. Layouts must never "break" or show horizontal scrollbars regardless of browser width. Fluid typography and responsive scaling (Tailwind's `clamp` or `rem` units) are preferred.

### II. Modern Component-Based Architecture
Utilize React with TypeScript and shadcn/ui to build a scalable and maintainable component-based architecture. Components must be modular, strongly typed, and reusable across different sections of the portfolio.

### III. Utility-First Styling (Tailwind CSS)
Styling must be managed through Tailwind CSS utilities to ensure design consistency, rapid development, and optimal CSS bundle size. Custom CSS should be minimized and justified.

### IV. High-Performance & Animation Excellence
Performance is a core feature. We use Vite for highly optimized production builds. 
- **Animation Goal**: Maintain a locked 60fps for all interactive and background animations.
- **Latency Goal**: Interaction feedback (hover/click) must occur within <100ms.
- **Resource Goal**: Minimize layout shifts (CLS < 0.1). 
All animations must be hardware-accelerated (via Framer Motion's GPU-bound transforms).

### V. Clean Code & Type Safety
Maintain a clean and consistent codebase by strictly adhering to TypeScript for type safety and ESLint for code quality. Avoid any-type usage and ensure proper documentation for complex logic.

## Technical Stack & Constraints

- **Framework**: React 18+ for building the UI.
- **Build Tool**: Vite for tooling and asset management.
- **Language**: TypeScript for static typing and developer productivity.
- **Styling**: Tailwind CSS for component styling.
- **UI Components**: shadcn/ui for consistent and accessible primitive components.
- **Data Persistence**: Future integration with Supabase for dynamic content management.

## Development Lifecycle & Standards

- **Linting & Formatting**: ESLint must be run before every commit to ensure code quality.
- **Build Verification**: Production builds via `npm run build` must be verified locally before deployment.
- **Version Control**: Follow standard Git flow and descriptive commit messages for all changes.
- **Accessibility**: Ensure ARIA standards and WCAG compliance for an inclusive web experience.

## Governance

- This Constitution serves as the primary guidance for all development activities within this repository.
- Any major architectural or principle changes require a version increment (MAJOR.MINOR.PATCH).
- Code reviews and contributions must be checked against these principles to ensure compliance.

**Version**: 1.0.0 | **Ratified**: 2026-03-19 | **Last Amended**: 2026-03-19

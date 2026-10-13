---
target: homepage
total_score: 21
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 2
target_identity: "file:D:\\MyPotfolio\\my-portfolio\\src\\pages\\Index.tsx"
target_fingerprint: "sha256:fec5f3af2c7c3dc59f506c41a87a8a3df0bc48f56487d6040b2bd56f28d5c9bc"
target_path: "D:\\MyPotfolio\\my-portfolio\\src\\pages\\Index.tsx"
timestamp: 2026-10-13T10-04-01Z
slug: src-pages-index-tsx
---
# Critique — src/pages/Index.tsx (homepage)

Method: dual-agent (A: ses_ecb4d87bdffec8BbZkA73gWhcD · B: ses_ecb4d87adffeLDfXfTyAzIXBh8)

## Health score: 21/32 (Acceptable)

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Shareable ?tab=&project= URL has no affordance |
| 2 | Match System / Real World | 3 | Three labels (Details/card-click/zoom) for one action |
| 3 | User Control and Freedom | 3 | No swipe on mobile dialog gallery |
| 4 | Consistency and Standards | 2 | Fractured header system + drifting primary CTA style |
| 5 | Error Prevention | 3 | No guard against downloading the wrong CV |
| 6 | Recognition Rather Than Recall | 2 | Proof buried behind tabs + dialog + collapsed chips |
| 7 | Flexibility and Efficiency | n/a | Linear single-page showcase, no repeated expert workflow |
| 8 | Aesthetic and Minimalist Design | 2 | Redundant stats (10+ x3) + chrome overload |
| 9 | Error Recovery | 3 | execCommand fallback path has no visible manual fallback |
| 10 | Help and Documentation | n/a | No complex task; inline microcopy suffices |

## Specificity verdict

Emerald Luxury system genuinely authored (emerald/bronze light+dark tokens, pinned Plus Jakarta Sans, bespoke mesh) — not AI slop. Dilution: 5 headers in 3 languages (01 About left-plain, 02 Skills centered pill+gradient, 03 Projects editorial split, 04 Experience left-plain, 05 Contact centered plain-accent); identical modern-card+icon-tile formula everywhere. Detector: [] zero findings. Browser: 6 screenshots, no render defects; one factual signal: GET /favicon.ico 404 on every load.

## Strengths

1. Token discipline across themes incl. selection/scrollbar.
2. Projects proof system (deep-linkable, CLS-safe, keyboard browsing).
3. Honest contact engineering (zod, mailto budget, blocked-state fallback).

## Priority issues

- [P1] 1. Generic Hero H1 + dual-CV choice paralysis (Hero.tsx:93,120-152). Fix: candidate-specific H1, single primary CV, proof strip. -> bolder
- [P2] 2. Fractured header system; numbering 01/04/05 skips Skills/Projects. Fix: promote editorial split pattern. -> layout
- [P2] 3. Three competing actions per project card footer (Projects.tsx:305-335). Fix: single primary + icon-only Github. -> layout
- [P2] 4. Redundant proof stats (10+ x3, A+ x2). Fix: one home per fact in About. -> distill
- [P1] 5. Contact ending deflates (Contact.tsx:140,278-315). Fix: outcome H2 + response-time reassurance. -> clarify

## Persona red flags

- Casey (mobile): photo pushes H1 below fold; h-8 buttons under 44px; no gallery swipe; CV-heavy mobile nav.
- Jordan (first-timer): no role anchor in H1; dual-CV microcopy forces self-classification; skill counts lack level cues; mailto vs copy with no recommended path.
- Recruiter-Riley (hiring, desktop): no current-role/stack/location bar under Hero; proof behind tabs + clamps; copy-email is a secondary below-fold button; no mailto CTA in desktop navbar.

## Minor observations

Eye icon for motion toggle reads as preview; ITI stat value looks like a metric; two Arabic comments in index.css:146,181; browser URL pill truncates at 12rem; light-mode chip contrast needs verification.

## Questions to Consider

1. Reading only H1 + Projects header + Contact H2, would Riley know you are currently employed full-time?
2. What would you delete to make the page 30% shorter without losing a hire signal?
3. If dual-CV is the differentiator, why does no project card state which CV it supports?

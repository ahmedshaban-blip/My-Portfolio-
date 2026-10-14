# Session Handoff — Portfolio Redesign (Anti-Slop Design Lab)

Read this file first in the new session, then continue.

## Project
- Path: `D:\MyPotfolio\my-portfolio` — React 19 + Vite + TS + Tailwind + shadcn/ui, dark/light themes.
- Real site sections: `src/pages/Index.tsx` → Navbar, Hero, About, Skills, Projects, Experience, Contact, Footer (lazy-loaded below-fold).
- Current real design (to be replaced): emerald/amber "luxury" — mesh gradients, glassmorphism, glow shadows, gradient text, blur orbs, rounded-full everything, Plus Jakarta Sans. This is exactly the "AI slop" the user wants gone.

## Goal
Redesign the portfolio away from AI-slop looks. Rearranging section order is allowed.
None of the real React code has been changed yet — only the design lab file was built.

## Workflow agreed
1. Build variant designs as full HTML mockups with the user's REAL content.
2. User picks one (or a mix).
3. Then apply the chosen design to the actual React/Tailwind codebase.

## Delivered — `design-lab/variants.html` REBUILT v2 (old 12 deleted per user request)
6 brand-new variants, all real content, all anti-slop (no gradients/glass/glow/rounded-3xl):
- N1 `#n1` — Sahara: sand #EFE6D2 / espresso / palm-green #2E4B34 + clay, Fraunces, souk stalls grid.
- N2 `#n2` — Transit: metro map, 3 flat lines (green/red/mustard), stations = projects, Archivo.
- N3 `#n3` — Field Manual: khaki/olive/rust stamp, Oswald + Courier, ops + equipment checks + log.
- N4 `#n4` — Catalog: department-store white/yellow #FFC700/price-red, SKU cards with real screenshots.
- N5 `#n5` — Night Shift: roadside dark #0F1210 + flat amber #FFB000, Anton, bays + logbook.
- N6 `#n6` — Airmail: ivory/postal-blue/postmark-red, letter + parcel + itinerary, Caslon + Special Elite.

- V1 `#v1` — Ledger: Swiss editorial, paper #f2efe8 / ink / vermilion #c8401a, hairlines, project ledger rows, Space Grotesk + IBM Plex Mono.
- V2 `#v2` — Press: brutalist print, hard 3px borders, offset shadows, signal orange #ff4a1c, ticker marquee, Archivo Black + Space Mono.
- V3 `#v3` — Terminal: dark console #0b0d0a, JetBrains Mono, `$ whoami`, `ls -1 ~/projects`, `tree ~/skills`, `cat experience.log`.
- V4 `#v4` — Studio: cream #faf5ec / terracotta #b0532c, Fraunces serif + Work Sans, arch photo, editorial work rows.
- V5 `#v5` — Blueprint: Prussian blue drafting sheet, title block, parts-list table, legend line-types, revision log, outline-stroke name, Archivo Narrow.
- V6 `#v6` — Broadsheet: newspaper, Playfair masthead + PT Serif, justified 2-col front page, project "articles", classifieds-style appointments, drop caps.
- V7 `#v7` — Carton: kraft freight/shipping label theme, Oswald + Courier Prime, packing list, barcodes, stamps, handling log, dispatch.
- V8 `#v8` — Poster: type-first, Anton + cobalt #1f3cff on light, giant index rows (hover→cobalt), black stat strip, "Say hi→" block.
- V9 `#v9` — Noir: gallery/museum, near-black #0e0d0b / ivory / gold #c9a227, Italiana + Cormorant italic, numbered plates I–VI, registry table, colophon.
- V10 `#v10` — Riso: zine overprint, cream + pink #ff2e88 + blue #2323ff, Archivo Black w/ misregistration shadow, rotated cut-outs, sticker badge, setlist + mailbox.
- V11 `#v11` — Workbook: hand-drawn field notes, grid paper, Caveat + Patrick Hand, wobbly sketch borders, tape labels, experiments grid, logbook, pass-note contact.
- V12 `#v12` — Arcade: CRT HUD, #0a0a12 + lime #b8ff29, Press Start 2P + VT323, scanlines, score/lives HUD, quest stages, achievements, "Continue?" contact.

Technical notes:
- Images use absolute `/...` paths (work via dev server / preview); a `file://` fallback script at the bottom rewrites them to `../public/...`.
- Each variant has its own scoped `<style>` inside its `<section>`.
- Validated: tags balanced, 9 style blocks, no artifacts. Check script was at `C:\Users\AhmedShaban\AppData\Local\Temp\opencode\check-variants.js` (may be gone after reboot).

## USER FEEDBACK — IMPORTANT
User rejected ALL 8 original variants (Arabic: "لم يعجبني اي تصميم اريد المزيد" = "I didn't like any design, I want more"). So 4 more were added (V9 Noir, V10 Riso, V11 Workbook, V12 Arcade) — file now has 12.
- Next step: ask the user to pick one of the 12 (or a mix).
- Remaining unused directions if still rejected: Luxury dark (black/ivory/gold thin rules — partly covered by Noir), Neo-geo/Memphis shapes, Movie credits scroll, Atlas/map-annotated.
- Keep anti-slop guardrails: no gradients, no glass/blur, no glow, no soft rounded-3xl cards, no purple/Inter defaults, one strong accent per design, strict typography, real content only.
- Ask the user again after adding new variants (pick a direction), then APPLY the winner to the real React code (index.css tokens + components).

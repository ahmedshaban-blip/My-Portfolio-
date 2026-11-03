/**
 * Verifies the CV reader's module layout, the "Read CV" dropdown contract, and
 * the CVView branch decision.
 *
 * Run: node .agents/workspace/cv-reader/verify-cvview-branch.mjs
 */

import { readFileSync } from "node:fs";

let failures = 0;
const check = (name, actual, expected) => {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}`);
  if (!ok) console.log(`        expected ${JSON.stringify(expected)}\n        actual   ${JSON.stringify(actual)}`);
};

const read = (p) => readFileSync(p, "utf8");

// --- 1. the branch condition ------------------------------------------------
const showFallback = ({ isMobile, coarsePointer, embedFailed }) => isMobile || coarsePointer || embedFailed;

check("desktop + fine pointer + loaded => iframe", showFallback({ isMobile: false, coarsePointer: false, embedFailed: false }), false);
check("narrow viewport => fallback", showFallback({ isMobile: true, coarsePointer: false, embedFailed: false }), true);
check("coarse pointer (tablet) => fallback", showFallback({ isMobile: false, coarsePointer: true, embedFailed: false }), true);
check("embed error => fallback", showFallback({ isMobile: false, coarsePointer: false, embedFailed: true }), true);

const cvView = read("src/pages/CVView.tsx");
check("CVView renders iframe/fallback via ternary", /showFallback \? \(/.test(cvView) && /\) : \(\s*<CVViewer/.test(cvView), true);
check("CVView imports the page helpers from @/lib/cv-view", /from "@\/lib\/cv-view"/.test(cvView), true);

// --- 2. helper module contract ---------------------------------------------
const view = read("src/lib/cv-view.ts");
check("cv-view has page-only helpers", /parseCVTrack/.test(view) && /CV_TRACKS/.test(view), true);
check("cv-view does NOT open windows (no entry need)", /window\.open/.test(view), false);

const link = read("src/lib/cv-link.ts");
check("cv-link emits mode=view", /mode=view/.test(link), true);
check("cv-link opens a new tab with noopener/noreferrer", /"_blank", "noopener,noreferrer"/.test(link), true);
check("cv-link does not import React (entry-safe)", /from "react"/.test(link), false);

// --- 3. the dropdown entry points ------------------------------------------
const menu = read("src/components/cv/CVReadMenu.tsx");
// The dropdown is the single CV entry point: both tracks × both actions.
check("dropdown opens via openCV (new tab, no download)", /openCV\(track\)/.test(menu), true);
check("dropdown also offers the download action", /downloadCV\(track\)/.test(menu), true);
check("dropdown lists both tracks as groups", /CV_TRACKS\.map/.test(menu) && /role="group"/.test(menu), true);
check("dropdown exposes real menu semantics", /role="menu"/.test(menu) && /role="menuitem"/.test(menu), true);
// The dropdown defines the two item templates (read + download) and gives the
// two sections visible identity (icon chip + role hint), per user request.
check("dropdown defines the two item templates (read + download)", (menu.match(/role="menuitem"/g) ?? []).length, 2);
check("menu headers use per-track icon chips + role hints", /TRACK_META\[track\]\.chipTint/.test(menu) && /roleHint/.test(menu), true);
check("flutter section is phone-identified, frontend web-identified", /Smartphone/.test(menu) && /Globe/.test(menu), true);
check("group headers are decorative (SR uses group aria-label)", /aria-hidden="true"\s*\n?\s*className="flex items-center gap-2/.test(menu), true);
check("trigger can render the two track chips", /chips/.test(menu) && /TRACK_META\[track\]\.label/.test(menu), true);
// The outline variant's hover:bg-accent (orange) hides the accent-tinted
// Frontend chip — the trigger must hover on a neutral fill instead.
check("trigger hover is a neutral fill, not accent orange", /hover:bg-secondary\/60/.test(menu) && !/hover:bg-accent/.test(menu), true);
check("trigger keeps readable text on hover and while open", /hover:text-foreground/.test(menu) && /open && .+bg-secondary\/60 text-foreground/.test(menu), true);
check("dropdown exposes real menu semantics", /role="menu"/.test(menu) && /role="menuitem"/.test(menu), true);
check("dropdown trigger declares aria-haspopup/expanded", /aria-haspopup="menu"/.test(menu) && /aria-expanded=\{open\}/.test(menu), true);
check("dropdown closes on Escape and restores focus", /key === "Escape"/.test(menu) && /close\(true\)/.test(menu), true);
check("dropdown is reduced-motion aware", /reducedMotion \? \{ opacity: 1 \}/.test(menu), true);
check("dropdown does NOT use the heavy Radix menu", /@radix-ui\/react-dropdown-menu/.test(menu), false);

// The dropdown trigger must receive the consumer's size classes (a hardcoded
// className once left the trigger 40px tall beside 56px siblings).
check(
  "trigger merges the consumer className",
  /"w-full rounded-full border-border\/60 bg-background text-foreground",[\s\S]*?,\s*\n\s*className\s*\)/.test(menu) &&
    /<div ref=\{rootRef\} className="relative">/.test(menu),
  true
);
check("dropdown wrapper does NOT swallow className", /className=\{cn\("relative", className\)\}/.test(menu), false);
check("dropdown wrapper is a fixed relative box", /<div ref=\{rootRef\} className="relative">/.test(menu), true);

// The hero must not clip affordances that open past its bottom edge: the old
// `overflow-hidden` (meant for the orbs) was cropping the CV dropdown.
const hero = read("src/components/Hero.tsx");
check("hero section is overflow-visible", !/<section[^>]*id="home"[^>]*overflow-hidden/.test(hero), true);
check("orb decorations live in their own clipping wrapper", /absolute inset-0[^"]*overflow-hidden/.test(hero), true);

// The menu flips above the trigger when the viewport is short below it.
check("dropdown measures and flips upward when needed", /useLayoutEffect/.test(menu) && /dropUp/.test(menu) && /bottom-\[calc\(100%\+0\.5rem\)\]/.test(menu), true);

// The entry points use the dropdown, not a plain page link.
for (const f of ["src/components/Hero.tsx", "src/components/Navbar.tsx"]) {
  const src = read(f);
  check(`${f} renders CVReadMenu`, /<CVReadMenu/.test(src), true);
  check(`${f} has no leftover Read CV page link`, /Read CV<\/Link>|getCVPageUrl\(""\)/.test(src), false);
}

// --- 4. the iframe stays accessible ----------------------------------------
const viewer = read("src/components/cv/CVViewer.tsx");
check("iframe has a descriptive title", /inline PDF viewer/.test(viewer), true);
check("iframe sets referrerPolicy", /referrerPolicy="no-referrer"/.test(viewer), true);

// --- 5. route ordering ------------------------------------------------------
const app = read("src/App.tsx");
check("App declares a /cv route", /path="\/cv"/.test(app), true);
check("/cv is declared BEFORE the catch-all", app.indexOf('path="/cv"') < app.indexOf('path="*"'), true);

console.log(failures === 0 ? "\nAll dropdown + module + branch checks passed." : `\n${failures} check(s) FAILED.`);
process.exit(failures === 0 ? 0 : 1);

// Reproducible asset pipeline for the portfolio Projects section.
//
// What it does:
//  1. Mobile apps with a Google Play URL  -> scrapes the Play Store page HTML,
//     extracts screenshot media (play-lh.googleusercontent.com entries rendered
//     at w526/w1052 thumbnail sizes) and re-downloads each at high resolution
//     (`=w1080-rw`, WebP served by Google's CDN).
//  2. Web apps with a live demo URL        -> captures a 1440x900 desktop
//     screenshot via the Microlink screenshot API (no key needed for low volume).
//  3. Mobile apps with only a GitHub demo -> downloads the repo OpenGraph
//     social image (1200x640) as a branded cover fallback.
//
// Output: public/projects/<slug>/cover.<ext>, shot-1.<ext>, ...
// Run:    node scripts/fetch-project-assets.mjs
// Re-run is idempotent (skips files that already exist unless --force).

import { mkdir, writeFile, access } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_ROOT = path.join(ROOT, "public", "projects");
const FORCE = process.argv.includes("--force");
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

const JOBS = [
  // ---- Mobile (Google Play) ----
  { slug: "cv-builder", playId: "com.quvlox.cvbuilder", maxShots: 6 },
  { slug: "rss-reader-pro", playId: "com.rssreader.pro", maxShots: 6, fallbackRepo: "https://github.com/ahmedshaban-blip/rss-reader" },
  // ---- Mobile (GitHub-only: OG cover fallback) ----
  { slug: "enjez-mobile", repo: "https://github.com/ahmedshaban-blip/EnjezMobileAppVersion" },
  { slug: "ecommerce-app", repo: "https://github.com/ahmedshaban-blip/CodeAlpha_E-Commerce-Application" },
  { slug: "movies-app", repo: "https://github.com/ahmedshaban-blip/Flutter_Movies_App" },
  { slug: "coffee-app", repo: "https://github.com/ahmedshaban-blip/CoffeeApplication" },
  { slug: "flashcard-quiz", repo: "https://github.com/ahmedshaban-blip/CodeAlpha_FlashCardQuizApplication" },
  { slug: "currency-converter", repo: "https://github.com/ahmedshaban-blip/currency_converter" },
  { slug: "scan-qr", repo: "https://github.com/ahmedshaban-blip/scan_qr" },
  { slug: "research-discover", repo: "https://github.com/ahmedshaban-blip/scientific_research_discover" },
  { slug: "random-quote", repo: "https://github.com/ahmedshaban-blip/CodeAlpha_RandomQuoteGenerator" },
  // ---- Web (live screenshot) ----
  { slug: "melano", site: "https://melano.store" },
  { slug: "enjez-web", site: "https://enjez.vercel.app/home" },
  { slug: "elmatgar", site: "https://elmatgar.vercel.app/" },
  { slug: "upcourse", site: "https://e-learning-now.vercel.app/" },
];

async function exists(p) {
  try {
    await access(p, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function fetchBuffer(url, { timeoutMs = 30000 } = {}) {
  const res = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(timeoutMs) });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return { buf: Buffer.from(await res.arrayBuffer()), type: res.headers.get("content-type") ?? "" };
}

async function fetchWithRetry(url, { timeoutMs = 30000, attempts = 4, baseDelayMs = 2500, label = url } = {}) {
  let lastErr;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fetchBuffer(url, { timeoutMs });
    } catch (err) {
      lastErr = err;
      console.log(`  retry ${attempt}/${attempts} ${label}: ${err.message}`);
      await sleep(baseDelayMs * attempt);
    }
  }
  throw lastErr;
}

async function save(url, dest, { timeoutMs = 30000, attempts = 4 } = {}) {
  if (!FORCE && (await exists(dest))) {
    console.log(`  skip (exists) ${path.basename(dest)}`);
    return true;
  }
  const { buf, type } = await fetchWithRetry(url, { timeoutMs, attempts, label: path.basename(dest) });
  if (buf.length < 4000) throw new Error(`suspiciously small file (${buf.length}b) for ${url} [${type}]`);
  await writeFile(dest, buf);
  console.log(`  saved ${path.basename(dest)} (${(buf.length / 1024).toFixed(0)} KB, ${type})`);
  return true;
}

/** Extract distinct Play Store screenshot base URLs (w526/w1052 thumbs => real screenshots). */
async function playScreenshotBases(playId) {
  const res = await fetch(`https://play.google.com/store/apps/details?id=${playId}&hl=en&gl=US`, {
    headers: { "User-Agent": UA },
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`Play Store HTTP ${res.status} for ${playId}`);
  const html = await res.text();
  const hits = html.match(/https:\/\/play-lh\.googleusercontent\.com\/[A-Za-z0-9_-]+=[^"'\\\s<>]*/g) ?? [];
  const shots = [];
  for (const h of hits) {
    const size = h.match(/=w(\d+)-h(\d+)/);
    if (!size) continue;
    if (Number(size[1]) < 500) continue; // icons/avatars use small sizes
    const base = h.split("=")[0];
    if (!shots.includes(base)) shots.push(base);
  }
  return shots;
}

async function githubOgImage(repoUrl) {
  const res = await fetch(repoUrl, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(30000) });
  if (!res.ok) throw new Error(`GitHub HTTP ${res.status} for ${repoUrl}`);
  const html = await res.text();
  const m = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/);
  if (!m) throw new Error(`no og:image for ${repoUrl}`);
  return m[1];
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const summary = {};

for (const job of JOBS) {
  const dir = path.join(OUT_ROOT, job.slug);
  await mkdir(dir, { recursive: true });
  console.log(`\n[${job.slug}]`);
  summary[job.slug] = [];
  try {
    if (job.playId) {
      const bases = await playScreenshotBases(job.playId);
      console.log(`  found ${bases.length} Play screenshots`);
      const picks = bases.slice(0, job.maxShots ?? 6);
      if (picks.length === 0) throw new Error("no screenshots found on Play listing");
      let i = 0;
      for (const b of picks) {
        i += 1;
        const dest = path.join(dir, `shot-${i}.webp`);
        await save(`${b}=w1080-rw`, dest);
        summary[job.slug].push(`projects/${job.slug}/shot-${i}.webp`);
      }
      // cover = first shot (copy reference; no duplicate bytes on disk needed)
      summary[job.slug].cover = summary[job.slug][0];
    } else if (job.site) {
      const api = `https://api.microlink.io?url=${encodeURIComponent(job.site)}&screenshot=true&meta=false&embed=screenshot.url&viewport.width=1440&viewport.height=900&type=png`;
      const dest = path.join(dir, "cover.png");
      await save(api, dest, { timeoutMs: 60000 });
      summary[job.slug].push(`projects/${job.slug}/cover.png`);
      summary[job.slug].cover = `projects/${job.slug}/cover.png`;
      await sleep(1500); // respect free-tier rate limits
    } else if (job.repo) {
      const og = await githubOgImage(job.repo);
      const dest = path.join(dir, "cover.png");
      await save(og, dest);
      summary[job.slug].push(`projects/${job.slug}/cover.png`);
      summary[job.slug].cover = `projects/${job.slug}/cover.png`;
    }
  } catch (err) {
    console.error(`  FAILED: ${err.message}`);
    if (job.fallbackRepo) {
      try {
        console.log(`  trying GitHub OG fallback: ${job.fallbackRepo}`);
        const og = await githubOgImage(job.fallbackRepo);
        const dest = path.join(dir, "cover.png");
        await save(og, dest);
        summary[job.slug] = [`projects/${job.slug}/cover.png`];
        summary[job.slug].cover = `projects/${job.slug}/cover.png`;
      } catch (e2) {
        console.error(`  fallback FAILED: ${e2.message}`);
      }
    }
    if (summary[job.slug].length === 0) delete summary[job.slug];
  }
}

console.log("\nDone. Manifest (paste into src/data/projects.ts):");
console.log(JSON.stringify(summary, null, 2));

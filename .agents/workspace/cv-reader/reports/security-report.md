# Security Audit Report: Read CVs In-Browser (cv-reader)

Scope: the 16 files listed in `.agents/workspace/cv-reader/feature-files.json`.
Agent spec `.agent/agents/security.md` is written for Flutter; its **spirit**
(hardcoded secrets, transport, PII, input validation, supply chain, storage)
is applied to this React 18 + Vite + TS + Vercel-serverless project.

## 1. Executive Summary

- **Overall Verdict**: **PASS**
- **Max Severity Detected**: **Low**
- **Action Required**: None (no Critical/High). Optional Low hygiene follow-ups listed below.

Three explicit questions the parent asked resolved as follows:

1. **`mode=view` serving attacker-influenced bytes** — not exploitable as-is.
   The bytes are `application/pdf` from Cloudinary's `/raw/upload/` origin with
   `X-Content-Type-Options: nosniff` added by the handler (`api/download-cv.ts:97`).
   Inline serving from our own origin cannot be sniffed to HTML. The missing
   iframe `sandbox` is **correct and intentional** — adding `sandbox` to a
   browser-native PDF embed is a known way to break the built-in viewer, and
   the document is same-origin/same-file, so it gains nothing.
2. **`?track=` / `mode=` clamping** — both are clamped. `track` is validated by
   `isCVTrack` (`api/download-cv.ts:32,42`) and by `parseCVTrack` on the client
   (`src/config/cv.ts:66`). `mode` is reduced to a boolean
   `rawMode === "view"` (`api/download-cv.ts:39`). No SSRF, no open redirect.
3. **`openCV` reverse-tabnabbing** — protected. `window.open(..., "noopener,noreferrer")`
   (`src/lib/utils.ts:46`) sets an opaque opener; `noopener` is real, not a
   dead `rel` string.

## 2. Scope of Audit

- Total Feature Files Scanned: **16** (12 modified, 4 created) — see `feature-files.json`.
- Manifests Checked: N/A (web app — no `AndroidManifest.xml` / `Info.plist`).
- Native permissions: N/A.
- Dependencies Audited: **none added** — `package.json` / `package-lock.json`
  show **zero diff** vs. `HEAD` (`git diff -- package.json package-lock.json`
  → empty). No new PDF library; the embed is a plain `<iframe>`.
- New secrets: **none**. No new env var (`UPSTASH_*`/`KV_REST_API_*`,
  `ADMIN_PIN`, `CLOUDINARY_*` already existed and are reused).

## 3. Security Inspection Checklist

| Check Category | Details | Status | Notes |
| :--- | :--- | :--- | :--- |
| **Hardcoded Secrets** | Scanned all 16 feature files + `.env.example` for keys/tokens/PINs | PASS | Only `process.env.*` references; `.env.example` values are placeholders (`your…key`, `change…el`). `.env` is gitignored (`git check-ignore -v .env` → `.gitignore:14`) and untracked. |
| **Transport Security** | No new outbound host; the only fetch is the pre-existing Cloudinary HTTPS call | PASS | `api/download-cv.ts:52` is unchanged and uses `https://res.cloudinary.com/...`. Feature files contain **no** literal `http(s)://` URL (grep returned none). |
| **Content-Type Hardening** | `application/pdf` + `X-Content-Type-Options: nosniff` on both view and download | PASS | `api/download-cv.ts:91,97`. Prevents HTML/script sniffing of the inline document. |
| **Content-Disposition** | `inline` only when `mode === "view"`; everything else → `attachment` | PASS | `api/download-cv.ts:39,94`. Fail-safe: unknown/absent → attachment. Contract-harness confirmed (`verify-download-cv.mjs`, 21/21). |
| **Input Validation** | `track` closed union; `mode` boolean clamp; iframe `src` built only by `getCVViewUrl` | PASS | `api/download-cv.ts:32,35-39`; `src/config/cv.ts:50,66`. No user input reaches a URL unvalidated. |
| **PII & Logging** | No `console.log`/`console.error` of IPs, hashes, or the visitor id in any feature file | PASS | `visitor` (SHA-1 of IP) is only written into a HyperLogLog (`api/download-cv.ts:77,82`); never returned. |
| **Auth Gates** | `visit-stats` (401) and `visit-reset` (401) both PIN-gated; scope guard unchanged | PASS | `api/visit-stats.ts:80-84`; `api/visit-reset.ts:64-68,76-79`. No new auth path, no new env var. |
| **Reset Scope Separation** | `cv` vs `cvviews` globs are disjoint | PASS | Verified by independent re-derivation + harness (see §5). |
| **Supply Chain** | No new npm package; no new transitive dependency | PASS | `package.json`/`package-lock.json` unchanged. |
| **Reverse Tabnabbing** | `openCV` new-tab opener | PASS | `src/lib/utils.ts:46` `noopener,noreferrer`. |
| **Frame Embedding** | No `X-Frame-Options`/CSP in repo to relax; iframe same-origin | PASS | No `headers`/`X-Frame-Options`/`Content-Security-Policy` in `vercel.json` or `index.html` (grep empty). See SEC-04 for the forward-looking note. |

## 4. Findings & Remediation Plan

| ID | Severity | File:line | Vulnerability Description | Required Fix |
| :--- | :--- | :--- | :--- | :--- |
| `SEC-01` | Low | `vercel.json:4` | The rewrite `source` is `/((?!api/).*)`. The lookahead anchors on the literal `api/`, so the bare path **`/api`** (no trailing slash) is **not** excluded and would be rewritten to `/index.html`. Impact is nil today because no `api/index.ts` handler exists (only `api/download-cv.ts`, `api/visit-stats.ts`, `api/visit-reset.ts`), and `/api` was already rewritten to `index.html` by the old `/(.*)`. Not a regression, not exploitable. | If defence-in-depth is wanted, drop the slash: `"source": "/((?!api).*)"` (matches Vercel's own middleware-doc form). Syntax `/((?!api/).*)` is itself **valid** path-to-regexp — the un-named group wrapper is exactly what Vercel's `invalid-route-source` doc prescribes. Do **not** change it unless the `/api` edge matters. |
| `SEC-02` | Low | `api/visit-reset.ts:28` | The `cvviews` scope contains the exact key `"v:cvview"`, which no code ever writes (the handler writes `v:cvview:<track>`, i.e. `api/download-cv.ts:80`). It deletes 0 keys — dead pattern, harmless but misleading. | Remove `"v:cvview"` from the `cvviews` array, or keep it as an intentional future-proof all-time key. Cosmetic. |
| `SEC-03` | Low | `api/download-cv.ts:63-89` | The Redis counting block runs **after** the Cloudinary fetch but scans no attacker input; however the whole block is wrapped in a bare `catch {}` with no logging. Silent failures make an analytics outage invisible. This is pre-existing behaviour and **not** a vulnerability. | Optional: log a single sanitized line (no IP/hash) on failure. Not required. |
| `SEC-04` | Low (informational, forward-looking) | `src/components/cv/CVViewer.tsx:40-51` | No `sandbox` on the PDF iframe is the **correct** choice for the native viewer (adding `sandbox` commonly breaks PDF rendering, and same-origin framing of our own PDF is safe). Recorded so a future CSP addition does not silently break `/cv`: a global `Content-Security-Policy` would need `frame-src 'self'` (and `object-src 'self'`). | No change now. When a CSP is introduced, add `frame-src 'self'`. |
| `SEC-05` | Low | `api/visit-stats.ts:466` | `cvViews` is additive and PIN-gated; it exposes only two integers + a 14-element integer series per track. **No per-visitor data** — `visitor` is never read back; `visit-stats` only reads aggregate `PFCOUNT` integers. Explicitly **no finding**; recorded for completeness because it was asked. | None. |

### Answers to the parent's specific security questions

- **Q1 — is `inline` + same-origin an XSS or content-sniffing risk?**
  No. HTML/script sniffing is blocked by `Content-Type: application/pdf` +
  `nosniff`. The bytes originate from a Cloudinary account **we** control
  (`CLOUDINARY_CLOUD_NAME` + fixed public ids `flutter_cv.pdf` /
  `frontend_cv.pdf`), not from a request parameter, so there is no
  attacker-controlled content path. The `<iframe>` has `title` and
  `referrerPolicy="no-referrer"` (`CVViewer.tsx:43,45`).
- **Q2 — is `?track=` clamped before any URL/fetch? Is `mode` clamped?**
  Yes, both. `isCVTrack` guards the handler; `parseCVTrack` guards the page
  (invalid → `"flutter"`). `mode` collapses to `rawMode === "view"`. The iframe
  `src` is produced only by `getCVViewUrl(track)` with a union-typed `track`.
  No SSRF (destination host is a fixed constant), no open redirect.
- **Q3 — is the `noopener` protection real?** Yes — it is passed in the
  `windowFeatures` argument of `window.open`, which genuinely gives the new
  context an opaque opener. (`rel="noreferrer"` there is inert for
  `window.open`, but `noopener` is the one that matters and it is effective.)
  Also note `triggerDownload`'s anchor sets `rel="noopener noreferrer"`
  (`utils.ts:22`), unchanged.
- **Q4 — does `/((?!api/).*)` expose or shadow anything?** No harmful path.
  Syntax is valid path-to-regexp (Vercel's error doc prescribes the `((?!…).*)`
  un-named-group wrapper). `/api/<handler>` is excluded from the rewrite and
  still resolves to the functions. Only the bare `/api` edge differs
  (SEC-01), which has no handler. Non-API deep links (`/cv`, `/dashboard`)
  still rewrite to `index.html`. No filesystem asset is newly exposed (the
  pattern only controls the SPA fallback, not static serving).
- **Q5 — does `api/visit-stats.ts` leak anything? Is the gate real?**
  Gate is real: `401` when `Authorization: Bearer <ADMIN_PIN>` is absent/incorrect
  (`visit-stats.ts:80-84`), and it also fails closed when `ADMIN_PIN` is unset.
  `cvViews` = two integers (all-time total, summed 14-day unique) + a 14-element
  daily integer series, per track. No identifiers, IPs, or hashes.
- **Q6 — can `scope=cvviews` delete unintended keys?**
  No. `v:cvview:*` requires the literal `v:cvview:` prefix; it does **not**
  match `v:cvviewday:*` / `v:cvviewuniq:*` (those are `v:cvviewd…` /
  `v:cvviewu…`). The view family is covered by its own explicit globs
  `v:cvviewday:*` / `v:cvviewuniq:*`. Conversely `v:cv:*` / `v:cvday:*` /
  `v:cvuniq:*` cannot match any `v:cvview*` key. Authorization is unchanged
  (same `ADMIN_PIN` bearer check, same POST-only guard).
- **Q7 — new dependency / new secret / new outbound request?**
  None, none, none. `package.json` and `package-lock.json` are byte-identical
  to `HEAD`; no new env keys; the only network calls in scope are the
  pre-existing Cloudinary fetch and the pre-existing Upstash Redis REST calls.

## 5. Real Command Results (G10)

| # | Command | Result | Summary |
| --- | --- | --- | --- |
| S-1 | `git diff --stat` | PASS | 12 files modified, 0 added/deleted in tracked tree; feature files match `feature-files.json`. |
| S-2 | `git diff -- package.json package-lock.json` | PASS | **Empty output** → zero new dependencies. |
| S-3 | `git ls-files --error-unmatch .env` | PASS | `error: pathspec '.env' did not match any file(s) known to git` → `.env` is untracked. |
| S-4 | `git check-ignore -v .env` | PASS | `.gitignore:14:.env  .env` → ignored. |
| S-5 | Grep feature files for `password|secret|token|api_key|Bearer|eval(|fetch(|http://|process.env` | PASS | Only `process.env.*` reads and the pre-existing `fetch(cloudinaryUrl)`; no hardcoded credential. |
| S-6 | Grep `.env.example` values, shape-masked | PASS | All sensitive values are placeholders (`your…key`, `your…secret`, `change…el`); no real secret committed. |
| S-7 | Grep feature files for `https?://` | PASS | No literal outbound URL in any created/modified client file. |
| S-8 | `node .agents/workspace/cv-reader/verify-download-cv.mjs` | PASS | **21/21 checks passed**, including "cv scope does not match a view key" and "cvviews scope does not match downloads". |
| S-9 | Independent glob re-derivation over the real key strings | PASS | `v:cvview:*` ∌ `v:cvviewday:*`; `cv` globs ∌ any `v:cvview*` key; `cvviews` globs ∌ any `v:cv:*`/`v:cvday:*` key. Confirms SEC-02 is a no-op, not a deletion risk. |
| S-10 | Grep `vercel.json`, `index.html` for `X-Frame-Options|Content-Security|frame-ancestors|headers|redirects|sandbox` | PASS | No CSP / framing headers exist to relax — the embed needs no relaxation. |
| S-11 | `npm run build` | PASS | Success (see performance report for chunk sizes). |
| S-12 | `npx eslint src --ext .ts,.tsx` | PASS | exit 0, no output. |
| S-13 | `vite preview` + `Invoke-WebRequest /api/download-cv?track=flutter&mode=view` | **NOT MEASURED (runtime)** | `vite preview` answers every path with `index.html` — the probe returned `200 text/html`, no `Content-Disposition`. Serverless headers cannot be observed locally; verified by contract harness (S-8) instead. Matches `reports/e2e-verification.md`. |
| S-14 | Live Redis reset-scope deletion test against a deployed environment | **NOT MEASURED (runtime)** | No deployed environment / Upstash credentials available to this audit; semantics proved statically and by harness (S-8, S-9). |

## 6. Open Questions

- Should the `cvviews` scope keep the no-op exact key `"v:cvview"` (SEC-02)?
  Harmless either way; flagged only for cleanliness.
- When a CSP is introduced site-wide, add `frame-src 'self'` (SEC-04).

## 7. Verdict

**PASS.** Zero Critical, zero High, zero Medium. Five Low findings, all
informational or cosmetic; none blocks the pipeline. No new dependency, no new
secret, no new outbound request, and the two destructive scopes are provably
disjoint.

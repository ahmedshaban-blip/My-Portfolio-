# E2E Verification: cv-reader

Environment: production build served by `vite preview` on `http://localhost:4175`
(`npm run build` output). Date: 2026-11-03.

Note: `vite preview` does NOT execute the Vercel serverless handlers — it answers
every path with `index.html`, so `/api/download-cv` returned `text/html` over
HTTP. The handler contract was therefore verified by the static contract harness
`verify-download-cv.mjs` (21 checks, all passing) instead of over the wire. The
handler itself is only reachable on Vercel.

| # | Check | Result | Evidence |
| --- | --- | --- | --- |
| E2E-01 | `/cv?track=flutter` renders | PASS | `h1` = "Flutter Developer CV"; iframe src `/api/download-cv?track=flutter&mode=view` |
| E2E-02 | `/cv?track=frontend` renders | PASS | `h1` = "Frontend Developer CV"; active tab = "Frontend Developer CV" |
| E2E-03 | Bare `/cv` defaults | PASS | URL stays `/cv`; renders Flutter CV |
| E2E-04 | Invalid track handled | PASS | `?track=marketing` → notice shown, URL normalized to `?track=flutter`, Flutter CV rendered |
| E2E-05 | Both track tabs present | PASS | `role="tab"` × 2, `data-state` active/inactive correct |
| E2E-06 | iframe is accessible | PASS | `title` = "Flutter Developer CV — inline PDF viewer" |
| E2E-07 | Mobile/coarse-pointer fallback | PASS | at 702px width the iframe is absent; "Open PDF" + "Download" render with aria-labels |
| E2E-08 | Wrong-scope reset cannot wipe views | PASS | contract harness: `cv` scope does not match `v:cvview:*` / `v:cvviewday:*` |
| E2E-09 | View vs download headers | PASS (contract) | `mode=view` → `inline`; default → `attachment`; unknown → `attachment` |
| E2E-10 | Counting namespaces are disjoint | PASS (contract) | no shared key between `v:cv*` and `v:cvview*` |
| E2E-11 | Range requests do not inflate views | PASS (contract) | `Range` header present → not counted |
| E2E-12 | Home page unaffected | PASS | 231 DOM nodes, no below-fold sections mounted, 2 "Read CV" links (`/cv?track=flutter`) |
| E2E-13 | Download path preserved | PASS (code) | `downloadCV` + `getCVDownloadUrl` unchanged; no `mode` param emitted |
| E2E-14 | No console errors | PASS | 0 console messages (errors or warnings) on the home page |

## Regression found and fixed during verification

**The invalid-track notice never rendered.** The normalization effect rewrote the
URL on the first commit, which flipped the derived `invalidTrack` boolean back to
false and unmounted the notice in the same render — the user saw a silent
substitution. Fixed by latching the fact in state (`setInvalidTrack(true)`)
before normalizing, so the notice survives the URL rewrite. Re-verified: the
notice is present from 150ms onward while the URL reads `?track=flutter`.

## Not measured

- **Real numbers in the admin "CV views" card.** The Redis view keys are empty
  until the endpoint runs on a deployed environment with Upstash configured, and
  `vite preview` does not execute the handlers. The card was verified to render
  (it falls back to the honest "No in-browser reads recorded yet." empty state
  and to zeros from `buildEmptyAnalytics`).
- **Actual PDF rendering inside the iframe.** The embed points at
  `/api/download-cv?...&mode=view`, which cannot be served locally, so the
  browser showed an empty frame. The `inline` disposition that makes it render
  was verified at the contract level, not visually.

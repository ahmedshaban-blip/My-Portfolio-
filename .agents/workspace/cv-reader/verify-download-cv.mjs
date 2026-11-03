/**
 * Static verification of the api/download-cv.ts contract.
 *
 * The Vercel handlers are not reachable from `vite preview` (it answers every
 * path with index.html), so this asserts the exact decision rules the handler
 * uses, re-implemented from the shipped source shape, to prove the view and
 * download paths cannot cross-contaminate.
 *
 * Run: node .agents/workspace/cv-reader/verify-download-cv.mjs
 */

let failures = 0;
const check = (name, actual, expected) => {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}`);
  if (!ok) console.log(`        expected ${JSON.stringify(expected)}\n        actual   ${JSON.stringify(actual)}`);
};

// --- mirrors the handler's parsing rules -------------------------------------
const pick = (v) => (Array.isArray(v) ? v[0] : v);
const isViewMode = (query) => pick(query?.mode) === "view";

const dispositionFor = (viewMode) => (viewMode ? "inline" : "attachment");
const namespaceFor = (viewMode) => (viewMode ? "cvview" : "cv");

const isRangeRequest = (headers) => pick(headers?.range) != null;
const shouldCount = (headers) => !isRangeRequest(headers);

// --- query param -> mode -----------------------------------------------------
check("absent mode is a download", isViewMode({ track: "flutter" }), false);
check("mode=view is a view", isViewMode({ track: "flutter", mode: "view" }), true);
check("mode=download is a download", isViewMode({ track: "flutter", mode: "download" }), false);
check("unknown mode fails safe to download", isViewMode({ track: "flutter", mode: "nonsense" }), false);
check("array mode takes the first value", isViewMode({ mode: ["view", "download"] }), true);

// --- disposition -------------------------------------------------------------
check("view disposition is inline", dispositionFor(true), "inline");
check("download disposition is attachment", dispositionFor(false), "attachment");

// --- key namespaces never overlap -------------------------------------------
check("view namespace", namespaceFor(true), "cvview");
check("download namespace", namespaceFor(false), "cv");
const keysFor = (ns, track, day) => [
  `v:${ns}:${track}`,
  `v:${ns}day:${track}:${day}`,
  `v:${ns}uniq:${track}:${day}`,
];
const viewKeys = keysFor(namespaceFor(true), "flutter", "2026-11-03");
const dlKeys = keysFor(namespaceFor(false), "flutter", "2026-11-03");
check("view keys carry the cvview family", viewKeys, [
  "v:cvview:flutter",
  "v:cvviewday:flutter:2026-11-03",
  "v:cvviewuniq:flutter:2026-11-03",
]);
check("download keys are unchanged", dlKeys, [
  "v:cv:flutter",
  "v:cvday:flutter:2026-11-03",
  "v:cvuniq:flutter:2026-11-03",
]);
const overlap = viewKeys.filter((k) => dlKeys.includes(k));
check("no key is shared between the two families", overlap, []);

// --- range requests do not inflate a single view -----------------------------
check("plain request counts", shouldCount({}), true);
check("range request is skipped", shouldCount({ range: "bytes=0-1024" }), false);
check("arrayed range header is skipped", shouldCount({ range: ["bytes=0-1024"] }), false);

// --- reset scopes stay disjoint ---------------------------------------------
// Mirrors api/visit-reset.ts SCOPES. `cv` must never match a `cvview` key.
const SCOPES = {
  cv: ["v:cv", "v:cv:*", "v:cvday:*", "v:cvuniq:*"],
  cvviews: ["v:cvview", "v:cvview:*", "v:cvviewday:*", "v:cvviewuniq:*"],
};
const globToRegExp = (g) => new RegExp(`^${g.split("*").map((s) => s.replace(/[.+?^${}()|[\]\\]/g, "\\$&")).join(".*")}$`);
const matchesAny = (patterns, key) => patterns.some((p) => globToRegExp(p).test(key));
check("cv scope does not match a view key", matchesAny(SCOPES.cv, "v:cvview:flutter"), false);
check("cv scope does not match a view day key", matchesAny(SCOPES.cv, "v:cvviewday:flutter:2026-11-03"), false);
check("cv scope still matches a download total", matchesAny(SCOPES.cv, "v:cv:flutter"), true);
check("cv scope still matches a download day", matchesAny(SCOPES.cv, "v:cvday:flutter:2026-11-03"), true);
check("cvviews scope matches view keys", matchesAny(SCOPES.cvviews, "v:cvview:flutter"), true);
check("cvviews scope does not match downloads", matchesAny(SCOPES.cvviews, "v:cv:flutter"), false);

console.log(failures === 0 ? "\nAll contract checks passed." : `\n${failures} check(s) FAILED.`);
process.exit(failures === 0 ? 0 : 1);

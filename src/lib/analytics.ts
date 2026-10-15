export type VisitRow = {
  id?: string;
  created_at: string;
  path: string;
  referrer: string;
  device: "mobile" | "desktop" | "tablet";
  browser: string;
  country?: string;
  session_id: string;
};

export type DayPoint = { label: string; date: string; visits: number; unique: number };
export type SourceSlice = { label: string; value: number; color: string };
export type TopPage = { path: string; visits: number; avgSeconds: number; bounce: number };
export type FeedItem = { place: string; path: string; when: string; you?: boolean; bot?: boolean };
export type HourlyPoint = { hour: string; value: number };
export type CvTrack = { track: "flutter" | "frontend"; total: number; unique: number; daily: { date: string; value: number }[] };
export type CountryStat = { code: string; flag: string; visits: number };

export type AnalyticsData = {
  source: "mock" | "live";
  hasData: boolean;
  today: number;
  yesterday: number;
  last7: number;
  last30: number;
  unique30: number;
  liveNow: number;
  bounceRate: number;
  avgSeconds: number;
  deltaMonth: number;
  deltaWeek: number;
  daily: DayPoint[];
  hourly: HourlyPoint[];
  sources: SourceSlice[];
  devices: { label: string; value: number; color: string }[];
  browsers: { label: string; value: number }[];
  topPages: TopPage[];
  feed: FeedItem[];
  cv: CvTrack[];
  countries: CountryStat[];
  owner: { today: number; liveNow: number };
  botsToday: number;
  rangeLabel: string;
  peakDay: string;
};

// Deterministic pseudo-random so mock looks stable between reloads.
function seeded(n: number) {
  const x = Math.sin(n * 999.7) * 10000;
  return x - Math.floor(x);
}

const DAY_LABELS = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];

export function buildMockAnalytics(): AnalyticsData {
  const now = new Date();
  const daily: DayPoint[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const weekendBoost = d.getDay() === 6 ? 1.6 : d.getDay() === 5 ? 1.3 : 1;
    const growth = 1 + (29 - i) * 0.012;
    const visits = Math.round((280 + seeded(i * 3 + 1) * 260) * weekendBoost * growth);
    daily.push({
      label: `${DAY_LABELS[d.getDay()]} ${d.getDate()}`,
      date: d.toISOString().slice(0, 10),
      visits,
      unique: Math.round(visits * (0.6 + seeded(i * 7 + 2) * 0.12)),
    });
  }
  const last30 = daily.reduce((s, d) => s + d.visits, 0);
  const last7 = daily.slice(-7).reduce((s, d) => s + d.visits, 0);
  const unique30 = daily.reduce((s, d) => s + d.unique, 0);
  const today = daily[daily.length - 1].visits;
  const yesterday = daily[daily.length - 2].visits;
  const peak = daily.reduce((a, b) => (b.visits > a.visits ? b : a));

  const hours = ["12a", "3a", "6a", "9a", "12p", "3p", "6p", "9p"];
  const hourly: HourlyPoint[] = hours.map((hour, i) => {
    const curve = [8, 5, 7, 22, 38, 52, 84, 100][i];
    return { hour, value: Math.round(curve * (0.9 + seeded(i + 40) * 0.2)) };
  });

  return {
    source: "mock",
    hasData: true,
    today,
    yesterday,
    last7,
    last30,
    unique30,
    liveNow: 24 + Math.floor(seeded(Date.now() % 97) * 16),
    bounceRate: 38,
    avgSeconds: 167,
    deltaMonth: 18.2,
    deltaWeek: 9.4,
    daily,
    hourly,
    sources: [
      { label: "Google", value: 52, color: "#059669" },
      { label: "Social", value: 25, color: "#d97706" },
      { label: "Direct", value: 15, color: "#1d2421" },
      { label: "Other", value: 8, color: "#a8a29e" },
    ],
    devices: [
      { label: "Mobile", value: 64, color: "#10b981" },
      { label: "Desktop", value: 29, color: "#f59e0b" },
      { label: "Tablet", value: 7, color: "#a8a29e" },
    ],
    browsers: [
      { label: "Chrome", value: 71 },
      { label: "Safari", value: 18 },
      { label: "Edge", value: 8 },
    ],
    topPages: [
      { path: "/", visits: 5210, avgSeconds: 192, bounce: 32 },
      { path: "/projects/melano", visits: 2140, avgSeconds: 125, bounce: 41 },
      { path: "/cv", visits: 1870, avgSeconds: 72, bounce: 58 },
      { path: "/projects/nassy", visits: 1240, avgSeconds: 148, bounce: 36 },
    ],
    feed: [
      { place: "Cairo, EG", path: "/projects/melano", when: "now" },
      { place: "Riyadh, SA", path: "/cv", when: "1m ago" },
      { place: "Berlin, DE", path: "/", when: "3m ago" },
      { place: "Dubai, AE", path: "/projects/nassy", when: "5m ago" },
    ],
    countries: [
      { code: "EG", flag: countryFlag("EG"), visits: 4210 },
      { code: "SA", flag: countryFlag("SA"), visits: 1860 },
      { code: "AE", flag: countryFlag("AE"), visits: 940 },
      { code: "DE", flag: countryFlag("DE"), visits: 620 },
    ],
    owner: { today: 0, liveNow: 0 },
    botsToday: 0,
    rangeLabel: formatRangeLabel(daily[0].date, daily[daily.length - 1].date, false),
    cv: (["flutter", "frontend"] as const).map((track, t) => ({
      track,
      total: track === "flutter" ? 412 : 228,
      unique: track === "flutter" ? 368 : 201,
      daily: Array.from({ length: 14 }, (_, i) => ({
        date: `day-${i}`,
        value: Math.round((track === "flutter" ? 22 : 12) * (0.5 + seeded(i * 11 + t * 5 + 3))),
      })),
    })),
    peakDay: `${peak.label} · ${peak.visits.toLocaleString()}`,
  };
}

export function formatDuration(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** "2026-10-15" → "Oct 15". */
export function formatShortDate(iso: string) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  return `${months[Number(m[2]) - 1] ?? m[2]} ${Number(m[3])}`;
}

/** "2026-10-09 → Oct 15" style range label. */
export function formatRangeLabel(from: string, to: string, allTime: boolean) {
  const span = `${formatShortDate(from)} → ${formatShortDate(to)}`;
  return allTime ? `All time · ${span}` : span;
}
export function countryFlag(code: string) {
  const upper = code.toUpperCase();
  if (!/^[A-Z]{2}$/.test(upper)) return "🌍";
  return String.fromCodePoint(...[...upper].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}

/** Build an SVG area+line path from values. */
export function areaPaths(values: number[], w: number, h: number, pad = 6) {
  const max = Math.max(...values, 1);
  const min = 0;
  const stepX = w / Math.max(values.length - 1, 1);
  const y = (v: number) => h - pad - ((v - min) / (max - min)) * (h - pad * 2);
  const pts = values.map((v, i) => [i * stepX, y(v)] as const);
  const line = pts.map(([x, yy], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${yy.toFixed(1)}`).join(" ");
  const area = `${line} L${w},${h} L0,${h} Z`;
  // All-zero series (e.g. right after a reset) has no real peak — point at the end.
  const peakIdx = values.indexOf(max);
  const peakPt = (peakIdx >= 0 ? pts[peakIdx] : pts[pts.length - 1]) ?? ([0, h] as const);
  return { line, area, peak: { x: peakPt[0], y: peakPt[1] } };
}

export function detectDevice(): VisitRow["device"] {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent.toLowerCase();
  if (/tablet|ipad/.test(ua)) return "tablet";
  if (/mobile|android|iphone/.test(ua)) return "mobile";
  return "desktop";
}

export function detectBrowser(): string {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent;
  if (/Edg\//.test(ua)) return "Edge";
  if (/Chrome\//.test(ua)) return "Chrome";
  if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) return "Safari";
  if (/Firefox\//.test(ua)) return "Firefox";
  return "Other";
}

export function classifySource(ref: string): string {
  if (!ref) return "Direct";
  try {
    const host = new URL(ref).hostname.toLowerCase();
    if (/google|bing|duckduckgo|yahoo/.test(host)) return "Google";
    if (/linkedin|twitter|x\.com|facebook|instagram|tiktok/.test(host)) return "Social";
    if (typeof location !== "undefined" && host === location.hostname.toLowerCase()) return "Internal";
    return "Other";
  } catch {
    return "Other";
  }
}

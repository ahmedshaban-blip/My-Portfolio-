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
  source: "live" | "empty";
  hasData: boolean;
  today: number;
  yesterday: number;
  last7: number;
  last30: number;
  unique30: number;
  liveNow: number;
  bounceRate: number;
  avgSeconds: number;
  /** Sessions with engagement data in range — 0 means "not measured yet". */
  engagementSessions: number;
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

// Empty skeleton for a date list — zeros everywhere, no fake numbers.
export function buildEmptyAnalytics(dates: string[]): AnalyticsData {
  const daily: DayPoint[] = dates.map((date) => ({
    date,
    label: date.slice(5),
    visits: 0,
    unique: 0,
  }));

  return {
    source: "empty",
    hasData: false,
    today: 0,
    yesterday: 0,
    last7: 0,
    last30: 0,
    unique30: 0,
    liveNow: 0,
    bounceRate: 0,
    avgSeconds: 0,
    engagementSessions: 0,
    deltaMonth: 0,
    deltaWeek: 0,
    daily,
    hourly: [],
    sources: [],
    devices: [],
    browsers: [],
    topPages: [],
    feed: [],
    countries: [],
    owner: { today: 0, liveNow: 0 },
    botsToday: 0,
    rangeLabel: dates.length > 0 ? formatRangeLabel(dates[0], dates[dates.length - 1], false) : "—",
    cv: (["flutter", "frontend"] as const).map((track) => ({ track, total: 0, unique: 0, daily: [] })),
    peakDay: "—",
  };
}

/** Local date list for the empty state (mirrors the requested filter). */
export function emptyDatesForRange(range: "7" | "14" | "30" | "all" | "custom", from = "", to = ""): string[] {
  const out: string[] = [];
  const today = new Date();
  if (range === "custom" && from && to && from <= to) {
    const span = Math.round((Date.parse(to) - Date.parse(from)) / 86400000) + 1;
    if (span > 366) {
      // Monthly skeleton for very long spans.
      for (let ym = from.slice(0, 7); ym <= to.slice(0, 7);) {
        out.push(`${ym}-01`);
        if (out.length > 240 || ym === to.slice(0, 7)) break;
        const [y, m] = ym.split("-").map(Number);
        ym = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`;
      }
      return out;
    }
    for (let t = Date.parse(from); t <= Date.parse(to); t += 86400000) {
      out.push(new Date(t).toISOString().slice(0, 10));
    }
    return out;
  }
  const n = range === "all" ? 30 : Number(range) || 14;
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

export function formatDuration(totalSeconds: number) {
  const total = Math.max(0, Math.round(totalSeconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
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

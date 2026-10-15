import { useQuery } from "@tanstack/react-query";
import { ADMIN_PIN_SESSION_KEY } from "@/components/admin/AdminAuthGuard";
import {
  buildEmptyAnalytics,
  countryFlag,
  emptyDatesForRange,
  formatDuration,
  formatRangeLabel,
  type AnalyticsData,
  type CvTrack,
  type DayPoint,
  type FeedItem,
  type HourlyPoint,
  type TopPage,
} from "@/lib/analytics";

export type RangeKey = "7" | "14" | "30" | "all" | "custom";

export type CustomRange = { from: string; to: string };

export { formatDuration };

type StatsResponse = {
  configured: boolean;
  hasData: boolean;
  range: string;
  allTime: boolean;
  from: string;
  to: string;
  today: number;
  yesterday: number;
  last7: number;
  last30: number;
  unique30: number;
  liveNow: number;
  daily: DayPoint[];
  hourly: HourlyPoint[];
  sources: Record<string, number>;
  devices: Record<string, number>;
  pages: Record<string, number>;
  countries: Record<string, number>;
  browsers: Record<string, number>;
  feed: FeedItem[];
  cv: CvTrack[];
  owner: { today: number; liveNow: number };
  botsToday: number;
  peakDay: string;
};

const SOURCE_COLORS: Record<string, string> = {
  Google: "#059669",
  Social: "#d97706",
  Direct: "#1d2421",
};
const DEVICE_COLORS: Record<string, string> = {
  Mobile: "#10b981",
  Desktop: "#f59e0b",
  Tablet: "#a8a29e",
};

function toPercentMap(record: Record<string, number>, colors: Record<string, string>, fallback: string) {
  const total = Object.values(record).reduce((s, v) => s + v, 0);
  const entries = Object.entries(record).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) return [];
  return entries.slice(0, 4).map(([label, value]) => ({
    label,
    value: total > 0 ? Math.round((value / total) * 100) : 0,
    color: colors[label] ?? fallback,
  }));
}

function mapStatsResponse(json: StatsResponse): AnalyticsData {
  const topPages: TopPage[] = Object.entries(json.pages)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    // Engagement timing ships in v2 — never show mock bounce/avg on live data.
    .map(([path, visits]) => ({ path, visits, avgSeconds: 0, bounce: 0 }));

  const countries = Object.entries(json.countries ?? {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([code, visits]) => ({ code: code.toUpperCase(), flag: countryFlag(code), visits }));

  const browserTotals = json.browsers ?? {};
  const browserSum = Object.values(browserTotals).reduce((s, v) => s + v, 0);
  const browsers = browserSum > 0
    ? Object.entries(browserTotals)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([label, value]) => ({ label, value: Math.round((value / browserSum) * 100) }))
    : [];

  return {
    source: "live",
    hasData: json.hasData,
    today: json.today,
    yesterday: json.yesterday,
    last7: json.last7,
    last30: json.last30,
    unique30: json.unique30,
    liveNow: json.liveNow,
    // Engagement timing ships in v2 — show placeholders until then.
    bounceRate: 0,
    avgSeconds: 0,
    deltaMonth: 0,
    deltaWeek: 0,
    daily: json.daily,
    hourly: json.hourly,
    sources: toPercentMap(json.sources, SOURCE_COLORS, "#a8a29e"),
    devices: toPercentMap(json.devices, DEVICE_COLORS, "#a8a29e").map((d) => ({
      label: (d.label[0] ?? "").toUpperCase() + d.label.slice(1),
      value: d.value,
      color: d.color,
    })),
    browsers,
    topPages,
    feed: json.feed,
    cv: (json.cv ?? []) as CvTrack[],
    countries,
    owner: json.owner ?? { today: 0, liveNow: 0 },
    botsToday: Number(json.botsToday) || 0,
    rangeLabel: formatRangeLabel(json.from, json.to, json.allTime),
    peakDay: json.peakDay || "—",
  };
}

export function useVisitsAnalytics(range: RangeKey, custom?: CustomRange) {
  const query = range === "custom" && custom?.from && custom?.to
    ? `from=${custom.from}&to=${custom.to}`
    : `days=${range}`;
  return useQuery({
    queryKey: ["visits-analytics", range, custom?.from ?? "", custom?.to ?? ""],
    queryFn: async (): Promise<AnalyticsData> => {
      try {
        const pin = sessionStorage.getItem(ADMIN_PIN_SESSION_KEY) ?? "";
        const res = await fetch(`/api/visit-stats?${query}`, {
          headers: { Authorization: `Bearer ${pin}` },
        });
        if (!res.ok) throw new Error(`stats ${res.status}`);
        const json = (await res.json()) as StatsResponse;
        if (!json.configured) throw new Error("not configured");
        return mapStatsResponse(json);
      } catch {
        // Storage not configured / unreachable → honest empty state (zeros, no fake numbers).
        return buildEmptyAnalytics(
          emptyDatesForRange(range === "custom" ? "custom" : range, custom?.from ?? "", custom?.to ?? ""),
        );
      }
    },
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
}

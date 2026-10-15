import { useQuery } from "@tanstack/react-query";
import { ADMIN_PIN_SESSION_KEY } from "@/components/admin/AdminAuthGuard";
import {
  buildMockAnalytics,
  formatDuration,
  type AnalyticsData,
  type CvTrack,
  type DayPoint,
  type FeedItem,
  type HourlyPoint,
  type TopPage,
} from "@/lib/analytics";

export type RangeKey = "7" | "14" | "30";

export { formatDuration };

type StatsResponse = {
  configured: boolean;
  hasData: boolean;
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
  feed: FeedItem[];
  cv: CvTrack[];
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
  const mock = buildMockAnalytics();
  const topPages: TopPage[] = Object.entries(json.pages)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([path, visits]) => {
      const fallback = mock.topPages.find((p) => p.path === path);
      return { path, visits, avgSeconds: fallback?.avgSeconds ?? 0, bounce: fallback?.bounce ?? 0 };
    });

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
    hourly: json.hourly.length > 0 ? json.hourly : mock.hourly,
    sources: toPercentMap(json.sources, SOURCE_COLORS, "#a8a29e"),
    devices: toPercentMap(json.devices, DEVICE_COLORS, "#a8a29e").map((d) => ({
      label: d.label[0].toUpperCase() + d.label.slice(1),
      value: d.value,
      color: d.color,
    })),
    browsers: mock.browsers,
    topPages,
    feed: json.feed,
    cv: (json.cv ?? []) as CvTrack[],
    peakDay: json.peakDay || "—",
  };
}

export function useVisitsAnalytics(range: RangeKey) {
  return useQuery({
    queryKey: ["visits-analytics", range],
    queryFn: async (): Promise<AnalyticsData> => {
      try {
        const pin = sessionStorage.getItem(ADMIN_PIN_SESSION_KEY) ?? "";
        const res = await fetch(`/api/visit-stats?days=${range}`, {
          headers: { Authorization: `Bearer ${pin}` },
        });
        if (!res.ok) throw new Error(`stats ${res.status}`);
        const json = (await res.json()) as StatsResponse;
        if (!json.configured) throw new Error("not configured");
        return mapStatsResponse(json);
      } catch {
        // Redis not configured / unreachable → demo data so the dashboard still previews.
        const mock = buildMockAnalytics();
        if (range !== "14") {
          const days = Number(range);
          const daily = mock.daily.slice(-days);
          const peak = daily.reduce((a, b) => (b.visits > a.visits ? b : a));
          return { ...mock, daily, peakDay: `${peak.label} · ${peak.visits.toLocaleString()}` };
        }
        return mock;
      }
    },
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
}

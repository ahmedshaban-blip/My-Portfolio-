import { Redis } from "@upstash/redis";

// Same numbers as src/lib/analytics-config.ts (single source of truth).
// Loaded dynamically so a bundling hiccup can never take stats down.
const FALLBACK_CONFIG = {
  feedVisibleCount: 15,
  feedFetchCount: 20,
  feedStoredCount: 50,
  ownerFeedFetchCount: 6,
  feedMaxHeightPx: 420,
} as const;

async function loadConfig() {
  try {
    const mod = (await import("../src/lib/analytics-config")) as {
      ANALYTICS_CONFIG?: typeof FALLBACK_CONFIG;
    };
    return mod.ANALYTICS_CONFIG ?? FALLBACK_CONFIG;
  } catch {
    return FALLBACK_CONFIG;
  }
}

type VercelRequest = {
  method?: string;
  headers: {
    authorization?: string;
  };
  query?: Record<string, string | string[] | undefined>;
};

type VercelResponse = {
  setHeader: (key: string, value: string) => void;
  status: (statusCode: number) => {
    json: (body: Record<string, unknown>) => void;
  };
};

const queryParam = (query: VercelRequest["query"], name: string) => {
  const value = query?.[name];
  return Array.isArray(value) ? value[0] : value;
};

const toRecord = (flat: unknown): Record<string, number> => {
  const out: Record<string, number> = {};
  if (Array.isArray(flat)) {
    for (let i = 0; i + 1 < flat.length; i += 2) {
      out[String(flat[i])] = Number(flat[i + 1]) || 0;
    }
  } else if (flat && typeof flat === "object") {
    for (const [k, v] of Object.entries(flat as Record<string, unknown>)) {
      out[k] = Number(v) || 0;
    }
  }
  return out;
};

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const adminPin = process.env.ADMIN_PIN ?? process.env.VITE_ADMIN_PIN;
  const providedPin = request.headers.authorization?.replace(/^Bearer\s+/i, "") ?? "";
  if (!adminPin || providedPin !== adminPin) {
    return response.status(401).json({ error: "Unauthorized." });
  }

  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    return response.status(501).json({ error: "Analytics storage is not configured.", configured: false });
  }

  const daysRaw = queryParam(request.query, "days") ?? "14";
  const fromRaw = queryParam(request.query, "from") ?? "";
  const toRaw = queryParam(request.query, "to") ?? "";
  const days = daysRaw === "all" ? "all" : [7, 14, 30].includes(Number(daysRaw)) ? Number(daysRaw) : 14;

  const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;
  const toDayKey = (d: Date) => d.toISOString().slice(0, 10);
  const todayKey = toDayKey(new Date());

  // Custom range: ?from=YYYY-MM-DD&to=YYYY-MM-DD (any span up to 10 years;
  // spans over 180 days are aggregated monthly).
  const MAX_CUSTOM_DAYS = 3650;
  let customFrom = "";
  let customTo = "";
  let customSpan = 0;
  if (ISO_DAY.test(fromRaw) && ISO_DAY.test(toRaw) && fromRaw <= toRaw && toRaw <= todayKey) {
    customSpan = Math.round((Date.parse(toRaw) - Date.parse(fromRaw)) / 86400000) + 1;
    if (customSpan >= 1 && customSpan <= MAX_CUSTOM_DAYS) {
      customFrom = fromRaw;
      customTo = toRaw;
    }
  }
  const isCustom = customFrom !== "";
  const useMonthly = isCustom && customSpan > 180;

  const HISTORY_DAYS = 730; // discovery window for "All" (trimmed to first active day below).

  try {
    const redis = new Redis({ url, token });
    const ANALYTICS_CONFIG = await loadConfig();
    const now = new Date();
    const dayKeys: string[] = [];
    for (let i = HISTORY_DAYS - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      dayKeys.push(d.toISOString().slice(0, 10));
    }

    // Resolve the requested window: custom from/to, "all", or a preset.
    // Long custom spans switch to monthly buckets (bounded, fast, chart-friendly).
    const monthLabel = (ym: string) => {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const m = /^(\d{4})-(\d{2})$/.exec(ym);
      if (!m) return ym;
      return `${months[Number(m[2]) - 1]} ${m[1].slice(2)}`;
    };
    let rangeDays: string[];
    let monthKeys: string[] = [];
    if (isCustom && useMonthly) {
      const startYm = customFrom.slice(0, 7);
      const endYm = customTo.slice(0, 7);
      for (let ym = startYm; ym <= endYm;) {
        monthKeys.push(ym);
        if (monthKeys.length > 240 || ym === endYm) break;
        const [y, m] = ym.split("-").map(Number);
        ym = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`;
        if (monthKeys.length > 240) break;
      }
      rangeDays = [];
    } else if (isCustom) {
      rangeDays = [];
      for (let t = Date.parse(customFrom); t <= Date.parse(customTo); t += 86400000) {
        rangeDays.push(toDayKey(new Date(t)));
      }
    } else {
      rangeDays = days === "all" ? [...dayKeys] : dayKeys.slice(-days);
    }
    const cvDays = dayKeys.slice(-14);
    const useAllTimeTotals = days === "all" && !isCustom;

    // One batched round-trip for every counter/hash in the selected range.
    const pipe = redis.pipeline();
    for (const d of rangeDays) {
      pipe.get(`v:day:${d}`);
      pipe.pfcount(`v:uniq:${d}`);
      if (!useAllTimeTotals) {
        pipe.hgetall(`v:page:${d}`);
        pipe.hgetall(`v:device:${d}`);
        pipe.hgetall(`v:source:${d}`);
        pipe.hgetall(`v:country:${d}`);
        pipe.hgetall(`v:browser:${d}`);
      }
    }
    for (const ym of monthKeys) {
      pipe.get(`v:m:${ym}`);
      pipe.pfcount(`v:muniq:${ym}`);
      pipe.hgetall(`v:mpage:${ym}`);
      pipe.hgetall(`v:mdevice:${ym}`);
      pipe.hgetall(`v:msource:${ym}`);
      pipe.hgetall(`v:mcountry:${ym}`);
      pipe.hgetall(`v:mbrowser:${ym}`);
    }
    if (useAllTimeTotals) {
      pipe.hgetall(`v:tot:page`);
      pipe.hgetall(`v:tot:device`);
      pipe.hgetall(`v:tot:source`);
      pipe.hgetall(`v:tot:country`);
      pipe.hgetall(`v:tot:browser`);
      pipe.get(`v:total`);
      pipe.pfcount(`v:uniq:all`);
    }
    pipe.hgetall(`v:hour:${dayKeys[dayKeys.length - 1]}`);
    pipe.get(`v:cv:flutter`);
    pipe.get(`v:cv:frontend`);
    for (const d of cvDays) {
      pipe.get(`v:cvday:flutter:${d}`);
      pipe.get(`v:cvday:frontend:${d}`);
    }
    const results = ((await pipe.exec()) ?? []) as unknown[];

    let cursor = 0;
    const next = () => results[cursor++] as unknown;
    const perDay: { date: string; visits: number; unique: number }[] = [];
    const pageTotals: Record<string, number> = {};
    const deviceTotals: Record<string, number> = {};
    const sourceTotals: Record<string, number> = {};
    const countryTotals: Record<string, number> = {};
    const browserTotals: Record<string, number> = {};
    const merge = (target: Record<string, number>, flat: unknown) => {
      for (const [k, v] of Object.entries(toRecord(flat))) {
        target[k] = (target[k] ?? 0) + v;
      }
    };
    for (const date of rangeDays) {
      const visits = Number(next() ?? 0) || 0;
      const unique = Number(next() ?? 0) || 0;
      perDay.push({ date, visits, unique });
      if (!useAllTimeTotals) {
        merge(pageTotals, next());
        merge(deviceTotals, next());
        merge(sourceTotals, next());
        merge(countryTotals, next());
        merge(browserTotals, next());
      }
    }
    for (const ym of monthKeys) {
      const visits = Number(next() ?? 0) || 0;
      const unique = Number(next() ?? 0) || 0;
      perDay.push({ date: `${ym}-01`, visits, unique, monthLabel: monthLabel(ym) } as (typeof perDay)[number] & { monthLabel?: string });
      merge(pageTotals, next());
      merge(deviceTotals, next());
      merge(sourceTotals, next());
      merge(countryTotals, next());
      merge(browserTotals, next());
    }
    if (useAllTimeTotals) {
      merge(pageTotals, next());
      merge(deviceTotals, next());
      merge(sourceTotals, next());
      merge(countryTotals, next());
      merge(browserTotals, next());
    }
    // "All" starts at the first day with real traffic — no dead leading zeros.
    let trimmed = perDay;
    if (useAllTimeTotals) {
      const firstActive = perDay.findIndex((d) => d.visits > 0 || d.unique > 0);
      trimmed = firstActive > 0 ? perDay.slice(firstActive) : perDay;
    }
    let totalAll = 0;
    let uniqAll = 0;
    if (useAllTimeTotals) {
      totalAll = Number(next() ?? 0) || 0;
      uniqAll = Number(next() ?? 0) || 0;
    }
    const hourTotals = toRecord(next());
    const cvTotalFlutter = Number(next() ?? 0) || 0;
    const cvTotalFrontend = Number(next() ?? 0) || 0;
    const cvDailyFlutter: number[] = [];
    const cvDailyFrontend: number[] = [];
    for (const _ of cvDays) {
      cvDailyFlutter.push(Number(next() ?? 0) || 0);
      cvDailyFrontend.push(Number(next() ?? 0) || 0);
    }

    const daily = trimmed.map((d) => ({
      ...d,
      label: (d as { monthLabel?: string }).monthLabel ?? d.date.slice(5),
    }));
    const allTime = useAllTimeTotals;

    const total30 = allTime ? totalAll : daily.reduce((s, d) => s + d.visits, 0);
    const uniq30 = allTime ? uniqAll : daily.reduce((s, d) => s + d.unique, 0);
    const ts = Date.now();
    const [liveNow, feedRaw, ownToday, ownLive, ownFeedRaw, botsToday, cvUniqFlutter, cvUniqFrontend] = await Promise.all([
      redis.zcount(`v:live`, ts - 5 * 60 * 1000, ts).catch(() => 0),
      redis.lrange<string[]>(`v:feed`, 0, ANALYTICS_CONFIG.feedFetchCount - 1).catch(() => []),
      redis.get<number>(`v:own:day:${dayKeys[dayKeys.length - 1]}`).catch(() => 0),
      redis.zcount(`v:own:live`, ts - 5 * 60 * 1000, ts).catch(() => 0),
      redis.lrange<string[]>(`v:own:feed`, 0, ANALYTICS_CONFIG.ownerFeedFetchCount - 1).catch(() => []),
      redis.get<number>(`v:bot:day:${dayKeys[dayKeys.length - 1]}`).catch(() => 0),
      Promise.all(cvDays.map((d) => redis.pfcount(`v:cvuniq:flutter:${d}`).catch(() => 0))),
      Promise.all(cvDays.map((d) => redis.pfcount(`v:cvuniq:frontend:${d}`).catch(() => 0))),
    ]);

    // CV downloads per track: all-time total + unique (14d) + daily series (14d).
    const cv = (
      [
        { track: "flutter", total: cvTotalFlutter, uniq: cvUniqFlutter, series: cvDailyFlutter },
        { track: "frontend", total: cvTotalFrontend, uniq: cvUniqFrontend, series: cvDailyFrontend },
      ] as const
    ).map((t) => ({
      track: t.track,
      total: t.total,
      unique: t.uniq.reduce((s, v) => s + (Number(v) || 0), 0),
      daily: cvDays.map((date, i) => ({ date, value: t.series[i] ?? 0 })),
    }));

    const feed = (feedRaw ?? []).flatMap((raw: unknown) => {
      try {
        const item = (typeof raw === "string" ? JSON.parse(raw) : raw) as {
          place?: unknown;
          path?: unknown;
          ts?: unknown;
          bot?: unknown;
        };
        const tsValue = typeof item.ts === "number" ? item.ts : ts;
        const mins = Math.max(0, Math.round((ts - tsValue) / 60000));
        return [{
          place: String(item.place ?? "??"),
          path: String(item.path ?? "/"),
          when: mins < 1 ? "now" : `${mins}m ago`,
          ...(item.bot === true ? { bot: true } : {}),
        }];
      } catch {
        return [];
      }
    });

    const ownFeed = (ownFeedRaw ?? []).flatMap((raw: unknown) => {
      try {
        const item = (typeof raw === "string" ? JSON.parse(raw) : raw) as {
          place?: unknown;
          path?: unknown;
          ts?: unknown;
        };
        const tsValue = typeof item.ts === "number" ? item.ts : ts;
        const mins = Math.max(0, Math.round((ts - tsValue) / 60000));
        return [{
          place: String(item.place ?? "??"),
          path: String(item.path ?? "/"),
          when: mins < 1 ? "now" : `${mins}m ago`,
          you: true,
        }];
      } catch {
        return [];
      }
    });

    const today = daily[daily.length - 1]?.visits ?? 0;
    const yesterday = daily[daily.length - 2]?.visits ?? 0;
    const last7 = daily.slice(-7).reduce((s, d) => s + d.visits, 0);
    const peak = daily.reduce((a, b) => (b.visits >= a.visits ? b : a), daily[0]);

    return response.status(200).json({
      configured: true,
      range: isCustom ? "custom" : days === "all" ? "all" : String(days),
      allTime,
      from: isCustom ? customFrom : daily[0]?.date ?? rangeDays[0] ?? "",
      to: isCustom ? customTo : daily[daily.length - 1]?.date ?? rangeDays[rangeDays.length - 1] ?? "",
      today,
      yesterday,
      last7,
      last30: total30,
      unique30: uniq30,
      liveNow,
      daily,
      hourly: Object.entries(hourTotals)
        .sort(([a], [b]) => (a < b ? -1 : 1))
        .map(([hour, value]) => ({ hour, value })),
      sources: sourceTotals,
      devices: deviceTotals,
      pages: pageTotals,
      countries: countryTotals,
      browsers: browserTotals,
      feed: [...ownFeed, ...feed].slice(0, ANALYTICS_CONFIG.feedVisibleCount),
      botsToday: Number(botsToday) || 0,
      owner: { today: Number(ownToday) || 0, liveNow: Number(ownLive) || 0 },
      cv,
      peakDay: peak ? `${peak.label} · ${peak.visits.toLocaleString()}` : "",
      hasData: total30 > 0,
    });
  } catch {
    return response.status(500).json({ error: "Could not read analytics." });
  }
}

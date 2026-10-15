import { Redis } from "@upstash/redis";

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

  const daysParam = Number(queryParam(request.query, "days") ?? 14);
  const days = [7, 14, 30].includes(daysParam) ? daysParam : 14;

  try {
    const redis = new Redis({ url, token });
    const now = new Date();
    const dayKeys: string[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      dayKeys.push(d.toISOString().slice(0, 10));
    }

    const [counts, uniques] = await Promise.all([
      redis.mget<number[]>(...dayKeys.map((d) => `v:day:${d}`)),
      Promise.all(dayKeys.map((d) => redis.pfcount(`v:uniq:${d}`).catch(() => 0))),
    ]);

    const rangeDays = dayKeys.slice(-days);
    const [pages, devices, sources, hours] = await Promise.all([
      Promise.all(rangeDays.map((d) => redis.hgetall(`v:page:${d}`).catch(() => null))),
      Promise.all(rangeDays.map((d) => redis.hgetall(`v:device:${d}`).catch(() => null))),
      Promise.all(rangeDays.map((d) => redis.hgetall(`v:source:${d}`).catch(() => null))),
      redis.hgetall(`v:hour:${dayKeys[dayKeys.length - 1]}`).catch(() => null),
    ]);

    const sumRecords = (list: unknown[]) => {
      const out: Record<string, number> = {};
      for (const item of list) {
        for (const [k, v] of Object.entries(toRecord(item))) {
          out[k] = (out[k] ?? 0) + v;
        }
      }
      return out;
    };
    const pageTotals = sumRecords(pages);
    const deviceTotals = sumRecords(devices);
    const sourceTotals = sumRecords(sources);
    const hourTotals = toRecord(hours);

    const daily = dayKeys.slice(-days).map((date, i) => {
      const idx = dayKeys.length - days + i;
      return {
        date,
        label: date.slice(5),
        visits: Number(counts?.[idx] ?? 0) || 0,
        unique: Number(uniques[idx] ?? 0) || 0,
      };
    });

    const total30 = dayKeys.reduce((s, _, i) => s + (Number(counts?.[i] ?? 0) || 0), 0);
    const uniq30 = dayKeys.reduce((s, _, i) => s + (Number(uniques[i] ?? 0) || 0), 0);
    const ts = Date.now();
    const [liveNow, feedRaw] = await Promise.all([
      redis.zcount(`v:live`, ts - 5 * 60 * 1000, ts).catch(() => 0),
      redis.lrange<string[]>(`v:feed`, 0, 7).catch(() => []),
    ]);

    const feed = (feedRaw ?? []).flatMap((raw) => {
      try {
        const item = JSON.parse(raw) as { place?: string; path?: string; ts?: number };
        const mins = Math.max(0, Math.round((ts - (item.ts ?? ts)) / 60000));
        return [{
          place: String(item.place ?? "??"),
          path: String(item.path ?? "/"),
          when: mins < 1 ? "now" : `${mins}m ago`,
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
      feed,
      peakDay: peak ? `${peak.label} · ${peak.visits.toLocaleString()}` : "",
      hasData: total30 > 0,
    });
  } catch {
    return response.status(500).json({ error: "Could not read analytics." });
  }
}

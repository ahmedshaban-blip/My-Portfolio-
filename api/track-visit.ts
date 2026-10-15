import { Redis } from "@upstash/redis";

type VercelRequest = {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: {
    path?: unknown;
    source?: unknown;
    device?: unknown;
    browser?: unknown;
    session?: unknown;
  };
};

type VercelResponse = {
  setHeader: (key: string, value: string) => void;
  status: (statusCode: number) => {
    json: (body: Record<string, unknown>) => void;
  };
};

const DEVICES = new Set(["mobile", "desktop", "tablet"]);
const DAY_TTL_SECONDS = 90 * 24 * 60 * 60; // keep 90 days of history

const clean = (value: unknown, max: number, fallback: string) => {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim().slice(0, max);
  return trimmed || fallback;
};

const header = (headers: VercelRequest["headers"], name: string) => {
  const value = headers[name];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
};

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    // Redis not configured yet — tracker stays silent, dashboard shows demo data.
    return response.status(200).json({ ok: true, stored: false });
  }

  const path = clean(request.body?.path, 120, "/");
  if (!path.startsWith("/")) {
    return response.status(400).json({ error: "Invalid path." });
  }
  const source = clean(request.body?.source, 60, "Direct");
  const deviceRaw = clean(request.body?.device, 10, "desktop").toLowerCase();
  const device = DEVICES.has(deviceRaw) ? deviceRaw : "desktop";
  const browser = clean(request.body?.browser, 20, "Other");
  const session = clean(request.body?.session, 40, "anon");

  const country = (header(request.headers, "x-vercel-ip-country") || "??").toUpperCase();
  const cityRaw = header(request.headers, "x-vercel-ip-city") || "";
  let city = "";
  try {
    city = decodeURIComponent(cityRaw);
  } catch {
    city = cityRaw;
  }
  const place = city ? `${city}, ${country}` : country;

  const now = new Date();
  const day = now.toISOString().slice(0, 10);
  const hour = `${String(now.getUTCHours()).padStart(2, "0")}:00`;
  const ts = Date.now();

  try {
    const redis = new Redis({ url, token });
    const pipe = redis.pipeline();
    pipe.incr(`v:day:${day}`);
    pipe.pfadd(`v:uniq:${day}`, session);
    pipe.hincrby(`v:page:${day}`, path, 1);
    pipe.hincrby(`v:device:${day}`, device, 1);
    pipe.hincrby(`v:source:${day}`, source, 1);
    pipe.hincrby(`v:hour:${day}`, hour, 1);
    pipe.zadd(`v:live`, { score: ts, member: `${ts}:${session}:${place}:${path}` });
    pipe.lpush(`v:feed`, JSON.stringify({ place, path, ts }));
    pipe.ltrim(`v:feed`, 0, 19);
    pipe.expire(`v:day:${day}`, DAY_TTL_SECONDS);
    pipe.expire(`v:uniq:${day}`, DAY_TTL_SECONDS);
    pipe.expire(`v:page:${day}`, DAY_TTL_SECONDS);
    pipe.expire(`v:device:${day}`, DAY_TTL_SECONDS);
    pipe.expire(`v:source:${day}`, DAY_TTL_SECONDS);
    pipe.expire(`v:hour:${day}`, DAY_TTL_SECONDS);
    await pipe.exec();

    // Best-effort pruning of stale presence/feed entries (not on the hot path if it fails).
    await Promise.all([
      redis.zremrangebyscore(`v:live`, 0, ts - 5 * 60 * 1000).catch(() => 0),
      redis.expire(`v:feed`, 7 * 24 * 60 * 60).catch(() => false),
      redis.expire(`v:live`, 24 * 60 * 60).catch(() => false),
    ]);

    return response.status(200).json({ ok: true, stored: true });
  } catch {
    return response.status(200).json({ ok: true, stored: false });
  }
}

import { Redis } from "@upstash/redis";

// Same numbers as src/lib/analytics-config.ts (single source of truth).
// Loaded dynamically so a bundling hiccup can never take the tracker down.
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
  headers: Record<string, string | string[] | undefined>;
  body?: {
    path?: unknown;
    source?: unknown;
    device?: unknown;
    browser?: unknown;
    session?: unknown;
    owner?: unknown;
  };
};

type VercelResponse = {
  setHeader: (key: string, value: string) => void;
  status: (statusCode: number) => {
    json: (body: Record<string, unknown>) => void;
  };
};

const DEVICES = new Set(["mobile", "desktop", "tablet"]);
const DAY_TTL_SECONDS = 90 * 24 * 60 * 60; // granular breakdowns keep a 90-day rolling window
// Daily totals, all-time aggregates and unique sets persist forever (tiny keys).

const clean = (value: unknown, max: number, fallback: string) => {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim().slice(0, max);
  return trimmed || fallback;
};

const header = (headers: VercelRequest["headers"], name: string) => {
  const value = headers[name];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
};

// Crawlers and headless tools execute page JS (firing the tracker) but aren't humans.
const BOT_RE =
  /bot|crawl|spider|slurp|mediapartners|baidu|yandex|ahrefs|semrush|dotbot|mj12|petal|bytespider|gptbot|ccbot|claudebot|anthropic|applebot|bingpreview|embedly|facebookexternalhit|twitterbot|linkedinbot|slackbot|telegrambot|headless|phantom|puppeteer|selenium|playwright|lighthouse|pagespeed|pingdom|uptimerobot|monitor|datadome|perimeterx/i;

// ISO subdivision → governorate name (Vercel sends the code via x-vercel-ip-country-region).
const EG_REGIONS: Record<string, string> = {
  C: "Cairo",
  ALX: "Alexandria",
  GZ: "Giza",
  DK: "Dakahlia",
  RD: "Red Sea",
  BH: "Beheira",
  FYM: "Faiyum",
  GH: "Gharbia",
  IS: "Ismailia",
  MNF: "Menofia",
  MN: "Minya",
  QIN: "Qena",
  SHR: "Sharqia",
  SUZ: "Suez",
  ASN: "Aswan",
  AST: "Asyut",
  BNS: "Beni Suef",
  PTS: "Port Said",
  DT: "Damietta",
  SHG: "Sohag",
  LX: "Luxor",
  KFS: "Kafr El Sheikh",
  MT: "Matrouh",
  SIN: "North Sinai",
  JS: "South Sinai",
  WAD: "New Valley",
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
  const owner = request.body?.owner === true;
  const userAgent = header(request.headers, "user-agent");
  const bot = BOT_RE.test(userAgent);

  const country = (header(request.headers, "x-vercel-ip-country") || "??").toUpperCase();
  const regionCode = (header(request.headers, "x-vercel-ip-country-region") || "").toUpperCase();
  const cityRaw = header(request.headers, "x-vercel-ip-city") || "";
  let city = "";
  try {
    city = decodeURIComponent(cityRaw.replace(/\+/g, " "));
  } catch {
    city = cityRaw;
  }
  // Most specific available: City, Region (governorate), Country.
  const regionName = country === "EG" ? EG_REGIONS[regionCode] ?? regionCode : regionCode;
  const parts = [city, regionName, country].filter((p) => p && p !== "??");
  const place = [...new Set(parts)].join(", ") || "Unknown";

  const now = new Date();
  const day = now.toISOString().slice(0, 10);
  const month = day.slice(0, 7);
  const hour = `${String(now.getUTCHours()).padStart(2, "0")}:00`;
  const ts = Date.now();

  try {
    const redis = new Redis({ url, token });
    const ANALYTICS_CONFIG = await loadConfig();

    // Owner's own visits are counted apart — never pollute visitor stats.
    if (owner) {
      const pipe = redis.pipeline();
      pipe.incr(`v:own:day:${day}`);
      pipe.zadd(`v:own:live`, { score: ts, member: `${ts}:${session}:${place}:${path}` });
      pipe.lpush(`v:own:feed`, JSON.stringify({ place, path, ts }));
      pipe.ltrim(`v:own:feed`, 0, ANALYTICS_CONFIG.feedStoredCount - 1);
      pipe.expire(`v:own:day:${day}`, DAY_TTL_SECONDS);
      pipe.expire(`v:own:feed`, 7 * 24 * 60 * 60);
      pipe.expire(`v:own:live`, 24 * 60 * 60);
      await pipe.exec();
      await redis.zremrangebyscore(`v:own:live`, 0, ts - 5 * 60 * 1000).catch(() => 0);
      return response.status(200).json({ ok: true, stored: "owner" });
    }

    // Bots/crawlers run page JS but aren't humans — count apart, label in feed.
    if (bot) {
      const pipe = redis.pipeline();
      pipe.incr(`v:bot:day:${day}`);
      pipe.persist(`v:bot:day:${day}`);
      pipe.lpush(`v:feed`, JSON.stringify({ place, path, ts, bot: true }));
      pipe.ltrim(`v:feed`, 0, ANALYTICS_CONFIG.feedStoredCount - 1);
      await pipe.exec();
      return response.status(200).json({ ok: true, stored: "bot" });
    }

    const pipe = redis.pipeline();
    pipe.incr(`v:day:${day}`);
    pipe.pfadd(`v:uniq:${day}`, session);
    pipe.persist(`v:day:${day}`);
    pipe.persist(`v:uniq:${day}`);
    // All-time aggregates (no TTL) — power the "All" filter forever.
    pipe.incr(`v:total`);
    pipe.pfadd(`v:uniq:all`, session);
    pipe.hincrby(`v:tot:page`, path, 1);
    pipe.hincrby(`v:tot:device`, device, 1);
    pipe.hincrby(`v:tot:source`, source, 1);
    pipe.hincrby(`v:tot:country`, country, 1);
    pipe.hincrby(`v:tot:browser`, browser, 1);
    // Monthly rollups (no TTL) — power custom ranges longer than 180 days.
    pipe.incr(`v:m:${month}`);
    pipe.pfadd(`v:muniq:${month}`, session);
    pipe.hincrby(`v:mpage:${month}`, path, 1);
    pipe.hincrby(`v:mdevice:${month}`, device, 1);
    pipe.hincrby(`v:msource:${month}`, source, 1);
    pipe.hincrby(`v:mcountry:${month}`, country, 1);
    pipe.hincrby(`v:mbrowser:${month}`, browser, 1);
    pipe.hincrby(`v:page:${day}`, path, 1);
    pipe.hincrby(`v:device:${day}`, device, 1);
    pipe.hincrby(`v:source:${day}`, source, 1);
    pipe.hincrby(`v:hour:${day}`, hour, 1);
    pipe.hincrby(`v:country:${day}`, country, 1);
    pipe.hincrby(`v:browser:${day}`, browser, 1);
    pipe.zadd(`v:live`, { score: ts, member: `${ts}:${session}:${place}:${path}` });
    pipe.lpush(`v:feed`, JSON.stringify({ place, path, ts }));
    pipe.ltrim(`v:feed`, 0, ANALYTICS_CONFIG.feedStoredCount - 1);
    pipe.expire(`v:page:${day}`, DAY_TTL_SECONDS);
    pipe.expire(`v:device:${day}`, DAY_TTL_SECONDS);
    pipe.expire(`v:source:${day}`, DAY_TTL_SECONDS);
    pipe.expire(`v:hour:${day}`, DAY_TTL_SECONDS);
    pipe.expire(`v:country:${day}`, DAY_TTL_SECONDS);
    pipe.expire(`v:browser:${day}`, DAY_TTL_SECONDS);
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

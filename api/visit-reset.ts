import { Redis } from "@upstash/redis";

type VercelRequest = {
  method?: string;
  headers: {
    authorization?: string;
  };
  body?: {
    scope?: unknown;
  };
};

type VercelResponse = {
  setHeader: (key: string, value: string) => void;
  status: (statusCode: number) => {
    json: (body: Record<string, unknown>) => void;
  };
};

const SCOPES = {
  visits: ["v:day:*", "v:uniq:*", "v:page:*", "v:device:*", "v:source:*", "v:hour:*", "v:country:*", "v:browser:*", "v:live", "v:feed", "v:own:*", "v:bot:*", "v:total", "v:uniq:all", "v:tot:*"],
  // Downloads only. `v:cv:*` would also match the `v:cvview:*` keys introduced
  // for in-page CV reads, so the view family is deliberately NOT covered here
  // and is reset through its own `cvviews` scope below.
  cv: ["v:cv", "v:cv:*", "v:cvday:*", "v:cvuniq:*"],
  // In-page CV reads (`mode=view`). Kept separate from `cv` so resetting one
  // metric never wipes the other.
  cvviews: ["v:cvview", "v:cvview:*", "v:cvviewday:*", "v:cvviewuniq:*"],
} as const;

async function deletePatterns(redis: InstanceType<typeof Redis>, patterns: readonly string[]) {
  let deleted = 0;
  const exact: string[] = [];
  const globs: string[] = [];
  for (const p of patterns) {
    if (p.endsWith("*")) globs.push(p);
    else exact.push(p);
  }
  if (exact.length > 0) {
    deleted += (await redis.del(...exact).catch(() => 0)) as number;
  }
  for (const match of globs) {
    let cursor = "0";
    do {
      const [next, keys] = (await redis.scan(cursor, { match, count: 200 }).catch(() => ["0", []])) as [string, string[]];
      cursor = next;
      for (let i = 0; i < keys.length; i += 100) {
        const chunk = keys.slice(i, i + 100);
        if (chunk.length > 0) {
          deleted += (await redis.del(...chunk).catch(() => 0)) as number;
        }
      }
    } while (cursor !== "0");
  }
  return deleted;
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
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
    return response.status(501).json({ error: "Analytics storage is not configured." });
  }

  const scope = request.body?.scope;
  if (scope !== "visits" && scope !== "cv" && scope !== "cvviews") {
    return response.status(400).json({ error: "Invalid scope. Use 'visits', 'cv' or 'cvviews'." });
  }

  try {
    const redis = new Redis({ url, token });
    const deleted = await deletePatterns(redis, SCOPES[scope]);
    return response.status(200).json({ ok: true, scope, deleted });
  } catch {
    return response.status(500).json({ error: "Could not reset analytics." });
  }
}

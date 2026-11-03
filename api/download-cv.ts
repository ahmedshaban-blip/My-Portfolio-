import { createHash } from "crypto";

const CV_FILES = {
  flutter: {
    publicId: "flutter_cv.pdf",
    fileName: "Ahmed_Shaban_Flutter_CV.pdf",
  },
  frontend: {
    publicId: "frontend_cv.pdf",
    fileName: "Ahmed_Shaban_Frontend_CV.pdf",
  },
} as const;

type CVTrack = keyof typeof CV_FILES;

type VercelRequest = {
  headers?: Record<string, string | string[] | undefined>;
  query?: {
    track?: string | string[];
    mode?: string | string[];
  };
};

type VercelResponse = {
  status: (statusCode: number) => {
    json: (body: Record<string, unknown>) => void;
    send: (body: Buffer | string) => void;
  };
  setHeader: (key: string, value: string) => void;
};

const isCVTrack = (track: unknown): track is CVTrack => track === "flutter" || track === "frontend";

export default async function handler(request: VercelRequest, response: VercelResponse) {
  const track = Array.isArray(request.query?.track) ? request.query?.track[0] : request.query?.track;
  const rawMode = Array.isArray(request.query?.mode) ? request.query?.mode[0] : request.query?.mode;
  // Only `view` opts into the in-page renderer; everything else keeps the
  // long-standing attachment behaviour.
  const isViewMode = rawMode === "view";
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME ?? process.env.VITE_CLOUDINARY_CLOUD_NAME;

  if (!isCVTrack(track)) {
    return response.status(400).json({ error: "Invalid CV track." });
  }

  if (!cloudName) {
    return response.status(500).json({ error: "Cloudinary cloud name is not configured." });
  }

  const cvFile = CV_FILES[track];
  const cloudinaryUrl = `https://res.cloudinary.com/${cloudName}/raw/upload/${cvFile.publicId}`;
  const cloudinaryResponse = await fetch(cloudinaryUrl, { cache: "no-store" });

  if (!cloudinaryResponse.ok) {
    return response.status(cloudinaryResponse.status).json({ error: "CV file is not available." });
  }

  const fileBuffer = Buffer.from(await cloudinaryResponse.arrayBuffer());

  // Count the successful hit (never blocks/fails the file itself). Views and
  // downloads use disjoint key families so one metric can never overwrite the
  // other, and resetting one scope leaves the other intact.
  try {
    // A PDF viewer issues extra ranged requests while paging/zooming; counting
    // those would inflate a single view, so only the initial fetch counts.
    const rangeHeader = request.headers?.range;
    const isRangeRequest = (Array.isArray(rangeHeader) ? rangeHeader[0] : rangeHeader) != null;

    const redisUrl = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
    if (redisUrl && redisToken && !isRangeRequest) {
      const { Redis } = await import("@upstash/redis");
      const redis = new Redis({ url: redisUrl, token: redisToken });
      const day = new Date().toISOString().slice(0, 10);
      const rawIp = request.headers?.["x-forwarded-for"];
      const ip = (Array.isArray(rawIp) ? rawIp[0] : rawIp ?? "").split(",")[0].trim() || "unknown";
      const visitor = createHash("sha1").update(ip).digest("hex");
      const ns = isViewMode ? "cvview" : "cv";
      await redis.pipeline()
        .incr(`v:${ns}:${track}`)
        .incr(`v:${ns}day:${track}:${day}`)
        .pfadd(`v:${ns}uniq:${track}:${day}`, visitor)
        .expire(`v:${ns}day:${track}:${day}`, 90 * 24 * 60 * 60)
        .expire(`v:${ns}uniq:${track}:${day}`, 90 * 24 * 60 * 60)
        .exec();
    }
  } catch {
    // Analytics must never break downloads.
  }

  response.setHeader("Content-Type", "application/pdf");
  response.setHeader(
    "Content-Disposition",
    `${isViewMode ? "inline" : "attachment"}; filename="${cvFile.fileName}"`
  );
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("X-Content-Type-Options", "nosniff");

  return response.status(200).send(fileBuffer);
}

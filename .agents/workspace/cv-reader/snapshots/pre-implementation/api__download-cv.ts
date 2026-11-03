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

  // Count the successful download (never blocks/fails the file itself).
  try {
    const redisUrl = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
    if (redisUrl && redisToken) {
      const { Redis } = await import("@upstash/redis");
      const redis = new Redis({ url: redisUrl, token: redisToken });
      const day = new Date().toISOString().slice(0, 10);
      const rawIp = request.headers?.["x-forwarded-for"];
      const ip = (Array.isArray(rawIp) ? rawIp[0] : rawIp ?? "").split(",")[0].trim() || "unknown";
      const visitor = createHash("sha1").update(ip).digest("hex");
      await redis.pipeline()
        .incr(`v:cv:${track}`)
        .incr(`v:cvday:${track}:${day}`)
        .pfadd(`v:cvuniq:${track}:${day}`, visitor)
        .expire(`v:cvday:${track}:${day}`, 90 * 24 * 60 * 60)
        .expire(`v:cvuniq:${track}:${day}`, 90 * 24 * 60 * 60)
        .exec();
    }
  } catch {
    // Analytics must never break downloads.
  }

  response.setHeader("Content-Type", "application/pdf");
  response.setHeader("Content-Disposition", `attachment; filename="${cvFile.fileName}"`);
  response.setHeader("Cache-Control", "no-store");

  return response.status(200).send(fileBuffer);
}

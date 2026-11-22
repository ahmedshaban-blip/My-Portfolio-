import { createHash } from "crypto";

/**
 * SINGLE SOURCE OF TRUTH — the same `cv.json` the download route and the front
 * end read.
 *
 * This endpoint signs an `overwrite` upload to `public_id`, so if these ids ever
 * drifted from `api/download-cv.ts` the dashboard would overwrite one asset
 * while the site served another.
 */
import cvProfile from "../src/data/profile/cv.json";

const CV_PUBLIC_IDS = {
  flutter: cvProfile.tracks.flutter.cloudinaryPublicId,
  frontend: cvProfile.tracks.frontend.cloudinaryPublicId,
} as const;

type CVTrack = keyof typeof CV_PUBLIC_IDS;

const isCVTrack = (track: unknown): track is CVTrack => track === "flutter" || track === "frontend";

type VercelRequest = {
  method?: string;
  headers: {
    authorization?: string;
  };
  body?: {
    track?: unknown;
  };
};

type VercelResponse = {
  setHeader: (key: string, value: string) => void;
  status: (statusCode: number) => {
    json: (body: Record<string, unknown>) => void;
  };
};

const signCloudinaryParams = (params: Record<string, string | number>, apiSecret: string) => {
  const payload = Object.entries(params)
    .filter(([, value]) => value !== "" && value !== undefined && value !== null)
    .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return createHash("sha1").update(`${payload}${apiSecret}`).digest("hex");
};

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME ?? process.env.VITE_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const adminPin = process.env.ADMIN_PIN ?? process.env.VITE_ADMIN_PIN;
  const providedPin = request.headers.authorization?.replace(/^Bearer\s+/i, "") ?? "";

  if (!cloudName || !apiKey || !apiSecret || !adminPin) {
    return response.status(500).json({ error: "Cloudinary server environment is not configured." });
  }

  if (providedPin !== adminPin) {
    return response.status(401).json({ error: "Unauthorized." });
  }

  const track = request.body?.track;
  if (!isCVTrack(track)) {
    return response.status(400).json({ error: "Invalid CV track." });
  }

  const timestamp = Math.round(Date.now() / 1000);
  const signedParams = {
    access_mode: "public",
    invalidate: "true",
    overwrite: "true",
    public_id: CV_PUBLIC_IDS[track],
    timestamp,
  };

  return response.status(200).json({
    apiKey,
    cloudName,
    publicId: CV_PUBLIC_IDS[track],
    timestamp,
    signature: signCloudinaryParams(signedParams, apiSecret),
  });
}

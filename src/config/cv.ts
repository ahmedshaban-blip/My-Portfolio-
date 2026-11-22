import { cv } from "@/data/profile";

export type CVTrack = "flutter" | "frontend";

type CVConfig = {
  label: string;
  description: string;
  cloudinaryPublicId: string;
  uploadPreset: string;
  fileName: string;
  /**
   * Local files inside `public/`, tried in order when Cloudinary is
   * unreachable. Add/remove paths in `src/data/profile/cv.json` — every path
   * listed there must exist on disk or that fallback is skipped.
   */
  fallbackUrls: string[];
};

export const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ?? "";

const sharedUploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET ?? "";

/**
 * Upload presets are credentials, so they stay in env vars — everything else
 * about a CV track is authored in `src/data/profile/cv.json`.
 */
const UPLOAD_PRESETS: Record<CVTrack, string> = {
  flutter: import.meta.env.VITE_CLOUDINARY_FLUTTER_UPLOAD_PRESET ?? sharedUploadPreset,
  frontend: import.meta.env.VITE_CLOUDINARY_FRONTEND_UPLOAD_PRESET ?? sharedUploadPreset,
};

export const CV_CONFIG: Record<CVTrack, CVConfig> = {
  flutter: { ...cv.tracks.flutter, uploadPreset: UPLOAD_PRESETS.flutter },
  frontend: { ...cv.tracks.frontend, uploadPreset: UPLOAD_PRESETS.frontend },
};

export const getCloudinaryRawUrl = (track: CVTrack) => {
  if (!CLOUDINARY_CLOUD_NAME) return "";

  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/raw/upload/${CV_CONFIG[track].cloudinaryPublicId}`;
};

export const getCloudinaryUploadEndpoint = () => {
  if (!CLOUDINARY_CLOUD_NAME) return "";

  return `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/raw/upload`;
};

export const getCVDownloadUrl = (track: CVTrack) => `/api/download-cv?track=${track}`;

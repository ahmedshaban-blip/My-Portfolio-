import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { CV_CONFIG, CVTrack, getCloudinaryRawUrl, getCVDownloadUrl } from "@/config/cv";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const canReachRemoteCV = async (url: string) => {
  try {
    const response = await fetch(url, { method: "HEAD", cache: "no-store" });
    return response.ok;
  } catch {
    return false;
  }
};

const triggerDownload = (href: string, fileName: string) => {
  const link = document.createElement("a");
  link.href = href;
  link.download = fileName;
  link.rel = "noopener noreferrer";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export async function downloadCV(type: CVTrack) {
  const config = CV_CONFIG[type];
  const cloudinaryUrl = getCloudinaryRawUrl(type);

  if (cloudinaryUrl && (await canReachRemoteCV(cloudinaryUrl))) {
    triggerDownload(getCVDownloadUrl(type), config.fileName);
    return;
  }

  // Cloudinary is unreachable. Walk the local fallbacks from `cv.json` in order
  // and use the first one that actually answers — a listed file that is missing
  // from `public/` is skipped instead of stranding the visitor.
  for (const fallbackUrl of config.fallbackUrls) {
    if (await canReachRemoteCV(fallbackUrl)) {
      triggerDownload(fallbackUrl, config.fileName);
      return;
    }
  }

  // Nothing answered a HEAD request. Hand over the first candidate anyway so the
  // click still does something (the browser shows its own 404) rather than
  // failing silently.
  const [firstFallback] = config.fallbackUrls;
  if (firstFallback) triggerDownload(firstFallback, config.fileName);
}

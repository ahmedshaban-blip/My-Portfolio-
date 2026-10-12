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

  triggerDownload(config.fallbackUrl, config.fileName);
}

export type CVTrack = "flutter" | "frontend";

type CVConfig = {
  label: string;
  description: string;
  cloudinaryPublicId: string;
  uploadPreset: string;
  fileName: string;
  fallbackUrl: string;
};

export const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ?? "";

const sharedUploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET ?? "";

export const CV_CONFIG: Record<CVTrack, CVConfig> = {
  flutter: {
    label: "Flutter Developer CV",
    description: "Overwrite the public Flutter developer PDF.",
    cloudinaryPublicId: "flutter_cv.pdf",
    uploadPreset: import.meta.env.VITE_CLOUDINARY_FLUTTER_UPLOAD_PRESET ?? sharedUploadPreset,
    fileName: "Ahmed_Shaban_Flutter_CV.pdf",
    fallbackUrl: "/Ahmed Shaban--Flutter Developer.pdf",
  },
  frontend: {
    label: "Frontend Developer CV",
    description: "Overwrite the public frontend developer PDF.",
    cloudinaryPublicId: "frontend_cv.pdf",
    uploadPreset: import.meta.env.VITE_CLOUDINARY_FRONTEND_UPLOAD_PRESET ?? sharedUploadPreset,
    fileName: "Ahmed_Shaban_Frontend_CV.pdf",
    fallbackUrl: "/Ahmed Shaban Front--End Web Developer.pdf",
  },
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

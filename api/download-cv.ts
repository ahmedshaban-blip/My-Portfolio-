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

  response.setHeader("Content-Type", "application/pdf");
  response.setHeader("Content-Disposition", `attachment; filename="${cvFile.fileName}"`);
  response.setHeader("Cache-Control", "no-store");

  return response.status(200).send(fileBuffer);
}

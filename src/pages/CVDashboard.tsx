import { ChangeEvent, useState } from "react";
import { ExternalLink, FileUp, Loader2, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ADMIN_PIN_SESSION_KEY } from "@/components/admin/AdminAuthGuard";
import { AnalyticsSection } from "@/components/admin/AnalyticsSection";
import { useToast } from "@/hooks/use-toast";
import { CLOUDINARY_CLOUD_NAME, CV_CONFIG, CVTrack, getCloudinaryRawUrl, getCloudinaryUploadEndpoint, getCVDownloadUrl } from "@/config/cv";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

type UploadState = Record<CVTrack, { isUploading: boolean; previewVersion: number; uploadedUrl: string; uploadedPublicId: string }>;

const initialUploadState: UploadState = {
  flutter: { isUploading: false, previewVersion: Date.now(), uploadedUrl: "", uploadedPublicId: "" },
  frontend: { isUploading: false, previewVersion: Date.now(), uploadedUrl: "", uploadedPublicId: "" },
};

export default function CVDashboard() {
  const { toast } = useToast();
  const [uploadState, setUploadState] = useState<UploadState>(initialUploadState);

  const uploadEndpoint = getCloudinaryUploadEndpoint();
  const isCloudinaryConfigured = Boolean(CLOUDINARY_CLOUD_NAME && uploadEndpoint);

  const updateTrackState = (track: CVTrack, nextState: Partial<UploadState[CVTrack]>) => {
    setUploadState((current) => ({
      ...current,
      [track]: { ...current[track], ...nextState },
    }));
  };

  const validateFile = (file: File) => {
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      return "Only PDF files are allowed.";
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return "PDF must be 5MB or smaller.";
    }

    return "";
  };

  const handleUpload = async (track: CVTrack, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const config = CV_CONFIG[track];
    const validationError = validateFile(file);

    if (validationError) {
      toast({ title: "Upload rejected", description: validationError, variant: "destructive" });
      return;
    }

    if (!isCloudinaryConfigured) {
      toast({
        title: "Cloudinary is not configured",
        description: "Add the required Cloudinary environment variables first.",
        variant: "destructive",
      });
      return;
    }

    updateTrackState(track, { isUploading: true });

    try {
      const adminPin = sessionStorage.getItem(ADMIN_PIN_SESSION_KEY) ?? "";
      const signatureResponse = await fetch("/api/cloudinary-signature", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminPin}`,
        },
        body: JSON.stringify({ track }),
      });

      const signaturePayload = await signatureResponse.json();

      if (!signatureResponse.ok) {
        throw new Error(signaturePayload?.error ?? "Could not sign Cloudinary upload.");
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", signaturePayload.apiKey);
      formData.append("timestamp", String(signaturePayload.timestamp));
      formData.append("signature", signaturePayload.signature);
      formData.append("public_id", signaturePayload.publicId);
      formData.append("access_mode", "public");
      formData.append("overwrite", "true");
      formData.append("invalidate", "true");

      const response = await fetch(uploadEndpoint, { method: "POST", body: formData });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error?.message ?? "Cloudinary upload failed.");
      }

      const uploadedUrl = result?.secure_url ?? "";
      const uploadedPublicId = result?.public_id ?? "";
      const expectedPublicId = config.cloudinaryPublicId;

      if (uploadedPublicId && uploadedPublicId !== expectedPublicId) {
        throw new Error(`Uploaded as "${uploadedPublicId}" instead of "${expectedPublicId}".`);
      }

      updateTrackState(track, { previewVersion: Date.now(), uploadedUrl, uploadedPublicId });
      toast({ title: "CV updated", description: `${config.label} was uploaded successfully.` });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Unexpected upload error.",
        variant: "destructive",
      });
    } finally {
      updateTrackState(track, { isUploading: false });
    }
  };

  const renderTrackPanel = (track: CVTrack) => {
    const config = CV_CONFIG[track];
    const currentUrl = uploadState[track].uploadedUrl || getCloudinaryRawUrl(track);
    const versionedPreviewUrl = currentUrl ? `${currentUrl}?v=${uploadState[track].previewVersion}` : "";

    return (
      <Card className="modern-card glass-effect overflow-hidden">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold tracking-tight">{config.label}</CardTitle>
              <CardDescription>{config.description}</CardDescription>
            </div>
            <Badge className="w-fit rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/10">
              {config.cloudinaryPublicId}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
            <Input
              type="file"
              accept="application/pdf,.pdf"
              disabled={uploadState[track].isUploading}
              onChange={(event) => handleUpload(track, event)}
              className="h-12 cursor-pointer rounded-xl bg-background/70 file:mr-4 file:rounded-full file:border-0 file:bg-primary/10 file:px-4 file:py-1.5 file:text-primary"
            />
            <Button
              type="button"
              variant="outline"
              className="h-12 rounded-full border-border/60 bg-background/50 hover:bg-primary/10 hover:text-primary"
              onClick={() => updateTrackState(track, { previewVersion: Date.now() })}
            >
              <RefreshCw className="h-4 w-4" /> Refresh preview
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span>PDF only</span>
            <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
            <span>Max 5MB</span>
            <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
            <span>Permanent URL overwrite</span>
          </div>

          {uploadState[track].uploadedPublicId && (
            <div className="rounded-2xl border border-border/60 bg-background/60 px-4 py-3 text-sm text-muted-foreground">
              Uploaded public ID: <span className="font-mono text-foreground">{uploadState[track].uploadedPublicId}</span>
            </div>
          )}

          {uploadState[track].isUploading && (
            <div className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary">
              <Loader2 className="h-4 w-4 animate-spin" /> Uploading CV to Cloudinary...
            </div>
          )}

          {currentUrl ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button asChild variant="outline" className="rounded-full border-border/60 bg-background/50 hover:bg-primary/10 hover:text-primary">
                  <a href={currentUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" /> Open current PDF
                  </a>
                </Button>
                <Button asChild className="rounded-full shadow-md shadow-primary/20">
                  <a href={getCVDownloadUrl(track)} download={config.fileName}>
                    <FileUp className="h-4 w-4" /> Test download
                  </a>
                </Button>
              </div>
              <iframe
                key={versionedPreviewUrl}
                src={versionedPreviewUrl}
                title={`${config.label} preview`}
                className="h-[520px] w-full rounded-2xl border border-border/60 bg-background/70 shadow-inner"
              />
            </div>
          ) : (
            <div className="rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-foreground">
              Cloudinary cloud name is missing. The public site will use the local PDF fallback.
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <main className="min-h-screen px-4 py-16 sm:py-24">
      <section className="container mx-auto max-w-6xl space-y-8">
        <div className="space-y-4 text-center">
          <Badge className="rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/10">Private Admin</Badge>
          <h1 className="text-gradient text-4xl font-extrabold tracking-tight sm:text-5xl">Dashboard</h1>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Traffic analysis, plus independent CV uploads. Public download buttons keep the same Cloudinary URLs.
          </p>
        </div>

        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="mx-auto grid h-auto w-full max-w-xl grid-cols-3 rounded-full bg-muted/70 p-1.5">
            <TabsTrigger value="analytics" className="rounded-full py-3">Analytics</TabsTrigger>
            <TabsTrigger value="flutter" className="rounded-full py-3">Flutter CV</TabsTrigger>
            <TabsTrigger value="frontend" className="rounded-full py-3">Frontend CV</TabsTrigger>
          </TabsList>
          <TabsContent value="analytics"><AnalyticsSection /></TabsContent>
          <TabsContent value="flutter">{renderTrackPanel("flutter")}</TabsContent>
          <TabsContent value="frontend">{renderTrackPanel("frontend")}</TabsContent>
        </Tabs>
      </section>
    </main>
  );
}

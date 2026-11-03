import { Download, ExternalLink, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CV_CONFIG, type CVTrack } from "@/config/cv";
import { cn, downloadCV } from "@/lib/utils";
import { openCV } from "@/lib/cv-link";

type CVFallbackProps = {
  track: CVTrack;
  /** Drives the copy only — the actions are identical either way. */
  reason: "coarse-pointer" | "load-error";
  className?: string;
};

const COPY: Record<CVFallbackProps["reason"], { title: string; body: string }> = {
  "coarse-pointer": {
    title: "Open or download this CV",
    body: "In-browser preview is limited on this device. Open the PDF in a new tab or save a copy.",
  },
  "load-error": {
    title: "This CV can't be displayed here",
    body: "The document could not be embedded. Open it in a new tab or download a copy instead.",
  },
};

/**
 * Shown instead of the embed when an iframe would be useless (phones, coarse
 * pointers) or when the PDF failed to load. Always offers working actions so the
 * visitor is never left at a dead end.
 */
export function CVFallback({ track, reason, className }: CVFallbackProps) {
  const label = CV_CONFIG[track].label;
  const copy = COPY[reason];

  return (
    <Card className={cn("modern-card border-border/50", className)}>
      <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
        <div className="rounded-2xl bg-primary/10 p-3 text-primary" aria-hidden="true">
          <FileText className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-foreground">{copy.title}</h2>
          <p className="max-w-md text-sm text-muted-foreground">{copy.body}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            className="rounded-full bg-primary px-6 text-primary-foreground hover:bg-primary/90"
            onClick={() => openCV(track)}
            aria-label={`Open ${label} in a new tab`}
          >
            <ExternalLink className="mr-2 h-4 w-4" aria-hidden="true" />
            Open PDF
          </Button>
          <Button
            variant="outline"
            className="rounded-full border-border/60 px-6"
            onClick={() => downloadCV(track)}
            aria-label={`Download ${label}`}
          >
            <Download className="mr-2 h-4 w-4" aria-hidden="true" />
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

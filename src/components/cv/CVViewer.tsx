import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { CV_CONFIG, type CVTrack } from "@/config/cv";
import { getCVViewUrl } from "@/lib/cv-link";
import { cn } from "@/lib/utils";
type CVViewerProps = {
  track: CVTrack;
  className?: string;
  /** Bubbled up so the page can show fallback actions if the embed fails. */
  onError?: () => void;
};

/**
 * Embeds the CV PDF using the browser's native viewer. The `inline` disposition
 * served by `/api/download-cv?mode=view` is what makes it render in-page rather
 * than download. Keyed by track downstream so switching forces a fresh load.
 */
export function CVViewer({ track, className, onError }: CVViewerProps) {
  const [loading, setLoading] = useState(true);
  const src = getCVViewUrl(track);
  const label = CV_CONFIG[track].label;

  // Reset the spinner whenever the embedded document changes.
  useEffect(() => {
    setLoading(true);
  }, [src]);

  return (
    <div className={cn("relative w-full overflow-hidden rounded-xl border border-border/60 bg-secondary/20", className)}>
      {loading && (
        <div
          className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-background/80"
          role="status"
          aria-live="polite"
        >
          <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">Loading the CV…</p>
        </div>
      )}
      <iframe
        key={src}
        src={src}
        title={`${label} — inline PDF viewer`}
        className="h-full w-full"
        referrerPolicy="no-referrer"
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          onError?.();
        }}
      />
    </div>
  );
}

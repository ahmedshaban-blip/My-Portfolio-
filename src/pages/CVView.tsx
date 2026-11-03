import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Download } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CVViewer } from "@/components/cv/CVViewer";
import { CVFallback } from "@/components/cv/CVFallback";
import { CVTrackTabs } from "@/components/cv/CVTrackTabs";
import { CV_CONFIG, type CVTrack } from "@/config/cv";
import { DEFAULT_CV_TRACK, isCVTrack, parseCVTrack } from "@/lib/cv-view";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAnimationContext } from "@/hooks/useAnimationContext";
import { fadeUp, staggerContainer, staggerItem } from "@/lib/animation-variants";
import { downloadCV } from "@/lib/utils";
import { hasFinePointer } from "@/lib/pointer";

/**
 * Shareable in-browser CV reader (`/cv?track=flutter|frontend`).
 *
 * The selected track is derived from the URL so a recruiter can be sent a
 * direct link, and so back/forward navigation works. Rendered from its own
 * lazy route chunk, so it never contributes to the home page's first paint.
 */
const CVView = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { reducedMotion } = useAnimationContext();
  const isMobile = useIsMobile();

  const rawTrack = searchParams.get("track");
  const track = parseCVTrack(rawTrack);
  // Latch the "we substituted a default" fact: the normalization below rewrites
  // the URL on the first commit, which would otherwise hide the notice instantly.
  const [invalidTrack, setInvalidTrack] = useState(false);

  // Embedded PDFs are unreliable on phones and coarse-pointer devices, so those
  // visitors get explicit "open" / "download" actions instead.
  const [coarsePointer, setCoarsePointer] = useState(false);
  const [embedFailed, setEmbedFailed] = useState(false);

  useEffect(() => {
    setCoarsePointer(!hasFinePointer());
  }, []);

  // Normalize an unusable ?track= so the address bar always matches what is shown.
  useEffect(() => {
    if (rawTrack !== null && !isCVTrack(rawTrack)) {
      setInvalidTrack(true);
      setSearchParams({ track: DEFAULT_CV_TRACK }, { replace: true });
    }
  }, [rawTrack, setSearchParams]);

  const showFallback = isMobile || coarsePointer || embedFailed;
  const label = CV_CONFIG[track].label;

  const handleTrackChange = (next: CVTrack) => {
    setEmbedFailed(false);
    setInvalidTrack(false);
    setSearchParams({ track: next });
  };

  return (
    <main id="cv" className="relative min-h-screen pb-20 pt-32 sm:pt-36">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={staggerContainer}
          initial={reducedMotion ? "visible" : "hidden"}
          animate="visible"
          className="mx-auto max-w-5xl space-y-8"
        >
          <motion.div variants={staggerItem} className="space-y-4">
            <Button asChild variant="ghost" size="sm" className="rounded-full pl-2 text-muted-foreground hover:text-primary">
              <Link to="/">
                <ArrowLeft className="mr-1.5 h-4 w-4" aria-hidden="true" />
                Back to portfolio
              </Link>
            </Button>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-2">
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                  {label}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Read it right here, or download a copy for later.
                </p>
              </div>
              <Button
                onClick={() => downloadCV(track)}
                className="rounded-full bg-primary px-6 text-primary-foreground hover:bg-primary/90"
                aria-label={`Download ${label}`}
              >
                <Download className="mr-2 h-4 w-4" aria-hidden="true" />
                Download CV
              </Button>
            </div>
          </motion.div>

          {invalidTrack && (
            <motion.p
              variants={staggerItem}
              role="status"
              className="rounded-xl border border-border/60 bg-secondary/40 px-4 py-3 text-sm text-muted-foreground"
            >
              We couldn't find that CV track, so the Flutter CV is shown instead.
            </motion.p>
          )}

          <motion.div variants={staggerItem}>
            <CVTrackTabs track={track} onChange={handleTrackChange} />
          </motion.div>

          <motion.div variants={staggerItem}>
            {showFallback ? (
              <CVFallback
                track={track}
                reason={embedFailed ? "load-error" : "coarse-pointer"}
                className="min-h-[320px]"
              />
            ) : (
              <CVViewer
                track={track}
                className="h-[75vh] min-h-[480px]"
                onError={() => setEmbedFailed(true)}
              />
            )}
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
};

export default CVView;

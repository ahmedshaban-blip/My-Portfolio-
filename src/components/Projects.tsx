import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, memo, type PointerEvent as ReactPointerEvent } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion, useMotionValue } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContentStatic, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Github,
  ExternalLink,
  Smartphone,
  Globe,
  Code2,
  Play,
  Clapperboard,
  ImageOff,
  ChevronLeft,
  ChevronRight,
  X,
  Expand,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { HoverCard } from "@/components/animations/HoverCard";
import { SectionHeading } from "@/components/SectionHeading";
import { useAnimationContext } from "@/hooks/useAnimationContext";
import { staggerContainer, staggerItem, plateTransition, indexRuleTransition, sheetTransition, stepTransition } from "@/lib/animation-variants";
import { flutterProjects, frontendProjects, type Project, type DemoKind } from "@/data/projects";
import { cn } from "@/lib/utils";

const DEMO_META: Record<DemoKind, { label: string; Icon: typeof ExternalLink }> = {
  play: { label: "Google Play", Icon: Play },
  live: { label: "Live Demo", Icon: ExternalLink },
  video: { label: "Video Demo", Icon: Clapperboard },
  source: { label: "Source Code", Icon: Github },
};

/**
 * The card's primary action is a verb, the case sheet's is a destination, so
 * they carry different words on purpose: a card button says what pressing it
 * does ("Open in Play Store"), while the sheet's button names where it goes
 * ("Google Play"). Same icon either way.
 */
const CARD_ACTION: Record<DemoKind, { label: string; Icon: typeof ExternalLink }> = {
  play: { label: "Open in Play Store", Icon: Play },
  live: { label: "Open Website", Icon: ExternalLink },
  video: { label: "Watch Video", Icon: Clapperboard },
  source: { label: "View Source", Icon: Github },
};

function demoHost(demo: string): string {
  try {
    return new URL(demo).hostname.replace(/^www\./, "");
  } catch {
    return demo;
  }
}

/**
 * Shared-element id for a project's media plate. The same plate is mounted in
 * the index card and in the case sheet, so opening a case reads as the plate
 * leaving the index rather than as a new surface appearing.
 */
const plateId = (slug: string) => `plate-${slug}`;

/**
 * What the card is allowed to tell the browser about the media box, so it picks
 * the right candidate from `srcset` instead of assuming the old layout.
 *
 * `ProjectImage` gets no `srcset` today (one file per screenshot), so this only
 * sets the width the browser reserves. It was `(max-width:768px) 100vw, 33vw` —
 * left over from the three-column grid, where the card was really ~176px wide.
 * Keep it in step with the tile in `ProjectCard`.
 */
const MEDIA_SIZES =
  "(max-width: 640px) calc(100vw - 2rem), (min-width: 1024px) 176px, 45vw";

/** CLS-safe image with skeleton + graceful fallback. */
const ProjectImage = memo(function ProjectImage({
  src,
  alt,
  className,
  eager = false,
  sizes = MEDIA_SIZES,
}: {
  src: string;
  alt: string;
  className?: string;
  eager?: boolean;
  sizes?: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  // Brand placeholder (e.g. flutter-cover.svg): full-bleed object-cover would
  // crop/zoom the logo badly — render it centered at a proper size instead.
  if (src.endsWith(".svg")) {
    return (
      <div
        className={cn(
          "relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary/15 via-secondary/40 to-accent/10",
          className,
        )}
      >
        {failed ? (
          <button
            type="button"
            onClick={() => setFailed(false)}
            aria-label={`Retry loading ${alt}`}
            className="relative flex flex-col items-center gap-2 rounded-xl p-4 text-muted-foreground transition-colors hover:text-accent-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            <ImageOff size={24} aria-hidden="true" />
            <span className="text-xs font-medium underline underline-offset-4">Tap to retry</span>
          </button>
        ) : (
          <img
            src={src}
            alt={alt}
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            draggable={false}
            onError={() => setFailed(true)}
            className="relative h-32 w-32 object-contain drop-shadow-lg sm:h-40 sm:w-40"
          />
        )}
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden bg-secondary/50", className)}>
      {!loaded && !failed && (
        // PERFORMANCE: a static placeholder — `animate-pulse` kept an infinite
        // compositor animation alive for every card whose image had not loaded
        // (up to 10 offscreen cards, forever).
        <div className="absolute inset-0 bg-secondary/70" aria-hidden="true" />
      )}
      {failed ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-secondary/60 px-4 text-center text-muted-foreground">
          <ImageOff size={20} aria-hidden="true" />
          <span className="text-xs font-medium">Preview unavailable</span>
          <button
            type="button"
            onClick={() => {
              setFailed(false);
              setLoaded(false);
            }}
            aria-label={`Retry loading ${alt}`}
            className="rounded-full border border-border/60 bg-background/80 px-3 py-1 text-[11px] font-semibold text-foreground transition-colors hover:border-primary/50 hover:text-accent-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            Retry
          </button>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          fetchpriority={eager ? "high" : "low"}
          sizes={sizes}
          draggable={false}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={cn(
            "h-full w-full object-contain",
            !loaded && "opacity-0",
          )}
        />
      )}
    </div>
  );
});

/**
 * PERFORMANCE: no cover is above the fold — the section itself is mounted only
 * when it approaches the viewport, so every cover loads lazily and nothing
 * competes with the hero LCP image.
 */

const ProjectCard = memo(function ProjectCard({
  project,
  isFlutter,
  reducedMotion,
  selected,
  onSelect,
  onFullscreen,
}: {
  project: Project;
  isFlutter: boolean;
  reducedMotion: boolean;
  /** True while this project's case sheet is open — see the plate handoff note. */
  selected: boolean;
  onSelect: (p: Project) => void;
  onFullscreen: (p: Project) => void;
}) {
  const open = () => onSelect(project);

  /**
   * Web work gets a browser-framed banner above the copy; mobile work gets a
   * panel above it, and a tile beside it once there is room.
   */
  const isWeb = project.kind === "web";

  /**
   * The media panel's ratio is the source's, not a fixed 9/16 — but only while
   * the card stacks (phone widths), where the panel is its own row and needs a
   * height of its own. From `sm` up the card is a row: the panel takes the
   * card's full height and the cover fills it, exactly like every other card.
   *
   * The square `enjez-mobile` cover is why this matters. Pinned to its own 1:1
   * ratio at `sm:w-56` it was 224 tall inside a 400 tall card, leaving a 176px
   * dead band under it — the one card that did not reach the card's height.
   */
  const [coverW, coverH] = project.coverAspect;

  // `object-cover` on `sm+`: the cover fills the panel at every source ratio, so
  // a square source crops to the tall panel instead of letterboxing inside it.
  const plateImageClass = "h-full w-full [&_img]:object-contain sm:[&_img]:object-cover";

  return (
    <HoverCard scale={reducedMotion ? 1 : 1.02} className="flex w-full flex-1 flex-col self-stretch min-h-0">
      <article className="flex w-full min-h-0 flex-1 flex-col">
        <Card
          className={cn(
            "group flex flex-1 flex-col overflow-hidden rounded-xl border border-border/60 bg-card/50 transition-colors duration-300 hover:border-primary/60",
            !isWeb && "sm:flex-row",
          )}
        >
          <div
            className={cn(
              "relative flex shrink-0 flex-col overflow-hidden border-border/50",
              // Below `sm` the panel is its own row, so it needs a height of its
              // own: the CSS var carries the source's ratio, and `aspect-[var(--media-aspect)]`
              // resolves it. From `sm` up the card is a row, so the panel takes
              // the card's full height instead (`sm:h-auto` + `sm:self-stretch`
              // drop the ratio) and the cover fills it — the square
              // `enjez-mobile` cover included, which otherwise sat 224 tall in a
              // 400 tall card and left a 176px dead band beneath it.
              isWeb
                ? "w-full border-b bg-secondary/20"
                : "aspect-[var(--media-aspect)] w-full self-start border-b bg-secondary/20 sm:aspect-auto sm:h-auto sm:w-56 sm:self-stretch sm:border-b-0 sm:border-r",
            )}
            style={isWeb ? undefined : ({ "--media-aspect": `${coverW} / ${coverH}` } as React.CSSProperties)}
          >
            {/* Browser chrome, the same frame the case sheet uses — it says
                "this is a website" before the crop says anything. */}
            {isWeb && (
              <div
                className="flex shrink-0 items-center gap-1.5 border-b border-border/50 bg-secondary/30 px-3 py-2"
                aria-hidden="true"
              >
                <span className="h-2 w-2 rounded-full bg-border" />
                <span className="h-2 w-2 rounded-full bg-border" />
                <span className="h-2 w-2 rounded-full bg-border" />
                <span className="ml-1.5 truncate rounded-md bg-background/70 px-2 py-0.5 text-[10px] text-muted-foreground">
                  {demoHost(project.demo)}
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={() => onFullscreen(project)}
              aria-label={`Open ${project.title} screenshots in fullscreen`}
              title="Open fullscreen gallery"
              className={cn(
                // `flex-1` claims the panel's leftover height (the panel is a
                // column), and `items-stretch` keeps the plate full-height on
                // the row layout — together the plate is the panel's full box,
                // so `object-cover` fills it. The old `items-center` with no
                // grow pinned a shorter source to the middle, leaving the band.
                "group relative flex w-full flex-1 cursor-zoom-in items-stretch overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/60",
                // Web sets its own height from the banner's aspect.
                isWeb && "aspect-video",
              )}
            >
              {/* PLATE HANDOFF — a `layoutId` must identify exactly one element at
                  a time. While this project's case sheet is open, the viewer's
                  plate is the leader; the card keeps a plain (unprojected) plate
                  so framer sees the element leave the index and land in the
                  sheet, rather than choosing between two live nodes. */}
              {selected ? (
                // `contents` keeps the plate's own box (and the image's aspect
                // with it) in flow — a wrapper with `absolute inset-0` collapsed
                // the tile to 1px, because an absolutely positioned child adds
                // no height to its parent.
                <div className="contents">
                  <ProjectImage
                    src={project.coverImage}
                    alt={`${project.title} cover preview`}
                    sizes={MEDIA_SIZES}
                    className={plateImageClass}
                  />
                </div>
              ) : (
                <motion.div
                  layoutId={plateId(project.slug)}
                  transition={reducedMotion ? { duration: 0 } : plateTransition}
                  className={plateImageClass}
                >
                  <ProjectImage
                    src={project.coverImage}
                    alt={`${project.title} cover preview`}
                    sizes={MEDIA_SIZES}
                    className={cn(
                      // Match the plate: `contain` while stacked, `cover` on the
                      // row layout. Without the `sm:` half this inner rule sat
                      // closer to the <img> than the plate's and won, so a square
                      // cover stayed 1:1 inside a full-height panel.
                      "h-full w-full [&_img]:object-contain sm:[&_img]:object-cover",
                      "group-hover:[&_img]:scale-[1.03] [&_img]:transition-transform [&_img]:duration-300",
                    )}
                  />
                </motion.div>
              )}
              {/* Hover / focus hint — mirrors the inline viewer */}
              <span
                aria-hidden="true"
                className={cn(
                  "pointer-events-none absolute inset-0 z-10 items-center justify-center bg-foreground/0 opacity-0 transition-all duration-200 group-hover:bg-foreground/10 group-hover:opacity-100 group-focus-visible:opacity-100",
                  // On the short mobile card the hint would cover the whole tile.
                  isWeb ? "flex" : "hidden sm:flex",
                )}
              >
                <span className="flex translate-y-1 items-center gap-1.5 rounded-full bg-background/90 px-3 py-1.5 text-xs font-semibold text-foreground shadow-lg backdrop-blur transition-transform duration-200 group-hover:translate-y-0">
                  <Expand size={14} /> Fullscreen
                </span>
              </span>
            </button>
          </div>

          <CardHeader className="relative z-10 flex flex-1 flex-col p-5 md:p-6">
            <div className="mb-3 flex items-center justify-between gap-2">
              <span
                className={cn(
                  "rounded-lg border p-2",
                  isFlutter
                    ? "border-primary/30 bg-primary/15 text-accent-strong"
                    : "border-border/60 bg-secondary/40 text-foreground",
                )}
                aria-hidden="true"
              >
                {isFlutter ? <Smartphone size={16} /> : <Globe size={16} />}
              </span>
              <Badge
                variant="outline"
                className="rounded-full border-border/70 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground"
              >
                {project.role}
              </Badge>
            </div>

            {/* Reserved line heights: without them a one-line title sat above a
                two-line one, so every row beneath it (chips, actions) started
                at a different y across the row of cards. */}
            <CardTitle className="mb-2 line-clamp-2 text-lg font-bold leading-snug tracking-tight text-foreground transition-colors duration-200 group-hover:text-accent-strong md:min-h-[2lh] md:text-xl">
              {project.title}
            </CardTitle>

            <CardDescription className="mb-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground md:min-h-[3lh]">
              {project.description}
            </CardDescription>

            <div className="mb-5 flex flex-wrap gap-2">
              {project.techStack.slice(0, 4).map((tech) => (
                <span
                  key={tech}
                  className="rounded-full border border-border/60 px-2.5 py-1 text-[10px] font-medium text-muted-foreground"
                >
                  {tech}
                </span>
              ))}
              {project.techStack.length > 4 && (
                <span className="px-1 py-1 text-[10px] font-medium text-muted-foreground">
                  +{project.techStack.length - 4}
                </span>
              )}
            </div>

            <div className="mt-auto space-y-2 border-t border-border/40 pt-4">
              {/* Primary action: leave for the real thing — the store listing, the
                  live site, the video. Naming it as a verb rather than a
                  destination ("Open in Play Store", not "Google Play") keeps it
                  distinct from the sheet's own button, which does the same job
                  with different words. */}
              {(() => {
                const meta = CARD_ACTION[project.demoKind];
                return (
                  <Button
                    className="h-11 min-h-[44px] w-full rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                    asChild
                  >
                    <a
                      href={project.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${meta.label} — ${project.title}`}
                    >
                      <meta.Icon size={14} className="mr-2 shrink-0" aria-hidden="true" />
                      <span className="truncate">{meta.label}</span>
                    </a>
                  </Button>
                );
              })()}

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="h-11 min-h-[44px] flex-1 rounded-full border-border/60 px-4 text-xs font-semibold transition-colors hover:border-primary/50 hover:bg-primary/15 hover:text-accent-strong"
                  onClick={open}
                >
                  View case <ChevronRight size={14} className="ml-1" aria-hidden="true" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-11 min-h-[44px] w-11 shrink-0 rounded-full border-border/60 transition-colors duration-200 hover:border-primary/50 hover:bg-primary/15 hover:text-accent-strong"
                  asChild
                >
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Source code for ${project.title} on GitHub`}
                  >
                    <Github size={14} />
                  </a>
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      </article>
    </HoverCard>
  );
});

const ALL_PROJECTS: Project[] = [...flutterProjects, ...frontendProjects];

type TabValue = "flutter" | "frontend";

function isTabValue(value: string | null): value is TabValue {
  return value === "flutter" || value === "frontend";
}

/** slug -> owning tab, built once — avoids a linear scan per lookup. */
const PROJECT_TAB_BY_SLUG: ReadonlyMap<string, TabValue> = new Map(
  ALL_PROJECTS.map((p) => [
    p.slug,
    flutterProjects.some((f) => f.slug === p.slug) ? "flutter" : "frontend",
  ]),
);

const PROJECT_BY_SLUG: ReadonlyMap<string, Project> = new Map(
  ALL_PROJECTS.map((p) => [p.slug, p]),
);

function tabOfProject(project: Project): TabValue {
  return PROJECT_TAB_BY_SLUG.get(project.slug) ?? "frontend";
}

function projectBySlug(slug: string | null): Project | null {
  if (!slug) return null;
  return PROJECT_BY_SLUG.get(slug) ?? null;
}

/** Inline single-dialog viewer: preview image with fade, arrows, counter + fullscreen entry. */
function InlineViewer({
  project,
  index,
  onIndex,
  onExpand,
  reducedMotion,
}: {
  project: Project;
  index: number;
  onIndex: (index: number) => void;
  onExpand: () => void;
  reducedMotion: boolean;
}) {
  const images = useMemo(
    () => (project.screenshots.length > 0 ? project.screenshots : [project.coverImage]),
    [project.screenshots, project.coverImage],
  );
  const safeIndex = ((index % images.length) + images.length) % images.length;
  const src = images[safeIndex];
  const portrait = project.kind === "mobile";
  const step = (dir: 1 | -1) => onIndex((safeIndex + dir + images.length) % images.length);
  const touchX = useRef<number | null>(null);

  // The screenshot enters from the side it was asked for, so the arrows read as
  // a direction instead of an unrelated swap. Wrapping is resolved the short
  // way round. Derived during render, applied in a layout effect: mutating a ref
  // mid-render replays wrongly under StrictMode's double render.
  const lastSafeIndex = useRef(safeIndex);
  const direction = useRef(1);
  useLayoutEffect(() => {
    if (safeIndex === lastSafeIndex.current) return;
    const forward = (safeIndex - lastSafeIndex.current + images.length) % images.length;
    direction.current = forward === 0 || forward > images.length / 2 ? -1 : 1;
    lastSafeIndex.current = safeIndex;
  }, [safeIndex, images.length]);

  // Preload neighbours so arrow / thumbnail switching feels instant (no API — local files, just decode cost).
  useEffect(() => {
    if (images.length <= 1) return;
    const preload = (i: number) => {
      const img = new Image();
      img.decoding = "async";
      img.src = images[((i % images.length) + images.length) % images.length];
    };
    preload(safeIndex + 1);
    preload(safeIndex - 1);
  }, [safeIndex, images]);

  return (
    <figure className="min-w-0">
      <div
        className="overflow-hidden rounded-xl border border-border/60 bg-secondary/30 shadow-sm"
        onTouchStart={(e) => {
          touchX.current = e.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(e) => {
          if (touchX.current === null || images.length <= 1) return;
          const dx = e.changedTouches[0]?.clientX - touchX.current;
          touchX.current = null;
          if (Math.abs(dx) < 24) return;
          step(dx < 0 ? 1 : -1);
        }}
      >
        {project.kind === "web" && (
          <div
            className="flex items-center gap-1.5 border-b border-border/40 bg-secondary/40 px-3 py-2"
            aria-hidden="true"
          >
            <span className="h-2.5 w-2.5 rounded-full bg-border" />
            <span className="h-2.5 w-2.5 rounded-full bg-border" />
            <span className="h-2.5 w-2.5 rounded-full bg-border" />
            <span className="ml-2 max-w-[16rem] truncate rounded-md bg-background px-2 py-0.5 text-xs text-muted-foreground">
              {demoHost(project.demo)}
            </span>
          </div>
        )}
        <div className={cn("relative", portrait && "flex items-center justify-center gap-2 p-4")}>
          {images.length > 1 && (
            <Button
              variant="outline"
              size="icon"
              aria-label={`Previous screenshot of ${project.title}`}
              onClick={() => step(-1)}
              className={cn(
                "shrink-0 rounded-full",
                !portrait && "absolute left-3 top-1/2 z-10 -translate-y-1/2 bg-background/90",
              )}
            >
              <ChevronLeft size={18} />
            </Button>
          )}
          <motion.div
            layoutId={plateId(project.slug)}
            transition={reducedMotion ? { duration: 0 } : plateTransition}
            className="relative min-w-0"
          >
            <button
              type="button"
              onClick={onExpand}
              aria-label={`Open ${project.title} screenshot ${safeIndex + 1} fullscreen`}
              title="Open fullscreen"
              className="group relative block min-w-0 cursor-zoom-in rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              <motion.img
                key={src}
                src={src}
                alt={`${project.title} screenshot ${safeIndex + 1} of ${images.length}`}
                loading="eager"
                fetchpriority="high"
                decoding="async"
                draggable={false}
                initial={reducedMotion ? false : { opacity: 0, x: direction.current * 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={reducedMotion ? { duration: 0 } : stepTransition}
                className={
                  src.endsWith(".svg")
                    ? "mx-auto h-40 w-40 object-contain p-6 drop-shadow-lg"
                    : portrait
                      ? "max-h-[46vh] w-auto max-w-full rounded-lg border border-border/40 object-contain"
                      : "aspect-video w-full object-cover object-top"
                }
              />
              {/* Hover / focus hint — subtle, calm */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg bg-foreground/0 opacity-0 transition-all duration-200 group-hover:bg-foreground/10 group-hover:opacity-100 group-focus-visible:opacity-100"
              >
                <span className="flex translate-y-1 items-center gap-1.5 rounded-full bg-background/90 px-3 py-1.5 text-xs font-semibold text-foreground shadow-lg backdrop-blur transition-transform duration-200 group-hover:translate-y-0">
                  <Expand size={14} /> Fullscreen
                </span>
              </span>
            </button>
          </motion.div>
          {images.length > 1 && (
            <Button
              variant="outline"
              size="icon"
              aria-label={`Next screenshot of ${project.title}`}
              onClick={() => step(1)}
              className={cn(
                "shrink-0 rounded-full",
                !portrait && "absolute right-3 top-1/2 z-10 -translate-y-1/2 bg-background/90",
              )}
            >
              <ChevronRight size={18} />
            </Button>
          )}
        </div>
      </div>
      <figcaption className="mt-2 flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span className="min-w-0 flex-1 truncate">
          {portrait
            ? "Tap image for fullscreen · swipe or arrows to browse."
            : "Click image for fullscreen · arrows to browse."}
        </span>
        {images.length > 1 && (
          <span aria-live="polite" className="shrink-0 tabular-nums">
            {safeIndex + 1} of {images.length}
          </span>
        )}
      </figcaption>
    </figure>
  );
}

/**
 * Calm fullscreen lightbox — one image at full size.
 * Mobile: bottom control bar + swipe + dots, large 44px targets, safe-area aware.
 * Desktop: side arrows + keyboard (Esc / ← / →) + zoom toggle.
 */
function Lightbox({
  project,
  index,
  onIndex,
  onClose,
  reducedMotion,
}: {
  project: Project;
  index: number;
  onIndex: (index: number) => void;
  onClose: () => void;
  reducedMotion: boolean;
}) {
  const images = useMemo(
    () => (project.screenshots.length > 0 ? project.screenshots : [project.coverImage]),
    [project.screenshots, project.coverImage],
  );
  const safeIndex = ((index % images.length) + images.length) % images.length;
  const src = images[safeIndex];
  const [zoomed, setZoomed] = useState(false);

  // Pan/zoom view as motion values — gestures stay at 60fps without re-renders;
  // `zoomed` mirrors scale only for UI (icons, hints, cursor).
  const tx = useMotionValue(0);
  const ty = useMotionValue(0);
  const sc = useMotionValue(1);
  const stageRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ startX: number; startY: number; pinchDist: number; moved: boolean } | null>(null);

  /**
   * PERFORMANCE: pan/zoom used to call `img.offsetWidth`, `stage.clientWidth`
   * and `stage.getBoundingClientRect()` on every pointermove / wheel tick —
   * i.e. 3–5 forced synchronous layouts per frame. Measured once per gesture
   * start (and on resize / image load) instead.
   */
  const metrics = useRef({ imgW: 0, imgH: 0, stageW: 0, stageH: 0, left: 0, top: 0, width: 0, height: 0 });

  const measure = useCallback(() => {
    const stage = stageRef.current;
    const img = imgRef.current;
    if (!stage || !img) return;
    const rect = stage.getBoundingClientRect();
    metrics.current = {
      imgW: img.offsetWidth,
      imgH: img.offsetHeight,
      stageW: stage.clientWidth,
      stageH: stage.clientHeight,
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
    };
  }, []);

  /** Measure only when the cache is still empty (e.g. a wheel before `onLoad`). */
  const ensureMeasured = useCallback(() => {
    if (metrics.current.imgW === 0 || metrics.current.width === 0) measure();
    return metrics.current;
  }, [measure]);

  const resetView = useCallback(() => {
    tx.set(0);
    ty.set(0);
    sc.set(1);
    setZoomed(false);
  }, [sc, tx, ty]);

  const step = useCallback(
    (dir: 1 | -1) => {
      resetView();
      onIndex((safeIndex + dir + images.length) % images.length);
    },
    [onIndex, safeIndex, images.length, resetView],
  );

  // Clamp pan so the image edge never leaves the stage (cached metrics — no layout reads).
  const clampPan = useCallback((x: number, y: number, s: number) => {
    const { imgW, imgH, stageW, stageH } = metrics.current;
    if (!imgW || !imgH) return { x, y };
    const maxX = Math.max(0, (imgW * s - stageW) / 2);
    const maxY = Math.max(0, (imgH * s - stageH) / 2);
    return {
      x: Math.min(maxX, Math.max(-maxX, x)),
      y: Math.min(maxY, Math.max(-maxY, y)),
    };
  }, []);

  // Zoom keeping the point under (clientX, clientY) fixed — cursor/pinch anchored.
  const zoomAt = useCallback(
    (clientX: number, clientY: number, next: number) => {
      const stage = stageRef.current;
      if (!stage) return;
      const s = Math.min(4, Math.max(1, next));
      const prev = sc.get();
      if (s === prev) return;
      const r = ensureMeasured();
      const mx = clientX - r.left - r.width / 2;
      const my = clientY - r.top - r.height / 2;
      const k = s / prev;
      const o = { x: tx.get(), y: ty.get() };
      const { x, y } = clampPan(mx - (mx - o.x) * k, my - (my - o.y) * k, s);
      tx.set(x);
      ty.set(y);
      sc.set(s);
      setZoomed(s > 1.01);
    },
    [clampPan, ensureMeasured, sc, tx, ty],
  );

  const zoomToggleAt = useCallback(
    (clientX: number, clientY: number) => {
      zoomAt(clientX, clientY, sc.get() > 1.01 ? 1 : 2);
    },
    [sc, zoomAt],
  );

  const zoomToggleCenter = useCallback(() => {
    const r = ensureMeasured();
    zoomToggleAt(r.left + r.width / 2, r.top + r.height / 2);
  }, [ensureMeasured, zoomToggleAt]);

  // Unified mouse + touch gestures on the stage:
  // tap on image = zoom toggle · drag = pan (zoomed) or swipe (fit) ·
  // two pointers = pinch zoom. Buttons opt out via closest("button").
  const onStagePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button")) return;
    measure();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1) {
      gesture.current = { startX: e.clientX, startY: e.clientY, pinchDist: 0, moved: false };
    } else if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      gesture.current = {
        startX: e.clientX,
        startY: e.clientY,
        pinchDist: Math.hypot(a.x - b.x, a.y - b.y),
        moved: true,
      };
    }
  };

  const onStagePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const p = pointers.current.get(e.pointerId);
    const g = gesture.current;
    if (!p || !g) return;
    const dx = e.clientX - p.x;
    const dy = e.clientY - p.y;
    p.x = e.clientX;
    p.y = e.clientY;
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (g.pinchDist > 0 && dist > 0) {
        zoomAt((a.x + b.x) / 2, (a.y + b.y) / 2, sc.get() * (dist / g.pinchDist));
        g.pinchDist = dist;
      }
      return;
    }
    if (Math.abs(e.clientX - g.startX) + Math.abs(e.clientY - g.startY) > 6) g.moved = true;
    if (sc.get() > 1.01) {
      const { x, y } = clampPan(tx.get() + dx, ty.get() + dy, sc.get());
      tx.set(x);
      ty.set(y);
    }
  };

  const endStagePointer = (e: ReactPointerEvent<HTMLDivElement>) => {
    const wasSingle = pointers.current.size === 1;
    pointers.current.delete(e.pointerId);
    if (pointers.current.size === 1) {
      // Pinch lifted with one finger still down — re-anchor to avoid a jump.
      const [rest] = [...pointers.current.values()];
      gesture.current = { startX: rest.x, startY: rest.y, pinchDist: 0, moved: true };
      return;
    }
    if (!wasSingle) return;
    const g = gesture.current;
    gesture.current = null;
    if (!g) return;
    const totalDx = e.clientX - g.startX;
    const totalDy = e.clientY - g.startY;
    if (!g.moved) {
      // Tap on the image toggles zoom at the tap point; elsewhere is a no-op
      // (backdrop clicks still bubble up to close the lightbox).
      if ((e.target as HTMLElement).closest("img")) zoomToggleAt(e.clientX, e.clientY);
    } else if (
      sc.get() <= 1.01 &&
      images.length > 1 &&
      Math.abs(totalDx) > 40 &&
      Math.abs(totalDx) > Math.abs(totalDy) * 1.5
    ) {
      step(totalDx < 0 ? 1 : -1);
    }
  };

  // Mouse-wheel zoom (desktop). Native non-passive listener — React's onWheel
  // is passive at the root and can't preventDefault the page zoom/scroll.
  // Exponential factor feels right for both wheel mice and trackpads.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const unit = e.deltaMode === 1 ? 16 : 1;
      zoomAt(e.clientX, e.clientY, sc.get() * Math.exp(-e.deltaY * unit * 0.0018));
    };
    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => stage.removeEventListener("wheel", onWheel);
  }, [sc, zoomAt]);

  // Warm the geometry cache once the lightbox is on screen, so a wheel or
  // pinch that arrives before `onLoad` anchors around the real stage centre.
  useEffect(() => {
    const raf = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(raf);
  }, [measure]);

  // Keep pan clamped across viewport resizes while zoomed.
  useEffect(() => {
    const onResize = () => {
      measure();      if (sc.get() > 1.01) {
        const { x, y } = clampPan(tx.get(), ty.get(), sc.get());
        tx.set(x);
        ty.set(y);
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [clampPan, measure, sc, tx, ty]);

  // Lock background scroll + keyboard controls.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, step]);

  // Reset zoom when switching images; preload neighbours for instant arrows.
  useEffect(() => {
    resetView();
    if (images.length <= 1) return;
    const preload = (i: number) => {
      const img = new Image();
      img.decoding = "async";
      img.src = images[((i % images.length) + images.length) % images.length];
    };
    preload(safeIndex + 1);
    preload(safeIndex - 1);
  }, [safeIndex, images, resetView]);

  return createPortal(
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={`${project.title} fullscreen image ${safeIndex + 1} of ${images.length}`}
      // Radix modal Dialog sets `pointer-events: none` on <body> while open —
      // this portal lives outside the dialog, so re-enable events or every
      // button/wheel gesture inside the lightbox silently passes through.
      className="pointer-events-auto fixed inset-0 z-[300] flex flex-col bg-black/90"
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.2, ease: "easeOut" }}
      onClick={onClose}
    >
      {/* Top bar */}
      <div
        className="flex shrink-0 items-center gap-3 px-4 pb-2 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="min-w-0 flex-1 truncate text-sm font-semibold text-white/90">
          {project.title}
          {images.length > 1 && (
            <span className="ml-2 font-normal tabular-nums text-white/60">
              {safeIndex + 1} / {images.length}
            </span>
          )}
        </p>
        <Button
          variant="ghost"
          size="icon"
          onClick={zoomToggleCenter}
          aria-label={zoomed ? "Zoom out" : "Zoom in"}
          aria-pressed={zoomed}
          className="h-11 w-11 shrink-0 rounded-full text-white hover:bg-white/15 hover:text-white"
        >
          {zoomed ? <ZoomOut size={19} /> : <ZoomIn size={19} />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="Close fullscreen"
          autoFocus
          className="h-11 w-11 shrink-0 rounded-full bg-white/10 text-white hover:bg-white/20 hover:text-white"
        >
          <X size={20} />
        </Button>
      </div>

      {/* Stage — tap = zoom, drag = pan/swipe, pinch & wheel = zoom */}
      <div
        ref={stageRef}
        className="relative flex min-h-0 flex-1 touch-none select-none items-center justify-center overflow-hidden px-3 sm:px-14"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={onStagePointerDown}
        onPointerMove={onStagePointerMove}
        onPointerUp={endStagePointer}
        onPointerCancel={endStagePointer}
      >
        {images.length > 1 && (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Previous image"
            onClick={() => step(-1)}
            className="absolute left-2 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 rounded-full bg-white/10 text-white backdrop-blur hover:bg-white/20 hover:text-white sm:flex md:left-4"
          >
            <ChevronLeft size={22} />
          </Button>
        )}
        <motion.img
          key={src}
          ref={imgRef}
          src={src}
          alt={`${project.title} fullscreen screenshot ${safeIndex + 1}`}
          draggable={false}
          decoding="async"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={reducedMotion ? { duration: 0 } : { duration: 0.2, ease: "easeOut" }}
          style={{ x: tx, y: ty, scale: sc, touchAction: "none", cursor: zoomed ? "zoom-out" : "zoom-in" }}
          title="Tap to zoom · scroll or pinch to zoom · drag to pan"
          onLoad={measure}
          className="h-auto max-h-[68vh] w-auto max-w-[92vw] select-none rounded-2xl border border-white/15 bg-black object-contain shadow-2xl sm:max-h-[74vh] md:max-h-[78vh] md:max-w-[78vw]"
        />
        {images.length > 1 && (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Next image"
            onClick={() => step(1)}
            className="absolute right-2 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 rounded-full bg-white/10 text-white backdrop-blur hover:bg-white/20 hover:text-white sm:flex md:right-4"
          >
            <ChevronRight size={22} />
          </Button>
        )}
      </div>

      {/* Bottom bar — mobile-first controls + dots */}
      <div
        className="flex shrink-0 flex-col items-center gap-3 px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-2"
        onClick={(e) => e.stopPropagation()}
      >
        {images.length > 1 && (
          <>
            {/* Mobile arrows */}
            <div className="flex items-center gap-3 sm:hidden">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Previous image"
                onClick={() => step(-1)}
                className="h-12 w-12 rounded-full bg-white/10 text-white hover:bg-white/20 hover:text-white"
              >
                <ChevronLeft size={22} />
              </Button>
              <span className="min-w-16 text-center text-sm tabular-nums text-white/80" aria-live="polite">
                {safeIndex + 1} of {images.length}
              </span>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Next image"
                onClick={() => step(1)}
                className="h-12 w-12 rounded-full bg-white/10 text-white hover:bg-white/20 hover:text-white"
              >
                <ChevronRight size={22} />
              </Button>
            </div>
            {/* Dots */}
            <div className="flex items-center justify-center gap-2" role="tablist" aria-label="Choose image">
              {images.map((imgSrc, i) => (
                <button
                  key={imgSrc + i}
                  type="button"
                  role="tab"
                  aria-selected={i === safeIndex}
                  aria-label={`Show image ${i + 1}`}
                  onClick={() => {
                    resetView();
                    onIndex(i);
                  }}
                  className={cn(
                    "h-2.5 rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
                    i === safeIndex ? "w-7 bg-white" : "w-2.5 bg-white/35 hover:bg-white/60",
                  )}
                />
              ))}
            </div>
          </>
        )}
        <p className="text-xs text-white/50">
          {zoomed ? (
            "Scroll / pinch to adjust · drag to pan · tap image to reset"
          ) : (
            <>
              <span className="hidden sm:inline">Scroll to zoom · tap image to zoom · arrows to browse · Esc to close</span>
              <span className="sm:hidden">Pinch or tap to zoom · swipe to browse</span>
            </>
          )}
        </p>
      </div>
    </motion.div>,
    document.body,
  );
}

const GalleryStrip = memo(function GalleryStrip({
  project,
  activeIndex,
  onSelect,
}: {
  project: Project;
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  if (project.screenshots.length <= 1) return null;
  return (
    <div
      className="flex w-full min-w-0 snap-x snap-mandatory gap-4 overflow-x-auto px-0.5 pb-3 pt-4"
      role="list"
      aria-label={`${project.title} screenshots`}
    >
      {project.screenshots.map((src, i) => {
        const active = i === activeIndex;
        return (
          <figure key={src} role="listitem" className="w-40 shrink-0 snap-start md:w-48">
            <button
              type="button"
              onClick={() => onSelect(i)}
              aria-label={`Show screenshot ${i + 1} of ${project.title}`}
              aria-current={active}
              className={cn(
                "block w-full overflow-hidden rounded-2xl border bg-secondary/30 shadow-sm transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active ? "border-primary/60 ring-2 ring-primary/30" : "border-border/60 hover:border-primary/50",
              )}
            >
              <span className="flex justify-center border-b border-border/40 py-1.5" aria-hidden="true">
                <span className="h-1 w-8 rounded-full bg-border" />
              </span>
              <ProjectImage
                src={src}
                alt={`${project.title} screenshot ${i + 1}`}
                className="aspect-[9/16]"
              />
            </button>
            <figcaption className="mt-2 line-clamp-2 text-xs leading-snug text-muted-foreground">
              {project.features.length > 0
                ? project.features[i % project.features.length]
                : `Screenshot ${i + 1}`}
            </figcaption>
          </figure>
        );
      })}
    </div>
  );
});

const WebGalleryStrip = memo(function WebGalleryStrip({
  project,
  activeIndex,
  onSelect,
}: {
  project: Project;
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  if (project.screenshots.length <= 1) return null;

  return (
    <div
      className="flex w-full min-w-0 snap-x snap-mandatory gap-4 overflow-x-auto px-0.5 pb-3 pt-4"
      role="list"
      aria-label={`${project.title} page screenshots`}
    >
      {project.screenshots.map((src, i) => {
        const active = i === activeIndex;
        return (
          <figure key={src} role="listitem" className="w-72 shrink-0 snap-start md:w-80">
            <button
              type="button"
              onClick={() => onSelect(i)}
              aria-label={`Show page screenshot ${i + 1} of ${project.title}`}
              aria-current={active}
              className={cn(
                "block w-full overflow-hidden rounded-2xl border bg-background shadow-sm transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active
                  ? "border-primary/60 ring-2 ring-primary/30"
                  : "border-border/60 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg",
              )}
            >
              <span className="flex items-center gap-1.5 border-b border-border/40 bg-secondary/40 px-3 py-2" aria-hidden="true">
                <span className="h-2 w-2 rounded-full bg-border" />
                <span className="h-2 w-2 rounded-full bg-border" />
                <span className="h-2 w-2 rounded-full bg-border" />
                <span className="ml-2 truncate rounded-md bg-background px-2 py-0.5 text-[10px] text-muted-foreground">
                  Page {i + 1}
                </span>
              </span>
              <ProjectImage
                src={src}
                alt={`${project.title} page screenshot ${i + 1}`}
                className="aspect-video"
              />
            </button>
            <figcaption className="mt-2 line-clamp-2 text-xs leading-snug text-muted-foreground">
              {i === 0 ? "Landing page" : `Captured page ${i + 1}`}
            </figcaption>
          </figure>
        );
      })}
    </div>
  );
});

/** Static dialog sections — memoized so viewerIndex steps skip re-render. JSX identical. */
const DialogTechStack = memo(function DialogTechStack({ project }: { project: Project }) {
  return (
    <div className="min-w-0">
      <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-primary">
        Tech Stack
      </h4>
      <div className="flex min-w-0 flex-wrap gap-2">
        {project.techStack?.map((t) => (
          <Badge
            key={t}
            variant="outline"
            className="cursor-default rounded-full border-border/40 bg-secondary/40 px-3 py-1.5 text-xs text-muted-foreground transition-colors duration-200 hover:border-primary/40 hover:bg-primary/15 hover:text-accent-strong"
          >
            {t}
          </Badge>
        ))}
      </div>
    </div>
  );
});

const DialogFeatures = memo(function DialogFeatures({ project }: { project: Project }) {
  return (
    <div className="min-w-0">
      <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-primary">
        Key Features
      </h4>
      <ul className="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-2">
        {project.features.map((f) => (
          <li
            key={f}
            className="flex min-w-0 items-start gap-2.5 text-sm leading-snug text-muted-foreground"
          >
            <Code2 size={14} className="mt-0.5 shrink-0 text-primary" /> {f}
          </li>
        ))}
      </ul>
    </div>
  );
});

const Projects = () => {
  const { reducedMotion } = useAnimationContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState<TabValue>(() => {
    const tabParam = searchParams.get("tab");
    if (isTabValue(tabParam)) return tabParam;
    const deepLinked = projectBySlug(searchParams.get("project"));
    return deepLinked ? tabOfProject(deepLinked) : "flutter";
  });
  const [selected, setSelected] = useState<Project | null>(() =>
    projectBySlug(searchParams.get("project")),
  );
  const [open, setOpen] = useState<boolean>(
    () => projectBySlug(searchParams.get("project")) !== null,
  );
  const [viewerIndex, setViewerIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  // Shareable, refresh-safe state via search params only — the `#projects` anchor is never touched.
  // `open` / `selected` / `tab` are intentionally NOT deps: this effect is the one
  // place that reconciles URL -> state, and reacting to state it writes would loop.
  // `reconciledSlug` mirrors the slug this effect last applied so an unrelated
  // search-param write (e.g. a tab switch) can't reset the open lightbox.
  const reconciledSlug = useRef<string | null>(null);
  useEffect(() => {
    const slugParam = searchParams.get("project");
    if (slugParam) {
      const found = projectBySlug(slugParam);
      if (!found) {
        const next = new URLSearchParams(searchParams);
        next.delete("project");
        setSearchParams(next, { replace: true });
        return;
      }
      if (reconciledSlug.current !== found.slug) {
        reconciledSlug.current = found.slug;
        setSelected(found);
        setViewerIndex(0);
        setLightbox(false);
      }
      setOpen(true);
      const owner = tabOfProject(found);
      setTab((prev) => (prev === owner ? prev : owner));
      if (searchParams.get("tab") !== owner) {
        const next = new URLSearchParams(searchParams);
        next.set("tab", owner);
        setSearchParams(next, { replace: true });
      }
      return;
    }
    reconciledSlug.current = null;
    setOpen(false);
    const tabParam = searchParams.get("tab");
    if (isTabValue(tabParam)) setTab((prev) => (prev === tabParam ? prev : tabParam));
  }, [searchParams, setSearchParams]);

  const handleTabChange = useCallback(
    (value: string) => {
      if (!isTabValue(value)) return;
      setTab(value);
      const next = new URLSearchParams(searchParams);
      next.set("tab", value);
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const handleSelect = useCallback(
    (p: Project) => {
      const owner = tabOfProject(p);
      setSelected(p);
      setViewerIndex(0);
      setLightbox(false);
      setOpen(true);
      if (owner !== tab) setTab(owner);
      const next = new URLSearchParams(searchParams);
      next.set("tab", owner);
      next.set("project", p.slug);
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams, tab],
  );

  // Open the fullscreen gallery straight from a card cover — no details dialog,
  // no URL change (ephemeral UI, same Lightbox component).
  const handleFullscreen = useCallback((p: Project) => {
    setSelected(p);
    setViewerIndex(0);
    setLightbox(true);
  }, []);

  const handleOpenChange = useCallback(
    (value: boolean) => {
      setOpen(value);
      if (!value) {
        setLightbox(false);
        const next = new URLSearchParams(searchParams);
        next.delete("project");
        setSearchParams(next, { replace: true });
      }
    },
    [searchParams, setSearchParams],
  );

  const selectedImageCount = selected
    ? (selected.screenshots.length > 0 ? selected.screenshots.length : 1)
    : 0;

  // Arrow-key browsing for the inline viewer; the listener is always cleaned up.
  // When the lightbox is open it owns keyboard input (Esc / arrows) — skip here to avoid double-stepping.
  useEffect(() => {
    if (!open || !selected || lightbox) return;
    const images = selected.screenshots.length > 0 ? selected.screenshots : [selected.coverImage];
    if (images.length <= 1) return;
    const count = images.length;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setViewerIndex((i) => (i + 1) % count);
      else if (e.key === "ArrowLeft") setViewerIndex((i) => (i - 1 + count) % count);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, selected, selectedImageCount, lightbox]);

  return (
    <section id="projects" className="section-padding relative">
      <div className="container mx-auto px-4">
        {/* One content spine: every section shares the same 6xl width and
            gutter so the page reads as a single column of bands, not five
            differently-inset panels. */}
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-12 max-w-3xl md:mb-16">
            <SectionHeading
              eyebrow="Explore Now"
              title={
                <>
                  Featured <span className="text-gradient">Projects</span>
                </>
              }
              description="A selection of my work, from mobile architectures to web applications."
            />
          </div>

          <Tabs value={tab} onValueChange={handleTabChange} className="w-full">
            <div className="mb-10 flex justify-center overflow-x-auto pb-2 md:mb-12">
              {/* One bordeaux rule travels between the collections. The same
                  shared-element mechanism as the navbar indicator, so the two
                  read as one instrument measuring the page. */}
              <TabsList className="inline-flex h-12 rounded-full border border-border/70 bg-transparent p-1">
                <TabsTrigger
                  value="flutter"
                  className="relative rounded-full px-6 text-sm font-semibold transition-colors data-[state=active]:text-primary-foreground md:px-8 md:text-base"
                >
                  {tab === "flutter" && (
                    <motion.span
                      layoutId="projects-index-rule"
                      className="absolute inset-0 rounded-full bg-primary"
                      transition={reducedMotion ? { duration: 0 } : indexRuleTransition}
                      aria-hidden="true"
                    />
                  )}
                  <span className="relative z-10 inline-flex items-center gap-1.5">
                    <Smartphone size={14} aria-hidden="true" />
                    Mobile <span className="hidden sm:inline">({flutterProjects.length})</span>
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="frontend"
                  className="relative rounded-full px-6 text-sm font-semibold transition-colors data-[state=active]:text-primary-foreground md:px-8 md:text-base"
                >
                  {tab === "frontend" && (
                    <motion.span
                      layoutId="projects-index-rule"
                      className="absolute inset-0 rounded-full bg-primary"
                      transition={reducedMotion ? { duration: 0 } : indexRuleTransition}
                      aria-hidden="true"
                    />
                  )}
                  <span className="relative z-10 inline-flex items-center gap-1.5">
                    <Globe size={14} aria-hidden="true" />
                    Web <span className="hidden sm:inline">({frontendProjects.length})</span>
                  </span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* PERFORMANCE: reveal on approach instead of `animate` on mount —
                both grids previously ran 12 concurrent tweens offscreen. */}
            <TabsContent value="flutter" key="flutter" asChild>
              <motion.div
                variants={staggerContainer}
                initial={reducedMotion ? false : "hidden"}
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2"
              >
                {flutterProjects.map((project, index) => (
                  <motion.div key={project.slug} variants={staggerItem} className="flex flex-col self-stretch min-h-0">
                    <ProjectCard
                      project={project}
                      isFlutter={true}
                      reducedMotion={reducedMotion}
                      selected={selected?.slug === project.slug}
                      onSelect={handleSelect}
                      onFullscreen={handleFullscreen}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </TabsContent>

            <TabsContent value="frontend" key="frontend" asChild>
              <motion.div
                variants={staggerContainer}
                initial={reducedMotion ? false : "hidden"}
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2"
              >
                {frontendProjects.map((project, index) => (
                  <motion.div key={project.slug} variants={staggerItem} className="flex flex-col self-stretch min-h-0">
                    <ProjectCard
                      project={project}
                      isFlutter={false}
                      reducedMotion={reducedMotion}
                      selected={selected?.slug === project.slug}
                      onSelect={handleSelect}
                      onFullscreen={handleFullscreen}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </TabsContent>
          </Tabs>

          <Dialog open={open} onOpenChange={handleOpenChange}>
            <AnimatePresence>
              {open && selected && (
                <DialogContentStatic
                  className="modern-card flex max-h-[90vh] w-full max-w-[95vw] flex-col gap-0 overflow-hidden border-border/50 bg-card p-0 shadow-2xl md:max-w-4xl"
                  onPointerDownOutside={(e) => {
                    // The fullscreen lightbox lives in a body portal, outside this
                    // content — don't let Radix dismiss the details while it's open.
                    if (lightbox) e.preventDefault();
                  }}
                  onFocusOutside={(e) => {
                    // The lightbox moves focus to its own controls (e.g. autofocus
                    // on close) — keep the details mounted underneath it.
                    if (lightbox) e.preventDefault();
                  }}
                  onEscapeKeyDown={(e) => {
                    // Esc closes the lightbox first; the details only after it's gone.
                    if (lightbox) {
                      e.preventDefault();
                      setLightbox(false);
                    }
                  }}
                >
                  <motion.div
                    key={selected.slug}
                    initial={reducedMotion ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={reducedMotion ? undefined : { opacity: 0 }}
                    transition={reducedMotion ? { duration: 0 } : sheetTransition}
                    className="flex min-h-0 min-w-0 flex-1 flex-col"
                  >
                    <DialogHeader className="shrink-0 px-6 pt-6 text-left md:px-8 md:pt-7">
                      <DialogTitle className="mb-3 break-words pr-8 text-xl font-bold text-foreground md:text-3xl">
                        {selected.title}
                      </DialogTitle>
                      <DialogDescription className="break-words text-sm leading-relaxed text-muted-foreground md:text-base">
                        {selected.description}
                      </DialogDescription>
                    </DialogHeader>

                    <div className="min-h-0 min-w-0 flex-1 space-y-6 overflow-y-auto px-6 py-6 md:space-y-8 md:px-8">
                      <div className="min-w-0">
                        <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-primary">
                          {selected.kind === "mobile" && selected.screenshots.length > 1
                            ? "Screens"
                            : selected.kind === "web" && selected.screenshots.length > 1
                              ? "Website Screens"
                            : "Preview"}
                        </h4>
                        <InlineViewer
                          project={selected}
                          index={viewerIndex}
                          onIndex={setViewerIndex}
                          onExpand={() => setLightbox(true)}
                          reducedMotion={reducedMotion}
                        />
                        {selected.kind === "mobile" ? (
                          <GalleryStrip
                            project={selected}
                            activeIndex={viewerIndex}
                            onSelect={setViewerIndex}
                          />
                        ) : (
                          <WebGalleryStrip
                            project={selected}
                            activeIndex={viewerIndex}
                            onSelect={setViewerIndex}
                          />
                        )}
                      </div>

                      <DialogTechStack project={selected} />

                      <DialogFeatures project={selected} />
                    </div>

                    <div className="flex shrink-0 flex-row gap-3 border-t border-border/30 px-6 py-4 md:px-8">
                      {(() => {
                        const meta = DEMO_META[selected.demoKind];
                        return (
                          <Button
                            className="h-11 min-w-0 flex-1 rounded-full bg-primary text-sm text-primary-foreground shadow-md shadow-primary/20 transition-interaction duration-300 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30"
                            asChild
                          >
                            <a href={selected.demo} target="_blank" rel="noopener noreferrer">
                              <meta.Icon size={14} className="mr-2 shrink-0" />{" "}
                              <span className="truncate">{meta.label}</span>
                            </a>
                          </Button>
                        );
                      })()}
                      <Button
                        variant="outline"
                        className="h-11 min-w-0 flex-1 rounded-full border-border/50 text-sm transition-colors duration-300 hover:border-primary/50 hover:bg-primary/15 hover:text-accent-strong"
                        asChild
                      >
                        <a href={selected.github} target="_blank" rel="noopener noreferrer">
                          <Github size={14} className="mr-2 shrink-0" />{" "}
                          <span className="truncate">Source Code</span>
                        </a>
                      </Button>
                    </div>
                  </motion.div>
                </DialogContentStatic>
              )}
            </AnimatePresence>
          </Dialog>

          {/* Fullscreen lightbox portals to document.body (z-300) so it sits above the dialog (z-200). */}
          {/* It opens either from the details viewer or straight from a card cover (dialog stays closed). */}
          <AnimatePresence>
            {selected && lightbox && (
              <Lightbox
                project={selected}
                index={viewerIndex}
                onIndex={setViewerIndex}
                onClose={() => {
                  setLightbox(false);
                  // Direct-from-card mode leaves no dialog behind — drop the
                  // selection so a later deep-link starts clean.
                  if (!open) setSelected(null);
                }}
                reducedMotion={reducedMotion}
              />
            )}
          </AnimatePresence>

        </div>
      </div>
    </section>
  );
};

export default Projects;

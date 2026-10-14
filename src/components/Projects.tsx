import { useCallback, useEffect, useRef, useState, memo, type PointerEvent as ReactPointerEvent } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion, useMotionValue } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Github,
  ExternalLink,
  Smartphone,
  Globe,
  Code2,
  Zap,
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
import { useAnimationContext } from "@/hooks/useAnimationContext";
import { staggerContainer, staggerItem } from "@/lib/animation-variants";
import { flutterProjects, frontendProjects, type Project, type DemoKind } from "@/data/projects";
import { cn } from "@/lib/utils";

const DEMO_META: Record<DemoKind, { label: string; Icon: typeof ExternalLink }> = {
  play: { label: "Google Play", Icon: Play },
  live: { label: "Live Demo", Icon: ExternalLink },
  video: { label: "Video Demo", Icon: Clapperboard },
  source: { label: "Source Code", Icon: Github },
};

function demoHost(demo: string): string {
  try {
    return new URL(demo).hostname.replace(/^www\./, "");
  } catch {
    return demo;
  }
}

/** CLS-safe image with skeleton + graceful fallback. */
const ProjectImage = memo(function ProjectImage({
  src,
  alt,
  className,
  eager = false,
}: {
  src: string;
  alt: string;
  className?: string;
  eager?: boolean;
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
        <div
          className="absolute inset-0 opacity-40"
          aria-hidden="true"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 20%, hsl(var(--primary) / 0.15) 0, transparent 50%), radial-gradient(circle at 70% 80%, hsl(var(--accent) / 0.12) 0, transparent 50%)",
          }}
        />
        {failed ? (
          <button
            type="button"
            onClick={() => setFailed(false)}
            aria-label={`Retry loading ${alt}`}
            className="relative flex flex-col items-center gap-2 rounded-xl p-4 text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
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
        <div className="absolute inset-0 animate-pulse bg-secondary/70" aria-hidden="true" />
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
            className="rounded-full border border-border/60 bg-background/80 px-3 py-1 text-[11px] font-semibold text-foreground transition-colors hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
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
          fetchPriority={eager ? "high" : "low"}
          sizes="(max-width:768px) 100vw, 33vw"
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

const ProjectCard = memo(function ProjectCard({
  project,
  isFlutter,
  reducedMotion,
  onSelect,
}: {
  project: Project;
  isFlutter: boolean;
  reducedMotion: boolean;
  onSelect: (p: Project) => void;
}) {
  const open = () => onSelect(project);

  return (
    <HoverCard scale={reducedMotion ? 1 : 1.02} className="flex w-full flex-1 flex-col self-stretch min-h-0">
      <article className="flex w-full min-h-0 flex-1 flex-col">
        <Card className="modern-card group flex flex-1 flex-col overflow-hidden border-border/50">
          <div className="relative flex h-48 shrink-0 items-center justify-center overflow-hidden bg-secondary/30 sm:h-56 md:h-64">
            {project.kind === "web" && (
              <span className="absolute inset-x-0 top-0 z-10 flex items-center gap-1.5 border-b border-border/40 bg-secondary/40 px-3 py-2 backdrop-blur-sm" aria-hidden="true">
                <span className="h-2 w-2 rounded-full bg-border" />
                <span className="h-2 w-2 rounded-full bg-border" />
                <span className="h-2 w-2 rounded-full bg-border" />
                <span className="ml-2 max-w-[12rem] truncate rounded-md bg-background/80 px-2 py-0.5 text-[10px] text-muted-foreground">
                  {demoHost(project.demo)}
                </span>
              </span>
            )}
            <ProjectImage
              src={project.coverImage}
              alt={`${project.title} cover preview`}
              className="h-full w-full [&_img]:object-contain"
              eager
            />
          </div>

          <CardHeader className="relative z-10 flex flex-1 flex-col p-6">
            <div className="mb-4 flex items-center justify-between gap-2">
              <span
                className={cn(
                  "rounded-xl border p-2.5 shadow-sm",
                  isFlutter
                    ? "border-primary/20 bg-primary/10 text-primary"
                    : "border-accent/20 bg-accent/10 text-accent",
                )}
                aria-hidden="true"
              >
                {isFlutter ? <Smartphone size={18} /> : <Globe size={18} />}
              </span>
              <Badge
                variant="outline"
                className="rounded-full border-border/40 bg-background/30 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider"
              >
                {project.role}
              </Badge>
            </div>

            <CardTitle className="mb-2 line-clamp-2 text-lg font-bold leading-snug text-foreground transition-colors duration-200 group-hover:text-primary md:min-h-[2lh] md:text-xl">
              {project.title}
            </CardTitle>

            <CardDescription className="mb-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground md:min-h-[3lh]">
              {project.description}
            </CardDescription>

            <div className="mb-5 flex flex-wrap gap-2">
              {project.techStack.slice(0, 4).map((tech) => (
                <span
                  key={tech}
                  className="rounded-full border border-border/30 bg-secondary/40 px-2.5 py-1 text-[10px] font-medium text-muted-foreground"
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

            <div className="mt-auto flex items-center gap-2 border-t border-border/30 pt-4">
              <Button
                className="h-11 min-h-[44px] flex-1 rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-colors hover:bg-primary/90"
                onClick={open}
              >
                View case <ChevronRight size={14} className="ml-1" aria-hidden="true" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="h-11 min-h-[44px] w-11 shrink-0 rounded-full border-border/40 transition-colors duration-200 hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
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

function tabOfProject(project: Project): TabValue {
  return flutterProjects.some((p) => p.slug === project.slug) ? "flutter" : "frontend";
}

function projectBySlug(slug: string | null): Project | null {
  if (!slug) return null;
  return ALL_PROJECTS.find((p) => p.slug === slug) ?? null;
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
  const images = project.screenshots.length > 0 ? project.screenshots : [project.coverImage];
  const safeIndex = ((index % images.length) + images.length) % images.length;
  const src = images[safeIndex];
  const portrait = project.kind === "mobile";
  const step = (dir: 1 | -1) => onIndex((safeIndex + dir + images.length) % images.length);
  const touchX = useRef<number | null>(null);

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
              fetchPriority="high"
              decoding="async"
              draggable={false}
              initial={false}
              animate={{ opacity: 1 }}
              transition={reducedMotion ? { duration: 0 } : { duration: 0.15, ease: "easeOut" }}
              style={{ opacity: 0, willChange: "opacity", transform: "translateZ(0)" }}
              onLoad={(e) => {
                (e.target as HTMLImageElement).style.opacity = "1";
              }}
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
  const images = project.screenshots.length > 0 ? project.screenshots : [project.coverImage];
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

  // Clamp pan so the image edge never leaves the stage.
  const clampPan = useCallback((x: number, y: number, s: number) => {
    const stage = stageRef.current;
    const img = imgRef.current;
    if (!stage || !img || img.offsetWidth === 0) return { x, y };
    const maxX = Math.max(0, (img.offsetWidth * s - stage.clientWidth) / 2);
    const maxY = Math.max(0, (img.offsetHeight * s - stage.clientHeight) / 2);
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
      const r = stage.getBoundingClientRect();
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
    [clampPan, sc, tx, ty],
  );

  const zoomToggleAt = useCallback(
    (clientX: number, clientY: number) => {
      zoomAt(clientX, clientY, sc.get() > 1.01 ? 1 : 2);
    },
    [sc, zoomAt],
  );

  const zoomToggleCenter = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const r = stage.getBoundingClientRect();
    zoomToggleAt(r.left + r.width / 2, r.top + r.height / 2);
  }, [zoomToggleAt]);

  // Unified mouse + touch gestures on the stage:
  // tap on image = zoom toggle · drag = pan (zoomed) or swipe (fit) ·
  // two pointers = pinch zoom. Buttons opt out via closest("button").
  const onStagePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button")) return;
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

  // Keep pan clamped across viewport resizes while zoomed.
  useEffect(() => {
    const onResize = () => {
      if (sc.get() > 1.01) {
        const { x, y } = clampPan(tx.get(), ty.get(), sc.get());
        tx.set(x);
        ty.set(y);
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [clampPan, sc, tx, ty]);

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
      className="pointer-events-auto fixed inset-0 z-[300] flex flex-col bg-black/85 backdrop-blur-md"
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
            className="cursor-default rounded-full border-border/40 bg-secondary/40 px-3 py-1.5 text-xs text-muted-foreground transition-colors duration-200 hover:border-primary/30 hover:bg-primary/10 hover:text-primary"
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
      if (selected?.slug !== found.slug) {
        setSelected(found);
        setViewerIndex(0);
        setLightbox(false);
      }
      if (!open) setOpen(true);
      const owner = tabOfProject(found);
      if (tab !== owner) setTab(owner);
      if (searchParams.get("tab") !== owner) {
        const next = new URLSearchParams(searchParams);
        next.set("tab", owner);
        setSearchParams(next, { replace: true });
      }
      return;
    }
    if (open) setOpen(false);
    const tabParam = searchParams.get("tab");
    if (isTabValue(tabParam) && tabParam !== tab) setTab(tabParam);
  }, [searchParams, open, selected, tab, setSearchParams]);

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
        <div className="mx-auto max-w-7xl">
          {/* Editorial split header — deliberately breaks the centered pill + gradient formula shared with Skills. */}
          <div className="mb-10 md:mb-14">
            <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.25em] text-primary">
              <Zap size={14} aria-hidden="true" />
              <span>03 · Selected work</span>
              <span className="h-px flex-1 bg-gradient-to-r from-primary/40 to-transparent" aria-hidden="true" />
              <span className="tabular-nums tracking-normal text-muted-foreground">
                {flutterProjects.length + frontendProjects.length} projects
              </span>
            </div>
            <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
                Featured <span className="text-gradient">Projects</span>
              </h2>
              <p className="max-w-md text-base leading-relaxed text-muted-foreground md:text-right md:text-lg">
                A selection of my work, from mobile architectures to web applications.
              </p>
            </div>
          </div>

          <Tabs value={tab} onValueChange={handleTabChange} className="w-full">
            <div className="mb-10 flex justify-center overflow-x-auto pb-2 md:mb-12">
              <TabsList className="inline-flex h-11 rounded-full border border-border/50 bg-secondary/50 p-1">
                <TabsTrigger
                  value="flutter"
                  className="rounded-full px-6 text-sm font-medium transition-colors data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Smartphone size={14} className="-ml-0.5 mr-1.5 inline" />
                  Mobile <span className="ml-1 hidden sm:inline">({flutterProjects.length})</span>
                </TabsTrigger>
                <TabsTrigger
                  value="frontend"
                  className="rounded-full px-6 text-sm font-medium transition-colors data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Globe size={14} className="-ml-0.5 mr-1.5 inline" />
                  Web <span className="ml-1 hidden sm:inline">({frontendProjects.length})</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <AnimatePresence mode="sync" initial={false}>
              <TabsContent value="flutter" key="flutter" asChild>
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, transition: { duration: 0.12 } }}
                  className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 items-stretch"
                >
                  {flutterProjects.map((project) => (
                    <motion.div key={project.slug} variants={staggerItem} className="flex flex-col self-stretch min-h-0">
                      <ProjectCard
                        project={project}
                        isFlutter={true}
                        reducedMotion={reducedMotion}
                        onSelect={handleSelect}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </TabsContent>

              <TabsContent value="frontend" key="frontend" asChild>
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, transition: { duration: 0.12 } }}
                  className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 items-stretch"
                >
                  {frontendProjects.map((project) => (
                    <motion.div key={project.slug} variants={staggerItem} className="flex flex-col self-stretch min-h-0">
                      <ProjectCard
                        project={project}
                        isFlutter={false}
                        reducedMotion={reducedMotion}
                        onSelect={handleSelect}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </TabsContent>
            </AnimatePresence>
          </Tabs>

          <Dialog open={open} onOpenChange={handleOpenChange}>
            <AnimatePresence>
              {open && selected && (
                <DialogContent
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
                    initial={reducedMotion ? {} : { opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={reducedMotion ? {} : { opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
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
                        className="h-11 min-w-0 flex-1 rounded-full border-border/50 text-sm transition-colors duration-300 hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
                        asChild
                      >
                        <a href={selected.github} target="_blank" rel="noopener noreferrer">
                          <Github size={14} className="mr-2 shrink-0" />{" "}
                          <span className="truncate">Source Code</span>
                        </a>
                      </Button>
                    </div>
                  </motion.div>
                </DialogContent>
              )}
            </AnimatePresence>
          </Dialog>

          {/* Fullscreen lightbox portals to document.body (z-300) so it sits above the dialog (z-200). */}
          <AnimatePresence>
            {open && selected && lightbox && (
              <Lightbox
                project={selected}
                index={viewerIndex}
                onIndex={setViewerIndex}
                onClose={() => setLightbox(false)}
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

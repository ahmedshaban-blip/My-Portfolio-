import { useEffect, useState, memo } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
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

  return (
    <div className={cn("relative overflow-hidden bg-secondary/50", className)}>
      {!loaded && !failed && (
        <div className="absolute inset-0 animate-pulse bg-secondary/70" aria-hidden="true" />
      )}
      {failed ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-secondary/60 px-4 text-center text-muted-foreground">
          <ImageOff size={20} aria-hidden="true" />
          <span className="text-xs font-medium">Preview unavailable</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={cn(
            "h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-105",
            !loaded && "opacity-0",
          )}
        />
      )}
    </div>
  );
});

/** Portrait device-frame teaser for real store screenshots. */
function MobileCardMedia({ project, onOpen }: { project: Project; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`View ${project.title} screenshots`}
      className="group block w-full cursor-zoom-in bg-secondary/30 px-8 pt-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="mx-auto block w-32 overflow-hidden rounded-t-2xl border border-b-0 border-border/60 bg-background shadow-lg transition-transform duration-300 group-hover:-translate-y-1 sm:w-36">
        <span className="flex justify-center border-b border-border/40 py-1.5" aria-hidden="true">
          <span className="h-1 w-10 rounded-full bg-border" />
        </span>
        <ProjectImage
          src={project.coverImage}
          alt={`${project.title} app preview`}
          className="aspect-[9/16]"
        />
      </span>
    </button>
  );
}

/** Landscape teaser: browser frame for web, flat frame for single-cover mobile. */
function LandscapeCardMedia({
  project,
  onOpen,
  browserChrome,
}: {
  project: Project;
  onOpen: () => void;
  browserChrome: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`View ${project.title} preview`}
      className="group block w-full cursor-zoom-in p-4 pb-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="block overflow-hidden rounded-xl border border-border/60 bg-background shadow-sm">
        {browserChrome && (
          <span className="flex items-center gap-1.5 border-b border-border/40 bg-secondary/40 px-3 py-2" aria-hidden="true">
            <span className="h-2 w-2 rounded-full bg-border" />
            <span className="h-2 w-2 rounded-full bg-border" />
            <span className="h-2 w-2 rounded-full bg-border" />
            <span className="ml-2 max-w-[12rem] truncate rounded-md bg-background px-2 py-0.5 text-[10px] text-muted-foreground">
              {demoHost(project.demo)}
            </span>
          </span>
        )}
        <ProjectImage
          src={project.coverImage}
          alt={`${project.title} preview`}
          className="aspect-[16/10]"
        />
      </span>
    </button>
  );
}

/** Desktop project teaser: browser chrome + editorial multi-page stack. */
function WebCardMedia({ project, onOpen }: { project: Project; onOpen: () => void }) {
  const previewImages = project.screenshots.slice(0, 4);

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`View ${project.title} website screenshots`}
      className="group block w-full cursor-zoom-in p-4 pb-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="block overflow-hidden rounded-xl border border-border/60 bg-background shadow-sm">
        <span className="flex items-center gap-1.5 border-b border-border/40 bg-secondary/40 px-3 py-2" aria-hidden="true">
          <span className="h-2 w-2 rounded-full bg-border" />
          <span className="h-2 w-2 rounded-full bg-border" />
          <span className="h-2 w-2 rounded-full bg-border" />
          <span className="ml-2 max-w-[12rem] truncate rounded-md bg-background px-2 py-0.5 text-[10px] text-muted-foreground">
            {demoHost(project.demo)} · {previewImages.length} screens
          </span>
        </span>
        <span className="grid aspect-[16/10] grid-cols-[1.7fr_1fr] gap-1.5 bg-secondary/30 p-1.5">
          <span className="overflow-hidden rounded-lg border border-border/40 bg-background shadow-sm">
            <ProjectImage
              src={previewImages[0] ?? project.coverImage}
              alt={`${project.title} main page preview`}
              className="h-full w-full"
            />
          </span>
          <span className="grid min-h-0 grid-rows-3 gap-1.5">
            {previewImages.slice(1, 4).map((src, index) => (
              <span key={src} className="overflow-hidden rounded-md border border-border/40 bg-background shadow-sm">
                <ProjectImage
                  src={src}
                  alt={`${project.title} page preview ${index + 2}`}
                  className="h-full w-full"
                />
              </span>
            ))}
          </span>
        </span>
      </span>
    </button>
  );
}

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
  const hasGallery = project.screenshots.length > 1;
  const demo = DEMO_META[project.demoKind];
  const open = () => onSelect(project);

  return (
    <HoverCard scale={reducedMotion ? 1 : 1.02} className="h-full">
      <article className="h-full">
        <Card className="modern-card group flex h-full flex-col overflow-hidden border-border/50">
          {project.kind === "web" && hasGallery ? (
            <WebCardMedia project={project} onOpen={open} />
          ) : project.kind === "mobile" && hasGallery ? (
            <MobileCardMedia project={project} onOpen={open} />
          ) : (
            <LandscapeCardMedia project={project} onOpen={open} browserChrome={project.kind === "web"} />
          )}

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

            <CardTitle className="mb-2 text-lg font-bold text-foreground transition-colors duration-200 group-hover:text-primary md:text-xl">
              {project.title}
            </CardTitle>

            <CardDescription className="mb-4 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
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

            <div className="mt-auto flex items-center gap-3 border-t border-border/30 pt-4">
              <Button
                variant="link"
                className="p-0 text-sm text-primary transition-colors hover:text-primary/80"
                asChild
              >
                <a href={project.github} target="_blank" rel="noopener noreferrer">
                  <Github size={14} className="mr-1.5" /> Github
                </a>
              </Button>

              <div className="ml-auto flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 rounded-full border-border/40 px-4 text-xs transition-all duration-200 hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
                  onClick={open}
                >
                  Details
                </Button>
                <Button
                  size="sm"
                  className="h-8 rounded-full bg-primary px-4 text-xs text-primary-foreground shadow-md shadow-primary/20 transition-all hover:bg-primary/90"
                  asChild
                >
                  <a href={project.demo} target="_blank" rel="noopener noreferrer" aria-label={`${demo.label} for ${project.title}`}>
                    <demo.Icon size={12} className="mr-1" /> {demo.label}
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

function tabOfProject(project: Project): TabValue {
  return flutterProjects.some((p) => p.slug === project.slug) ? "flutter" : "frontend";
}

function projectBySlug(slug: string | null): Project | null {
  if (!slug) return null;
  return ALL_PROJECTS.find((p) => p.slug === slug) ?? null;
}

/** Inline single-dialog viewer: full-size image with fade, arrows, and counter. */
function InlineViewer({
  project,
  index,
  onIndex,
  reducedMotion,
}: {
  project: Project;
  index: number;
  onIndex: (index: number) => void;
  reducedMotion: boolean;
}) {
  const images = project.screenshots.length > 0 ? project.screenshots : [project.coverImage];
  const safeIndex = ((index % images.length) + images.length) % images.length;
  const src = images[safeIndex];
  const portrait = project.kind === "mobile";
  const step = (dir: 1 | -1) => onIndex((safeIndex + dir + images.length) % images.length);

  return (
    <figure className="min-w-0">
      <div className="overflow-hidden rounded-xl border border-border/60 bg-secondary/30 shadow-sm">
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
          <motion.img
            key={src}
            src={src}
            alt={`${project.title} screenshot ${safeIndex + 1} of ${images.length}`}
            loading="eager"
            decoding="async"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.2, ease: "easeOut" }}
            className={
              portrait
                ? "max-h-[46vh] w-auto max-w-full rounded-lg border border-border/40 object-contain"
                : "aspect-video w-full object-cover object-top"
            }
          />
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
            ? "Full preview — browse with arrows or thumbnails."
            : `Live preview · ${demoHost(project.demo)}`}
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

function GalleryStrip({
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
                "block w-full overflow-hidden rounded-2xl border bg-secondary/30 shadow-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
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
}

function WebGalleryStrip({
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
                "block w-full overflow-hidden rounded-2xl border bg-background shadow-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
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
}

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

  const handleTabChange = (value: string) => {
    if (!isTabValue(value)) return;
    setTab(value);
    const next = new URLSearchParams(searchParams);
    next.set("tab", value);
    setSearchParams(next, { replace: true });
  };

  const handleSelect = (p: Project) => {
    const owner = tabOfProject(p);
    setSelected(p);
    setViewerIndex(0);
    setOpen(true);
    if (owner !== tab) setTab(owner);
    const next = new URLSearchParams(searchParams);
    next.set("tab", owner);
    next.set("project", p.slug);
    setSearchParams(next, { replace: true });
  };

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (!value) {
      const next = new URLSearchParams(searchParams);
      next.delete("project");
      setSearchParams(next, { replace: true });
    }
  };

  // Arrow-key browsing for the inline viewer; the listener is always cleaned up.
  useEffect(() => {
    if (!open || !selected) return;
    const images = selected.screenshots.length > 0 ? selected.screenshots : [selected.coverImage];
    if (images.length <= 1) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setViewerIndex((i) => (i + 1) % images.length);
      else if (e.key === "ArrowLeft") setViewerIndex((i) => (i - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, selected]);

  return (
    <section id="projects" className="section-padding relative">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 space-y-4 text-center md:mb-16 md:space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-primary">
              <Zap size={14} /> My Portfolio
            </div>
            <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
              Featured <span className="text-gradient">Projects</span>
            </h2>
            <p className="mx-auto max-w-2xl px-4 text-base leading-relaxed text-muted-foreground md:text-lg">
              A selection of my work, from mobile architectures to web applications.
            </p>
          </div>

          <Tabs value={tab} onValueChange={handleTabChange} className="w-full">
            <div className="mb-10 flex justify-center overflow-x-auto pb-2 md:mb-12">
              <TabsList className="inline-flex h-11 rounded-full border border-border/50 bg-secondary/50 p-1">
                <TabsTrigger
                  value="flutter"
                  className="rounded-full px-6 text-sm font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Smartphone size={14} className="-ml-0.5 mr-1.5 inline" />
                  Mobile <span className="ml-1 hidden sm:inline">({flutterProjects.length})</span>
                </TabsTrigger>
                <TabsTrigger
                  value="frontend"
                  className="rounded-full px-6 text-sm font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Globe size={14} className="-ml-0.5 mr-1.5 inline" />
                  Web <span className="ml-1 hidden sm:inline">({frontendProjects.length})</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <AnimatePresence mode="wait">
              <TabsContent value="flutter" key="flutter" asChild>
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.1 }}
                  exit={{ opacity: 0, transition: { duration: 0.15, ease: "easeOut" } }}
                  className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
                >
                  {flutterProjects.map((project) => (
                    <motion.div key={project.slug} variants={staggerItem} className="h-full">
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
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.1 }}
                  exit={{ opacity: 0, transition: { duration: 0.15, ease: "easeOut" } }}
                  className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
                >
                  {frontendProjects.map((project) => (
                    <motion.div key={project.slug} variants={staggerItem} className="h-full">
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
                <DialogContent className="modern-card flex max-h-[90vh] w-full max-w-[95vw] flex-col gap-0 overflow-hidden border-border/50 bg-card p-0 shadow-2xl md:max-w-4xl">
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

                      <div className="min-w-0">
                        <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-primary">
                          Tech Stack
                        </h4>
                        <div className="flex min-w-0 flex-wrap gap-2">
                          {selected.techStack?.map((t) => (
                            <Badge
                              key={t}
                              variant="outline"
                              className="cursor-default rounded-full border-border/40 bg-secondary/40 px-3 py-1.5 text-xs text-muted-foreground transition-all duration-200 hover:border-primary/30 hover:bg-primary/10 hover:text-primary"
                            >
                              {t}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="min-w-0">
                        <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-primary">
                          Key Features
                        </h4>
                        <ul className="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-2">
                          {selected.features.map((f) => (
                            <li
                              key={f}
                              className="flex min-w-0 items-start gap-2.5 text-sm leading-snug text-muted-foreground"
                            >
                              <Code2 size={14} className="mt-0.5 shrink-0 text-primary" /> {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-row gap-3 border-t border-border/30 px-6 py-4 md:px-8">
                      {(() => {
                        const meta = DEMO_META[selected.demoKind];
                        return (
                          <Button
                            className="h-11 min-w-0 flex-1 rounded-full bg-primary text-sm text-primary-foreground shadow-md shadow-primary/20 transition-all duration-300 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30"
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
                        className="h-11 min-w-0 flex-1 rounded-full border-border/50 text-sm transition-all duration-300 hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
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

        </div>
      </div>
    </section>
  );
};

export default Projects;

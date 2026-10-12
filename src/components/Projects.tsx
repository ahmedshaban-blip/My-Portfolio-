import { useState, memo } from "react";
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
  Expand,
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

type LightboxState = { title: string; images: string[]; index: number } | null;

function GalleryStrip({
  project,
  onExpand,
}: {
  project: Project;
  onExpand: (index: number) => void;
}) {
  if (project.screenshots.length <= 1) return null;
  return (
    <div
      className="flex w-full min-w-0 snap-x snap-mandatory gap-4 overflow-x-auto pb-3"
      role="list"
      aria-label={`${project.title} screenshots`}
    >
      {project.screenshots.map((src, i) => (
        <figure key={src} role="listitem" className="w-40 shrink-0 snap-start md:w-48">
          <button
            type="button"
            onClick={() => onExpand(i)}
            aria-label={`Expand screenshot ${i + 1} of ${project.title}`}
            className="group block w-full cursor-zoom-in overflow-hidden rounded-2xl border border-border/60 bg-secondary/30 shadow-sm transition-all duration-200 hover:border-primary/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
            {project.features[i % project.features.length]}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

function WebGalleryStrip({
  project,
  onExpand,
}: {
  project: Project;
  onExpand: (index: number) => void;
}) {
  if (project.screenshots.length <= 1) return null;

  return (
    <div
      className="flex w-full min-w-0 snap-x snap-mandatory gap-4 overflow-x-auto pb-3"
      role="list"
      aria-label={`${project.title} page screenshots`}
    >
      {project.screenshots.map((src, i) => (
        <figure key={src} role="listitem" className="w-72 shrink-0 snap-start md:w-80">
          <button
            type="button"
            onClick={() => onExpand(i)}
            aria-label={`Expand page screenshot ${i + 1} of ${project.title}`}
            className="group block w-full cursor-zoom-in overflow-hidden rounded-2xl border border-border/60 bg-background shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
      ))}
    </div>
  );
}

function WebHero({
  project,
  onExpand,
}: {
  project: Project;
  onExpand: () => void;
}) {
  return (
    <figure>
      <div className="overflow-hidden rounded-xl border border-border/60 bg-background shadow-sm">
        <div className="flex items-center gap-1.5 border-b border-border/40 bg-secondary/40 px-3 py-2" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-border" />
          <span className="h-2.5 w-2.5 rounded-full bg-border" />
          <span className="h-2.5 w-2.5 rounded-full bg-border" />
          <span className="ml-2 max-w-[16rem] truncate rounded-md bg-background px-2 py-0.5 text-xs text-muted-foreground">
            {demoHost(project.demo)}
          </span>
        </div>
        <button
          type="button"
          onClick={onExpand}
          aria-label={`Expand ${project.title} full preview`}
          className="group relative block w-full cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ProjectImage
            src={project.coverImage}
            alt={`${project.title} full page preview`}
            className="aspect-video"
            eager
          />
          <span className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full border border-border/50 bg-background/90 px-3 py-1.5 text-xs font-medium text-foreground opacity-0 shadow-sm transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
            <Expand size={12} aria-hidden="true" /> Expand
          </span>
        </button>
      </div>
      <figcaption className="mt-2 text-xs text-muted-foreground">
        Live preview · {demoHost(project.demo)} — select to inspect at full resolution.
      </figcaption>
    </figure>
  );
}

const Projects = () => {
  const { reducedMotion } = useAnimationContext();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Project | null>(null);
  const [lightbox, setLightbox] = useState<LightboxState>(null);

  const handleSelect = (p: Project) => {
    setSelected(p);
    setOpen(true);
  };

  const expandFrom = (p: Project, index: number) =>
    setLightbox({ title: p.title, images: p.screenshots, index });

  const stepLightbox = (dir: 1 | -1) =>
    setLightbox((lb) =>
      lb ? { ...lb, index: (lb.index + dir + lb.images.length) % lb.images.length } : lb,
    );

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

          <Tabs defaultValue="flutter" className="w-full">
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

          <Dialog open={open} onOpenChange={setOpen}>
            <AnimatePresence>
              {open && selected && (
                <DialogContent className="modern-card flex max-h-[90vh] w-full max-w-[95vw] flex-col gap-0 overflow-hidden border-border/50 bg-card p-0 shadow-2xl md:max-w-4xl">
                  <motion.div
                    initial={reducedMotion ? {} : { opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={reducedMotion ? {} : { opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="flex min-h-0 min-w-0 flex-1 flex-col"
                  >
                    <DialogHeader className="shrink-0 px-6 pt-6 text-left md:px-8 md:pt-7">
                      <DialogTitle className="mb-3 pr-8 text-xl font-bold text-foreground md:text-3xl">
                        {selected.title}
                      </DialogTitle>
                      <DialogDescription className="text-sm leading-relaxed text-muted-foreground md:text-base">
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
                        {selected.kind === "mobile" && selected.screenshots.length > 1 ? (
                          <GalleryStrip project={selected} onExpand={(i) => expandFrom(selected, i)} />
                        ) : selected.kind === "web" && selected.screenshots.length > 1 ? (
                          <div className="space-y-5">
                            <WebHero project={selected} onExpand={() => expandFrom(selected, 0)} />
                            <WebGalleryStrip project={selected} onExpand={(i) => expandFrom(selected, i)} />
                          </div>
                        ) : (
                          <WebHero project={selected} onExpand={() => expandFrom(selected, 0)} />
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

          {/* Full-resolution lightbox */}
          <Dialog open={lightbox !== null} onOpenChange={(v) => !v && setLightbox(null)}>
            {lightbox && (
              <DialogContent className="max-w-[95vw] border-border/50 bg-card p-4 shadow-2xl md:max-w-5xl md:p-6">
                <DialogHeader>
                  <DialogTitle className="text-base font-semibold md:text-lg">
                    {lightbox.title}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground md:text-sm">
                    Screenshot {lightbox.index + 1} of {lightbox.images.length}
                  </DialogDescription>
                </DialogHeader>
                <div className="relative flex items-center justify-center gap-2">
                  {lightbox.images.length > 1 && (
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label="Previous screenshot"
                      className="z-10 shrink-0 rounded-full"
                      onClick={() => stepLightbox(-1)}
                    >
                      <ChevronLeft size={18} />
                    </Button>
                  )}
                  <motion.img
                    key={lightbox.images[lightbox.index]}
                    src={lightbox.images[lightbox.index]}
                    alt={`${lightbox.title} screenshot ${lightbox.index + 1} full resolution`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="max-h-[70vh] w-auto max-w-full rounded-lg border border-border/40 object-contain"
                  />
                  {lightbox.images.length > 1 && (
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label="Next screenshot"
                      className="z-10 shrink-0 rounded-full"
                      onClick={() => stepLightbox(1)}
                    >
                      <ChevronRight size={18} />
                    </Button>
                  )}
                </div>
              </DialogContent>
            )}
          </Dialog>
        </div>
      </div>
    </section>
  );
};

export default Projects;

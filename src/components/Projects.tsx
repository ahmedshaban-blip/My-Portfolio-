import { useState, memo } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Github, ExternalLink, Smartphone, Globe, Code2, Zap } from "lucide-react";
import { HoverCard } from "@/components/animations/HoverCard";
import { useAnimationContext } from "@/context/AnimationContext";
import { staggerContainer, staggerItem, defaultTransition } from "@/lib/animation-variants";
import { flutterProjects, frontendProjects, type Project } from "@/data/projects";

const ProjectCard = memo(function ProjectCard({ project, isFlutter, reducedMotion, onSelect }: {
  project: Project;
  isFlutter: boolean;
  reducedMotion: boolean;
  onSelect: (p: Project) => void;
}) {
  return (
    <HoverCard scale={reducedMotion ? 1 : 1.02}>
      <motion.div layout>
        <Card className="modern-card flex flex-col h-full border-border/50 group overflow-hidden">
          <CardHeader className="p-6 relative z-10">
            <div className="flex justify-between items-start mb-5">
              <div
                className={`p-3 rounded-xl ${isFlutter ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-accent/10 text-accent border border-accent/20'} shadow-lg transition-transform duration-300 group-hover:scale-110`}
              >
                {isFlutter ? <Smartphone size={22} /> : <Globe size={22} />}
              </div>
              <Badge variant="outline" className="border-border/40 bg-background/30 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase">
                {project.role}
              </Badge>
            </div>

            <CardTitle className="text-lg md:text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors duration-200">
              {project.title}
            </CardTitle>
            
            <CardDescription className="text-sm text-muted-foreground line-clamp-2 mb-5 leading-relaxed">
              {project.description}
            </CardDescription>

            <div className="flex flex-wrap gap-2 mb-6">
              {project.techStack.slice(0, 4).map((tech, i) => (
                <span key={i} className="text-[10px] font-medium text-muted-foreground bg-secondary/40 border border-border/30 px-2.5 py-1 rounded-full">
                  {tech}
                </span>
              ))}
              {project.techStack.length > 4 && (
                <span className="text-[10px] font-medium text-muted-foreground">+{project.techStack.length - 4}</span>
              )}
            </div>

            <div className="flex items-center gap-3 mt-auto pt-4 border-t border-border/30">
              <Button variant="link" className="p-0 text-primary hover:text-primary/80 text-sm transition-colors" asChild>
                <a href={project.github} target="_blank" rel="noopener noreferrer">
                  <Github size={14} className="mr-1.5" /> Github
                </a>
              </Button>

              <div className="ml-auto flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full text-xs px-4 h-8 border-border/40 hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-all duration-200"
                  onClick={() => onSelect(project)}
                >
                  Details
                </Button>
                <Button
                  size="sm"
                  className="rounded-full bg-primary text-white hover:bg-primary/90 text-xs shadow-md shadow-primary/20 transition-all px-4 h-8"
                  asChild
                >
                  <a href={project.demo} target="_blank" rel="noopener noreferrer">
                    <ExternalLink size={12} />
                  </a>
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>
    </HoverCard>
  );
});

const Projects = () => {
  const { reducedMotion } = useAnimationContext();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Project | null>(null);

  const handleSelect = (p: Project) => {
    setSelected(p);
    setOpen(true);
  };

  return (
    <section id="projects" className="section-padding relative">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 md:space-y-6 mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase border border-primary/20">
              <Zap size={14} /> My Portfolio
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Featured <span className="text-gradient">Projects</span>
            </h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed px-4">
              A selection of my work, from mobile architectures to web applications.
            </p>
          </div>

          <LayoutGroup>
            <Tabs defaultValue="flutter" className="w-full">
              <div className="flex justify-center mb-10 md:mb-12 overflow-x-auto pb-2">
                <TabsList className="bg-secondary/50 border border-border/50 p-1 rounded-full h-11 inline-flex">
                  <TabsTrigger value="flutter" className="rounded-full px-6 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                    <Smartphone size={14} className="inline mr-1.5 -ml-0.5" />
                    Mobile <span className="hidden sm:inline ml-1">({flutterProjects.length})</span>
                  </TabsTrigger>
                  <TabsTrigger value="frontend" className="rounded-full px-6 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                    <Globe size={14} className="inline mr-1.5 -ml-0.5" />
                    Web <span className="hidden sm:inline ml-1">({frontendProjects.length})</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <AnimatePresence mode="wait">
                <TabsContent value="flutter" key="flutter" asChild>
                  <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, y: -10 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {flutterProjects.map((project) => (
                      <motion.div key={project.title} variants={staggerItem}>
                        <ProjectCard project={project} isFlutter={true} reducedMotion={reducedMotion} onSelect={handleSelect} />
                      </motion.div>
                    ))}
                  </motion.div>
                </TabsContent>

                <TabsContent value="frontend" key="frontend" asChild>
                  <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, y: -10 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {frontendProjects.map((project) => (
                      <motion.div key={project.title} variants={staggerItem}>
                        <ProjectCard project={project} isFlutter={false} reducedMotion={reducedMotion} onSelect={handleSelect} />
                      </motion.div>
                    ))}
                  </motion.div>
                </TabsContent>
              </AnimatePresence>
            </Tabs>

            <Dialog open={open} onOpenChange={setOpen}>
              <AnimatePresence>
                {open && selected && (
                  <DialogContent className="max-w-[95vw] md:max-w-2xl modern-card border-border/50 p-6 md:p-8 max-h-[90vh] overflow-y-auto">
                    <motion.div
                      initial={reducedMotion ? {} : { opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={reducedMotion ? {} : { opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.2 }}
                    >
                      <DialogHeader>
                        <DialogTitle className="text-xl md:text-3xl font-bold mb-3 text-foreground">{selected.title}</DialogTitle>
                        <DialogDescription className="text-sm md:text-base text-muted-foreground leading-relaxed">
                          {selected.description}
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-6 md:space-y-8 mt-6">
                        <div>
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-primary mb-4">Tech Stack</h4>
                          <div className="flex flex-wrap gap-2">
                            {selected.techStack?.map((t, i) => (
                              <Badge key={i} variant="outline" className="bg-secondary/40 border-border/40 text-muted-foreground px-3 py-1.5 rounded-full text-xs">
                                {t}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-primary mb-4">Key Features</h4>
                          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {selected.features.map((f, i) => (
                              <li key={i} className="flex items-start gap-2.5 text-muted-foreground text-sm leading-snug">
                                <Code2 size={14} className="text-primary mt-0.5 shrink-0" /> {f}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border/30">
                          <Button className="flex-1 rounded-full h-11 bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20 text-sm transition-all" asChild>
                            <a href={selected.demo} target="_blank" rel="noopener noreferrer">Live Preview</a>
                          </Button>
                          <Button variant="outline" className="flex-1 rounded-full h-11 border-border/50 hover:border-primary/50 hover:text-primary text-sm transition-all" asChild>
                            <a href={selected.github} target="_blank" rel="noopener noreferrer">Source Code</a>
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  </DialogContent>
                )}
              </AnimatePresence>
            </Dialog>
          </LayoutGroup>
        </div>
      </div>
    </section>
  );
};

export default Projects;

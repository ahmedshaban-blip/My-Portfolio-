import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  Code2,
  Database,
  Globe,
  Smartphone,
  Terminal,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SectionReveal, SectionItem } from "@/components/animations/SectionReveal";
import { HoverCard } from "@/components/animations/HoverCard";
import { SectionHeading } from "@/components/SectionHeading";
import { useAnimationContext } from "@/hooks/useAnimationContext";
import { easeProfessional, listEntryDelay } from "@/lib/animation-variants";
import { cn } from "@/lib/utils";
import { skills } from "@/data/profile";

/**
 * Categories, skills, chip counts and column spans all come from
 * `src/data/profile/skills.json`. The JSON stores each icon as a KEY rather
 * than a component — the valid keys are listed in `src/data/profile/README.txt`
 * and mapped here. An unknown key falls back to `terminal`.
 */
const ICONS: Record<string, LucideIcon> = {
  smartphone: Smartphone,
  globe: Globe,
  globe2: Globe,
  database: Database,
  code2: Code2,
  terminal: Terminal,
};

const Skills = () => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const { reducedMotion } = useAnimationContext();

  const toggle = (title: string) =>
    setExpanded((prev) => ({ ...prev, [title]: !prev[title] }));

  const slug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  // The reference's outlined chip, tinted rather than filled: muted at rest,
  // the accent step on hover. `text-accent-strong` is the token solved for
  // text that sits on an accent-tinted fill.
  const chip =
    "px-3 py-1.5 text-xs font-medium rounded-full border border-border/45 bg-secondary/40 text-muted-foreground hover:bg-primary/15 hover:text-accent-strong hover:border-primary/40 transition-colors duration-200 cursor-default";

  return (
    <section id="skills" className="section-padding relative">
      {/* Decorative layer: one low-strength bloom for the section, contained.
          The reference reads as lit, never hazy. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="uv-orb -left-[6%] top-[6%] h-80 w-72" />
      </div>

      <div className="container relative z-10 mx-auto px-4">
        <div className="max-w-6xl mx-auto space-y-12">
          <SectionHeading
            eyebrow="Explore Now"
            title={
              <>
                Technical <span className="text-gradient">Skills</span>
              </>
            }
            description="The stack I use for mobile and web apps."
            className="mb-12"
          />

          {/* The categories are one grid, so one trigger reveals it and the
              cards land in reading order — previously each card ran its own
              `whileInView` with an index-based delay, so they fired at
              different scroll positions and read as unrelated pops. */}
          <SectionReveal className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {skills.categories.map((category) => {
              const Icon = ICONS[category.icon] ?? Terminal;
              const isExpanded = !!expanded[category.title];
              const needsToggle = category.skills.length > category.visibleCount;
              const visibleSkills = isExpanded
                ? category.skills
                : category.skills.slice(0, category.visibleCount);
              const hiddenCount = category.skills.length - category.visibleCount;
              const listId = `skills-${slug(category.title)}`;
              return (
              <SectionItem
                key={category.title}
                direction={category.colSpan ? "left" : "up"}
                className={cn("h-full", category.colSpan)}
              >
                <HoverCard scale={1.01} className="h-full">
                  <div className="uv-panel h-full p-6">
                    <div className="flex items-center gap-4 mb-5">
                      <div className="w-12 h-12 rounded-xl bg-primary/15 text-accent-strong flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold tracking-tight text-foreground">{category.title}</h3>
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                      </div>
                    </div>
                    <div id={listId} className="flex flex-wrap gap-2">
                      {/* Extra skills arrive as a list, in reading order — the
                          reveal says "these were already in the stack". */}
                      <AnimatePresence initial={false}>
                        {visibleSkills.map((skill, i) => (
                          <motion.span
                            key={skill}
                            initial={reducedMotion ? false : { opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={reducedMotion ? undefined : { opacity: 0, transition: { duration: 0.08 } }}
                            transition={
                              reducedMotion
                                ? { duration: 0 }
                                : { duration: 0.2, ease: easeProfessional, delay: listEntryDelay(i) }
                            }
                            className="inline-flex"
                          >
                            <Badge variant="outline" className={chip}>
                              {skill}
                            </Badge>
                          </motion.span>
                        ))}
                      </AnimatePresence>
                    </div>
                    {needsToggle && (
                      <button
                        type="button"
                        aria-expanded={isExpanded}
                        aria-controls={listId}
                        onClick={() => toggle(category.title)}
                        className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-accent-strong hover:text-primary transition-colors rounded-md px-1 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                      >
                        {isExpanded
                          ? "Show less"
                          : `Show all ${category.skills.length} skills (+${hiddenCount} more)`}
                        <ChevronDown
                          className={cn(
                            "w-3.5 h-3.5 transition-transform duration-200",
                            isExpanded && "rotate-180"
                          )}
                          aria-hidden="true"
                        />
                      </button>
                    )}
                  </div>
                </HoverCard>
              </SectionItem>
              );
            })}
          </SectionReveal>
        </div>
      </div>
    </section>
  );
};

export default Skills;

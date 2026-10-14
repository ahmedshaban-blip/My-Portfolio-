import { useState } from "react";
import { Smartphone, Globe, Database, Code2, Terminal, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { RevealOnScroll } from "@/components/animations/RevealOnScroll";
import { HoverCard } from "@/components/animations/HoverCard";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type SkillCategory = {
  icon: ReactNode;
  title: string;
  description: string;
  skills: string[];
  color: string;
  bg: string;
  colSpan?: string;
  /** Collapsed chip count — keeps initial scan within working-memory limits. */
  visibleCount: number;
};

const Skills = () => {
  const skillCategories: SkillCategory[] = [
    {
      icon: <Smartphone className="w-5 h-5" />,
      title: "Mobile Development",
      description: "Flutter & React Native",
      skills: ["Flutter & Dart", "React Native", "Clean Architecture (MVVM)", "Bloc/Cubit", "GetX", "Provider", "Web Socket", "Flutter Animations"],
      color: "text-primary",
      bg: "bg-primary/10",
      visibleCount: 5
    },
    {
      icon: <Globe className="w-5 h-5" />,
      title: "Frontend Web",
      description: "React & Modern Web",
      skills: ["React 18", "Redux Toolkit", "JavaScript (ES6+)", "Tailwind CSS", "Vite", "React Router v6", "SPA Architecture"],
      color: "text-accent",
      bg: "bg-accent/10",
      visibleCount: 4
    },
    {
      icon: <Database className="w-5 h-5" />,
      title: "Backend & APIs",
      description: "Services & Integration",
      skills: ["REST APIs", "Firebase Auth", "Firestore", "Supabase Storage", "Firebase Storage", "Push Notifications", "i18next"],
      color: "text-success",
      bg: "bg-success/10",
      visibleCount: 4
    },
    {
      icon: <Code2 className="w-5 h-5" />,
      title: "Core Technologies",
      description: "Foundations & Tools",
      skills: ["HTML5", "CSS3", "TypeScript", "Git & GitHub", "JSON Parsing", "RESTful APIs", "Vercel"],
      color: "text-warning",
      bg: "bg-warning/10",
      visibleCount: 4
    },
    {
      icon: <Terminal className="w-5 h-5" />,
      title: "AI-Assisted Development",
      description: "Accelerated Velocity & Clean Code",
      skills: [
        "Claude (Claude Code)",
        "OpenAI Codex / ChatGPT",
        "Prompt Engineering & Workflow Automation",
        "AI-Driven Testing & Code Review"
      ],
      color: "text-accent",
      bg: "bg-accent/10",
      colSpan: "md:col-span-2",
      visibleCount: 4
    },
  ];

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggle = (title: string) =>
    setExpanded((prev) => ({ ...prev, [title]: !prev[title] }));

  const slug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  const chip =
    "px-3 py-1.5 text-xs font-medium rounded-full border border-border/40 bg-secondary/30 text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors duration-200 cursor-default";

  return (
    <section id="skills" className="section-padding relative">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto space-y-12">
          <RevealOnScroll>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.25em] text-accent">
                <Code2 size={14} aria-hidden="true" />
                <span>02 · My Expertise</span>
                <span className="h-px flex-1 bg-gradient-to-r from-accent/40 to-transparent" aria-hidden="true" />
                <span className="tabular-nums tracking-normal text-muted-foreground">
                  {skillCategories.reduce((n, c) => n + c.skills.length, 0)} skills
                </span>
              </div>
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
                  Technical <span className="text-gradient">Skills</span>
                </h2>
                <p className="max-w-md text-muted-foreground text-base md:text-right md:text-lg leading-relaxed">
                  Focused stack for building production-ready mobile and web apps.
                </p>
              </div>
            </div>
          </RevealOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {skillCategories.map((category, index) => {
              const isExpanded = !!expanded[category.title];
              const needsToggle = category.skills.length > category.visibleCount;
              const visibleSkills = isExpanded
                ? category.skills
                : category.skills.slice(0, category.visibleCount);
              const hiddenCount = category.skills.length - category.visibleCount;
              const listId = `skills-${slug(category.title)}`;
              return (
              <RevealOnScroll
                key={category.title}
                delay={index * 0.05}
                className={category.colSpan || ""}
              >
                <HoverCard scale={1.01} className="h-full">
                  <Card className="modern-card border-border/50 rounded-2xl p-6 h-full">
                    <div className="flex items-center gap-4 mb-5">
                      <div className={`w-12 h-12 rounded-xl ${category.bg} ${category.color} flex items-center justify-center`}>
                        {category.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-foreground">{category.title}</h3>
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                      </div>
                    </div>
                    <div id={listId} className="flex flex-wrap gap-2">
                      {visibleSkills.map((skill) => (
                        <Badge key={skill} variant="outline" className={chip}>
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    {needsToggle && (
                      <button
                        type="button"
                        aria-expanded={isExpanded}
                        aria-controls={listId}
                        onClick={() => toggle(category.title)}
                        className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors rounded-md px-1 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
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
                  </Card>
                </HoverCard>
              </RevealOnScroll>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Skills;

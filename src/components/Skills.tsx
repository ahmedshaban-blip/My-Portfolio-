import { Smartphone, Globe, Database, Palette, Code2, Server } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { RevealOnScroll } from "@/components/animations/RevealOnScroll";
import { HoverCard } from "@/components/animations/HoverCard";

const Skills = () => {
  const skillCategories = [
    {
      icon: <Smartphone className="w-5 h-5" />,
      title: "Mobile Development",
      description: "Flutter & React Native",
      skills: ["Flutter & Dart", "React Native", "Clean Architecture (MVVM)", "Bloc/Cubit", "GetX", "Provider", "Web Socket", "Flutter Animations"],
      color: "text-primary",
      bg: "bg-primary/10"
    },
    {
      icon: <Globe className="w-5 h-5" />,
      title: "Frontend Web",
      description: "React & Modern Web",
      skills: ["React 18", "Redux Toolkit", "JavaScript (ES6+)", "Tailwind CSS", "Vite", "React Router v6", "SPA Architecture"],
      color: "text-accent",
      bg: "bg-accent/10"
    },
    {
      icon: <Database className="w-5 h-5" />,
      title: "Backend & APIs",
      description: "Services & Integration",
      skills: ["REST APIs", "Firebase Auth", "Firestore", "Supabase Storage", "Firebase Storage", "Push Notifications", "i18next"],
      color: "text-success",
      bg: "bg-success/10"
    },
    {
      icon: <Code2 className="w-5 h-5" />,
      title: "Core Technologies",
      description: "Foundations & Tools",
      skills: ["HTML5", "CSS3", "TypeScript", "Git & GitHub", "JSON Parsing", "RESTful APIs", "Vercel"],
      color: "text-warning",
      bg: "bg-warning/10"
    },
  ];

  const chip =
    "px-3 py-1.5 text-xs font-medium rounded-full border border-border/40 bg-secondary/30 text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all duration-200 cursor-default";

  return (
    <section id="skills" className="section-padding relative">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto space-y-12">
          <RevealOnScroll>
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-xs font-bold tracking-widest uppercase border border-accent/20">
                <Code2 size={14} /> My Expertise
              </div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
                Technical <span className="text-gradient">Skills</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Focused stack for building production-ready mobile and web apps.
              </p>
            </div>
          </RevealOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {skillCategories.map((category, index) => (
              <RevealOnScroll key={category.title} delay={index * 0.05}>
                <HoverCard scale={1.01}>
                  <Card className="modern-card border-border/50 rounded-2xl p-6 h-full">
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`w-12 h-12 rounded-xl ${category.bg} ${category.color} flex items-center justify-center`}>
                        {category.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-foreground">{category.title}</h3>
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {category.skills.map((skill) => (
                        <Badge key={skill} variant="outline" className={chip}>
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                </HoverCard>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Skills;

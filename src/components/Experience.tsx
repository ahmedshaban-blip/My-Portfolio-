import { Briefcase, GraduationCap, Award, CheckCircle2, Calendar, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { RevealOnScroll } from "@/components/animations/RevealOnScroll";


const Experience = () => {
  const courses = [
    "Deep Dive into Clean Architecture in Flutter",
    "Flutter Advanced – Clean Architecture & MVVM",
    "Flutter – Animations from Zero to Hero",
    "Mastering Flutter: Responsive & Adaptive UI Design",
    "Complete Flutter & Dart Development Course",
    "HTML, CSS, and JavaScript (ITI)",
    "React Native Web Application (ITI)",
    "Payment Integration: Stripe, PayPal & More (ITI)",
  ];

  return (
    <section id="experience" className="section-padding relative">
      <div className="absolute top-1/4 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-64 h-64 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto space-y-12">
          
          <RevealOnScroll>
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase border border-primary/20">
                <Sparkles className="w-4 h-4" /> Resume & Journey
              </div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
                Experience & <span className="text-gradient">Education</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                A timeline of my professional growth, academic achievements, and continuous learning.
              </p>
            </div>
          </RevealOnScroll>

          <div className="grid gap-8">
            <RevealOnScroll delay={0.1}>
              <Card className="modern-card border-border/50 rounded-2xl overflow-hidden group">
                <div className="flex flex-col md:flex-row gap-6 p-6 md:p-8">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-300">
                      <Briefcase className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-5">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h3 className="text-xl md:text-2xl font-bold text-foreground">
                          Front-end and Cross-Platform Developer
                        </h3>
                        <Badge className="bg-primary/10 text-primary border-none px-3 py-1 text-sm font-medium">2025</Badge>
                      </div>
                      <p className="text-lg text-primary font-semibold">
                        Information Technology Institute (ITI)
                      </p>
                      <div className="flex items-center gap-4 text-muted-foreground text-sm">
                        <span className="flex items-center gap-1.5"><Calendar size={14} /> July 2025 – Nov 2025</span>
                        <span className="flex items-center gap-1.5"><MapPin size={14} /> Egypt</span>
                      </div>
                    </div>
                    
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-muted-foreground">
                      {[
                        "Developed production-ready mobile screens using Flutter",
                        "Implemented state management (Bloc, Cubit, GetX)",
                        "Integrated REST APIs & handled JSON parsing",
                        "Firebase Auth, Firestore & Push Notifications",
                        "Built engaging web UIs using React & Redux",
                        "Worked with Stripe & PayPal integrations",
                        "Collaborated via Git & GitHub workflows",
                        "Followed Clean Architecture principles"
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <CheckCircle2 className="text-primary mt-0.5 shrink-0 w-4 h-4" />
                          <span className="text-sm leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            </RevealOnScroll>

            <RevealOnScroll delay={0.2}>
              <Card className="modern-card border-border/50 rounded-2xl overflow-hidden group">
                <div className="flex flex-col md:flex-row gap-6 p-6 md:p-8">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center border border-border/50 group-hover:scale-105 transition-transform duration-300">
                      <GraduationCap className="h-8 w-8 text-foreground" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-5">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h3 className="text-xl md:text-2xl font-bold text-foreground">
                          Bachelor's Degree in Computer Science
                        </h3>
                        <Badge variant="outline" className="border-border/50 text-muted-foreground px-3 py-1 text-sm">Class of 2025</Badge>
                      </div>
                      <p className="text-lg text-primary font-semibold">
                        Faculty of Computer and Information, Minya University
                      </p>
                      <div className="flex items-center gap-4 text-muted-foreground text-sm pt-1">
                        <span className="flex items-center gap-1.5"><Calendar size={14} /> Sept 2020 – Jan 2025</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 rounded-xl bg-success/5 border border-success/10">
                      <Award className="h-5 w-5 text-success" />
                      <span className="font-medium text-foreground">
                        Graduation Project Grade:{" "}
                        <span className="text-success font-bold text-lg">A+</span>
                      </span>
                    </div>
                    
                    <p className="text-muted-foreground leading-relaxed">
                      Solid foundation in software engineering, algorithms, and problem-solving, with a focus on delivering high-quality architectural solutions.
                    </p>
                  </div>
                </div>
              </Card>
            </RevealOnScroll>

            <RevealOnScroll delay={0.3}>
              <Card className="modern-card border-border/50 rounded-2xl p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 rounded-xl bg-accent/10 text-accent">
                    <Award className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-foreground">
                    Selected Courses & Certifications
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {courses.map((course, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="px-4 py-2 text-sm rounded-full border-border/40 bg-secondary/30 text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all cursor-default"
                    >
                      {course}
                    </Badge>
                  ))}
                </div>
              </Card>
            </RevealOnScroll>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Experience;
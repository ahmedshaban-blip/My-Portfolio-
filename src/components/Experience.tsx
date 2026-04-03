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
    <section id="experience" className="py-24 relative overflow-hidden">
      <div className="absolute top-1/4 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto space-y-16">
          
          <RevealOnScroll>
            <div className="text-center space-y-4">
              <Badge variant="outline" className="px-4 py-1 rounded-full border-primary/20 bg-primary/5 text-primary">
                <Sparkles className="w-3.5 h-3.5 mr-2" /> Resume & Journey
              </Badge>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter">
                Experience & <span className="text-blue-600 dark:text-blue-500">Education</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                A timeline of my professional growth, academic achievements, and continuous learning.
              </p>
            </div>
          </RevealOnScroll>

          <div className="grid gap-10">
            <RevealOnScroll delay={0.1}>
              <Card className="glass-effect rounded-[2.5rem] border-border overflow-hidden group hover:border-blue-500/50 transition-all duration-500">
                <div className="flex flex-col md:flex-row gap-8 p-8 md:p-12">
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 rounded-3xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform duration-500">
                      <Briefcase className="h-10 w-10 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-6">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                          Front-end and Cross-Platform Developer (Internship)
                        </h3>
                        <Badge className="bg-blue-600/10 text-blue-600 border-none px-4 py-1">2025</Badge>
                      </div>
                      <p className="text-xl text-blue-600 dark:text-blue-400 font-extrabold tracking-tight">
                        Information Technology Institute (ITI)
                      </p>
                      <div className="flex items-center gap-4 text-muted-foreground text-sm">
                        <span className="flex items-center gap-1.5"><Calendar size={14} /> July 2025 – Nov 2025</span>
                        <span className="flex items-center gap-1.5"><MapPin size={14} /> Egypt</span>
                      </div>
                    </div>
                    
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-muted-foreground">
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
                        <li key={i} className="flex items-start gap-3 group/item">
                          <CheckCircle2 className="text-blue-500 mt-1 shrink-0 w-4 h-4 group-hover/item:scale-125 transition-transform" />
                          <span className="text-sm leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            </RevealOnScroll>

            <RevealOnScroll delay={0.2}>
              <Card className="glass-effect rounded-[2.5rem] border-border overflow-hidden group hover:border-blue-500/50 transition-all duration-500">
                <div className="flex flex-col md:flex-row gap-8 p-8 md:p-12">
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 rounded-3xl bg-secondary flex items-center justify-center border border-border group-hover:scale-110 transition-transform duration-500">
                      <GraduationCap className="h-10 w-10 text-foreground" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-6">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                          Bachelor's Degree in Computer Science
                        </h3>
                        <Badge variant="outline" className="border-border text-muted-foreground px-4 py-1">Class of 2025</Badge>
                      </div>
                      <p className="text-xl text-blue-600 dark:text-blue-400 font-black tracking-tight underline decoration-blue-500/20 underline-offset-4">
                        Faculty of Computer and Information, Minya University
                      </p>
                      <div className="flex items-center gap-4 text-muted-foreground text-sm pt-1">
                        <span className="flex items-center gap-1.5"><Calendar size={14} /> Sept 2020 – Jan 2025</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                      <Award className="h-6 w-6 text-blue-500" />
                      <span className="font-semibold text-foreground">
                        Graduation Project Grade:{" "}
                        <span className="text-blue-600 dark:text-blue-400 font-black text-lg">A+</span>
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
              <Card className="glass-effect rounded-[2.5rem] border-border p-8 md:p-12 hover:border-blue-500/50 transition-all duration-500">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
                    <Award className="h-7 w-7" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                    Selected Courses & Certifications
                  </h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {courses.map((course, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="px-5 py-2.5 text-sm rounded-full border-border bg-background/50 text-muted-foreground hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all cursor-default"
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
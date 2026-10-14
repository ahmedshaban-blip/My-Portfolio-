import { Code2, Globe2, Smartphone, Terminal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { RevealOnScroll } from "@/components/animations/RevealOnScroll";
import { HoverCard } from "@/components/animations/HoverCard";
import { playStoreApps } from "@/data/projects";

const About = () => {
  const highlights = [
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: "Mobile Dev",
      description: "Expert in Flutter & React Native with Clean Architecture patterns.",
      color: "text-primary",
      bg: "bg-primary/10"
    },
    {
      icon: <Code2 className="w-6 h-6" />,
      title: "Web Tech",
      description: "Modern web apps using React, Redux Toolkit, and Tailwind CSS.",
      color: "text-accent",
      bg: "bg-accent/10"
    },
    {
      icon: <Terminal className="w-6 h-6" />,
      title: "Clean Code",
      description: "Production-ready applications with maintainable and scalable code.",
      color: "text-success",
      bg: "bg-success/10"
    },
    {
      icon: <Globe2 className="w-6 h-6" />,
      title: "Integrations",
      description: "Experienced in Firebase, Supabase, Stripe, and PayPal gateways.",
      color: "text-warning",
      bg: "bg-warning/10"
    }
  ];

  return (
    <section id="about" className="section-padding relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03] bg-[radial-gradient(hsl(var(--border))_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            {/* Left Side: Content */}
            <div className="space-y-8">
              <RevealOnScroll>
                <div className="space-y-6">
                  <p className="flex items-center gap-3 text-xs font-bold tracking-[0.25em] uppercase text-primary">
                    <span>01 · About me</span>
                    <span className="h-px flex-1 bg-gradient-to-r from-primary/40 to-transparent" aria-hidden="true" />
                    <span className="tabular-nums tracking-normal text-muted-foreground">
                      Flutter · React · Clean Architecture
                    </span>
                  </p>
                  <div className="flex flex-col gap-4">
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight text-foreground">
                      Passionate developer solving problems through code.
                    </h2>
                    <p className="max-w-md text-muted-foreground text-base md:text-lg leading-relaxed">
                      Full-time at Truck World · 10+ apps shipped · {playStoreApps.length} live on Google Play.
                    </p>
                  </div>
                </div>
              </RevealOnScroll>

              <RevealOnScroll delay={0.1}>
                <div className="space-y-5 text-base md:text-lg text-muted-foreground leading-relaxed">
                  <p>
                    I'm <span className="text-foreground font-semibold">Ahmed Shaban</span>, a passionate developer with a <span className="text-foreground font-semibold">Bachelor's Degree in Computer Science</span> from the <span className="text-primary font-semibold">Faculty of Computer and Information, Minya University</span>.
                  </p>
                  <p>
                    During my internship at the <span className="text-foreground font-semibold">Information Technology Institute (ITI)</span>, I worked as a Front-end and Cross-Platform Developer, gaining hands-on experience with <span className="text-foreground font-semibold">Flutter</span>, <span className="text-foreground font-semibold">React Native</span>, and <span className="text-foreground font-semibold">React</span>.
                  </p>
                  <p>
                    I specialize in creating <span className="text-foreground font-semibold">cross-platform mobile applications</span> using <span className="text-primary font-semibold">Flutter</span> and <span className="text-primary font-semibold">React Native</span> with Clean Architecture and seamless API integrations. On the web side, I build responsive web applications using <span className="text-primary font-semibold">React</span> and Redux Toolkit.
                  </p>
                </div>
              </RevealOnScroll>

              <RevealOnScroll delay={0.2}>
                {/* Single home for the 10+ fact — ITI + A+ live in Experience. */}
                <div className="pt-4 flex flex-wrap gap-6">
                  <div className="text-center sm:text-left">
                    <p className="text-3xl font-bold text-primary">10+</p>
                    <p className="text-sm text-muted-foreground mt-1">Projects Completed</p>
                  </div>
                  <div className="w-px h-16 bg-border/50 hidden sm:block" />
                  <div className="text-center sm:text-left">
                    <p className="text-3xl font-bold text-success">{playStoreApps.length}</p>
                    <p className="text-sm text-muted-foreground mt-1">App{playStoreApps.length === 1 ? "" : "s"} Live on Google Play</p>
                  </div>
                </div>
              </RevealOnScroll>
            </div>

            {/* Right Side: Highlights Grid */}
            <RevealOnScroll delay={0.2}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {highlights.map((item, index) => (
                  <HoverCard key={index} scale={1.02}>
                    <Card className="modern-card border-border/50 rounded-2xl group hover:border-primary/50 transition-colors duration-300 overflow-hidden">
                      <CardContent className="p-6 space-y-4">
                        <div className={`w-12 h-12 rounded-xl ${item.bg} ${item.color} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
                          {item.icon}
                        </div>
                        <div className="space-y-2">
                          <h3 className="font-semibold text-lg text-foreground">{item.title}</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </HoverCard>
                ))}
              </div>
            </RevealOnScroll>

          </div>
        </div>
      </div>

      {/* Background Decorative Element */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
    </section>
  );
};

export default About;
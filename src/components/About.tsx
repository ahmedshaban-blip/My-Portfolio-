import { User, Code2, Globe2, Sparkles, Smartphone, Terminal, GraduationCap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const About = () => {
  const highlights = [
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: "Mobile Dev",
      description: "Expert in Flutter & React Native with Clean Architecture patterns.",
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      icon: <Code2 className="w-6 h-6" />,
      title: "Web Tech",
      description: "Modern web apps using React, Redux Toolkit, and Tailwind CSS.",
      color: "text-purple-500",
      bg: "bg-purple-500/10"
    },
    {
      icon: <Terminal className="w-6 h-6" />,
      title: "Clean Code",
      description: "Production-ready applications with maintainable and scalable code.",
      color: "text-emerald-500",
      bg: "bg-emerald-500/10"
    },
    {
      icon: <Globe2 className="w-6 h-6" />,
      title: "Integrations",
      description: "Experienced in Firebase, Supabase, Stripe, and PayPal gateways.",
      color: "text-orange-500",
      bg: "bg-orange-500/10"
    }
  ];

  return (
    <section id="about" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Side: Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase">
                  <User size={14} /> About Me
                </div>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                  Passionate Developer <br />
                  <span className="text-primary">Solving Problems</span> Through Code
                </h2>
              </div>

              <div className="space-y-6 text-base md:text-lg text-muted-foreground leading-relaxed">
                <p>
                  I'm <span className="text-foreground font-semibold">Ahmed Shaban</span>, a passionate developer with a <span className="text-foreground font-bold italic underline decoration-primary/30">Bachelor's Degree in Computer Science</span> from the <span className="text-primary font-bold">Faculty of Computer and Information, Minya University</span>, where I graduated with an <span className="text-foreground font-bold">A+</span> in my final project.
                </p>
                <p>
                  During my internship at the <span className="text-foreground">Information Technology Institute (ITI)</span>, I worked as a Front-end and Cross-Platform Developer, gaining hands-on experience with <span className="text-foreground font-semibold">Flutter</span>, <span className="text-foreground font-semibold">React Native</span>, and <span className="text-foreground font-semibold">React</span>. This experience sharpened my skills in building production-ready applications with clean, maintainable code.
                </p>
                <p>
                  I specialize in creating <span className="text-foreground font-semibold">cross-platform mobile applications</span> using <span className="text-primary font-bold">Flutter</span> and <span className="text-primary font-bold">React Native</span> with Clean Architecture and seamless API integrations. On the web side, I build responsive web applications using <span className="text-primary font-bold">React</span> and Redux Toolkit.
                </p>
              </div>

              <div className="pt-4 flex flex-wrap gap-6">
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-foreground">10+</p>
                  <p className="text-sm text-muted-foreground">Projects Completed</p>
                </div>
                <div className="w-px h-12 bg-border hidden sm:block" />
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-foreground">ITI</p>
                  <p className="text-sm text-muted-foreground">Certified Intern</p>
                </div>
                <div className="w-px h-12 bg-border hidden sm:block" />
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-foreground">A+</p>
                  <p className="text-sm text-muted-foreground">Final Project Grade</p>
                </div>
              </div>
            </div>

            {/* Right Side: Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {highlights.map((item, index) => (
                <Card key={index} className="glass-effect border-border rounded-3xl group hover:border-primary/50 transition-all duration-500">
                  <CardContent className="p-8 space-y-4">
                    <div className={`w-12 h-12 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center transition-transform group-hover:scale-110`}>
                      {item.icon}
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-bold text-xl">{item.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

          </div>
        </div>
      </div>

      {/* Background Decorative Element */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
    </section>
  );
};

export default About;
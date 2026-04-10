import { ArrowRight, Github, Linkedin, Mail, Sparkles, Download } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { StaggerReveal } from "@/components/animations/StaggerReveal";
import { Magnetic } from "@/components/animations/Magnetic";
import { useAnimationContext } from "@/context/AnimationContext";
import { downloadCV } from "@/lib/utils";

const springHighBounce = {
  type: "spring" as const,
  stiffness: 350,
  damping: 14,
  mass: 0.6,
};

const heroSectionStagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.5,
    },
  },
};

const heroElementFadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: springHighBounce,
  },
};

const Hero = () => {
  const { reducedMotion } = useAnimationContext();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleDownloadCV = (type: "flutter" | "frontend") => {
    downloadCV(type);
  };

  const socials = [
    { icon: Github, href: "https://github.com/ahmedshaban-blip" },
    { icon: Linkedin, href: "https://www.linkedin.com/in/ahmedshaban-dev" },
    { icon: Mail, href: "mailto:ahmed.shabaan.dev@gmail.com" },
  ];

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      {/* Enhanced gradient orbs with new color palette */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 dark:bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 dark:bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/50 pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10 text-center">
        <motion.div
          variants={heroSectionStagger}
          initial="hidden"
          animate="visible"
          className="space-y-10 max-w-5xl mx-auto"
        >
          {/* Enhanced Badge */}
          <motion.div variants={heroElementFadeUp}>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 text-primary border border-primary/20 shadow-lg shadow-primary/5">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-semibold">Open for new opportunities</span>
            </div>
          </motion.div>

          {/* Letter-by-Letter Title Reveal */}
          <StaggerReveal
            as="h1"
            mode="word"
            staggerDelay={0.12}
            delay={0.2}
            className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter leading-tight text-gradient"
          >
            Building Modern Mobile and Web Solutions
          </StaggerReveal>

          {/* Subtext */}
          <motion.div variants={heroElementFadeUp}>
            <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
              I am Ahmed Shaban, a Computer Science graduate specializing in
              <span className="text-foreground font-semibold"> Flutter</span>,
              <span className="text-foreground font-semibold"> React Native</span>, and
              <span className="text-foreground font-semibold"> React</span>.
              I build high-performance, cross-platform experiences with clean code.
            </p>
          </motion.div>

          {/* CTA Buttons with Magnetic pull */}
          <motion.div variants={heroElementFadeUp}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Magnetic strength={0.25}>
                <Button
                  size="lg"
                  className="rounded-full h-14 px-10 text-lg bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white shadow-xl shadow-primary/25 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300"
                  onClick={() => scrollToSection("projects")}
                >
                  View Projects <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Magnetic>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <Magnetic strength={0.2}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-full h-14 px-8 glass-effect border-border/60 hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all duration-200"
                    onClick={() => handleDownloadCV("flutter")}
                  >
                    <Download className="mr-2 w-4 h-4" /> Flutter CV
                  </Button>
                </Magnetic>
                <Magnetic strength={0.2}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-full h-14 px-8 glass-effect border-border/60 hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all duration-200"
                    onClick={() => handleDownloadCV("frontend")}
                  >
                    <Download className="mr-2 w-4 h-4" /> Frontend CV
                  </Button>
                </Magnetic>
              </div>
            </div>
          </motion.div>

          {/* Social icons with enhanced hover */}
          <motion.div variants={heroElementFadeUp}>
            <div className="flex justify-center gap-8 pt-12">
              {socials.map((social, i) => (
                <Magnetic key={i} strength={0.4} radius={120}>
                  <a href={social.href} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-all duration-200 hover:scale-110 transform">
                    <social.icon className="w-7 h-7" />
                  </a>
                </Magnetic>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;

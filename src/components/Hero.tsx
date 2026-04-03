import { ArrowRight, Github, Linkedin, Mail, Sparkles, Download } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { StaggerReveal } from "@/components/animations/StaggerReveal";
import { Magnetic } from "@/components/animations/Magnetic";
import { useAnimationContext } from "@/context/AnimationContext";

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
    const link = document.createElement("a");
    if (type === "flutter") {
      link.href = "/Ahmed Shaban--Flutter Developer.pdf";
      link.download = "Ahmed-Shaban-Flutter-CV.pdf";
    } else {
      link.href = "/Ahmed Shaban Front--End Web Developer.pdf";
      link.download = "Ahmed-Shaban-Frontend-CV.pdf";
    }
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const socials = [
    { icon: Github, href: "https://github.com/ahmedshaban-blip" },
    { icon: Linkedin, href: "https://www.linkedin.com/in/ahmedshaban-dev" },
    { icon: Mail, href: "mailto:ahmed.shabaan.dev@gmail.com" },
  ];

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 dark:bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 dark:bg-purple-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10 text-center">
        <motion.div
          variants={heroSectionStagger}
          initial="hidden"
          animate="visible"
          className="space-y-10 max-w-5xl mx-auto"
        >
          {/* Badge */}
          <motion.div variants={heroElementFadeUp}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">Open for new opportunities</span>
            </div>
          </motion.div>

          {/* Letter-by-Letter Title Reveal */}
          <StaggerReveal
            as="h1"
            mode="letter"
            staggerDelay={0.035}
            delay={0.2}
            className="text-5xl md:text-8xl font-extrabold tracking-tighter leading-tight text-gradient"
          >
            Building Modern Mobile and Web Solutions
          </StaggerReveal>

          {/* Subtext with high-frequency spring bounce */}
          <motion.div variants={heroElementFadeUp}>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
              I am Ahmed Shaban, a Computer Science graduate specializing in 
              <span className="text-foreground font-bold"> Flutter</span>, 
              <span className="text-foreground font-bold"> React Native</span>, and 
              <span className="text-foreground font-bold"> React</span>. 
              I build high-performance, cross-platform experiences with clean code.
            </p>
          </motion.div>

          {/* CTA Buttons with Magnetic pull */}
          <motion.div variants={heroElementFadeUp}>
            <div className="flex flex-col sm:flex-row gap-5 justify-center pt-6">
              <Magnetic strength={0.25}>
                <Button 
                  size="lg" 
                  className="rounded-full h-14 px-10 text-lg bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 transition-all" 
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
                    className="rounded-full h-14 px-8 glass-effect border-border hover:bg-accent transition-all" 
                    onClick={() => handleDownloadCV("flutter")}
                  >
                    <Download className="mr-2 w-4 h-4" /> Flutter CV
                  </Button>
                </Magnetic>
                <Magnetic strength={0.2}>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="rounded-full h-14 px-8 glass-effect border-border hover:bg-accent transition-all" 
                    onClick={() => handleDownloadCV("frontend")}
                  >
                    <Download className="mr-2 w-4 h-4" /> Frontend CV
                  </Button>
                </Magnetic>
              </div>
            </div>
          </motion.div>

          {/* Social icons */}
          <motion.div variants={heroElementFadeUp}>
            <div className="flex justify-center gap-8 pt-12">
              {socials.map((social, i) => (
                <Magnetic key={i} strength={0.4} radius={120}>
                  <a href={social.href} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-blue-600 dark:hover:text-white transition-all">
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

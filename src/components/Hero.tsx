import { ArrowRight, Github, Linkedin, Mail, Download, FolderGit2, Layers } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { StaggerReveal } from "@/components/animations/StaggerReveal";
import { Magnetic } from "@/components/animations/Magnetic";
import { useAnimationContext } from "@/hooks/useAnimationContext";
import { downloadCV } from "@/lib/utils";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";

const heroEntranceEase = [0.22, 1, 0.36, 1] as const;

const heroSectionStagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const heroElementFadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: heroEntranceEase },
  },
};

const Hero = () => {
  const { reducedMotion } = useAnimationContext();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      element.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    }
  };

  const handleDownloadCV = (type: "flutter" | "frontend") => {
    downloadCV(type);
  };

  const whatsappUrl = `https://wa.me/201114975104?text=${encodeURIComponent(
    "Hello Ahmed, I saw your portfolio and would like to connect"
  )}`;

  const socials = [
    { icon: Github, href: "https://github.com/ahmedshaban-blip", label: "GitHub", hoverClass: "hover:text-primary" },
    { icon: Linkedin, href: "https://www.linkedin.com/in/ahmedshaban-dev", label: "LinkedIn", hoverClass: "hover:text-primary" },
    { icon: WhatsAppIcon, href: whatsappUrl, label: "WhatsApp", hoverClass: "hover:text-[#25D366]" },
    { icon: Mail, href: "mailto:ahmed.shabaan.dev@gmail.com", label: "Email", hoverClass: "hover:text-primary" },
  ];

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center pt-28 pb-16 lg:pt-32 lg:pb-20 overflow-hidden">
      {/* Enhanced gradient orbs with new color palette */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 dark:bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 dark:bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/50 pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          variants={heroSectionStagger}
          initial={reducedMotion ? "visible" : "hidden"}
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center max-w-7xl mx-auto"
        >
          {/* Left Column: Text & CTAs */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left order-2 lg:order-1">
            {/* Status Badge */}
            <motion.div variants={heroElementFadeUp}>
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 shadow-sm">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success"></span>
                </span>
                <span className="text-xs sm:text-sm font-semibold tracking-wide">Available for new opportunities</span>
              </div>
            </motion.div>

            {/* Main Title */}
            <StaggerReveal
              as="h1"
              mode="word"
              staggerDelay={0.06}
              delay={0.1}
              className="text-3xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight leading-[1.12] text-foreground"
            >
              Building Modern Mobile and Web Solutions
            </StaggerReveal>

            {/* Subtext */}
            <motion.div variants={heroElementFadeUp}>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0">
                I am <span className="text-foreground font-semibold">Ahmed Shaban</span>, a Computer Science graduate specializing in
                <span className="text-foreground font-semibold"> Flutter</span>,
                <span className="text-foreground font-semibold"> React Native</span>, and
                <span className="text-foreground font-semibold"> React</span>.
                I build high-performance, cross-platform experiences with clean code.
              </p>
            </motion.div>

            {/* CTA Buttons with Magnetic pull */}
            <motion.div variants={heroElementFadeUp}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
                <Magnetic strength={0.25}>
                  <Button
                    size="lg"
                    className="rounded-full h-12 sm:h-14 px-8 sm:px-10 text-base sm:text-lg bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-xl shadow-primary/25 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300"
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
                      className="rounded-full h-12 sm:h-14 px-6 sm:px-8 glass-effect border-border/60 hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all duration-200"
                      onClick={() => handleDownloadCV("flutter")}
                    >
                      <Download className="mr-2 w-4 h-4" /> Flutter CV
                    </Button>
                  </Magnetic>
                  <Magnetic strength={0.2}>
                    <Button
                      size="lg"
                      variant="outline"
                      className="rounded-full h-12 sm:h-14 px-6 sm:px-8 glass-effect border-border/60 hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all duration-200"
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
              <div className="flex justify-center lg:justify-start gap-6 pt-4">
                {socials.map((social, i) => (
                  <Magnetic key={i} strength={0.4} radius={100}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className={`text-muted-foreground ${social.hoverClass} transition-all duration-200 hover:scale-110 transform`}
                    >
                      <social.icon className="w-6 h-6" />
                    </a>
                  </Magnetic>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column: Personal Image Showcase with Floating Badges & Mobile Stats */}
          <div className="lg:col-span-5 flex justify-center items-center order-1 lg:order-2">
            <motion.div variants={heroElementFadeUp} className="relative flex flex-col items-center justify-center">
              {/* Ambient background glow */}
              <div className="absolute w-56 h-56 sm:w-72 sm:h-72 bg-gradient-to-tr from-primary/25 to-accent/20 rounded-full blur-3xl pointer-events-none -z-10" />

              {/* Showcase Frame */}
              <div className="relative group">
                <div className="relative p-1.5 rounded-full bg-gradient-to-b from-primary/40 via-accent/30 to-border/40 shadow-2xl backdrop-blur-sm">
                  <div className="w-48 h-48 sm:w-60 sm:h-60 md:w-72 md:h-72 lg:w-80 lg:h-80 rounded-full overflow-hidden bg-background ring-4 ring-background/60 shadow-inner">
                    <picture>
                      <source
                        type="image/webp"
                        srcSet="/images/personal-image-320.webp 320w, /images/personal-image-640.webp 640w, /images/personal-image-960.webp 960w"
                        sizes="(min-width: 1024px) 320px, (min-width: 768px) 288px, (min-width: 640px) 240px, 192px"
                      />
                      <img
                        src="/images/personal-image-640.webp"
                        alt="Ahmed Shaban"
                        width={640}
                        height={640}
                        className="w-full h-full object-cover rounded-full transition-transform duration-500 group-hover:scale-105 select-none"
                        loading="eager"
                        decoding="async"
                        fetchPriority="high"
                      />
                    </picture>
                  </div>
                </div>

                {/* Floating Badge 1: 10+ Projects (Desktop & Tablet only, static for 90Hz idle) */}
                <motion.div
                  variants={heroElementFadeUp}
                  className="hidden sm:flex absolute sm:top-[22%] sm:-left-16 md:-left-20 lg:-left-24 backdrop-blur-md bg-background/90 border border-border/60 shadow-xl rounded-2xl px-3.5 py-2.5 items-center gap-3 z-20 whitespace-nowrap"
                >
                  <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                    <FolderGit2 className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-foreground leading-tight">10+ Projects</p>
                    <p className="text-[10px] text-muted-foreground">Completed successfully</p>
                  </div>
                </motion.div>

                {/* Floating Badge 2: Cross-Platform Specialist (Desktop & Tablet only, static for 90Hz idle) */}
                <motion.div
                  variants={heroElementFadeUp}
                  className="hidden sm:flex absolute sm:bottom-4 sm:-right-6 backdrop-blur-md bg-background/90 border border-border/60 shadow-xl rounded-2xl px-3.5 py-2.5 items-center gap-3 z-20 whitespace-nowrap"
                >
                  <div className="p-1.5 rounded-lg bg-accent/10 text-accent">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-foreground leading-tight">Flutter & React</p>
                    <p className="text-[10px] text-muted-foreground">Clean Architecture</p>
                  </div>
                </motion.div>
              </div>

              {/* Mobile-Only Stats Cards (Clean row directly below the photo) */}
              <motion.div variants={heroElementFadeUp} className="flex sm:hidden items-center justify-center gap-2.5 mt-5 w-full max-w-[290px]">
                <div className="flex-1 backdrop-blur-md bg-background/90 border border-border/60 shadow-lg rounded-2xl p-2.5 flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0">
                    <FolderGit2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-[11px] font-bold text-foreground leading-tight truncate">10+ Projects</p>
                    <p className="text-[9px] text-muted-foreground truncate">Completed</p>
                  </div>
                </div>

                <div className="flex-1 backdrop-blur-md bg-background/90 border border-border/60 shadow-lg rounded-2xl p-2.5 flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-accent/10 text-accent shrink-0">
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-[11px] font-bold text-foreground leading-tight truncate">Flutter & React</p>
                    <p className="text-[9px] text-muted-foreground truncate">Clean Architecture</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;

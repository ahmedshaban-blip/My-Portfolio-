import { ArrowRight, Github, Linkedin, Mail, Play, Layers } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { StaggerReveal } from "@/components/animations/StaggerReveal";
import { Magnetic } from "@/components/animations/Magnetic";
import { CVReadMenu } from "@/components/cv/CVReadMenu";
import { useAnimationContext } from "@/hooks/useAnimationContext";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { playStoreApps } from "@/data/projects";

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

/**
 * The floating badges ride on the portrait's rim, and below `lg` the
 * "Available for new opportunities" pill sits directly under that rim. Because
 * the two are separate `heroElementFadeUp` children they close on each other by
 * the full 32px of their opposing y-offsets, so the falling badge crossed the
 * rising pill at the start of every entrance. Fading without a y-offset keeps
 * the same reveal rhythm and removes the crossing.
 */
const heroBadgeFadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.45, ease: heroEntranceEase } },
};

/**
 * PERFORMANCE: the <h1> is the LCP element. Fading it in from `opacity: 0`
 * kept it invisible for ~1.1s (delay + 9-word stagger), so the page looked
 * stalled and the browser could not record LCP. Transform-only reveal paints
 * the text on the first frame and stays on the compositor.
 */
const heroWordRise: Variants = {
  hidden: { y: "0.3em" },
  visible: { y: "0em", transition: { duration: 0.5, ease: heroEntranceEase } },
};

const Hero = () => {
  const { reducedMotion } = useAnimationContext();

  // Derived from projects data — adding/removing a Play listing updates every badge automatically.
  const playAppsCount = playStoreApps.length;
  const playAppsLabel = `${playAppsCount} App${playAppsCount === 1 ? "" : "s"} Live`;

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      element.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    }
  };

  const whatsappUrl = `https://wa.me/201114975104?text=${encodeURIComponent(
    "Hello Ahmed, I saw your portfolio and would like to connect"
  )}`;

  const socials = [
    { icon: Github, href: "https://github.com/ahmedshaban-blip", label: "GitHub", hoverClass: "hover:text-primary" },
    { icon: Linkedin, href: "https://www.linkedin.com/in/ahmed-shaban-front-cross", label: "LinkedIn", hoverClass: "hover:text-primary" },
    { icon: WhatsAppIcon, href: whatsappUrl, label: "WhatsApp", hoverClass: "hover:text-[hsl(var(--whatsapp))]" },
    { icon: Mail, href: "mailto:ahmed.shabaan.dev@gmail.com", label: "Email", hoverClass: "hover:text-primary" },
  ];

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center pt-28 pb-16 lg:pt-32 lg:pb-20">
      {/* PERFORMANCE: soft light orbs are painted as radial gradients, not
          `filter: blur(120px)` — a 120px blur on a 40vw element rasterizes a
          huge surface on every repaint, which is what made first paint jank. */}
      {/* Decorative layer. The orbs overshoot the section on purpose, so they
          live in their own clipping wrapper — the section itself must stay
          `overflow-visible` or it would crop the CV dropdown (and any other
          affordance) that opens past the hero's bottom edge. */}
      <div aria-hidden="true" className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%]"
          style={{
            background:
              "radial-gradient(circle at center, oklch(var(--primary) / 0.09) 0%, oklch(var(--primary) / 0.03) 45%, transparent 72%)",
          }}
        />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%]"
          style={{
            background:
              "radial-gradient(circle at center, oklch(var(--accent) / 0.08) 0%, oklch(var(--accent) / 0.025) 45%, transparent 72%)",
          }}
        />
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/50" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          variants={heroSectionStagger}
          initial={reducedMotion ? "visible" : "hidden"}
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center max-w-6xl mx-auto"
        >
          {/* Left Column: Text & CTAs */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left order-2 lg:order-1">
            {/* Status Badge */}
            <motion.div variants={heroElementFadeUp}>
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 shadow-sm">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping [animation-iteration-count:3] absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success"></span>
                </span>
                <span className="text-xs sm:text-sm font-semibold tracking-wide">Available for new opportunities</span>
              </div>
            </motion.div>

            {/* Main Title — candidate-specific: name + current role anchor for recruiters */}
            <StaggerReveal
              as="h1"
              mode="word"
              staggerDelay={0.06}
              delay={0.1}
              childVariants={heroWordRise}
              className="text-3xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight leading-[1.12] text-foreground"
            >
              Ahmed Shaban — Flutter & Front-end Developer
            </StaggerReveal>

            {/* Subtext */}
            <motion.div variants={heroElementFadeUp}>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Computer Science graduate specializing in
                <span className="text-foreground font-semibold"> Flutter</span>,
                <span className="text-foreground font-semibold"> React Native</span>, and
                <span className="text-foreground font-semibold"> React</span>.
                I build and ship cross-platform apps.
              </p>
              <p className="mt-3 flex flex-wrap items-center justify-center lg:justify-start gap-x-2 gap-y-1 text-xs font-medium text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-secondary/40 px-3 py-1">
                  Full-time · Truck World, Saudi Arabia
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-secondary/40 px-3 py-1">
                  Cairo, Egypt (GMT+2) · Open to remote & on-site
                </span>
              </p>
            </motion.div>

            {/* CTA: one primary + one CV pill — every other CV action
                (read/download per track) lives inside the dropdown, so the
                hero stays uncluttered. The chips on the pill already name the
                two tracks, so the row needs no helper sentence. */}
            <motion.div variants={heroElementFadeUp}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
                <Magnetic strength={0.25}>
                  <Button
                    size="lg"
                    className="rounded-full h-12 sm:h-14 px-8 sm:px-10 text-base sm:text-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/25 hover:shadow-primary/30 hover:-translate-y-0.5 transition-interaction duration-300"
                    onClick={() => scrollToSection("projects")}
                  >
                    View Projects <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Magnetic>

                <Magnetic strength={0.2}>
                  <CVReadMenu className="h-12 sm:h-14 px-6 sm:px-8" align="start" chips />
                </Magnetic>
              </div>
            </motion.div>

            {/* Live proof strip: real Play Store apps, not a stat repeat */}
            <motion.div variants={heroElementFadeUp}>
              <p className="flex flex-wrap items-center justify-center lg:justify-start gap-x-1.5 gap-y-1 text-xs text-muted-foreground">
                <Play className="w-3.5 h-3.5 text-success" aria-hidden="true" />
                <span>
                  {playStoreApps.map((app, i) => (
                    <span key={app.slug}>
                      {i > 0 && " · "}
                      <a
                        href={app.demo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-foreground underline-offset-4 hover:text-primary hover:underline"
                      >
                        {app.shortTitle ?? app.title}
                      </a>
                    </span>
                  ))}{" "}
                  live on Google Play
                </span>
              </p>
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
                      className={`text-muted-foreground ${social.hoverClass} transition-interaction duration-200 hover:scale-110 transform`}
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
              {/* Ambient background glow — gradient instead of a 64px blur filter */}
              <div
                aria-hidden="true"
                className="absolute w-56 h-56 sm:w-72 sm:h-72 rounded-full pointer-events-none -z-10"
                style={{
                  background:
                    "radial-gradient(circle at center, oklch(var(--primary) / 0.22) 0%, oklch(var(--accent) / 0.12) 45%, transparent 72%)",
                }}
              />

              {/* Showcase Frame */}
              <div className="relative group">
                <div className="relative p-1.5 rounded-full bg-gradient-to-b from-primary/40 via-accent/30 to-border/40 shadow-xl">
                  <div className="w-48 h-48 sm:w-60 sm:h-60 md:w-72 md:h-72 lg:w-80 lg:h-80 rounded-full overflow-hidden bg-background ring-4 ring-background/60 shadow-inner">
                    <picture>
                      <source
                        type="image/webp"
                        srcSet="/images/personal-image-320.webp 320w, /images/personal-image-640.webp 640w, /images/personal-image-960.webp 960w"
                        sizes="(min-width: 1024px) 320px, (min-width: 768px) 288px, (min-width: 640px) 240px, 192px"
                      />
                      {/* `fetchpriority` stays lowercase: React 18 exposes the
                          DOM attribute that way and the camelCase alias only
                          landed in React 19. Wrong casing warns and is dropped. */}
                      <img
                        src="/images/personal-image-640.webp"
                        alt="Ahmed Shaban"
                        width={640}
                        height={640}
                        className="w-full h-full object-cover rounded-full transition-transform duration-500 group-hover:scale-105 select-none"
                        loading="eager"
                        decoding="async"
                        fetchpriority="high"
                      />
                    </picture>
                  </div>
                </div>

                {/* Floating Badge 1: Live on Google Play (differentiated proof; the 10+ stat lives in About)
                    Hidden below `sm`: at 192px the photo is narrower than either
                    badge, so the pair covered the subject's face and overlapped
                    each other. The proof they carry is already in the About
                    metrics and the Play strip below. */}
                <motion.div
                  variants={heroBadgeFadeIn}
                  className="hidden sm:flex absolute sm:top-[22%] sm:-left-16 md:-left-20 lg:-left-24 bg-background/95 border border-border/60 shadow-xl rounded-2xl px-3.5 py-2.5 items-center gap-3 z-20 whitespace-nowrap"
                >
                  <div className="p-1.5 rounded-lg bg-success/10 text-success">
                    <Play className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-foreground leading-tight">{playAppsLabel}</p>
                    <p className="text-[10px] text-muted-foreground">On Google Play</p>
                  </div>
                </motion.div>

                {/* Floating Badge 2: Cross-Platform Specialist (Desktop & Tablet only, static for 90Hz idle)
                    Anchored to hang under the lower-right rim. `bottom-4` kept the
                    whole badge inside the circle, where it sat across the subject's
                    chin at every width >= 640px.
                    Below `lg` the layout is one column, so the text column (and the
                    "Available for new opportunities" pill) sits directly beneath the
                    photo and the hanging badge covered it. The pill's row is only
                    ~46px below the rim, less than this badge is tall, so no offset
                    clears both: -bottom-5 keeps a 20px gap to the pill and confines
                    the remaining overlap to the circle's bottom rim, clear of the
                    face. At `lg` the text moves beside the photo, so the badge hangs
                    the full -bottom-11 again with nothing to collide with. */}
                <motion.div
                  variants={heroBadgeFadeIn}
                  className="hidden sm:flex absolute -bottom-5 -right-6 lg:-bottom-11 bg-background/95 border border-border/60 shadow-xl rounded-2xl px-3.5 py-2.5 items-center gap-3 z-20 whitespace-nowrap"
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
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;

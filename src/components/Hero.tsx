import { Github, Linkedin, Mail, Play, ArrowRight } from "lucide-react";
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
  const playAppsLabel = `${playAppsCount} App${playAppsCount === 1 ? "" : "s"}`;

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
    { icon: Github, href: "https://github.com/ahmedshaban-blip", label: "GitHub", hoverClass: "hover:text-accent-strong" },
    { icon: Linkedin, href: "https://www.linkedin.com/in/ahmed-shaban-front-cross", label: "LinkedIn", hoverClass: "hover:text-accent-strong" },
    { icon: WhatsAppIcon, href: whatsappUrl, label: "WhatsApp", hoverClass: "hover:text-success" },
    { icon: Mail, href: "mailto:ahmed.shabaan.dev@gmail.com", label: "Email", hoverClass: "hover:text-accent-strong" },
  ];

  // The one pill the reference leads with: a quiet outline, not a fill.
  const heroPill =
    "h-[52px] rounded-full px-8 text-[15px] font-medium transition-colors duration-300";

  return (
    <section id="home" className="relative overflow-hidden pb-20 pt-[72px] lg:pb-28">
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={heroSectionStagger}
          initial={reducedMotion ? "visible" : "hidden"}
          animate="visible"
          className="mx-auto flex max-w-3xl flex-col items-center pt-10 text-center lg:pt-16"
        >
          {/* Portrait: the reference leads with a circular bust on a lifted disc. */}
          <motion.div variants={heroElementFadeUp}>
            <div className="relative">
              <div
                aria-hidden="true"
                className="uv-orb left-1/2 top-1/2 h-[128%] w-[128%] -translate-x-1/2 -translate-y-1/2"
              />
              <div className="relative h-[168px] w-[168px] overflow-hidden rounded-full bg-secondary p-1 ring-1 ring-border/70 sm:h-[196px] sm:w-[196px] lg:h-[231px] lg:w-[231px]">
                <picture>
                  <source
                    type="image/webp"
                    srcSet="/images/personal-image-320.webp 320w, /images/personal-image-640.webp 640w, /images/personal-image-960.webp 960w"
                    sizes="(min-width: 1024px) 231px, (min-width: 640px) 196px, 168px"
                  />
                  {/* `fetchpriority` stays lowercase: React 18 exposes the DOM
                      attribute that way and the camelCase alias only landed in
                      React 19. Wrong casing warns and is dropped. */}
                  <img
                    src="/images/personal-image-640.webp"
                    alt="Ahmed Shaban"
                    width={640}
                    height={640}
                    className="h-full w-full select-none rounded-full object-cover"
                    loading="eager"
                    decoding="async"
                    fetchpriority="high"
                  />
                </picture>
              </div>
            </div>
          </motion.div>

          <motion.div variants={heroElementFadeUp} className="mt-9">
            <StaggerReveal
              as="h1"
              mode="word"
              staggerDelay={0.06}
              delay={0.1}
              childVariants={heroWordRise}
              className="font-display text-[clamp(2.5rem,7.2vw,4rem)] font-bold leading-[1.05] tracking-tight text-foreground"
            >
              Ahmed Shaban!
            </StaggerReveal>
          </motion.div>

          <motion.p
            variants={heroElementFadeUp}
            className="mt-4 text-[clamp(1.2rem,3.2vw,1.7rem)] font-semibold leading-tight text-muted-foreground"
          >
            I do Code &amp; <span className="text-accent-strong">Chill</span>{" "}
            <span aria-hidden="true">🍿</span>
          </motion.p>

          <motion.p
            variants={heroElementFadeUp}
            className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-[1.0625rem]"
          >
            Passionate Software Engineer with a focus on Flutter and front-end development,
            dedicated to crafting elegant and user-friendly applications.
          </motion.p>

          <motion.div variants={heroElementFadeUp} className="mt-7">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-border/80 px-4 py-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75 [animation-iteration-count:3]" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
              </span>
              <span className="text-xs font-semibold tracking-wide text-muted-foreground sm:text-sm">
                Available for new opportunities
              </span>
            </div>
          </motion.div>

          {/* CTA: the reference's outline pill leads; the filled pill and the CV
              menu sit beside it rather than competing with it. */}
          <motion.div
            variants={heroElementFadeUp}
            className="mt-7 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center"
          >
            <Magnetic strength={0.2}>
              <Button
                variant="outline"
                // `outline`'s variant hover sets `hover:text-accent-foreground`,
                // which is black in dark and white in light — the label vanished
                // on its own hover fill in BOTH themes. `!` because both rules
                // have equal specificity and Tailwind's emit order is not
                // something a call site should depend on.
                className={`${heroPill} w-full border-border/80 bg-transparent text-foreground hover:border-primary/60 hover:bg-primary/10 hover:!text-foreground sm:w-auto`}
                onClick={() => scrollToSection("contact")}
              >
                Contact Me
              </Button>
            </Magnetic>

            <Magnetic strength={0.2}>
              <Button
                className={`${heroPill} w-full bg-primary text-primary-foreground shadow-none hover:bg-primary/90 sm:w-auto`}
                onClick={() => scrollToSection("projects")}
              >
                View Projects <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </Magnetic>

            <CVReadMenu className={`${heroPill} w-full sm:w-auto`} align="start" chips />
          </motion.div>

          <motion.p
            variants={heroElementFadeUp}
            className="mt-7 text-sm leading-relaxed text-muted-foreground sm:text-base"
          >
            Currently, I&apos;m a{" "}
            <span className="text-foreground">
              Front-end (ERP Next, React.js) and Flutter Developer
            </span>{" "}
            at <span className="text-accent-strong">Truck World</span>, Saudi Arabia.
          </motion.p>

          <motion.p
            variants={heroElementFadeUp}
            className="mt-3 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs font-medium text-muted-foreground"
          >
            <span className="rounded-full border border-border/60 px-3 py-1">
              Full-time · Truck World, Saudi Arabia
            </span>
            <span className="rounded-full border border-border/60 px-3 py-1">
              Cairo, Egypt (GMT+2) · Open to remote &amp; on-site
            </span>
          </motion.p>

          {/* Live proof strip: real Play Store apps, not a stat repeat */}
          <motion.div variants={heroElementFadeUp} className="mt-6">
            <p className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-xs text-muted-foreground">
              <Play className="h-3.5 w-3.5 text-success" aria-hidden="true" />
              <span>{playAppsLabel} live on Google Play:</span>
              <span>
                {playStoreApps.map((app, i) => (
                  <span key={app.slug}>
                    {i > 0 && " · "}
                    <a
                      href={app.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-foreground underline-offset-4 hover:text-accent-strong hover:underline"
                    >
                      {app.shortTitle ?? app.title}
                    </a>
                  </span>
                ))}
              </span>
            </p>
          </motion.div>

          <motion.div variants={heroElementFadeUp} className="mt-8">
            <div className="flex justify-center gap-6">
              {socials.map((social, i) => (
                <Magnetic key={i} strength={0.4} radius={100}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className={`text-muted-foreground ${social.hoverClass} transition-interaction duration-200 hover:scale-110 transform`}
                  >
                    <social.icon className="h-5 w-5" />
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

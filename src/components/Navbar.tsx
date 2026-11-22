import { useEffect, useState, useRef } from "react";
import { Menu, X, Moon, Sun, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { CVReadMenu } from "@/components/cv/CVReadMenu";
import { useAnimationContext } from "@/hooks/useAnimationContext";
import { motion, AnimatePresence } from "framer-motion";
import { useScrollSpy } from "@/hooks/use-scrollspy";
import { springTransition } from "@/lib/animation-variants";

const ModeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/15">
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-full hover:bg-primary/15 hover:text-accent-strong transition-interaction duration-300"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};

const ReducedMotionToggle = () => {
  const { reducedMotion, toggleReducedMotion } = useAnimationContext();

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "rounded-full hover:bg-primary/15 hover:text-accent-strong transition-interaction duration-300",
        reducedMotion && "bg-primary/15 text-accent-strong",
      )}
      onClick={toggleReducedMotion}
      title={reducedMotion ? "Enable animations" : "Toggle reduced motion"}
    >
      <Eye className="h-[1.2rem] w-[1.2rem]" />
      <span className="sr-only">{reducedMotion ? "Enable animations" : "Toggle reduced motion"}</span>
    </Button>
  );
};

const sectionIds = ["home", "about", "skills", "projects", "experience", "contact"];

const links = [
  { name: "About me", href: "#about" },
  { name: "Skills", href: "#skills" },
  { name: "Projects", href: "#projects" },
  { name: "Experience", href: "#experience" },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { reducedMotion } = useAnimationContext();
  const activeId = useScrollSpy(sectionIds);
  const scrollTick = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollTick.current) return;
      scrollTick.current = true;
      requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 40);
        scrollTick.current = false;
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // The reference's Contact control: an inverted pill (ink ground, page-colour
  // label), which flips to black-on-white in light mode without a second style.
  const contactPill =
    "inline-flex h-9 items-center rounded-lg bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-85";

  return (
    <header className="fixed inset-x-0 top-0 z-[100]">
      {/* PERFORMANCE: only paint properties transition. Animating `padding`
          (layout) for 500ms on a fixed header was the first-scroll jank. The bar
          is transparent over the hero and settles onto a blurred ground once the
          page moves, so the fan shows through at the top. */}
      <nav
        className={cn(
          "relative border-b transition-[background-color,border-color,box-shadow] duration-200",
          isScrolled
            ? "border-border/70 bg-background/95 shadow-[0_6px_22px_-14px_rgb(0_0_0/0.9)] backdrop-blur-md"
            : "border-transparent bg-transparent",
        )}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-[72px] items-center justify-between gap-4">
            {/* Wordmark: the reference's two-line lockup. */}
            <a
              href="#home"
              className="flex flex-col leading-none transition-opacity hover:opacity-80"
              aria-label="Ahmed Shaban — home"
            >
              <span className="font-display text-xl font-bold tracking-tight text-foreground">
                Ahmed
              </span>
              <span className="mt-1 text-[0.5rem] font-medium uppercase tracking-[0.45em] text-muted-foreground">
                Shaban
              </span>
            </a>

            {/* Desktop links with animated active indicator */}
            <div className="relative hidden items-center gap-7 lg:flex">
              {links.map((link) => {
                const isActive = activeId === link.href.slice(1);
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    className={cn(
                      "relative py-1 text-sm font-medium tracking-wide transition-colors",
                      isActive ? "text-accent-strong" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {link.name}
                    {isActive && !reducedMotion && (
                      <motion.div
                        layoutId="navbar-indicator"
                        className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-primary"
                        transition={springTransition}
                      />
                    )}
                    {isActive && reducedMotion && (
                      <span
                        aria-hidden="true"
                        className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-primary"
                      />
                    )}
                  </a>
                );
              })}
            </div>

            {/* Desktop actions: quiet controls, then the reference's Contact pill. */}
            <div className="hidden items-center gap-2 md:flex">
              <ReducedMotionToggle />
              <ModeToggle />
              <CVReadMenu className="h-9 px-4 text-sm" />
              <a href="#contact" className={contactPill}>
                Contact
              </a>
            </div>

            {/* Mobile menu icon */}
            <div className="flex items-center gap-1 md:hidden">
              <ReducedMotionToggle />
              <ModeToggle />
              <button
                className="rounded-full p-2 text-foreground transition-colors hover:bg-primary/15"
                onClick={() => setIsOpen(!isOpen)}
                aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={isOpen}
                aria-controls="mobile-nav-menu"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={reducedMotion ? {} : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? {} : { opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-x-0 top-full z-[110] border-b border-border/70 bg-background p-8 shadow-2xl md:hidden"
              id="mobile-nav-menu"
            >
              <div className="flex flex-col gap-6">
                {links.map((link) => {
                  const isActive = activeId === link.href.slice(1);
                  return (
                    <a
                      key={link.name}
                      href={link.href}
                      className={cn(
                        "border-b border-border/40 py-2 text-center text-xl font-bold transition-colors last:border-none",
                        isActive ? "text-accent-strong" : "text-foreground hover:text-accent-strong",
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      {link.name}
                    </a>
                  );
                })}

                <a
                  href="#contact"
                  className="mt-1 flex h-12 items-center justify-center rounded-lg bg-foreground text-base font-medium text-background"
                  onClick={() => setIsOpen(false)}
                >
                  Contact
                </a>

                <div className="grid grid-cols-1 gap-3" role="group" aria-label="CV actions">
                  <CVReadMenu
                    className="h-12 w-full text-base"
                    onAction={() => setIsOpen(false)}
                    chips
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
};

export default Navbar;

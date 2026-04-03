import { useEffect, useState, useMemo, useRef } from "react";
import { Menu, X, Download, Moon, Sun, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { cn, downloadCV } from "@/lib/utils";
import { useAnimationContext } from "@/context/AnimationContext";
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
      <Button variant="outline" size="icon" className="rounded-full border-border glass-effect bg-background/50">
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="icon"
      className="rounded-full border-border glass-effect bg-background/50 hover:bg-primary/10 hover:text-primary transition-all duration-300"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-blue-400" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};

const ReducedMotionToggle = () => {
  const { reducedMotion, toggleReducedMotion } = useAnimationContext();

  return (
    <Button
      variant="outline"
      size="icon"
      className={cn(
        "rounded-full border-border glass-effect bg-background/50 hover:bg-primary/10 hover:text-primary transition-all duration-300",
        reducedMotion && "bg-amber-500/10 border-amber-500/30"
      )}
      onClick={toggleReducedMotion}
      title={reducedMotion ? "Enable animations" : "Reduce motion"}
    >
      <Eye className={cn("h-[1.2rem] w-[1.2rem]", reducedMotion ? "text-amber-500" : "text-foreground")} />
      <span className="sr-only">Toggle reduced motion</span>
    </Button>
  );
};

const sectionIds = ["home", "about", "skills", "projects", "experience", "contact"];

const links = [
  { name: "About", href: "#about" },
  { name: "Skills", href: "#skills" },
  { name: "Projects", href: "#projects" },
  { name: "Experience", href: "#experience" },
  { name: "Contact", href: "#contact" },
];

const handleDownloadCV = (type: "flutter" | "frontend") => {
  downloadCV(type);
};

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

  return (
    <header className="fixed top-6 left-0 right-0 z-[100] px-4">
      <nav className={cn(
        "max-w-6xl mx-auto transition-all duration-500 rounded-full border relative",
        isScrolled 
          ? "bg-background/95 backdrop-blur-xl border-border shadow-lg py-3 px-8" 
          : "bg-transparent border-transparent py-5 px-6"
      )}>
        <div className="flex items-center justify-between">
          <a href="#home" className="text-xl font-bold tracking-tighter whitespace-nowrap hover:opacity-80 transition-opacity">
            AHMED <span className="text-primary">SHABAN</span>
          </a>

          {/* Desktop links with animated active indicator */}
          <div className="hidden lg:flex items-center gap-6 relative">
            {links.map((link) => {
              const isActive = activeId === link.href.slice(1);
              return (
                <a
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors relative py-1",
                    isActive ? "text-foreground" : "text-muted-foreground hover:text-primary"
                  )}
                >
                  {link.name}
                  {isActive && !reducedMotion && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"
                      transition={springTransition}
                    />
                  )}
                </a>
              );
            })}
          </div>

          {/* Desktop action buttons */}
          <div className="hidden md:flex items-center gap-3">
            <ReducedMotionToggle />
            <ModeToggle />
            <Button
              size="sm"
              className="rounded-full bg-primary hover:bg-primary/90 text-white px-5 transition-all active:scale-95 shadow-md shadow-primary/20"
              onClick={() => handleDownloadCV("flutter")}
            >
              <Download className="w-4 h-4 mr-2" /> Flutter CV
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="rounded-full bg-background/50 backdrop-blur-sm px-5 border-border/60 hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-all duration-200 active:scale-95"
              onClick={() => handleDownloadCV("frontend")}
            >
              <Download className="w-4 h-4 mr-2" /> Frontend CV
            </Button>
          </div>

          {/* Mobile menu icon */}
          <div className="flex items-center gap-2 md:hidden">
            <ReducedMotionToggle />
            <ModeToggle />
            <button 
              className="text-foreground p-2 rounded-full hover:bg-accent transition-colors" 
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle Menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={reducedMotion ? {} : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? {} : { opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="absolute top-[calc(100%+1.5rem)] left-0 right-0 p-8 bg-background border border-border shadow-2xl rounded-[2rem] md:hidden z-[110]"
            >
               <div className="flex flex-col gap-6">
                  {links.map((link) => {
                    const isActive = activeId === link.href.slice(1);
                    return (
                      <a
                        key={link.name}
                        href={link.href}
                        className={cn(
                          "text-center text-xl font-bold transition-colors py-2 border-b border-border/50 last:border-none",
                          isActive ? "text-primary" : "text-foreground hover:text-primary"
                        )}
                        onClick={() => setIsOpen(false)}
                      >
                        {link.name}
                      </a>
                    );
                  })}
                  
                  <div className="grid grid-cols-1 gap-4 pt-6">
                    <Button
                      className="rounded-full bg-primary hover:bg-primary/90 text-white w-full h-14 text-lg font-bold transition-all active:scale-95 shadow-xl shadow-primary/20"
                      onClick={() => { handleDownloadCV("flutter"); setIsOpen(false); }}
                    >
                      <Download className="w-5 h-5 mr-2" /> Flutter CV
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-full bg-secondary border-border/60 text-foreground w-full h-14 text-lg font-bold hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-all duration-200 active:scale-95"
                      onClick={() => { handleDownloadCV("frontend"); setIsOpen(false); }}
                    >
                      <Download className="w-5 h-5 mr-2" /> Frontend CV
                    </Button>
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

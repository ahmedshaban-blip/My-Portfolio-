import { Suspense, lazy, useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";

// OPTIMIZE: below-fold sections ship in deferred chunks so the initial bundle
// stays Navbar + Hero (LCP). Min-height placeholders reserve space to keep CLS < 0.1.
const About = lazy(() => import("@/components/About"));
const Skills = lazy(() => import("@/components/Skills"));
const Projects = lazy(() => import("@/components/Projects"));
const Experience = lazy(() => import("@/components/Experience"));
const Contact = lazy(() => import("@/components/Contact"));
const Footer = lazy(() => import("@/components/Footer"));

const BelowFold = ({
  minHeight,
  children,
}: {
  minHeight: string;
  children: React.ReactNode;
}) => (
  <Suspense fallback={<div style={{ minHeight }} aria-hidden="true" />}>
    {children}
  </Suspense>
);

const BackToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setVisible(window.scrollY > 700);
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => {
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      }}
      className="fixed bottom-6 right-6 z-[90] rounded-full border border-border/60 bg-background/90 p-3 text-foreground shadow-xl backdrop-blur-md transition-all hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
    >
      <ArrowUp size={18} aria-hidden="true" />
    </button>
  );
};

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <BelowFold minHeight="60vh">
        <About />
      </BelowFold>
      <BelowFold minHeight="60vh">
        <Skills />
      </BelowFold>
      <BelowFold minHeight="120vh">
        <Projects />
      </BelowFold>
      <BelowFold minHeight="120vh">
        <Experience />
      </BelowFold>
      <BelowFold minHeight="80vh">
        <Contact />
      </BelowFold>
      <BelowFold minHeight="30vh">
        <Footer />
      </BelowFold>
      <BackToTop />
    </div>
  );
};

export default Index;

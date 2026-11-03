import { Suspense, lazy, memo, useEffect, useRef, useState } from "react";
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

/**
 * PERFORMANCE: `lazy()` only splits the chunk — its `import()` still fires on
 * the first render, so every section was parsed, mounted (~1,000 elements) and
 * decoded at page load, competing with the hero's LCP and entrance animation.
 * Mounting is now gated on the placeholder approaching the viewport.
 * The wrapper keeps the section id while unmounted so `#anchor` navigation
 * still works before the real <section> exists.
 */
const BelowFold = ({
  id,
  minHeight,
  forceMount = false,
  children,
}: {
  id: string;
  minHeight: string;
  /** Render immediately (e.g. a deep link can only be satisfied by this section). */
  forceMount?: boolean;
  children: React.ReactNode;
}) => {
  const [mounted, setMounted] = useState(
    forceMount ||
      // A deep link / hash landing can only be satisfied by this section, so it
      // must exist before the browser resolves the scroll position.
      (typeof window !== "undefined" && window.location.hash === `#${id}`)
  );
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (mounted) return;
    if (!host || typeof IntersectionObserver === "undefined") {
      setMounted(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setMounted(true);
          observer.disconnect();
        }
      },
      // One viewport of headroom: mounts well before the user reaches it.
      { rootMargin: "900px 0px" }
    );
    observer.observe(host);
    return () => observer.disconnect();
  }, [mounted]);

  /**
   * PERFORMANCE/UX: `scroll-behavior: smooth` computes the destination once, so
   * a section that expands mid-scroll (placeholder → real content) makes the
   * jump land short. Mount as soon as a nav link for this section is clicked,
   * then re-assert the position once the layout has settled.
   */
  useEffect(() => {
    const anchor = `#${id}`;
    let settleTimer: number | undefined;

    const onClick = (event: MouseEvent) => {
      const target = (event.target as HTMLElement | null)?.closest?.(`a[href="${anchor}"]`);
      if (!target) return;
      setMounted(true);
      // A repeated click only moves the single pending correction forward.
      if (settleTimer !== undefined) window.clearTimeout(settleTimer);
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      // Re-assert once the smooth scroll has finished and the newly mounted
      // section has reported its real height.
      settleTimer = window.setTimeout(() => {
        settleTimer = undefined;
        document.getElementById(id)?.scrollIntoView({ behavior: "auto", block: "start" });
      }, 700);
    };

    // Any deliberate user scroll cancels the pending correction so it never
    // fights someone who started scrolling on their own.
    const cancelSettle = () => {
      if (settleTimer === undefined) return;
      window.clearTimeout(settleTimer);
      settleTimer = undefined;
    };
    const onUserScroll = (event: Event) => {
      if (event.isTrusted) cancelSettle();
    };

    document.addEventListener("click", onClick, true);
    window.addEventListener("wheel", onUserScroll, { passive: true });
    window.addEventListener("touchstart", onUserScroll, { passive: true });
    window.addEventListener("keydown", onUserScroll);
    return () => {
      cancelSettle();
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("wheel", onUserScroll);
      window.removeEventListener("touchstart", onUserScroll);
      window.removeEventListener("keydown", onUserScroll);
    };
  }, [id]);

  return (
    <div
      ref={hostRef}
      id={mounted ? undefined : id}
      style={mounted ? undefined : { minHeight }}
    >
      {mounted && (
        <Suspense fallback={<div id={id} style={{ minHeight }} aria-hidden="true" />}>{children}</Suspense>
      )}
    </div>
  );
};

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
      className="fixed bottom-6 right-6 z-[90] rounded-full border border-border/60 bg-background p-3 text-foreground shadow-xl transition-colors hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
    >
      <ArrowUp size={18} aria-hidden="true" />
    </button>
  );
};

const Index = () => {
  // A shareable project link (?project=slug) is only meaningful once the
  // Projects section exists, so that section skips the deferred mount.
  const projectDeepLink =
    typeof window !== "undefined" && new URLSearchParams(window.location.search).has("project");

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <BelowFold id="about" minHeight="60vh">
        <About />
      </BelowFold>
      <BelowFold id="skills" minHeight="60vh">
        <Skills />
      </BelowFold>
      <BelowFold id="projects" minHeight="120vh" forceMount={projectDeepLink}>
        <Projects />
      </BelowFold>
      <BelowFold id="experience" minHeight="120vh">
        <Experience />
      </BelowFold>
      <BelowFold id="contact" minHeight="80vh">
        <Contact />
      </BelowFold>
      <BelowFold id="footer" minHeight="30vh">
        <Footer />
      </BelowFold>
      <BackToTop />
    </div>
  );
};

// PERFORMANCE: the page takes no props, so memoising it stops every
// `setSearchParams` navigation (Projects lightbox/tab) from reconciling the
// whole ~1,000-node page and replaying hero animations.
export default memo(Index);

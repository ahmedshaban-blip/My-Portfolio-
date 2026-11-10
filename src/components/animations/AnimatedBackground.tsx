import { useRef, useEffect, useMemo } from "react";
import { useAnimationContext } from "@/hooks/useAnimationContext";

const CODE_SNIPPETS = [
  "import { useState } from 'react';",
  "const [data, setData] = useState([]);",
  "useEffect(() => { ... }, []);",
  "Widget build(BuildContext context) {",
  "return Scaffold(body: ...);",
  "const api = axios.create();",
  "git commit -m 'feat: animations'",
  "npm run dev",
  "flutter pub get",
  "export default function App() {",
  "interface User { id: string; }",
  "await supabase.from('projects')",
  "const query = useQuery(['projects'])",
  "<motion.div animate={{ ... }} />",
  "class Calculator extends Cubit {",
  "StreamBuilder<Project>(...)",
];

// PERFORMANCE: Minimal background work for 90Hz foreground animations.
// Particles are disabled on narrow viewports — the static CSS mesh is enough there.
const isCompactViewport = () => typeof window !== "undefined" && window.innerWidth < 768;
const PARTICLE_COUNT = isCompactViewport() ? 0 : 5;
// PERFORMANCE: Cap DPR at 2 — enough crispness on Retina, half the fill cost of 3x.
const MAX_DPR = 1.5;
// PERFORMANCE: 20fps is enough for ambient background.
const FRAME_INTERVAL = 50;
/**
 * PERFORMANCE: the mesh is a smooth radial blur, so rasterizing it at half the
 * canvas resolution is visually identical while cutting the one-off fill cost
 * (3 × createRadialGradient + fillRect) by 4× — that fill used to be a
 * guaranteed long task during first paint.
 */
const MESH_SCALE = 0.5;
// PERFORMANCE: keep the very first mesh build out of the LCP / hero entrance window.
const START_DELAY_MS = 350;

const GRADIENTS_DARK = [
  { x: 0.2, y: 0.3, r: 0.35, color: "0.758 0.159 55.9" },
  { x: 0.8, y: 0.6, r: 0.3, color: "0.705 0.187 47.6" },
  { x: 0.5, y: 0.8, r: 0.25, color: "0.295 0.018 294.4" },
];

const GRADIENTS_LIGHT = [
  { x: 0.2, y: 0.3, r: 0.35, color: "0.553 0.174 38.4" },
  { x: 0.8, y: 0.6, r: 0.3, color: "0.646 0.194 41.1" },
  { x: 0.5, y: 0.8, r: 0.25, color: "0.913 0.009 84.6" },
];

/**
 * PERFORMANCE: the mesh gradient is static — it never drifts between frames.
 * Painting 3 full-screen radial gradients every frame was the single most
 * expensive part of the background loop, so it is rasterized once per
 * theme/size and blitted with a single drawImage() afterwards.
 */
function renderMesh(w: number, h: number, isDark: boolean, reducedMotion: boolean) {
  const mw = Math.max(1, Math.round(w * MESH_SCALE));
  const mh = Math.max(1, Math.round(h * MESH_SCALE));
  const layer = document.createElement("canvas");
  layer.width = mw;
  layer.height = mh;
  const lctx = layer.getContext("2d");
  if (!lctx) return null;

  for (const g of isDark ? GRADIENTS_DARK : GRADIENTS_LIGHT) {
    const px = mw * g.x;
    const py = mh * g.y;

    const grad = lctx.createRadialGradient(px, py, 0, px, py, mw * g.r);
    grad.addColorStop(0, `oklch(${g.color} / ${reducedMotion ? 0.025 : 0.05})`);
    grad.addColorStop(0.5, `oklch(${g.color} / 0.012)`);
    grad.addColorStop(1, `oklch(${g.color} / 0)`);

    lctx.fillStyle = grad;
    lctx.fillRect(0, 0, mw, mh);
  }

  return layer;
}

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { reducedMotion } = useAnimationContext();
  const lastFrameTimeRef = useRef<number>(0);
  const isAnimatingRef = useRef<boolean>(true);

  // Stale values read inside the animation loop without restarting it.
  const reducedMotionRef = useRef(reducedMotion);
  reducedMotionRef.current = reducedMotion;

  // Stable particles generated once
  const particles = useMemo(() => {
    return Array.from({ length: PARTICLE_COUNT }, () => ({
      text: CODE_SNIPPETS[Math.floor(Math.random() * CODE_SNIPPETS.length)],
      x: Math.random() * 100,
      y: Math.random() * 100,
      speed: 0.05 + Math.random() * 0.1,
      opacity: 0.03 + Math.random() * 0.08,
      offset: Math.random() * 100,
    }));
  }, []);

  // PERFORMANCE: Pre-compute font string to avoid recreation every frame
  const fontRef = useRef<string>("");

  // Cached mesh layer: rebuilt only when the theme or the canvas size changes.
  const meshRef = useRef<{
    layer: HTMLCanvasElement;
    isDark: boolean;
    w: number;
    h: number;
    reduced: boolean;
  } | null>(null);

  const invalidateMesh = () => {
    meshRef.current = null;
  };

  // Rebuild the mesh right after the theme class flips instead of waiting for
  // the next size-dependent check.
  useEffect(() => {
    const observer = new MutationObserver(invalidateMesh);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  // Main animation loop with frame throttling
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Compact viewport: no canvas is mounted at all — nothing to drive.
    if (particles.length === 0) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    fontRef.current = `600 ${12 * dpr}px 'JetBrains Mono', 'Fira Code', monospace`;

    let rafId = 0;
    let stopped = false;

    // PERFORMANCE: a `document.querySelector` per frame walked the whole tree
    // 20×/s forever. Track dialog state with an event-driven observer instead.
    let dialogOpen = !!document.querySelector('[role="dialog"][data-state="open"]');
    let dialogObserver: MutationObserver | undefined;
    if (typeof MutationObserver !== "undefined") {
      dialogObserver = new MutationObserver(() => {
        dialogOpen = !!document.querySelector('[role="dialog"][data-state="open"]');
      });
      dialogObserver.observe(document.body, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ["data-state"],
      });
    }

    const schedule = () => {
      if (stopped || rafId) return;
      rafId = requestAnimationFrame(draw);
    };

    const paint = (timestamp: number) => {
      const w = canvas.width;
      const h = canvas.height;
      const time = timestamp * 0.001;
      const speedScale = reducedMotionRef.current ? 0.2 : 1;

      const isDark = document.documentElement.classList.contains("dark");

      // 1. Blit the cached mesh layer (rebuild only on theme/size change)
      const cached = meshRef.current;
      if (
        !cached ||
        cached.isDark !== isDark ||
        cached.w !== w ||
        cached.h !== h ||
        cached.reduced !== reducedMotionRef.current
      ) {
        const layer = renderMesh(w, h, isDark, reducedMotionRef.current);
        meshRef.current = layer
          ? { layer, isDark, w, h, reduced: reducedMotionRef.current }
          : null;
      }

      ctx.clearRect(0, 0, w, h);
      if (meshRef.current) {
        ctx.drawImage(meshRef.current.layer, 0, 0, w, h);
      }

      // 2. Draw Floating Code Snippets (reduced count, optimized)
      ctx.font = fontRef.current;
      for (const p of particles) {
        const x = (p.x / 100) * w;
        const moveY = (time * p.speed * 50 * speedScale + (p.y / 100) * h) % h;

        // PERFORMANCE: Simplified fade calculation
        const fade = Math.sin(time * 0.5 + p.offset) * 0.5 + 0.5;
        const finalOpacity = p.opacity * fade * speedScale;

        ctx.fillStyle = isDark
          ? `oklch(0.973 0.009 67.7 / ${finalOpacity})`
          : `oklch(0.216 0.006 56 / ${finalOpacity})`;
        ctx.fillText(p.text, x, moveY);
      }
    };

    const draw = (timestamp: number) => {
      rafId = 0;
      // Hidden tab: keep the chain alive so it resumes when the tab returns.
      // Browsers stop servicing rAF while hidden, so the extra scheduling is
      // free — returning without re-scheduling used to kill the loop forever.
      if (document.hidden) {
        schedule();
        return;
      }

      // PERFORMANCE: Throttle to ~20fps.
      const elapsed = timestamp - lastFrameTimeRef.current;
      if (elapsed < FRAME_INTERVAL) {
        schedule();
        return;
      }
      lastFrameTimeRef.current = timestamp;

      // PERFORMANCE: Skip heavy gradient+text work while scrolling or while a
      // dialog is open. The loop is re-scheduled (not dropped) so it resumes.
      if (!isAnimatingRef.current || dialogOpen) {
        schedule();
        return;
      }

      paint(timestamp);
      schedule();
    };

    // PERFORMANCE: start after the hero is on screen — the first mesh
    // rasterization must not land inside the initial paint / LCP window.
    const startTimer = setTimeout(schedule, START_DELAY_MS);

    return () => {
      stopped = true;
      clearTimeout(startTimer);
      if (rafId) cancelAnimationFrame(rafId);
      dialogObserver?.disconnect();
      meshRef.current = null;
    };
  }, [particles]);

  // Canvas setup and resize handler
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Compact viewport: particles are off and the static CSS mesh covers the
    // background, so skip the full-screen canvas allocation entirely.
    if (particles.length === 0) return;

    const setupCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      // Update font after resize
      fontRef.current = `600 ${12 * dpr}px 'JetBrains Mono', 'Fira Code', monospace`;
    };

    setupCanvas();

    // PERFORMANCE: pause background work while user scrolls — scroll stays on compositor thread.
    let scrollTimer: ReturnType<typeof setTimeout>;
    const handleScroll = () => {
      isAnimatingRef.current = false;
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        if (!document.hidden) isAnimatingRef.current = true;
      }, 250);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    // PERFORMANCE: Debounced resize — DPR can change when the window moves
    // between displays, so re-read it on every rebuild.
    let resizeTimer: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(setupCanvas, 100);
    };
    window.addEventListener("resize", handleResize, { passive: true });

    // Pause animation when tab is hidden
    const handleVisibilityChange = () => {
      if (document.hidden) {
        isAnimatingRef.current = false;
      } else {
        isAnimatingRef.current = true;
        lastFrameTimeRef.current = 0; // Reset frame timer to avoid burst
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange, { passive: true });

    return () => {
      clearTimeout(resizeTimer);
      clearTimeout(scrollTimer);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      isAnimatingRef.current = false;
    };
  }, [particles]);

  // PERFORMANCE: No compositor hint on a full-screen canvas — avoids an extra layer.
  // Compact viewports render nothing: the static CSS mesh already covers the page,
  // so no full-screen canvas allocation is needed there.
  if (particles.length === 0) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
      style={{ opacity: 0.55 }}
    />
  );
}

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
const PARTICLE_COUNT = typeof window !== "undefined" && window.innerWidth < 768 ? 0 : 5;
// PERFORMANCE: Cap DPR at 1 — background is decorative.
const MAX_DPR = 1;
// PERFORMANCE: 20fps is enough for ambient background.
const FRAME_INTERVAL = 50;

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { reducedMotion } = useAnimationContext();
  const animRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);
  const isAnimatingRef = useRef<boolean>(true);

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

  // Main animation loop with frame throttling
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Mobile: keep the static CSS mesh only, skip canvas work entirely.
    if (particles.length === 0) {
      const ctx = canvas.getContext("2d", { alpha: true });
      ctx?.clearRect(0, 0, canvas.width || 1, canvas.height || 1);
      return;
    }
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Set font once
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    fontRef.current = `600 ${12 * dpr}px 'JetBrains Mono', 'Fira Code', monospace`;

    let rafId: number;

    const draw = (timestamp: number) => {
      // PERFORMANCE: Throttle to 30fps
      const elapsed = timestamp - lastFrameTimeRef.current;
      if (elapsed < FRAME_INTERVAL) {
        rafId = requestAnimationFrame(draw);
        return;
      }
      lastFrameTimeRef.current = timestamp;

      if (!isAnimatingRef.current) return;

      const w = canvas.width;
      const h = canvas.height;
      const time = Date.now() * 0.001;
      const speedScale = reducedMotion ? 0.2 : 1;

      ctx.clearRect(0, 0, w, h);

      const isDark = document.documentElement.classList.contains("dark");

      // 1. Draw Mesh Gradients (static — no per-frame drift for 90Hz idle)
      const gradients = isDark
        ? [
            { x: w * 0.2, y: h * 0.3, r: w * 0.35, hue: 160, saturation: 60, lightness: 45, offset: 0 },  // Emerald
            { x: w * 0.8, y: h * 0.6, r: w * 0.3, hue: 36, saturation: 85, lightness: 58, offset: 2 },   // Amber
            { x: w * 0.5, y: h * 0.8, r: w * 0.25, hue: 48, saturation: 70, lightness: 55, offset: 4 },  // Champagne Glow
          ]
        : [
            { x: w * 0.2, y: h * 0.3, r: w * 0.35, hue: 162, saturation: 70, lightness: 32, offset: 0 },
            { x: w * 0.8, y: h * 0.6, r: w * 0.3, hue: 32, saturation: 85, lightness: 45, offset: 2 },
            { x: w * 0.5, y: h * 0.8, r: w * 0.25, hue: 150, saturation: 15, lightness: 70, offset: 4 },
          ];

      for (const g of gradients) {
        const px = g.x;
        const py = g.y;

        const grad = ctx.createRadialGradient(px, py, 0, px, py, g.r);
        const s = g.saturation;
        const l = g.lightness;
        grad.addColorStop(0, `hsla(${g.hue}, ${s}%, ${l}%, ${reducedMotion ? 0.04 : 0.08})`);
        grad.addColorStop(0.5, `hsla(${g.hue}, ${s - 10}%, ${l - 15}%, 0.02)`);
        grad.addColorStop(1, `hsla(${g.hue}, ${s - 20}%, ${l - 20}%, 0)`);

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }

      // PERFORMANCE: Set font once per resize (outside particle loop)
      ctx.font = fontRef.current;

      // 2. Draw Floating Code Snippets (reduced count, optimized)
      for (const p of particles) {
        const x = (p.x / 100) * w;
        const moveY = (time * p.speed * 50 * speedScale + (p.y / 100) * h) % h;

        // PERFORMANCE: Simplified fade calculation
        const fade = Math.sin(time * 0.5 + p.offset) * 0.5 + 0.5;
        const finalOpacity = p.opacity * fade * speedScale;

        ctx.fillStyle = isDark
          ? `hsla(150, 8%, 90%, ${finalOpacity})`
          : `hsla(160, 15%, 22%, ${finalOpacity})`;
        ctx.fillText(p.text, x, moveY);
      }

      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [reducedMotion, particles]);

  // Canvas setup and resize handler
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    const setupCanvas = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      // Update font after resize
      fontRef.current = `600 ${12 * dpr}px 'JetBrains Mono', 'Fira Code', monospace`;
    };

    setupCanvas();

    // PERFORMANCE: Debounced resize
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
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      isAnimatingRef.current = false;
    };
  }, []);

  // PERFORMANCE: No compositor hint on a full-screen canvas — avoids an extra layer.
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
      style={{ opacity: 0.7 }}
    />
  );
}

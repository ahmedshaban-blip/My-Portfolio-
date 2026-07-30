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

// PERFORMANCE: Reduced particle count significantly
const PARTICLE_COUNT = typeof window !== "undefined" && window.innerWidth < 768 ? 4 : 8;
// PERFORMANCE: Lower DPR cap for better rendering performance
const MAX_DPR = 1.25;
// PERFORMANCE: Lower frame rate for background animations (25fps is enough)
const FRAME_INTERVAL = 40;

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

      // 1. Draw Mesh Gradients (simplified)
      const meshSpeed = reducedMotion ? 0 : 0.15;
      const gradients = isDark
        ? [
            { x: w * 0.2, y: h * 0.3, r: w * 0.35, hue: 38, saturation: 85, lightness: 62, offset: 0 },  // Gold
            { x: w * 0.8, y: h * 0.6, r: w * 0.3, hue: 24, saturation: 80, lightness: 55, offset: 2 },   // Copper/Amber
            { x: w * 0.5, y: h * 0.8, r: w * 0.25, hue: 42, saturation: 80, lightness: 58, offset: 4 },  // Warm Gold Glow
          ]
        : [
            { x: w * 0.2, y: h * 0.3, r: w * 0.35, hue: 220, saturation: 80, lightness: 60, offset: 0 },
            { x: w * 0.8, y: h * 0.6, r: w * 0.3, hue: 270, saturation: 70, lightness: 50, offset: 2 },
            { x: w * 0.5, y: h * 0.8, r: w * 0.25, hue: 200, saturation: 60, lightness: 40, offset: 4 },
          ];

      for (const g of gradients) {
        const px = g.x + Math.sin(time * meshSpeed + g.offset) * w * 0.08;
        const py = g.y + Math.cos(time * meshSpeed * 0.7 + g.offset) * h * 0.06;

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
          ? `hsla(240, 5%, 90%, ${finalOpacity})`
          : `hsla(220, 10%, 25%, ${finalOpacity})`;
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

  // PERFORMANCE: Use will-change to promote to a compositor layer
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
      style={{ opacity: 0.8, willChange: "transform" }}
    />
  );
}

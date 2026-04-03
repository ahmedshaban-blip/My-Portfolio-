import { useRef, useEffect, useCallback, useMemo } from "react";
import { useAnimationContext } from "@/context/AnimationContext";

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

// FIX #9: Responsive particle count for better mobile performance
const PARTICLE_COUNT = typeof window !== "undefined" && window.innerWidth < 768 ? 8 : 15;
// FIX #9: Lower DPR cap for better performance (was 2, now 1.5)
const MAX_DPR = 1.5;

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { reducedMotion } = useAnimationContext();
  const animRef = useRef<number>(0);

  // Use useMemo to generate stable particles
  const particles = useMemo(() => {
    return Array.from({ length: PARTICLE_COUNT }, () => ({
      text: CODE_SNIPPETS[Math.floor(Math.random() * CODE_SNIPPETS.length)],
      x: Math.random() * 100,
      y: Math.random() * 100,
      speed: 0.05 + Math.random() * 0.1,
      size: 10 + Math.random() * 6,
      opacity: 0.03 + Math.random() * 0.08,
      offset: Math.random() * 100,
    }));
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const time = Date.now() * 0.001;
    const speedScale = reducedMotion ? 0.2 : 1;

    ctx.clearRect(0, 0, w, h);

    // 1. Draw Mesh Gradients
    const meshSpeed = reducedMotion ? 0 : 0.15;
    const gradients = [
      { x: w * 0.2, y: h * 0.3, r: w * 0.35, hue: 220, offset: 0 },
      { x: w * 0.8, y: h * 0.6, r: w * 0.3, hue: 270, offset: 2 },
      { x: w * 0.5, y: h * 0.8, r: w * 0.25, hue: 200, offset: 4 },
    ];

    for (const g of gradients) {
      const px = g.x + Math.sin(time * meshSpeed + g.offset) * w * 0.08;
      const py = g.y + Math.cos(time * meshSpeed * 0.7 + g.offset) * h * 0.06;

      const grad = ctx.createRadialGradient(px, py, 0, px, py, g.r);
      grad.addColorStop(0, `hsla(${g.hue}, 80%, 60%, ${reducedMotion ? 0.05 : 0.12})`);
      grad.addColorStop(0.5, `hsla(${g.hue}, 70%, 50%, 0.03)`);
      grad.addColorStop(1, `hsla(${g.hue}, 60%, 40%, 0)`);

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    }

    // 2. Draw Floating Code Snippets
    ctx.font = `600 ${12 * (window.devicePixelRatio || 1)}px 'JetBrains Mono', 'Fira Code', monospace`;

    for (const p of particles) {
      const x = (p.x / 100) * w;
      const moveY = (time * p.speed * 50 * speedScale + (p.y / 100) * h) % h;

      const fade = Math.sin(time * 0.5 + p.offset) * 0.5 + 0.5;
      const finalOpacity = p.opacity * fade * speedScale;

      ctx.fillStyle = `hsla(213, 31%, 91%, ${finalOpacity})`;
      ctx.fillText(p.text, x, moveY);
    }

    animRef.current = requestAnimationFrame(draw);
  }, [reducedMotion, particles]);

  // FIX #1: Separate effect for draw function changes
  // Cancels old animation before starting new one when reducedMotion changes
  useEffect(() => {
    cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(draw);
  }, [draw]);

  // FIX #2 + #9: Main setup effect with visibility handling and optimized DPR
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };

    resize();
    window.addEventListener("resize", resize);

    // FIX #2: Pause animation when tab is hidden to save CPU/GPU
    const handleVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(animRef.current);
      } else {
        animRef.current = requestAnimationFrame(draw);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
      style={{ opacity: 0.8, willChange: "transform" }}
    />
  );
}

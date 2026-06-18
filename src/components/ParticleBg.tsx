import { useEffect, useRef } from "react";

interface Props { color?: string; density?: number; }

export function ParticleBg({ color = "#d4af37", density = 60 }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current!;
    const ctx = cv.getContext("2d")!;
    let raf = 0;
    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      cv.width = window.innerWidth * dpr;
      cv.height = window.innerHeight * dpr;
      cv.style.width = "100%";
      cv.style.height = "100%";
    };
    resize();
    window.addEventListener("resize", resize);
    const parts = Array.from({ length: density }, () => ({
      x: Math.random() * cv.width,
      y: Math.random() * cv.height,
      r: (Math.random() * 1.6 + 0.4) * dpr,
      vx: (Math.random() - 0.5) * 0.15 * dpr,
      vy: (Math.random() - 0.5) * 0.15 * dpr - 0.05,
      a: Math.random() * 0.6 + 0.2,
    }));
    const loop = () => {
      ctx.clearRect(0, 0, cv.width, cv.height);
      for (const p of parts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = cv.width;
        if (p.x > cv.width) p.x = 0;
        if (p.y < 0) p.y = cv.height;
        if (p.y > cv.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = p.a;
        ctx.shadowColor = color;
        ctx.shadowBlur = 8 * dpr;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, [color, density]);
  return <canvas ref={ref} className="pointer-events-none fixed inset-0 -z-10" aria-hidden />;
}

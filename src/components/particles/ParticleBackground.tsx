"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  radius: number;
  baseRadius: number;
  vx: number;
  vy: number;
  glow: number;
};

const PARTICLE_COUNT = 90;

const createParticle = (w: number, h: number): Particle => ({
  x: Math.random() * w,
  y: Math.random() * h,
  radius: Math.random() * 1.2 + 0.6,
  baseRadius: Math.random() * 1.2 + 0.6,
  vx: (Math.random() - 0.5) * 0.12,
  vy: (Math.random() - 0.5) * 0.12,
  glow: Math.random(),
});

const ParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrame: number;
    let particles: Particle[] = [];
    const pointer = { x: 0, y: 0, active: false };

    const setCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    const initParticles = () => {
      particles = Array.from({ length: PARTICLE_COUNT }, () =>
        createParticle(window.innerWidth, window.innerHeight),
      );
    };

    const draw = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.save();
      ctx.fillStyle = "rgba(5, 8, 15, 0.45)";
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.restore();

      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (pointer.active) {
          const dx = pointer.x - particle.x;
          const dy = pointer.y - particle.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            const force = (120 - dist) / 120;
            particle.vx -= (dx / dist) * 0.02 * force;
            particle.vy -= (dy / dist) * 0.02 * force;
            particle.radius = particle.baseRadius + force * 2;
          } else {
            particle.radius += (particle.baseRadius - particle.radius) * 0.05;
          }
        }

        if (particle.x < -32 || particle.x > window.innerWidth + 32) {
          particle.x = Math.random() * window.innerWidth;
        }
        if (particle.y < -32 || particle.y > window.innerHeight + 32) {
          particle.y = Math.random() * window.innerHeight;
        }

        ctx.beginPath();
        const gradient = ctx.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          18,
        );
        gradient.addColorStop(0, "rgba(247, 216, 160, 0.8)");
        gradient.addColorStop(0.6, "rgba(247, 216, 160, 0.12)");
        gradient.addColorStop(1, "transparent");
        ctx.fillStyle = gradient;
        ctx.arc(particle.x, particle.y, particle.radius * 10, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrame = requestAnimationFrame(draw);
    };

    const handlePointerMove = (event: PointerEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
    };

    const handlePointerLeave = () => {
      pointer.active = false;
    };

    const handleResize = () => {
      setCanvasSize();
      initParticles();
    };

    setCanvasSize();
    initParticles();
    draw();

    window.addEventListener("resize", handleResize);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-60"
      aria-hidden="true"
    />
  );
};

export default ParticleBackground;


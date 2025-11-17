"use client";

import { useEffect, useRef, useState } from "react";

type Particle = {
  x: number;
  y: number;
  radius: number;
  baseRadius: number;
  vx: number;
  vy: number;
  glow: number;
};

const PARTICLE_COUNT = typeof window !== "undefined" && window.innerWidth < 768 ? 20 : 90;

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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrame: number;
    let particles: Particle[] = [];
    const pointer = { x: 0, y: 0, active: false };
    let lastFrameTime = 0;
    let isScrolling = false;
    let scrollTimeout: NodeJS.Timeout;
    
    const getIsMobile = () => window.innerWidth < 768;
    const getTargetFPS = () => getIsMobile() ? 15 : 60;
    const getFrameInterval = () => 1000 / getTargetFPS();

    const setCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    const initParticles = () => {
      const particleCount = window.innerWidth < 768 ? 8 : 90;
      particles = Array.from({ length: particleCount }, () =>
        createParticle(window.innerWidth, window.innerHeight),
      );
    };

    const draw = (currentTime?: number) => {
      const isMobileDevice = getIsMobile();
      const frameInterval = getFrameInterval();
      
      // Throttle frame rate on mobile
      if (isMobileDevice && currentTime && currentTime - lastFrameTime < frameInterval) {
        animationFrame = requestAnimationFrame(draw);
        return;
      }
      if (currentTime) {
        lastFrameTime = currentTime;
      }

      // Pause animation while scrolling on mobile
      if (isMobileDevice && isScrolling) {
        animationFrame = requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.save();
      ctx.fillStyle = "rgba(5, 8, 15, 0.45)";
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.restore();
      
      particles.forEach((particle) => {
        // Slower movement on mobile
        const speedMultiplier = isMobileDevice ? 0.5 : 1;
        particle.x += particle.vx * speedMultiplier;
        particle.y += particle.vy * speedMultiplier;

        // Disable pointer interaction on mobile for performance
        if (!isMobileDevice && pointer.active) {
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
        } else {
          particle.radius += (particle.baseRadius - particle.radius) * 0.05;
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
          isMobileDevice ? 12 : 18, // Smaller radius on mobile
        );
        const opacity = isMobileDevice ? 0.2 : 0.8;
        const midOpacity = isMobileDevice ? 0.03 : 0.12;
        gradient.addColorStop(0, `rgba(247, 216, 160, ${opacity})`);
        gradient.addColorStop(0.6, `rgba(247, 216, 160, ${midOpacity})`);
        gradient.addColorStop(1, "transparent");
        ctx.fillStyle = gradient;
        ctx.arc(particle.x, particle.y, particle.radius * (isMobileDevice ? 6 : 10), 0, Math.PI * 2);
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

    const handleScroll = () => {
      if (getIsMobile()) {
        isScrolling = true;
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          isScrolling = false;
        }, 150);
      }
    };

    const handleResize = () => {
      setCanvasSize();
      initParticles();
    };

    setCanvasSize();
    initParticles();
    animationFrame = requestAnimationFrame(draw);

    window.addEventListener("resize", handleResize);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerleave", handlePointerLeave);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      cancelAnimationFrame(animationFrame);
      clearTimeout(scrollTimeout);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isMobile]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none fixed inset-0 z-0 h-full w-full ${isMobile ? "opacity-20" : "opacity-60"}`}
      aria-hidden="true"
    />
  );
};

export default ParticleBackground;


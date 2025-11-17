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

const createParticle = (w: number, h: number, isMobile: boolean = false): Particle => ({
  x: Math.random() * w,
  y: Math.random() * h,
  radius: Math.random() * 1.2 + 0.6,
  baseRadius: Math.random() * 1.2 + 0.6,
  // Much slower, more subtle movement on mobile
  vx: isMobile ? (Math.random() - 0.5) * 0.04 : (Math.random() - 0.5) * 0.12,
  vy: isMobile ? (Math.random() - 0.5) * 0.04 : (Math.random() - 0.5) * 0.12,
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
      const isMobileDevice = getIsMobile();
      particles = Array.from({ length: particleCount }, () =>
        createParticle(window.innerWidth, window.innerHeight, isMobileDevice),
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

      // Don't pause on mobile - let particles flow continuously
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.save();
      ctx.fillStyle = "rgba(5, 8, 15, 0.45)";
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.restore();
      
      // Use current time for smooth sine wave flow on mobile
      const time = currentTime || performance.now();
      const flowTime = time * 0.0003; // Slow time multiplier for gentle flow
      
      particles.forEach((particle, index) => {
        if (isMobileDevice) {
          // On mobile: subtle, slow flowing movement with gentle sine wave
          const flowX = Math.sin(flowTime + index * 0.5) * 0.3;
          const flowY = Math.cos(flowTime + index * 0.7) * 0.3;
          particle.x += particle.vx + flowX;
          particle.y += particle.vy + flowY;
        } else {
          // Desktop: normal movement with pointer interaction
          particle.x += particle.vx;
          particle.y += particle.vy;
          
          // Pointer interaction only on desktop
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
          } else {
            particle.radius += (particle.baseRadius - particle.radius) * 0.05;
          }
        }
        
        // Ensure radius returns to base on mobile
        if (isMobileDevice) {
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
        // Even more subtle opacity on mobile for gentle background flow
        const opacity = isMobileDevice ? 0.12 : 0.8;
        const midOpacity = isMobileDevice ? 0.02 : 0.12;
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

    const handleResize = () => {
      setCanvasSize();
      initParticles();
    };

    setCanvasSize();
    initParticles();
    animationFrame = requestAnimationFrame(draw);

    window.addEventListener("resize", handleResize);
    
    // Only add pointer events on desktop - mobile particles flow automatically
    if (!getIsMobile()) {
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerleave", handlePointerLeave);
    }
    // Remove scroll pause - let particles flow continuously on mobile
    // window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", handleResize);
      if (!getIsMobile()) {
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerleave", handlePointerLeave);
      }
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


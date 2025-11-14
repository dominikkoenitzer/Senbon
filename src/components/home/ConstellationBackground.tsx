"use client";

import { useEffect, useRef, useState } from "react";

type Star = {
  x: number;
  y: number;
  radius: number;
  brightness: number;
  twinkle: number;
  connections: number[];
  vx: number;
  vy: number;
};

const ConstellationBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const starsRef = useRef<Star[]>([]);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const mouseRef = useRef({ x: 0, y: 0, active: false });

  useEffect(() => {
    // Set mounted state to enable client-only rendering
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const setCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    const createStars = (): Star[] => {
      const starCount = 50;
      const stars: Star[] = [];
      
      // Create constellation pattern
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      
      for (let i = 0; i < starCount; i++) {
        const angle = (i / starCount) * Math.PI * 2;
        const radius = 200 + Math.random() * 300;
        const x = centerX + Math.cos(angle) * radius + (Math.random() - 0.5) * 150;
        const y = centerY + Math.sin(angle) * radius + (Math.random() - 0.5) * 150;
        
        stars.push({
          x: Math.max(50, Math.min(window.innerWidth - 50, x)),
          y: Math.max(50, Math.min(window.innerHeight - 50, y)),
          radius: Math.random() * 1.2 + 0.6,
          brightness: Math.random() * 0.5 + 0.5,
          twinkle: Math.random() * Math.PI * 2,
          connections: [],
          vx: (Math.random() - 0.5) * 0.05,
          vy: (Math.random() - 0.5) * 0.05,
        });
      }

      // Create constellation connections
      stars.forEach((star, i) => {
        const nearby: Array<{ index: number; dist: number }> = [];
        stars.forEach((other, j) => {
          if (i !== j) {
            const dx = star.x - other.x;
            const dy = star.y - other.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 280) {
              nearby.push({ index: j, dist });
            }
          }
        });
        // Connect to 2-4 nearest stars
        nearby.sort((a, b) => a.dist - b.dist);
        const connections = nearby.slice(0, Math.floor(Math.random() * 3) + 2);
        star.connections = connections.map(c => c.index);
      });

      return stars;
    };

    const draw = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      
      const stars = starsRef.current;
      
      // Draw connections with gradient
      stars.forEach((star) => {
        star.connections.forEach((connIndex) => {
          const connected = stars[connIndex];
          const gradient = ctx.createLinearGradient(star.x, star.y, connected.x, connected.y);
          gradient.addColorStop(0, "rgba(247, 216, 160, 0.12)");
          gradient.addColorStop(0.5, "rgba(247, 216, 160, 0.08)");
          gradient.addColorStop(1, "rgba(247, 216, 160, 0.12)");
          
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(star.x, star.y);
          ctx.lineTo(connected.x, connected.y);
          ctx.stroke();
        });
      });

      // Draw stars with mouse interaction
      stars.forEach((star) => {
        // Gentle drift
        star.x += star.vx;
        star.y += star.vy;
        
        // Mouse interaction
        if (mouseRef.current.active) {
          const dx = mouseRef.current.x - star.x;
          const dy = mouseRef.current.y - star.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            const force = (150 - dist) / 150;
            star.vx -= (dx / dist) * 0.01 * force;
            star.vy -= (dy / dist) * 0.01 * force;
          }
        }
        
        // Boundary check
        if (star.x < 0 || star.x > window.innerWidth) star.vx *= -1;
        if (star.y < 0 || star.y > window.innerHeight) star.vy *= -1;
        star.x = Math.max(0, Math.min(window.innerWidth, star.x));
        star.y = Math.max(0, Math.min(window.innerHeight, star.y));
        
        // Twinkle animation
        star.twinkle += 0.015;
        const twinkle = Math.sin(star.twinkle) * 0.4 + 0.6;
        const alpha = star.brightness * twinkle;

        // Outer glow
        const gradient = ctx.createRadialGradient(
          star.x,
          star.y,
          0,
          star.x,
          star.y,
          star.radius * 12,
        );
        gradient.addColorStop(0, `rgba(247, 216, 160, ${alpha * 0.5})`);
        gradient.addColorStop(0.4, `rgba(247, 216, 160, ${alpha * 0.2})`);
        gradient.addColorStop(0.8, `rgba(247, 216, 160, ${alpha * 0.05})`);
        gradient.addColorStop(1, "transparent");
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius * 12, 0, Math.PI * 2);
        ctx.fill();

        // Core star
        ctx.fillStyle = `rgba(247, 216, 160, ${alpha * 0.9})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Bright center
        ctx.fillStyle = `rgba(247, 216, 160, ${alpha})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius * 0.5, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    setCanvasSize();
    starsRef.current = createStars();
    draw();

    const handleResize = () => {
      setCanvasSize();
      starsRef.current = createStars();
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [mounted]);

  if (!mounted) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
      aria-hidden="true"
    />
  );
};

export default ConstellationBackground;

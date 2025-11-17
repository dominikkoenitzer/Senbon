"use client";

import { useEffect, useRef } from "react";

type Star = {
  x: number;
  y: number;
  originalX: number;
  originalY: number;
  radius: number;
  brightness: number;
  twinkle: number;
  connections: number[];
  vx: number;
  vy: number;
};

const ConstellationBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const starsRef = useRef<Star[]>([]);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const mouseRef = useRef({ x: 0, y: 0, active: false });

  useEffect(() => {
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
      const isMobile = window.innerWidth < 768;
      const starCount = isMobile ? 25 : 50; // Fewer stars on mobile for better performance
      const stars: Star[] = [];
      
      // Create constellation pattern
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const maxRadius = isMobile ? Math.min(window.innerWidth, window.innerHeight) * 0.4 : 500;
      
      for (let i = 0; i < starCount; i++) {
        const angle = (i / starCount) * Math.PI * 2;
        const radius = (maxRadius * 0.4) + Math.random() * (maxRadius * 0.6);
        const x = centerX + Math.cos(angle) * radius + (Math.random() - 0.5) * (isMobile ? 80 : 150);
        const y = centerY + Math.sin(angle) * radius + (Math.random() - 0.5) * (isMobile ? 80 : 150);
        
        const finalX = Math.max(30, Math.min(window.innerWidth - 30, x));
        const finalY = Math.max(30, Math.min(window.innerHeight - 30, y));
        stars.push({
          x: finalX,
          y: finalY,
          originalX: finalX,
          originalY: finalY,
          radius: Math.random() * 1.2 + 0.6,
          brightness: Math.random() * 0.5 + 0.5,
          twinkle: Math.random() * Math.PI * 2,
          connections: [],
          vx: 0,
          vy: 0,
        });
      }

      // Create constellation connections
      const connectionDistance = isMobile ? 180 : 280; // Shorter connections on mobile
      stars.forEach((star, i) => {
        const nearby: Array<{ index: number; dist: number }> = [];
        stars.forEach((other, j) => {
          if (i !== j) {
            const dx = star.x - other.x;
            const dy = star.y - other.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < connectionDistance) {
              nearby.push({ index: j, dist });
            }
          }
        });
        // Connect to 2-4 nearest stars (fewer on mobile)
        nearby.sort((a, b) => a.dist - b.dist);
        const maxConnections = isMobile ? 2 : 4;
        const connections = nearby.slice(0, Math.floor(Math.random() * (maxConnections - 1)) + 2);
        star.connections = connections.map(c => c.index);
      });

      return stars;
    };

    const draw = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      
      const stars = starsRef.current;
      
      // Draw connections with gradient
      const isMobile = window.innerWidth < 768;
      stars.forEach((star) => {
        star.connections.forEach((connIndex) => {
          const connected = stars[connIndex];
          const gradient = ctx.createLinearGradient(star.x, star.y, connected.x, connected.y);
          // Slightly more visible on mobile
          const opacity = isMobile ? 0.15 : 0.12;
          const midOpacity = isMobile ? 0.1 : 0.08;
          gradient.addColorStop(0, `rgba(247, 216, 160, ${opacity})`);
          gradient.addColorStop(0.5, `rgba(247, 216, 160, ${midOpacity})`);
          gradient.addColorStop(1, `rgba(247, 216, 160, ${opacity})`);
          
          ctx.strokeStyle = gradient;
          ctx.lineWidth = isMobile ? 0.6 : 0.8;
          ctx.beginPath();
          ctx.moveTo(star.x, star.y);
          ctx.lineTo(connected.x, connected.y);
          ctx.stroke();
        });
      });

      // Draw stars with mouse interaction (desktop only)
      const isMobileDevice = window.innerWidth < 768;
      stars.forEach((star) => {
        // Mouse interaction - push away from cursor (desktop only)
        if (!isMobileDevice && mouseRef.current.active) {
          const dx = mouseRef.current.x - star.x;
          const dy = mouseRef.current.y - star.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            const force = (150 - dist) / 150;
            star.vx -= (dx / dist) * 0.08 * force;
            star.vy -= (dy / dist) * 0.08 * force;
          }
        }
        
        // Spring force - pull back to original position
        const springForce = 0.02;
        const springDamping = 0.7; // Strong friction - 30% velocity loss per frame
        const dx = star.originalX - star.x;
        const dy = star.originalY - star.y;
        star.vx += dx * springForce;
        star.vy += dy * springForce;
        
        // Apply damping to velocity (friction) - very strong friction
        star.vx *= springDamping;
        star.vy *= springDamping;
        
        // Stop movement when velocity is very small (settled) - more aggressive
        const velocityThreshold = 0.05;
        if (Math.abs(star.vx) < velocityThreshold && Math.abs(star.vy) < velocityThreshold) {
          // If very close to original position and low velocity, snap to rest
          const distToOriginal = Math.sqrt(dx * dx + dy * dy);
          if (distToOriginal < 1.0) {
            star.x = star.originalX;
            star.y = star.originalY;
            star.vx = 0;
            star.vy = 0;
          }
        }
        
        // Update position
        star.x += star.vx;
        star.y += star.vy;
        
        // Boundary check with bounce
        if (star.x < 0 || star.x > window.innerWidth) {
          star.vx *= -0.5;
          star.x = Math.max(0, Math.min(window.innerWidth, star.x));
        }
        if (star.y < 0 || star.y > window.innerHeight) {
          star.vy *= -0.5;
          star.y = Math.max(0, Math.min(window.innerHeight, star.y));
        }
        
        // Twinkle animation
        star.twinkle += 0.015;
        const twinkle = Math.sin(star.twinkle) * 0.4 + 0.6;
        const alpha = star.brightness * twinkle;

        // Outer glow - adjusted for mobile
        const glowRadius = isMobileDevice ? star.radius * 8 : star.radius * 12;
        const gradient = ctx.createRadialGradient(
          star.x,
          star.y,
          0,
          star.x,
          star.y,
          glowRadius,
        );
        // Slightly brighter on mobile for visibility
        const glowOpacity = isMobileDevice ? 0.6 : 0.5;
        gradient.addColorStop(0, `rgba(247, 216, 160, ${alpha * glowOpacity})`);
        gradient.addColorStop(0.4, `rgba(247, 216, 160, ${alpha * 0.2})`);
        gradient.addColorStop(0.8, `rgba(247, 216, 160, ${alpha * 0.05})`);
        gradient.addColorStop(1, "transparent");
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(star.x, star.y, glowRadius, 0, Math.PI * 2);
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

    const getIsMobile = () => window.innerWidth < 768;
    const isMobileDevice = getIsMobile();
    
    window.addEventListener("resize", handleResize);
    // Only add mouse events on desktop for better mobile performance
    if (!isMobileDevice) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseleave", handleMouseLeave);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener("resize", handleResize);
      // Check again in cleanup to ensure proper cleanup
      if (!getIsMobile()) {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
      aria-hidden="true"
    />
  );
};

export default ConstellationBackground;

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

// Componente para efeito de partículas
interface ParticlesProps {
  className?: string;
  count?: number;
  color?: string;
  size?: number;
  speed?: number;
}

export function Particles({ 
  className, 
  count = 50, 
  color = "hsl(var(--primary))", 
  size = 2,
  speed = 1 
}: ParticlesProps) {
  const [particles, setParticles] = useState<{ x: number; y: number; vx: number; vy: number; id: number }[]>([]);

  useEffect(() => {
    const initialParticles = Array.from({ length: count }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      vx: (Math.random() - 0.5) * speed,
      vy: (Math.random() - 0.5) * speed,
      id: i,
    }));
    
    setParticles(initialParticles);

    const interval = setInterval(() => {
      setParticles(prev => prev.map(particle => ({
        ...particle,
        x: (particle.x + particle.vx + 100) % 100,
        y: (particle.y + particle.vy + 100) % 100,
      })));
    }, 50);

    return () => clearInterval(interval);
  }, [count, speed]);

  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute rounded-full opacity-30 animate-pulse"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: size,
            height: size,
            backgroundColor: color,
            animationDuration: `${2 + Math.random() * 3}s`,
          }}
        />
      ))}
    </div>
  );
}

// Componente para efeito glow
interface GlowEffectProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
  intensity?: "low" | "medium" | "high";
  animated?: boolean;
}

export function GlowEffect({ 
  children, 
  className, 
  color = "hsl(var(--primary))", 
  intensity = "medium",
  animated = true 
}: GlowEffectProps) {
  const intensityMap = {
    low: "blur-sm opacity-30",
    medium: "blur-md opacity-50",
    high: "blur-lg opacity-70",
  };

  return (
    <div className={cn("relative", className)}>
      {children}
      <div 
        className={cn(
          "absolute inset-0 -z-10",
          intensityMap[intensity],
          animated && "animate-pulse"
        )}
        style={{
          background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        }}
      />
    </div>
  );
}

// Componente para efeito de reflexão
interface ReflectionEffectProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
}

export function ReflectionEffect({ 
  children, 
  className, 
  intensity = 0.3 
}: ReflectionEffectProps) {
  return (
    <div className={cn("relative", className)}>
      {children}
      <div 
        className="absolute top-full left-0 w-full h-full pointer-events-none"
        style={{
          background: `linear-gradient(to bottom, rgba(255,255,255,${intensity}) 0%, transparent 100%)`,
          transform: "scaleY(-1)",
          filter: "blur(1px)",
          opacity: 0.6,
        }}
      >
        <div className="w-full h-full overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}

// Componente para efeito parallax
interface ParallaxProps {
  children: React.ReactNode;
  className?: string;
  speed?: number;
  direction?: "vertical" | "horizontal";
}

export function Parallax({ 
  children, 
  className, 
  speed = 0.5,
  direction = "vertical" 
}: ParallaxProps) {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const rate = scrolled * -speed;
      setOffset(rate);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [speed]);

  const transform = direction === "vertical" 
    ? `translateY(${offset}px)` 
    : `translateX(${offset}px)`;

  return (
    <div className={cn("relative", className)}>
      <div 
        style={{ transform }}
        className="transition-transform duration-75 ease-out"
      >
        {children}
      </div>
    </div>
  );
}

// Componente para efeito de ondas
export function WaveEffect({ className }: { className?: string }) {
  return (
    <div className={cn("absolute bottom-0 left-0 w-full overflow-hidden", className)}>
      <svg
        className="relative block w-full h-16"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 320"
      >
        <path
          fill="url(#waveGradient)"
          d="M0,160L48,144C96,128,192,96,288,106.7C384,117,480,171,576,186.7C672,203,768,181,864,160C960,139,1056,117,1152,122.7C1248,128,1344,160,1392,176L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          className="animate-pulse"
        />
        <defs>
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary) / 0.1)" />
            <stop offset="50%" stopColor="hsl(var(--accent) / 0.1)" />
            <stop offset="100%" stopColor="hsl(var(--primary) / 0.1)" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

// Componente para efeito de grade animada
interface AnimatedGridProps {
  className?: string;
  color?: string;
  size?: number;
  opacity?: number;
}

export function AnimatedGrid({ 
  className, 
  color = "hsl(var(--border))", 
  size = 20,
  opacity = 0.1 
}: AnimatedGridProps) {
  return (
    <div className={cn("absolute inset-0 pointer-events-none", className)}>
      <div
        className="w-full h-full animate-pulse"
        style={{
          backgroundImage: `
            linear-gradient(${color} 1px, transparent 1px),
            linear-gradient(90deg, ${color} 1px, transparent 1px)
          `,
          backgroundSize: `${size}px ${size}px`,
          opacity,
        }}
      />
    </div>
  );
}

// Componente para efeito de aurora
export function AuroraEffect({ className }: { className?: string }) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      <div className="absolute inset-0 opacity-30">
        <div
          className="absolute inset-0 animate-pulse"
          style={{
            background: `
              radial-gradient(ellipse at top, hsl(var(--primary) / 0.3) 0%, transparent 50%),
              radial-gradient(ellipse at bottom, hsl(var(--accent) / 0.3) 0%, transparent 50%)
            `,
            animationDuration: "4s",
          }}
        />
        <div
          className="absolute inset-0 animate-pulse"
          style={{
            background: `
              radial-gradient(ellipse at left, hsl(var(--success) / 0.2) 0%, transparent 50%),
              radial-gradient(ellipse at right, hsl(var(--warning) / 0.2) 0%, transparent 50%)
            `,
            animationDuration: "6s",
            animationDelay: "2s",
          }}
        />
      </div>
    </div>
  );
}
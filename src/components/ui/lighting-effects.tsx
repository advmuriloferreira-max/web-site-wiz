import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LightingProps {
  children: React.ReactNode;
  className?: string;
  intensity?: 'subtle' | 'medium' | 'strong';
  color?: 'primary' | 'secondary' | 'accent' | 'white';
}

// Subtle Glow Effect
export function GlowEffect({ 
  children, 
  className, 
  intensity = 'medium',
  color = 'primary' 
}: LightingProps) {
  const glowIntensities = {
    subtle: 'shadow-lg',
    medium: 'shadow-xl',
    strong: 'shadow-2xl'
  };

  const glowColors = {
    primary: 'shadow-primary/25',
    secondary: 'shadow-secondary/25',
    accent: 'shadow-accent/25',
    white: 'shadow-white/25'
  };

  return (
    <motion.div
      className={cn(
        'relative',
        glowIntensities[intensity],
        glowColors[color],
        className
      )}
      whileHover={{
        boxShadow: color === 'primary' 
          ? '0 20px 60px -12px hsla(var(--primary), 0.4)'
          : '0 20px 60px -12px rgba(255,255,255,0.3)',
        scale: 1.02
      }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

// Mouse Shadow Casting
export function MouseShadowCaster({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    
    setMousePosition({ x, y });
  };

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden', className)}
      onMouseMove={handleMouseMove}
    >
      {/* Dynamic shadow overlay */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-300"
        style={{
          background: `
            radial-gradient(
              circle at ${50 + mousePosition.x * 30}% ${50 + mousePosition.y * 30}%,
              transparent 0%,
              rgba(0,0,0,0.1) 50%,
              rgba(0,0,0,0.2) 100%
            )
          `,
          transform: `translate(${mousePosition.x * 5}px, ${mousePosition.y * 5}px)`
        }}
      />
      
      {children}
    </div>
  );
}

// Ambient Lighting that changes with time
export function AmbientLighting({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  const [timeOfDay, setTimeOfDay] = useState('day');

  useEffect(() => {
    const updateTimeOfDay = () => {
      const hour = new Date().getHours();
      if (hour >= 6 && hour < 18) {
        setTimeOfDay('day');
      } else if (hour >= 18 && hour < 22) {
        setTimeOfDay('evening');
      } else {
        setTimeOfDay('night');
      }
    };

    updateTimeOfDay();
    const interval = setInterval(updateTimeOfDay, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const lightingStyles = {
    day: 'bg-gradient-to-br from-blue-50/30 to-yellow-50/30',
    evening: 'bg-gradient-to-br from-orange-50/30 to-purple-50/30',
    night: 'bg-gradient-to-br from-indigo-900/10 to-purple-900/10'
  };

  return (
    <div className={cn('relative', className)}>
      {/* Ambient overlay */}
      <div 
        className={cn(
          'absolute inset-0 pointer-events-none transition-all duration-1000',
          lightingStyles[timeOfDay as keyof typeof lightingStyles]
        )}
      />
      
      {children}
    </div>
  );
}

// Spotlight Effect for CTAs
export function SpotlightEffect({ 
  children, 
  className,
  active = true 
}: { 
  children: React.ReactNode; 
  className?: string;
  active?: boolean;
}) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { stiffness: 150, damping: 15, mass: 0.1 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  return (
    <motion.div
      className={cn('relative overflow-hidden rounded-xl', className)}
      onMouseMove={handleMouseMove}
      whileHover={active ? { scale: 1.02 } : {}}
    >
      {/* Spotlight */}
      {active && (
        <motion.div
          className="absolute inset-0 pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `
              radial-gradient(
                circle 200px at var(--mouse-x) var(--mouse-y),
                rgba(255,255,255,0.15) 0%,
                rgba(255,255,255,0.05) 30%,
                transparent 70%
              )
            `,
            '--mouse-x': x,
            '--mouse-y': y,
          } as React.CSSProperties}
        />
      )}
      
      {children}
    </motion.div>
  );
}

// Neon Effect
export function NeonEffect({ 
  children, 
  className,
  color = 'primary',
  intensity = 'medium'
}: LightingProps) {
  const neonColors = {
    primary: 'hsl(var(--primary))',
    secondary: 'hsl(var(--secondary))',
    accent: 'hsl(var(--accent))',
    white: '#ffffff'
  };

  const neonIntensities = {
    subtle: '0 0 5px currentColor, 0 0 10px currentColor',
    medium: '0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor',
    strong: '0 0 15px currentColor, 0 0 30px currentColor, 0 0 45px currentColor, 0 0 60px currentColor'
  };

  return (
    <motion.div
      className={cn('relative', className)}
      style={{
        color: neonColors[color],
        textShadow: neonIntensities[intensity],
        filter: `drop-shadow(${neonIntensities[intensity]})`
      }}
      animate={{
        textShadow: [
          neonIntensities[intensity],
          `${neonIntensities[intensity]}, 0 0 40px currentColor`,
          neonIntensities[intensity]
        ]
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        repeatType: 'reverse'
      }}
    >
      {children}
    </motion.div>
  );
}

// Holographic Effect
export function HolographicEffect({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  return (
    <motion.div
      className={cn('relative', className)}
      whileHover={{
        background: [
          'linear-gradient(45deg, transparent, rgba(255,0,150,0.1), transparent)',
          'linear-gradient(45deg, transparent, rgba(0,255,150,0.1), transparent)',
          'linear-gradient(45deg, transparent, rgba(150,0,255,0.1), transparent)',
        ]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        repeatType: 'reverse'
      }}
    >
      {/* Holographic overlay */}
      <div 
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background: `
            linear-gradient(
              45deg,
              transparent 30%,
              rgba(255,255,255,0.2) 50%,
              transparent 70%
            )
          `,
          backgroundSize: '200% 200%',
          animation: 'holographic 3s ease-in-out infinite'
        }}
      />
      
      {children}
    </motion.div>
  );
}
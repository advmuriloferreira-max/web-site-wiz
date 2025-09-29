import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassmorphismProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'subtle' | 'medium' | 'strong' | 'frost' | 'premium';
  animated?: boolean;
  gradient?: boolean;
  reflection?: boolean;
}

export function AdvancedGlassmorphism({
  children,
  className,
  variant = 'medium',
  animated = true,
  gradient = false,
  reflection = false
}: GlassmorphismProps) {
  const glassVariants = {
    subtle: 'bg-white/5 backdrop-blur-sm border border-white/10',
    medium: 'bg-white/10 backdrop-blur-md border border-white/20',
    strong: 'bg-white/20 backdrop-blur-lg border border-white/30',
    frost: 'bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] shadow-2xl',
    premium: 'bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-2xl border border-white/30'
  };

  const Component = animated ? motion.div : 'div';

  return (
    <Component
      className={cn(
        'relative rounded-xl overflow-hidden',
        glassVariants[variant],
        gradient && 'bg-gradient-to-br from-primary/10 to-secondary/10',
        reflection && 'before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:via-transparent before:to-transparent before:rounded-xl',
        className
      )}
      {...(animated && {
        whileHover: { 
          scale: 1.02,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        },
        transition: { type: "spring", stiffness: 300, damping: 30 }
      })}
    >
      {/* Frost Pattern Overlay */}
      {variant === 'frost' && (
        <div 
          className="absolute inset-0 opacity-30 rounded-xl"
          style={{
            background: `
              radial-gradient(circle at 20% 50%, rgba(255,255,255,0.2) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(255,255,255,0.15) 0%, transparent 50%),
              radial-gradient(circle at 40% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)
            `
          }}
        />
      )}
      
      {/* Animated Border Gradient */}
      {variant === 'premium' && (
        <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-primary/50 via-secondary/50 to-primary/50 animate-spin-slow opacity-50" />
      )}
      
      {/* Content */}
      <div className="relative z-10 p-6">
        {children}
      </div>
      
      {/* Reflection Effect */}
      {reflection && (
        <div className="absolute inset-x-0 -bottom-px h-24 bg-gradient-to-t from-current/5 to-transparent rounded-b-xl transform scale-y-[-1] opacity-30" />
      )}
    </Component>
  );
}

// Multi-layer Glass Card
export function MultiLayerGlass({ 
  children, 
  className,
  layers = 3 
}: { 
  children: React.ReactNode; 
  className?: string;
  layers?: number;
}) {
  return (
    <div className={cn('relative', className)}>
      {/* Background layers */}
      {Array.from({ length: layers }).map((_, i) => (
        <motion.div
          key={i}
          className={cn(
            'absolute inset-0 rounded-xl border',
            i === 0 && 'bg-white/20 backdrop-blur-xl border-white/30',
            i === 1 && 'bg-white/10 backdrop-blur-lg border-white/20 transform translate-x-1 translate-y-1',
            i === 2 && 'bg-white/5 backdrop-blur-md border-white/10 transform translate-x-2 translate-y-2'
          )}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1, duration: 0.5 }}
        />
      ))}
      
      {/* Content */}
      <div className="relative z-10 p-6">
        {children}
      </div>
    </div>
  );
}

// Floating Glass Modal
export function FloatingGlassModal({
  children,
  isOpen,
  onClose,
  className
}: {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}) {
  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
      />
      
      {/* Modal */}
      <motion.div
        className={cn(
          'relative max-w-lg w-full bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20',
          'shadow-2xl overflow-hidden',
          className
        )}
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 50 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Frost Effect */}
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            background: `
              radial-gradient(circle at 30% 20%, rgba(255,255,255,0.3) 0%, transparent 50%),
              radial-gradient(circle at 70% 80%, rgba(255,255,255,0.2) 0%, transparent 50%)
            `
          }}
        />
        
        {/* Animated border */}
        <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-primary/30 via-white/20 to-secondary/30 animate-pulse" />
        
        <div className="relative z-10">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}

// Glass Navigation
export function GlassNavigation({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <motion.nav
      className={cn(
        'bg-white/[0.08] backdrop-blur-2xl border border-white/[0.12]',
        'shadow-lg shadow-black/5 rounded-2xl',
        className
      )}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Ambient light effect */}
      <div 
        className="absolute inset-0 rounded-2xl opacity-60"
        style={{
          background: `
            linear-gradient(135deg, 
              rgba(255,255,255,0.1) 0%, 
              rgba(255,255,255,0.02) 50%, 
              rgba(255,255,255,0.05) 100%
            )
          `
        }}
      />
      
      <div className="relative z-10 p-4">
        {children}
      </div>
    </motion.nav>
  );
}
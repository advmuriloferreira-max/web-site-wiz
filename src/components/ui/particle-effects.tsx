import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { ParticleSystem } from '@/lib/particle-system';
import { cn } from '@/lib/utils';

interface ParticleCanvasProps {
  className?: string;
  type?: 'background' | 'loading' | 'confetti';
  particleCount?: number;
  autoStart?: boolean;
}

export interface ParticleCanvasRef {
  createConfetti: (x: number, y: number, count?: number) => void;
  start: () => void;
  stop: () => void;
}

export const ParticleCanvas = forwardRef<ParticleCanvasRef, ParticleCanvasProps>(
  ({ className, type = 'background', particleCount = 50, autoStart = true }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const systemRef = useRef<ParticleSystem | null>(null);

    useImperativeHandle(ref, () => ({
      createConfetti: (x: number, y: number, count = 30) => {
        systemRef.current?.createConfetti(x, y, count);
      },
      start: () => {
        systemRef.current?.start();
      },
      stop: () => {
        systemRef.current?.stop();
      }
    }));

    useEffect(() => {
      if (!canvasRef.current) return;

      const system = new ParticleSystem(canvasRef.current);
      systemRef.current = system;

      // Initialize based on type
      switch (type) {
        case 'background':
          system.createBackgroundParticles(particleCount);
          break;
        case 'loading':
          system.createLoadingParticles(particleCount);
          break;
        case 'confetti':
          // Confetti will be created via imperative API
          break;
      }

      if (autoStart) {
        system.start();
      }

      return () => {
        system.destroy();
      };
    }, [type, particleCount, autoStart]);

    return (
      <canvas
        ref={canvasRef}
        className={cn(
          'pointer-events-none absolute inset-0 w-full h-full',
          type === 'confetti' && 'pointer-events-auto z-50',
          className
        )}
        style={{ 
          mixBlendMode: type === 'background' ? 'multiply' : 'normal',
          filter: type === 'background' ? 'blur(0.5px)' : 'none'
        }}
      />
    );
  }
);

ParticleCanvas.displayName = 'ParticleCanvas';

// Hero Background with Particles
export function HeroParticleBackground({ children, className }: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  return (
    <div className={cn('relative overflow-hidden', className)}>
      <ParticleCanvas type="background" particleCount={30} />
      {children}
    </div>
  );
}

// Loading with Connected Particles
export function LoadingParticles({ className }: { className?: string }) {
  return (
    <div className={cn('relative w-full h-32', className)}>
      <ParticleCanvas type="loading" particleCount={15} />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Processando...</div>
      </div>
    </div>
  );
}

// Success Confetti Effect
export function SuccessConfetti({ 
  trigger, 
  onComplete,
  className 
}: { 
  trigger: boolean;
  onComplete?: () => void;
  className?: string;
}) {
  const particleRef = useRef<ParticleCanvasRef>(null);

  useEffect(() => {
    if (trigger && particleRef.current) {
      // Create confetti at random positions
      setTimeout(() => {
        particleRef.current?.createConfetti(
          Math.random() * window.innerWidth,
          Math.random() * window.innerHeight * 0.3,
          40
        );
      }, 100);

      setTimeout(() => {
        onComplete?.();
      }, 3000);
    }
  }, [trigger, onComplete]);

  return trigger ? (
    <ParticleCanvas
      ref={particleRef}
      type="confetti"
      className={cn('fixed inset-0 z-50 pointer-events-none', className)}
      autoStart={true}
    />
  ) : null;
}

// Mouse Trail Effect
export function MouseTrailEffect({ children, className }: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('relative', className)}>
      <ParticleCanvas 
        type="background" 
        particleCount={0}
        className="pointer-events-auto"
      />
      {children}
    </div>
  );
}
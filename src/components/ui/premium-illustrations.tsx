import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface IllustrationProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
}

const sizeClasses = {
  sm: 'w-24 h-24',
  md: 'w-32 h-32',
  lg: 'w-48 h-48',
  xl: 'w-64 h-64'
};

export function EmptyStateIllustration({ className, size = 'lg', animated = true }: IllustrationProps) {
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1] as any,
        staggerChildren: 0.1
      }
    }
  };

  const pathVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        duration: 1.5,
        ease: [0.4, 0, 0.2, 1] as any
      }
    }
  };

  return (
    <motion.div
      className={cn('flex items-center justify-center', sizeClasses[size], className)}
      variants={animated ? containerVariants : undefined}
      initial={animated ? "hidden" : undefined}
      animate={animated ? "visible" : undefined}
    >
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background Circle */}
        <motion.circle
          cx="100"
          cy="100"
          r="80"
          fill="hsl(var(--muted))"
          variants={animated ? pathVariants : undefined}
        />
        
        {/* Document Stack */}
        <motion.rect
          x="60"
          y="70"
          width="50"
          height="60"
          rx="4"
          fill="hsl(var(--background))"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          variants={animated ? pathVariants : undefined}
        />
        
        <motion.rect
          x="70"
          y="60"
          width="50"
          height="60"
          rx="4"
          fill="hsl(var(--background))"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          variants={animated ? pathVariants : undefined}
        />
        
        <motion.rect
          x="80"
          y="50"
          width="50"
          height="60"
          rx="4"
          fill="hsl(var(--card))"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          variants={animated ? pathVariants : undefined}
        />
        
        {/* Document Lines */}
        <motion.line
          x1="90"
          y1="70"
          x2="120"
          y2="70"
          stroke="hsl(var(--muted-foreground))"
          strokeWidth="2"
          strokeLinecap="round"
          variants={animated ? pathVariants : undefined}
        />
        
        <motion.line
          x1="90"
          y1="80"
          x2="115"
          y2="80"
          stroke="hsl(var(--muted-foreground))"
          strokeWidth="2"
          strokeLinecap="round"
          variants={animated ? pathVariants : undefined}
        />
        
        <motion.line
          x1="90"
          y1="90"
          x2="110"
          y2="90"
          stroke="hsl(var(--muted-foreground))"
          strokeWidth="2"
          strokeLinecap="round"
          variants={animated ? pathVariants : undefined}
        />
        
        {/* Floating Elements */}
        <motion.circle
          cx="160"
          cy="80"
          r="3"
          fill="hsl(var(--primary))"
          animate={animated ? {
            y: [0, -8, 0],
            opacity: [0.5, 1, 0.5]
          } : undefined}
          transition={animated ? {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          } : undefined}
        />
        
        <motion.circle
          cx="40"
          cy="120"
          r="2"
          fill="hsl(var(--secondary-foreground))"
          animate={animated ? {
            y: [0, -6, 0],
            opacity: [0.3, 0.8, 0.3]
          } : undefined}
          transition={animated ? {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          } : undefined}
        />
      </svg>
    </motion.div>
  );
}

export function LoadingIllustration({ className, size = 'md', animated = true }: IllustrationProps) {
  return (
    <motion.div
      className={cn('flex items-center justify-center', sizeClasses[size], className)}
      animate={animated ? { rotate: 360 } : undefined}
      transition={animated ? {
        duration: 2,
        repeat: Infinity,
        ease: "linear"
      } : undefined}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Ring */}
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="hsl(var(--muted))"
          strokeWidth="8"
          fill="none"
        />
        
        {/* Progress Ring */}
        <motion.circle
          cx="50"
          cy="50"
          r="45"
          stroke="hsl(var(--primary))"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="283"
          initial={{ strokeDashoffset: 283 }}
          animate={animated ? {
            strokeDashoffset: [283, 70, 283],
          } : undefined}
          transition={animated ? {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          } : undefined}
        />
        
        {/* Center Logo */}
        <motion.circle
          cx="50"
          cy="50"
          r="15"
          fill="hsl(var(--primary))"
          animate={animated ? {
            scale: [1, 1.1, 1],
            opacity: [1, 0.8, 1]
          } : undefined}
          transition={animated ? {
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          } : undefined}
        />
      </svg>
    </motion.div>
  );
}

export function ErrorIllustration({ className, size = 'lg', animated = true }: IllustrationProps) {
  const shakeVariants = {
    shake: {
      x: [0, -10, 10, -10, 10, 0],
      transition: {
        duration: 0.5,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div
      className={cn('flex items-center justify-center', sizeClasses[size], className)}
      variants={animated ? shakeVariants : undefined}
      animate={animated ? "shake" : undefined}
    >
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background */}
        <circle
          cx="100"
          cy="100"
          r="80"
          fill="hsl(var(--destructive) / 0.1)"
          stroke="hsl(var(--destructive) / 0.3)"
          strokeWidth="2"
        />
        
        {/* Warning Triangle */}
        <motion.path
          d="M100 60 L130 120 L70 120 Z"
          fill="hsl(var(--destructive))"
          initial={{ scale: 0 }}
          animate={animated ? { scale: 1 } : undefined}
          transition={animated ? {
            duration: 0.5,
            ease: "easeOut",
            delay: 0.2
          } : undefined}
        />
        
        {/* Exclamation Mark */}
        <motion.rect
          x="97"
          y="80"
          width="6"
          height="20"
          rx="3"
          fill="white"
          initial={{ opacity: 0 }}
          animate={animated ? { opacity: 1 } : undefined}
          transition={animated ? { delay: 0.4 } : undefined}
        />
        
        <motion.circle
          cx="100"
          cy="110"
          r="3"
          fill="white"
          initial={{ opacity: 0 }}
          animate={animated ? { opacity: 1 } : undefined}
          transition={animated ? { delay: 0.6 } : undefined}
        />
        
        {/* Floating Debris */}
        <motion.rect
          x="140"
          y="70"
          width="8"
          height="3"
          rx="1"
          fill="hsl(var(--destructive))"
          animate={animated ? {
            x: [140, 150, 140],
            y: [70, 75, 70],
            rotate: [0, 45, 0]
          } : undefined}
          transition={animated ? {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          } : undefined}
        />
        
        <motion.circle
          cx="60"
          cy="90"
          r="4"
          fill="hsl(var(--destructive))"
          animate={animated ? {
            x: [0, -10, 0],
            y: [0, -5, 0]
          } : undefined}
          transition={animated ? {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          } : undefined}
        />
      </svg>
    </motion.div>
  );
}

export function OnboardingIllustration({ className, size = 'xl', animated = true, step = 1 }: IllustrationProps & { step?: number }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const elementVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      className={cn('flex items-center justify-center', sizeClasses[size], className)}
      variants={animated ? containerVariants : undefined}
      initial={animated ? "hidden" : undefined}
      animate={animated ? "visible" : undefined}
    >
      <svg
        viewBox="0 0 300 200"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {step === 1 && (
          <>
            {/* Welcome Scene */}
            <motion.rect
              x="50"
              y="50"
              width="200"
              height="100"
              rx="8"
              fill="hsl(var(--card))"
              stroke="hsl(var(--border))"
              strokeWidth="2"
              variants={animated ? elementVariants : undefined}
            />
            
            <motion.text
              x="150"
              y="90"
              textAnchor="middle"
              className="text-sm font-semibold fill-primary"
              variants={animated ? elementVariants : undefined}
            >
              Bem-vindo ao INTELBANK
            </motion.text>
            
            <motion.text
              x="150"
              y="110"
              textAnchor="middle"
              className="text-xs fill-muted-foreground"
              variants={animated ? elementVariants : undefined}
            >
              Sua plataforma jurídica inteligente
            </motion.text>
          </>
        )}
        
        {step === 2 && (
          <>
            {/* Features Scene */}
            <motion.circle
              cx="100"
              cy="80"
              r="30"
              fill="hsl(var(--primary) / 0.1)"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              variants={animated ? elementVariants : undefined}
            />
            
            <motion.path
              d="M85 80 L95 90 L115 70"
              stroke="hsl(var(--primary))"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              variants={animated ? elementVariants : undefined}
            />
            
            <motion.circle
              cx="200"
              cy="80"
              r="30"
              fill="hsl(var(--secondary) / 0.1)"
              stroke="hsl(var(--secondary-foreground))"
              strokeWidth="2"
              variants={animated ? elementVariants : undefined}
            />
          </>
        )}
        
        {step === 3 && (
          <>
            {/* Success Scene */}
            <motion.path
              d="M150 60 L180 100 L120 100 Z"
              fill="hsl(var(--primary))"
              variants={animated ? elementVariants : undefined}
            />
            
            <motion.circle
              cx="150"
              cy="120"
              r="20"
              fill="hsl(var(--primary))"
              animate={animated ? {
                scale: [1, 1.2, 1],
                opacity: [1, 0.8, 1]
              } : undefined}
              transition={animated ? {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              } : undefined}
            />
          </>
        )}
      </svg>
    </motion.div>
  );
}

export function SuccessIllustration({ className, size = 'md', animated = true }: IllustrationProps) {
  return (
    <motion.div
      className={cn('flex items-center justify-center', sizeClasses[size], className)}
      initial={animated ? { scale: 0 } : undefined}
      animate={animated ? { scale: 1 } : undefined}
      transition={animated ? {
        duration: 0.5,
        ease: "easeOut"
      } : undefined}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.circle
          cx="50"
          cy="50"
          r="45"
          fill="hsl(var(--primary) / 0.1)"
          stroke="hsl(var(--primary))"
          strokeWidth="4"
          initial={animated ? { scale: 0 } : undefined}
          animate={animated ? { scale: 1 } : undefined}
          transition={animated ? { duration: 0.3 } : undefined}
        />
        
        <motion.path
          d="M30 50 L45 65 L70 35"
          stroke="hsl(var(--primary))"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={animated ? { pathLength: 0 } : undefined}
          animate={animated ? { pathLength: 1 } : undefined}
          transition={animated ? {
            duration: 0.6,
            delay: 0.2,
            ease: "easeOut"
          } : undefined}
        />
      </svg>
    </motion.div>
  );
}
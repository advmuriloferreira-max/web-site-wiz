import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LoadingIllustration } from './premium-illustrations';
import { AnimatedLoadingIcon, IntelbankLogoIcon } from './premium-icons';
import { cn } from '@/lib/utils';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'pulse' | 'skeleton' | 'illustration' | 'branded';
  text?: string;
  className?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12'
};

// Spinning loader
export function SpinnerLoader({ size = 'md', className }: LoadingProps) {
  return (
    <motion.div
      className={cn('inline-block border-2 border-muted rounded-full border-t-primary', sizeClasses[size], className)}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }}
    />
  );
}

// Pulsing dots
export function PulseLoader({ size = 'md', className }: LoadingProps) {
  const dotSize = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2',
    lg: 'w-3 h-3'
  };

  return (
    <div className={cn('flex space-x-1', className)}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={cn('bg-primary rounded-full', dotSize[size])}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
}

// Skeleton loader
export function SkeletonLoader({ className, variant = 'skeleton' }: LoadingProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <motion.div
        className="h-4 bg-muted rounded-md"
        animate={{
          opacity: [0.5, 1, 0.5]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="h-4 bg-muted rounded-md w-3/4"
        animate={{
          opacity: [0.5, 1, 0.5]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          delay: 0.2,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="h-4 bg-muted rounded-md w-1/2"
        animate={{
          opacity: [0.5, 1, 0.5]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          delay: 0.4,
          ease: "easeInOut"
        }}
      />
    </div>
  );
}

// Branded loader with INTELBANK logo
export function BrandedLoader({ size = 'lg', text, className }: LoadingProps) {
  return (
    <div className={cn('flex flex-col items-center space-y-4', className)}>
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.8, 1, 0.8]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <IntelbankLogoIcon size={size === 'sm' ? 32 : size === 'md' ? 48 : 64} />
      </motion.div>
      
      {text && (
        <motion.p
          className="text-sm text-muted-foreground text-center"
          animate={{
            opacity: [0.6, 1, 0.6]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        >
          {text}
        </motion.p>
      )}
      
      <PulseLoader size="sm" />
    </div>
  );
}

// Full page loading with backdrop
export function FullPageLoader({ text = "Carregando...", className }: LoadingProps) {
  return (
    <AnimatePresence>
      <motion.div
        className={cn(
          'fixed inset-0 bg-background/80 backdrop-blur-sm',
          'flex items-center justify-center z-50',
          className
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className="bg-card p-8 rounded-lg shadow-lg border"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <BrandedLoader text={text} />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Card loading state
export function CardLoader({ className }: LoadingProps) {
  return (
    <div className={cn('p-6 space-y-4', className)}>
      <motion.div
        className="h-6 bg-muted rounded-md w-1/3"
        animate={{
          opacity: [0.5, 1, 0.5]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <SkeletonLoader />
      <div className="flex space-x-2">
        <motion.div
          className="h-8 bg-muted rounded-md w-20"
          animate={{
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: 0.6,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="h-8 bg-muted rounded-md w-16"
          animate={{
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: 0.8,
            ease: "easeInOut"
          }}
        />
      </div>
    </div>
  );
}

// Table loading state
export function TableLoader({ rows = 5, columns = 4, className }: LoadingProps & { rows?: number; columns?: number }) {
  return (
    <div className={cn('space-y-3', className)}>
      {/* Header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <motion.div
            key={`header-${i}`}
            className="h-4 bg-muted rounded-md"
            animate={{
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.1,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <motion.div
              key={`cell-${rowIndex}-${colIndex}`}
              className="h-4 bg-muted rounded-md"
              animate={{
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: (rowIndex * columns + colIndex) * 0.05,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// Button loading state
export function ButtonLoader({ size = 'md', className }: LoadingProps) {
  return (
    <div className={cn('inline-flex items-center space-x-2', className)}>
      <SpinnerLoader size={size} />
      <motion.span
        className="text-sm"
        animate={{
          opacity: [0.7, 1, 0.7]
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        Processando...
      </motion.span>
    </div>
  );
}

// Main PremiumLoading component that combines all variants
export function PremiumLoading({ 
  variant = 'spinner', 
  size = 'md', 
  text, 
  className 
}: LoadingProps) {
  switch (variant) {
    case 'pulse':
      return <PulseLoader size={size} className={className} />;
    case 'skeleton':
      return <SkeletonLoader className={className} />;
    case 'illustration':
      return (
        <div className={cn('flex flex-col items-center space-y-4', className)}>
          <LoadingIllustration size={size} />
          {text && (
            <p className="text-sm text-muted-foreground text-center">{text}</p>
          )}
        </div>
      );
    case 'branded':
      return <BrandedLoader size={size} text={text} className={className} />;
    default:
      return <SpinnerLoader size={size} className={className} />;
  }
}
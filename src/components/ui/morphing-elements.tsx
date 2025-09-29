import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Check, Plus, X, Play, Pause, Heart, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface MorphingButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  loading?: boolean;
  success?: boolean;
  disabled?: boolean;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

// Morphing Button with Loading States
export function MorphingButton({
  children,
  className,
  onClick,
  loading = false,
  success = false,
  disabled = false,
  variant = 'default'
}: MorphingButtonProps) {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    if (disabled || loading) return;
    setIsClicked(true);
    onClick?.();
    setTimeout(() => setIsClicked(false), 200);
  };

  return (
    <motion.div
      className="relative overflow-hidden"
      animate={isClicked ? { scale: 0.95 } : { scale: 1 }}
      transition={{ duration: 0.1 }}
    >
      <Button
        variant={variant}
        className={cn(
          'relative transition-all duration-300',
          loading && 'cursor-not-allowed',
          success && 'bg-green-500 hover:bg-green-600 text-white',
          className
        )}
        onClick={handleClick}
        disabled={disabled || loading}
      >
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center space-x-2"
            >
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Processando...</span>
            </motion.div>
          ) : success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center space-x-2"
            >
              <Check className="w-4 h-4" />
              <span>Concluído!</span>
            </motion.div>
          ) : (
            <motion.div
              key="default"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </Button>
    </motion.div>
  );
}

// Contextual Morphing Icons
export function MorphingIcon({
  state,
  className,
  size = 24
}: {
  state: 'play' | 'pause' | 'like' | 'liked' | 'add' | 'remove' | 'star' | 'starred';
  className?: string;
  size?: number;
}) {
  const iconMap = {
    play: Play,
    pause: Pause,
    like: Heart,
    liked: Heart,
    add: Plus,
    remove: X,
    star: Star,
    starred: Star
  };

  const Icon = iconMap[state];

  return (
    <motion.div
      className={cn('inline-flex items-center justify-center', className)}
      key={state}
      initial={{ scale: 0, rotate: -90 }}
      animate={{ scale: 1, rotate: 0 }}
      exit={{ scale: 0, rotate: 90 }}
      transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
    >
      <Icon 
        size={size}
        className={cn(
          'transition-colors duration-200',
          (state === 'liked' || state === 'starred') && 'fill-current text-red-500',
          state === 'pause' && 'text-orange-500',
          state === 'play' && 'text-green-500'
        )}
      />
    </motion.div>
  );
}

// Expandable Container
export function MorphingContainer({
  children,
  expanded = false,
  className,
  expandedHeight = 'auto'
}: {
  children: React.ReactNode;
  expanded: boolean;
  className?: string;
  expandedHeight?: string | number;
}) {
  return (
    <motion.div
      className={cn('overflow-hidden', className)}
      animate={{
        height: expanded ? expandedHeight : 0,
        opacity: expanded ? 1 : 0
      }}
      transition={{
        duration: 0.5,
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
    >
      <motion.div
        initial={{ y: -20 }}
        animate={{ y: expanded ? 0 : -20 }}
        transition={{ delay: expanded ? 0.1 : 0 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

// Text to Number Morphing
export function MorphingNumber({
  value,
  duration = 1000,
  className,
  prefix = '',
  suffix = ''
}: {
  value: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const startValue = displayValue;
    const endValue = value;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (endValue - startValue) * easeOutCubic;
      
      setDisplayValue(Math.round(current));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }, [value, duration]);

  return (
    <motion.span
      className={className}
      key={value}
      initial={{ scale: 1.1, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {prefix}{displayValue.toLocaleString('pt-BR')}{suffix}
    </motion.span>
  );
}

// Card that morphs on hover
export function MorphingCard({
  children,
  className,
  hoverContent,
  expandOnHover = false
}: {
  children: React.ReactNode;
  className?: string;
  hoverContent?: React.ReactNode;
  expandOnHover?: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className={cn('relative overflow-hidden cursor-pointer', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      animate={{
        scale: isHovered && expandOnHover ? 1.05 : 1,
      }}
      transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
    >
      {/* Default content */}
      <motion.div
        animate={{
          opacity: hoverContent && isHovered ? 0 : 1,
          y: hoverContent && isHovered ? -20 : 0
        }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>

      {/* Hover content */}
      {hoverContent && (
        <motion.div
          className="absolute inset-0"
          animate={{
            opacity: isHovered ? 1 : 0,
            y: isHovered ? 0 : 20
          }}
          transition={{ duration: 0.3 }}
        >
          {hoverContent}
        </motion.div>
      )}
    </motion.div>
  );
}

// Fluid Shape Morphing
export function MorphingShape({
  shape = 'circle',
  className,
  children,
  animated = true
}: {
  shape: 'circle' | 'square' | 'rounded' | 'pill';
  className?: string;
  children?: React.ReactNode;
  animated?: boolean;
}) {
  const shapeStyles = {
    circle: 'rounded-full',
    square: 'rounded-none',
    rounded: 'rounded-lg',
    pill: 'rounded-full px-6'
  };

  return (
    <motion.div
      className={cn(
        'transition-all duration-500 ease-out',
        shapeStyles[shape],
        className
      )}
      {...(animated && {
        whileHover: { 
          borderRadius: shape === 'circle' ? '0%' : '50%',
          rotate: 5
        },
        whileTap: { scale: 0.95 }
      })}
    >
      {children}
    </motion.div>
  );
}
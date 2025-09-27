import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

// Hook para animações de entrada na viewport
export function useInViewAnimation(threshold = 0.1) {
  const [isInView, setIsInView] = useState(false);
  const [ref, setRef] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold }
    );

    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref, threshold]);

  return { ref: setRef, isInView };
}

// Hook para animações sequenciais
export function useSequentialAnimation(items: any[], delay = 100) {
  const [visibleItems, setVisibleItems] = useState(new Set<number>());

  useEffect(() => {
    items.forEach((_, index) => {
      setTimeout(() => {
        setVisibleItems(prev => new Set([...prev, index]));
      }, index * delay);
    });

    return () => setVisibleItems(new Set());
  }, [items, delay]);

  return visibleItems;
}

// Componente para animações de loading com skeleton
interface LoadingAnimationProps {
  lines?: number;
  className?: string;
  variant?: "card" | "table" | "text";
}

export function LoadingAnimation({ 
  lines = 3, 
  className, 
  variant = "text" 
}: LoadingAnimationProps) {
  if (variant === "card") {
    return (
      <div className={cn("animate-pulse space-y-4 p-6", className)}>
        <div className="flex items-center space-x-4">
          <div className="rounded-full bg-muted h-10 w-10 animate-shimmer"></div>
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-muted rounded animate-shimmer"></div>
            <div className="h-3 bg-muted rounded w-3/4 animate-shimmer"></div>
          </div>
        </div>
        <div className="space-y-3">
          {Array.from({ length: lines }).map((_, i) => (
            <div 
              key={i} 
              className="h-4 bg-muted rounded animate-shimmer"
              style={{ animationDelay: `${i * 100}ms` }}
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === "table") {
    return (
      <div className={cn("animate-pulse space-y-3", className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div 
            key={i} 
            className="flex items-center space-x-4 p-4"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="rounded-full bg-muted h-8 w-8 animate-shimmer"></div>
            <div className="h-4 bg-muted rounded flex-1 animate-shimmer"></div>
            <div className="h-4 bg-muted rounded w-20 animate-shimmer"></div>
            <div className="h-4 bg-muted rounded w-16 animate-shimmer"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("animate-pulse space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div 
          key={i} 
          className={cn(
            "h-4 bg-muted rounded animate-shimmer",
            i === lines - 1 ? "w-3/4" : "w-full"
          )}
          style={{ animationDelay: `${i * 100}ms` }}
        ></div>
      ))}
    </div>
  );
}

// Componente para animações de entrada
interface EntranceAnimationProps {
  children: React.ReactNode;
  animation?: "fade" | "slide" | "scale" | "bounce";
  delay?: number;
  duration?: number;
  className?: string;
}

export function EntranceAnimation({
  children,
  animation = "fade",
  delay = 0,
  duration = 300,
  className,
}: EntranceAnimationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const animationClasses = {
    fade: "animate-fade-in",
    slide: "animate-slide-up", 
    scale: "animate-scale-in",
    bounce: "animate-bounce-subtle",
  };

  return (
    <div
      className={cn(
        animationClasses[animation],
        !isVisible && "opacity-0",
        className
      )}
      style={{
        animationDuration: `${duration}ms`,
        animationDelay: `${delay}ms`,
        animationFillMode: "forwards",
      }}
    >
      {children}
    </div>
  );
}

// Componente para indicadores de progresso animados
interface ProgressIndicatorProps {
  progress: number;
  className?: string;
  showLabel?: boolean;
  variant?: "linear" | "circular";
}

export function ProgressIndicator({
  progress,
  className,
  showLabel = false,
  variant = "linear",
}: ProgressIndicatorProps) {
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayProgress(progress);
    }, 100);
    return () => clearTimeout(timer);
  }, [progress]);

  if (variant === "circular") {
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (displayProgress / 100) * circumference;

    return (
      <div className={cn("relative inline-flex items-center justify-center", className)}>
        <svg width="100" height="100" className="transform -rotate-90">
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="hsl(var(--muted))"
            strokeWidth="8"
            fill="transparent"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="hsl(var(--primary))"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        </svg>
        {showLabel && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-medium text-foreground">
              {Math.round(displayProgress)}%
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full progress-fill"
          style={{ width: `${displayProgress}%` }}
        />
      </div>
      {showLabel && (
        <div className="mt-1 text-sm text-muted-foreground">
          {Math.round(displayProgress)}%
        </div>
      )}
    </div>
  );
}
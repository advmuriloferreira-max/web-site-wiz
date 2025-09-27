import React from "react";
import { cn } from "@/lib/utils";

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: number | string;
}

export function ResponsiveGrid({ 
  children, 
  className, 
  cols = { default: 1, sm: 1, md: 2, lg: 3, xl: 4 },
  gap = 6 
}: ResponsiveGridProps) {
  const gridClasses = [
    cols.default && `grid-cols-${cols.default}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
    typeof gap === 'number' ? `gap-${gap}` : gap
  ].filter(Boolean).join(' ');

  return (
    <div className={cn("grid", gridClasses, className)}>
      {children}
    </div>
  );
}

interface ResponsiveColumnsProps {
  children: React.ReactNode;
  className?: string;
  breakpoint?: 'sm' | 'md' | 'lg' | 'xl';
}

export function ResponsiveColumns({ 
  children, 
  className, 
  breakpoint = 'md' 
}: ResponsiveColumnsProps) {
  const breakpointClasses = {
    sm: 'sm:flex-row sm:space-y-0 sm:space-x-6',
    md: 'md:flex-row md:space-y-0 md:space-x-6',
    lg: 'lg:flex-row lg:space-y-0 lg:space-x-6',
    xl: 'xl:flex-row xl:space-y-0 xl:space-x-6'
  };

  return (
    <div className={cn(
      "flex flex-col space-y-6",
      breakpointClasses[breakpoint],
      className
    )}>
      {children}
    </div>
  );
}

interface AdaptiveCardProps {
  children: React.ReactNode;
  className?: string;
  compact?: boolean;
}

export function AdaptiveCard({ children, className, compact = false }: AdaptiveCardProps) {
  return (
    <div className={cn(
      "bg-white rounded-xl border border-slate-200 shadow-sm",
      "transition-all duration-200 hover:shadow-md",
      compact 
        ? "p-3 sm:p-4 md:p-6" 
        : "p-4 sm:p-6 md:p-8",
      className
    )}>
      {children}
    </div>
  );
}

interface TouchTargetProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function TouchTarget({ 
  children, 
  className, 
  size = 'md',
  ...props 
}: TouchTargetProps) {
  const sizeClasses = {
    sm: 'min-h-[40px] min-w-[40px] p-2',
    md: 'min-h-[44px] min-w-[44px] p-3',
    lg: 'min-h-[48px] min-w-[48px] p-4'
  };

  return (
    <button
      className={cn(
        "flex items-center justify-center",
        "rounded-lg border border-transparent",
        "transition-all duration-200",
        "active:scale-95 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        "touch-manipulation", // Optimizes touch interactions
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
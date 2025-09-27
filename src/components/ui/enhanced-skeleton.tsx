import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "default" | "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export function EnhancedSkeleton({
  className,
  variant = "default",
  width,
  height,
  lines = 1,
}: SkeletonProps) {
  const baseClasses = "skeleton animate-shimmer bg-muted rounded";
  
  const variantClasses = {
    default: "h-4",
    text: "h-4",
    circular: "rounded-full",
    rectangular: "rounded-md",
  };

  const style = {
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : height,
  };

  if (variant === "text" && lines > 1) {
    return (
      <div className={cn("space-y-2", className)}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(
              baseClasses,
              variantClasses[variant],
              index === lines - 1 && "w-3/4" // Last line shorter
            )}
            style={index === 0 ? style : undefined}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        className
      )}
      style={style}
    />
  );
}

// Skeleton presets for common layouts
export function SkeletonCard() {
  return (
    <div className="animate-fade-in p-6 space-y-4">
      <div className="flex items-center space-x-4">
        <EnhancedSkeleton variant="circular" width={40} height={40} />
        <div className="space-y-2 flex-1">
          <EnhancedSkeleton className="h-4 w-3/4" />
          <EnhancedSkeleton className="h-3 w-1/2" />
        </div>
      </div>
      <EnhancedSkeleton variant="text" lines={3} />
      <div className="flex space-x-2 pt-4">
        <EnhancedSkeleton className="h-8 w-20" />
        <EnhancedSkeleton className="h-8 w-20" />
      </div>
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className="animate-fade-in space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex items-center space-x-4 p-4">
          <EnhancedSkeleton variant="circular" width={32} height={32} />
          <EnhancedSkeleton className="h-4 flex-1" />
          <EnhancedSkeleton className="h-4 w-20" />
          <EnhancedSkeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <div 
          key={index} 
          className="animate-fade-in p-6 border rounded-lg space-y-3"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="flex items-center justify-between">
            <EnhancedSkeleton className="h-4 w-24" />
            <EnhancedSkeleton variant="circular" width={16} height={16} />
          </div>
          <EnhancedSkeleton className="h-8 w-32" />
          <EnhancedSkeleton className="h-3 w-40" />
        </div>
      ))}
    </div>
  );
}
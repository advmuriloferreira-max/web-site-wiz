import * as React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "circular" | "rounded";
}

function PremiumSkeleton({ 
  className, 
  variant = "default",
  ...props 
}: SkeletonProps) {
  const variantClasses = {
    default: "rounded-md",
    circular: "rounded-full", 
    rounded: "rounded-lg"
  };

  return (
    <div
      className={cn(
        "animate-pulse bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 bg-[length:200%_100%]",
        variantClasses[variant],
        className
      )}
      style={{
        animation: "shimmer 2s infinite linear"
      }}
      {...props}
    />
  );
}

// Specialized skeleton components for common use cases
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-4">
      {/* Table Header */}
      <div className="flex space-x-4 p-4 border-b border-slate-200">
        {Array.from({ length: columns }).map((_, i) => (
          <PremiumSkeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      
      {/* Table Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4 p-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <PremiumSkeleton 
              key={colIndex} 
              className="h-4 flex-1" 
              style={{ 
                width: colIndex === 0 ? '25%' : colIndex === columns - 1 ? '15%' : 'auto'
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="p-6 space-y-4 border border-slate-200 rounded-lg">
      <div className="flex items-center space-x-4">
        <PremiumSkeleton variant="circular" className="h-12 w-12" />
        <div className="space-y-2 flex-1">
          <PremiumSkeleton className="h-4 w-3/4" />
          <PremiumSkeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <PremiumSkeleton className="h-3 w-full" />
        <PremiumSkeleton className="h-3 w-5/6" />
        <PremiumSkeleton className="h-3 w-4/6" />
      </div>
      <div className="flex space-x-2 pt-2">
        <PremiumSkeleton className="h-8 w-20" />
        <PremiumSkeleton className="h-8 w-16" />
      </div>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-6">
      {/* Form Title */}
      <div className="space-y-2">
        <PremiumSkeleton className="h-6 w-48" />
        <PremiumSkeleton className="h-4 w-96" />
      </div>

      {/* Form Fields */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <PremiumSkeleton className="h-4 w-32" />
          <PremiumSkeleton className="h-10 w-full" />
        </div>
      ))}

      {/* Form Actions */}
      <div className="flex space-x-3 pt-4">
        <PremiumSkeleton className="h-10 w-24" />
        <PremiumSkeleton className="h-10 w-20" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <PremiumSkeleton className="h-8 w-64" />
        <PremiumSkeleton className="h-4 w-96" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-6 border border-slate-200 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <PremiumSkeleton className="h-4 w-20" />
              <PremiumSkeleton variant="circular" className="h-8 w-8" />
            </div>
            <PremiumSkeleton className="h-8 w-16" />
            <PremiumSkeleton className="h-3 w-24" />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 border border-slate-200 rounded-lg space-y-4">
          <PremiumSkeleton className="h-6 w-48" />
          <PremiumSkeleton className="h-64 w-full" />
        </div>
        <div className="p-6 border border-slate-200 rounded-lg space-y-4">
          <PremiumSkeleton className="h-6 w-40" />
          <PremiumSkeleton className="h-64 w-full" />
        </div>
      </div>
    </div>
  );
}

export function ListSkeleton({ items = 8 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 border border-slate-200 rounded-lg">
          <PremiumSkeleton variant="circular" className="h-10 w-10" />
          <div className="space-y-2 flex-1">
            <PremiumSkeleton className="h-4 w-3/4" />
            <PremiumSkeleton className="h-3 w-1/2" />
          </div>
          <PremiumSkeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
}

// Add shimmer animation to global CSS
const shimmerStyles = `
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
`;

// Inject styles if not already present
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = shimmerStyles;
  document.head.appendChild(styleSheet);
}

export { 
  PremiumSkeleton,
  type SkeletonProps
};
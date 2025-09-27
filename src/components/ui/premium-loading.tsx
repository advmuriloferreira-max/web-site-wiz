import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2, Zap } from "lucide-react";

interface PremiumSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "default" | "lg";
  variant?: "default" | "brand";
}

export function PremiumSpinner({ 
  className, 
  size = "default", 
  variant = "default",
  ...props 
}: PremiumSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-6 w-6", 
    lg: "h-8 w-8"
  };

  const variantClasses = {
    default: "text-blue-600",
    brand: "text-gradient-to-r from-blue-500 to-blue-600"
  };

  return (
    <div className={cn("flex items-center justify-center", className)} {...props}>
      <Loader2 className={cn(
        "animate-spin",
        sizeClasses[size],
        variantClasses[variant]
      )} />
    </div>
  );
}

interface PremiumProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  progress: number;
  label?: string;
  showPercentage?: boolean;
  variant?: "default" | "success" | "warning" | "error";
}

export function PremiumProgressBar({ 
  progress, 
  label, 
  showPercentage = false,
  variant = "default",
  className,
  ...props 
}: PremiumProgressBarProps) {
  const variantClasses = {
    default: "from-blue-500 to-blue-600",
    success: "from-emerald-500 to-emerald-600",
    warning: "from-amber-500 to-amber-600", 
    error: "from-red-500 to-red-600"
  };

  return (
    <div className={cn("w-full space-y-2", className)} {...props}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center text-sm">
          {label && <span className="text-slate-700 font-medium">{label}</span>}
          {showPercentage && <span className="text-slate-600">{Math.round(progress)}%</span>}
        </div>
      )}
      <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
        <div 
          className={cn(
            "h-2.5 bg-gradient-to-r transition-all duration-500 ease-out rounded-full",
            variantClasses[variant]
          )}
          style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
        />
      </div>
    </div>
  );
}

interface LoadingStateProps extends React.HTMLAttributes<HTMLDivElement> {
  message?: string;
  spinner?: boolean;
  size?: "sm" | "default" | "lg";
}

export function LoadingState({ 
  message = "Carregando...", 
  spinner = true, 
  size = "default",
  className,
  ...props 
}: LoadingStateProps) {
  const sizeClasses = {
    sm: "p-4",
    default: "p-8",
    lg: "p-12"
  };

  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center space-y-4 text-center",
        sizeClasses[size],
        className
      )} 
      {...props}
    >
      {spinner && <PremiumSpinner size={size} variant="brand" />}
      <div className="space-y-1">
        <p className="text-slate-700 font-medium">{message}</p>
        <p className="text-sm text-slate-500">Aguarde alguns instantes</p>
      </div>
    </div>
  );
}

interface PulseLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "default" | "lg";
}

export function PulseLoader({ size = "default", className, ...props }: PulseLoaderProps) {
  const sizeClasses = {
    sm: "h-2 w-2",
    default: "h-3 w-3",
    lg: "h-4 w-4"
  };

  return (
    <div className={cn("flex items-center space-x-1", className)} {...props}>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className={cn(
            "bg-blue-600 rounded-full animate-pulse",
            sizeClasses[size]
          )}
          style={{ 
            animationDelay: `${i * 0.15}s`,
            animationDuration: '1s'
          }}
        />
      ))}
    </div>
  );
}

interface SkeletonLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  lines?: number;
  avatar?: boolean;
  width?: string | number;
  height?: string | number;
}

export function SkeletonLoader({ 
  lines = 3, 
  avatar = false, 
  width = "100%",
  height = "auto",
  className,
  ...props 
}: SkeletonLoaderProps) {
  return (
    <div 
      className={cn("animate-pulse space-y-3", className)} 
      style={{ width, height }}
      {...props}
    >
      {avatar && (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-slate-200 rounded-full" />
          <div className="space-y-2 flex-1">
            <div className="h-3 bg-slate-200 rounded w-1/4" />
            <div className="h-2 bg-slate-200 rounded w-1/6" />
          </div>
        </div>
      )}
      
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div 
            key={i}
            className="h-3 bg-slate-200 rounded"
            style={{ 
              width: i === lines - 1 ? '75%' : '100%' 
            }}
          />
        ))}
      </div>
    </div>
  );
}

interface BrandLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  message?: string;
}

export function BrandLoader({ message = "Carregando...", className, ...props }: BrandLoaderProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center space-y-4", className)} {...props}>
      <div className="relative">
        <div className="w-12 h-12 border-4 border-blue-200 rounded-full animate-spin">
          <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 rounded-full animate-spin" />
        </div>
        <Zap className="absolute inset-0 m-auto h-4 w-4 text-blue-600" />
      </div>
      
      <div className="text-center">
        <p className="text-sm font-medium text-slate-700">{message}</p>
        <div className="flex items-center justify-center space-x-1 mt-1">
          <PulseLoader size="sm" />
        </div>
      </div>
    </div>
  );
}
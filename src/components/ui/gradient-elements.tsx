import React from "react";
import { cn } from "@/lib/utils";

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "hero" | "rainbow" | "sunset" | "ocean";
}

export function GradientText({ 
  children, 
  className, 
  variant = "primary" 
}: GradientTextProps) {
  const gradients = {
    primary: "bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent",
    hero: "bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-800 bg-clip-text text-transparent",
    rainbow: "bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 bg-clip-text text-transparent",
    sunset: "bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 bg-clip-text text-transparent",
    ocean: "bg-gradient-to-r from-blue-400 via-cyan-500 to-teal-500 bg-clip-text text-transparent",
  };

  return (
    <span className={cn(gradients[variant], className)}>
      {children}
    </span>
  );
}

interface GradientBorderProps {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "rainbow" | "warm" | "cool";
  width?: number;
}

export function GradientBorder({ 
  children, 
  className, 
  variant = "primary",
  width = 2 
}: GradientBorderProps) {
  const gradients = {
    primary: "from-primary via-accent to-primary",
    rainbow: "from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500",
    warm: "from-orange-400 via-red-500 to-pink-500",
    cool: "from-blue-400 via-cyan-500 to-teal-500",
  };

  return (
    <div className={cn("relative", className)}>
      <div 
        className={cn(
          "absolute inset-0 rounded-lg bg-gradient-to-r",
          gradients[variant],
          "animate-pulse"
        )}
        style={{ padding: `${width}px` }}
      >
        <div className="h-full w-full bg-background rounded-lg">
          {children}
        </div>
      </div>
      <div className="relative">
        {children}
      </div>
    </div>
  );
}

interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "success" | "warning" | "error";
  size?: "sm" | "md" | "lg";
  glow?: boolean;
}

export function GradientButton({ 
  children, 
  className, 
  variant = "primary",
  size = "md",
  glow = false,
  ...props 
}: GradientButtonProps) {
  const variants = {
    primary: "bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary",
    secondary: "bg-gradient-to-r from-secondary to-secondary-hover hover:from-secondary-hover hover:to-secondary",
    success: "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700",
    warning: "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700",
    error: "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      className={cn(
        "rounded-lg font-medium text-white transition-all duration-300",
        "interactive-button focus-ring",
        variants[variant],
        sizes[size],
        glow && "shadow-lg hover:shadow-xl",
        glow && variant === "primary" && "hover:shadow-primary/50",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

interface GradientBackgroundProps {
  children: React.ReactNode;
  className?: string;
  variant?: "subtle" | "hero" | "warm" | "cool" | "dark";
}

export function GradientBackground({ 
  children, 
  className, 
  variant = "subtle" 
}: GradientBackgroundProps) {
  const variants = {
    subtle: "bg-gradient-to-br from-slate-50 via-white to-slate-100",
    hero: "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50",
    warm: "bg-gradient-to-br from-orange-50 via-red-50 to-pink-50",
    cool: "bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50",
    dark: "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900",
  };

  return (
    <div className={cn(variants[variant], className)}>
      {children}
    </div>
  );
}
import React from "react";
import { cn } from "@/lib/utils";

interface GlassProps {
  children: React.ReactNode;
  className?: string;
  variant?: "light" | "dark" | "subtle" | "strong";
  blur?: "sm" | "md" | "lg" | "xl";
}

export function Glass({ 
  children, 
  className, 
  variant = "light", 
  blur = "md" 
}: GlassProps) {
  const variantClasses = {
    light: "bg-white/10 border-white/20",
    dark: "bg-slate-900/10 border-slate-700/20",
    subtle: "bg-white/5 border-white/10",
    strong: "bg-white/20 border-white/30",
  };

  const blurClasses = {
    sm: "backdrop-blur-sm",
    md: "backdrop-blur-md", 
    lg: "backdrop-blur-lg",
    xl: "backdrop-blur-xl",
  };

  return (
    <div className={cn(
      "border rounded-lg",
      variantClasses[variant],
      blurClasses[blur],
      className
    )}>
      {children}
    </div>
  );
}

// Componente para Cards com glassmorphism
interface GlassCardProps extends GlassProps {
  hover?: boolean;
}

export function GlassCard({ 
  children, 
  className, 
  variant = "light", 
  blur = "md",
  hover = true 
}: GlassCardProps) {
  return (
    <Glass
      variant={variant}
      blur={blur}
      className={cn(
        "p-6 transition-all duration-300",
        hover && "hover:bg-white/15 hover:scale-[1.02] hover:shadow-2xl",
        className
      )}
    >
      {children}
    </Glass>
  );
}

// Componente para Modal com glassmorphism
interface GlassModalProps {
  children: React.ReactNode;
  className?: string;
  overlayClassName?: string;
}

export function GlassModal({ 
  children, 
  className, 
  overlayClassName 
}: GlassModalProps) {
  return (
    <div className={cn(
      "fixed inset-0 z-50 flex items-center justify-center p-4",
      "bg-black/20 backdrop-blur-sm",
      overlayClassName
    )}>
      <div className={cn(
        "relative max-w-lg w-full mx-auto",
        "bg-white/95 backdrop-blur-md",
        "border border-white/20 rounded-xl shadow-2xl",
        "animate-scale-in",
        className
      )}>
        {children}
      </div>
    </div>
  );
}

// Componente para Header com glassmorphism
interface GlassHeaderProps {
  children: React.ReactNode;
  className?: string;
  sticky?: boolean;
}

export function GlassHeader({ 
  children, 
  className, 
  sticky = true 
}: GlassHeaderProps) {
  return (
    <header className={cn(
      "bg-white/80 backdrop-blur-md border-b border-white/20",
      "transition-all duration-300",
      sticky && "sticky top-0 z-40",
      className
    )}>
      {children}
    </header>
  );
}
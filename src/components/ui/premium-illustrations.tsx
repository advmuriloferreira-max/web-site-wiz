import React from "react";
import { cn } from "@/lib/utils";

interface IllustrationProps {
  className?: string;
  size?: number;
  animated?: boolean;
}

// Ilustração para estado vazio
export function EmptyStateIllustration({ className, size = 200, animated = true }: IllustrationProps) {
  return (
    <div className={cn("flex justify-center", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        className={cn(animated && "animate-fade-in")}
      >
        {/* Fundo */}
        <circle
          cx="100"
          cy="100"
          r="80"
          fill="url(#emptyGradient)"
          className={cn(animated && "animate-scale-in")}
        />
        
        {/* Caixa vazia */}
        <rect
          x="70"
          y="80"
          width="60"
          height="40"
          rx="4"
          fill="none"
          stroke="hsl(var(--muted-foreground))"
          strokeWidth="2"
          strokeDasharray="4,4"
          className={cn(animated && "animate-pulse")}
        />
        
        {/* Ícone de busca */}
        <circle
          cx="85"
          cy="95"
          r="8"
          fill="none"
          stroke="hsl(var(--muted-foreground))"
          strokeWidth="2"
          className={cn(animated && "animate-bounce-subtle")}
        />
        <line
          x1="91"
          y1="101"
          x2="96"
          y2="106"
          stroke="hsl(var(--muted-foreground))"
          strokeWidth="2"
          strokeLinecap="round"
        />
        
        <defs>
          <linearGradient id="emptyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--muted))" />
            <stop offset="100%" stopColor="hsl(var(--muted-foreground) / 0.1)" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

// Ilustração para página de erro
export function ErrorIllustration({ className, size = 200, animated = true }: IllustrationProps) {
  return (
    <div className={cn("flex justify-center", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        className={cn(animated && "animate-fade-in")}
      >
        {/* Fundo */}
        <circle
          cx="100"
          cy="100"
          r="80"
          fill="url(#errorGradient)"
          className={cn(animated && "animate-scale-in")}
        />
        
        {/* Face triste */}
        <circle
          cx="100"
          cy="100"
          r="30"
          fill="hsl(var(--destructive))"
          className={cn(animated && "animate-bounce-subtle")}
        />
        
        {/* Olhos */}
        <circle cx="92" cy="92" r="3" fill="white" />
        <circle cx="108" cy="92" r="3" fill="white" />
        
        {/* Boca triste */}
        <path
          d="M 90 112 Q 100 105 110 112"
          stroke="white"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        
        <defs>
          <linearGradient id="errorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--destructive) / 0.1)" />
            <stop offset="100%" stopColor="hsl(var(--destructive) / 0.05)" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

// Ilustração para loading
export function LoadingIllustration({ className, size = 100, animated = true }: IllustrationProps) {
  return (
    <div className={cn("flex justify-center", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className={cn(animated && "animate-spin-slow")}
      >
        {/* Círculos concêntricos */}
        <circle
          cx="50"
          cy="50"
          r="35"
          fill="none"
          stroke="url(#loadingGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="10,5"
        />
        <circle
          cx="50"
          cy="50"
          r="25"
          fill="none"
          stroke="url(#loadingGradient2)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="8,4"
          className="animate-spin"
          style={{ animationDirection: "reverse" }}
        />
        <circle
          cx="50"
          cy="50"
          r="15"
          fill="url(#loadingGradient3)"
          className="animate-pulse"
        />
        
        <defs>
          <linearGradient id="loadingGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--accent))" />
          </linearGradient>
          <linearGradient id="loadingGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--accent))" />
            <stop offset="100%" stopColor="hsl(var(--secondary))" />
          </linearGradient>
          <radialGradient id="loadingGradient3">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--primary) / 0.3)" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}

// Ilustração para sucesso
export function SuccessIllustration({ className, size = 200, animated = true }: IllustrationProps) {
  return (
    <div className={cn("flex justify-center", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        className={cn(animated && "animate-fade-in")}
      >
        {/* Fundo */}
        <circle
          cx="100"
          cy="100"
          r="80"
          fill="url(#successGradient)"
          className={cn(animated && "animate-scale-in")}
        />
        
        {/* Círculo de sucesso */}
        <circle
          cx="100"
          cy="100"
          r="30"
          fill="hsl(var(--success))"
          className={cn(animated && "animate-bounce-subtle")}
        />
        
        {/* Check mark */}
        <path
          d="M 85 100 L 95 110 L 115 90"
          stroke="white"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(animated && "animate-fade-in")}
          style={{ animationDelay: "0.3s" }}
        />
        
        {/* Partículas de celebração */}
        <g className={cn(animated && "animate-pulse")}>
          <circle cx="60" cy="60" r="2" fill="hsl(var(--success))" />
          <circle cx="140" cy="60" r="2" fill="hsl(var(--accent))" />
          <circle cx="60" cy="140" r="2" fill="hsl(var(--primary))" />
          <circle cx="140" cy="140" r="2" fill="hsl(var(--warning))" />
        </g>
        
        <defs>
          <linearGradient id="successGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--success) / 0.1)" />
            <stop offset="100%" stopColor="hsl(var(--success) / 0.05)" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

// Ilustração para onboarding
export function OnboardingIllustration({ 
  step, 
  className, 
  size = 200, 
  animated = true 
}: IllustrationProps & { step: number }) {
  const illustrations = {
    1: (
      <svg width={size} height={size} viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="80" fill="url(#step1Gradient)" />
        <rect x="70" y="70" width="60" height="60" rx="8" fill="hsl(var(--primary))" />
        <path d="M90 90h20M90 100h20M90 110h15" stroke="white" strokeWidth="2" />
        <defs>
          <linearGradient id="step1Gradient">
            <stop offset="0%" stopColor="hsl(var(--primary) / 0.1)" />
            <stop offset="100%" stopColor="hsl(var(--primary) / 0.05)" />
          </linearGradient>
        </defs>
      </svg>
    ),
    2: (
      <svg width={size} height={size} viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="80" fill="url(#step2Gradient)" />
        <circle cx="100" cy="90" r="15" fill="hsl(var(--accent))" />
        <path d="M85 110h30M85 120h25" stroke="hsl(var(--accent))" strokeWidth="2" />
        <defs>
          <linearGradient id="step2Gradient">
            <stop offset="0%" stopColor="hsl(var(--accent) / 0.1)" />
            <stop offset="100%" stopColor="hsl(var(--accent) / 0.05)" />
          </linearGradient>
        </defs>
      </svg>
    ),
    3: (
      <svg width={size} height={size} viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="80" fill="url(#step3Gradient)" />
        <path d="M70 90l15 15 25-25" stroke="hsl(var(--success))" strokeWidth="4" fill="none" />
        <circle cx="100" cy="110" r="8" fill="hsl(var(--success))" />
        <defs>
          <linearGradient id="step3Gradient">
            <stop offset="0%" stopColor="hsl(var(--success) / 0.1)" />
            <stop offset="100%" stopColor="hsl(var(--success) / 0.05)" />
          </linearGradient>
        </defs>
      </svg>
    ),
  };

  return (
    <div className={cn("flex justify-center", className)}>
      <div className={cn(animated && "animate-scale-in")}>
        {illustrations[step] || illustrations[1]}
      </div>
    </div>
  );
}
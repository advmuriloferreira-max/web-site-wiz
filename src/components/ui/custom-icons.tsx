import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface AnimatedIconProps {
  icon: LucideIcon;
  className?: string;
  animation?: "pulse" | "bounce" | "spin" | "ping" | "float";
  size?: number;
  color?: string;
}

export function AnimatedIcon({ 
  icon: Icon, 
  className, 
  animation = "pulse",
  size = 24,
  color = "currentColor"
}: AnimatedIconProps) {
  const animations = {
    pulse: "animate-pulse",
    bounce: "animate-bounce",
    spin: "animate-spin",
    ping: "animate-ping",
    float: "animate-bounce-subtle",
  };

  return (
    <Icon 
      size={size}
      color={color}
      className={cn(animations[animation], className)}
    />
  );
}

// Ícone personalizado para loading
export function LoadingIcon({ className, size = 24 }: { className?: string; size?: number }) {
  return (
    <div className={cn("relative", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        className="animate-spin"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="32"
          strokeDashoffset="32"
          className="animate-pulse"
        />
      </svg>
    </div>
  );
}

// Ícone personalizado para sucesso
export function SuccessIcon({ className, size = 24 }: { className?: string; size?: number }) {
  return (
    <div className={cn("relative", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        className="animate-scale-in"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          fill="hsl(var(--success))"
          className="animate-pulse"
        />
        <path
          d="M9 12l2 2 4-4"
          stroke="white"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-fade-in"
          style={{ animationDelay: "0.2s" }}
        />
      </svg>
    </div>
  );
}

// Ícone personalizado para erro
export function ErrorIcon({ className, size = 24 }: { className?: string; size?: number }) {
  return (
    <div className={cn("relative", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        className="animate-scale-in"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          fill="hsl(var(--destructive))"
          className="animate-pulse"
        />
        <path
          d="M15 9l-6 6M9 9l6 6"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-fade-in"
          style={{ animationDelay: "0.2s" }}
        />
      </svg>
    </div>
  );
}

// Ícone contextual para tipos de dados
interface DataIconProps {
  type: "financial" | "contract" | "client" | "calculation" | "report";
  className?: string;
  size?: number;
  animated?: boolean;
}

export function DataIcon({ type, className, size = 24, animated = false }: DataIconProps) {
  const iconProps = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    className: cn(animated && "animate-pulse", className),
  };

  const icons = {
    financial: (
      <svg {...iconProps}>
        <path
          d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"
          fill="none"
          stroke="hsl(var(--success))"
          strokeWidth="2"
        />
        <path
          d="M9 12l2 2 4-4"
          stroke="hsl(var(--success))"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    contract: (
      <svg {...iconProps}>
        <rect
          x="3"
          y="4"
          width="18"
          height="16"
          rx="2"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
        />
        <path
          d="M7 8h10M7 12h10M7 16h6"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
    client: (
      <svg {...iconProps}>
        <circle
          cx="12"
          cy="8"
          r="4"
          fill="none"
          stroke="hsl(var(--accent))"
          strokeWidth="2"
        />
        <path
          d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"
          stroke="hsl(var(--accent))"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    ),
    calculation: (
      <svg {...iconProps}>
        <rect
          x="4"
          y="2"
          width="16"
          height="18"
          rx="2"
          fill="none"
          stroke="hsl(var(--warning))"
          strokeWidth="2"
        />
        <path
          d="M8 6h8M8 10h8M8 14h5"
          stroke="hsl(var(--warning))"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
    report: (
      <svg {...iconProps}>
        <path
          d="M3 3v18h18"
          stroke="hsl(var(--info))"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M7 12l3-3 3 3 5-5"
          stroke="hsl(var(--info))"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  };

  return <div className={cn("inline-flex", className)}>{icons[type]}</div>;
}

// Componente para ícones com glow effect
interface GlowIconProps {
  icon: LucideIcon;
  className?: string;
  size?: number;
  color?: string;
  glowColor?: string;
}

export function GlowIcon({ 
  icon: Icon, 
  className, 
  size = 24, 
  color = "currentColor",
  glowColor = "hsl(var(--primary))"
}: GlowIconProps) {
  return (
    <div className={cn("relative", className)}>
      <Icon 
        size={size}
        color={color}
        className="relative z-10"
      />
      <div 
        className="absolute inset-0 blur-md opacity-50"
        style={{ color: glowColor }}
      >
        <Icon size={size} />
      </div>
    </div>
  );
}
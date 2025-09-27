import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface PremiumBadgeProps {
  children: React.ReactNode;
  variant?: "status" | "notification" | "achievement" | "progress";
  color?: "primary" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md" | "lg";
  className?: string;
  icon?: LucideIcon;
  animated?: boolean;
  glow?: boolean;
}

export function PremiumBadge({
  children,
  variant = "status",
  color = "primary",
  size = "md",
  className,
  icon: Icon,
  animated = false,
  glow = false,
}: PremiumBadgeProps) {
  const variants = {
    status: "rounded-full px-3 py-1",
    notification: "rounded-lg px-2 py-1 relative",
    achievement: "rounded-xl px-4 py-2 border-2",
    progress: "rounded-lg px-3 py-2",
  };

  const colors = {
    primary: "bg-primary/10 text-primary border-primary/20",
    success: "bg-success/10 text-success border-success/20",
    warning: "bg-warning/10 text-warning border-warning/20",
    error: "bg-destructive/10 text-destructive border-destructive/20",
    info: "bg-info/10 text-info border-info/20",
  };

  const sizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const glowColors = {
    primary: "shadow-primary/50",
    success: "shadow-success/50",
    warning: "shadow-warning/50",
    error: "shadow-destructive/50",
    info: "shadow-info/50",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 font-medium border transition-all duration-200",
        variants[variant],
        colors[color],
        sizes[size],
        animated && "animate-scale-in",
        glow && "shadow-lg",
        glow && glowColors[color],
        "hover:scale-105",
        className
      )}
    >
      {Icon && (
        <Icon 
          className={cn(
            "flex-shrink-0",
            size === "sm" ? "h-3 w-3" : size === "md" ? "h-4 w-4" : "h-5 w-5",
            animated && "animate-pulse"
          )} 
        />
      )}
      {children}
      
      {variant === "notification" && (
        <div className="absolute -top-1 -right-1 h-2 w-2 bg-destructive rounded-full animate-ping" />
      )}
    </div>
  );
}

// Badge de status específico
interface StatusBadgeProps {
  status: "active" | "inactive" | "pending" | "completed" | "error";
  className?: string;
  animated?: boolean;
}

export function StatusBadge({ status, className, animated = true }: StatusBadgeProps) {
  const statusConfig = {
    active: { 
      label: "Ativo", 
      color: "success" as const,
      icon: "●"
    },
    inactive: { 
      label: "Inativo", 
      color: "error" as const,
      icon: "●"
    },
    pending: { 
      label: "Pendente", 
      color: "warning" as const,
      icon: "●"
    },
    completed: { 
      label: "Concluído", 
      color: "success" as const,
      icon: "✓"
    },
    error: { 
      label: "Erro", 
      color: "error" as const,
      icon: "✕"
    },
  };

  const config = statusConfig[status];

  return (
    <PremiumBadge
      variant="status"
      color={config.color}
      size="sm"
      animated={animated}
      className={className}
    >
      <span className={cn(animated && "animate-pulse")}>{config.icon}</span>
      {config.label}
    </PremiumBadge>
  );
}

// Badge de progresso
interface ProgressBadgeProps {
  progress: number;
  total?: number;
  className?: string;
  showPercentage?: boolean;
}

export function ProgressBadge({ 
  progress, 
  total = 100, 
  className, 
  showPercentage = true 
}: ProgressBadgeProps) {
  const percentage = (progress / total) * 100;
  const color = percentage >= 80 ? "success" : percentage >= 50 ? "warning" : "error";

  return (
    <PremiumBadge
      variant="progress"
      color={color}
      size="sm"
      className={cn("relative overflow-hidden", className)}
      animated
    >
      <div 
        className="absolute inset-0 bg-current opacity-10 transition-all duration-500"
        style={{ width: `${percentage}%` }}
      />
      <span className="relative z-10">
        {showPercentage ? `${Math.round(percentage)}%` : `${progress}/${total}`}
      </span>
    </PremiumBadge>
  );
}

// Badge de conquista
interface AchievementBadgeProps {
  title: string;
  description?: string;
  rarity?: "common" | "rare" | "epic" | "legendary";
  className?: string;
  unlocked?: boolean;
}

export function AchievementBadge({ 
  title, 
  description, 
  rarity = "common", 
  className,
  unlocked = true 
}: AchievementBadgeProps) {
  const rarityConfig = {
    common: { color: "info" as const, icon: "🥉" },
    rare: { color: "primary" as const, icon: "🥈" },
    epic: { color: "warning" as const, icon: "🥇" },
    legendary: { color: "success" as const, icon: "👑" },
  };

  const config = rarityConfig[rarity];

  return (
    <PremiumBadge
      variant="achievement"
      color={config.color}
      size="lg"
      className={cn(
        "flex-col items-start gap-1 min-w-[120px]",
        !unlocked && "opacity-50 grayscale",
        className
      )}
      animated={unlocked}
      glow={unlocked && rarity !== "common"}
    >
      <div className="flex items-center gap-2 w-full">
        <span className="text-lg">{config.icon}</span>
        <span className="font-bold text-sm">{title}</span>
      </div>
      {description && (
        <span className="text-xs opacity-80 leading-tight">{description}</span>
      )}
      {!unlocked && (
        <div className="absolute inset-0 bg-black/20 rounded-xl flex items-center justify-center">
          <span className="text-xs text-white/80">🔒</span>
        </div>
      )}
    </PremiumBadge>
  );
}

// Badge de notificação com contador
interface NotificationBadgeProps {
  count: number;
  max?: number;
  className?: string;
  pulse?: boolean;
}

export function NotificationBadge({ 
  count, 
  max = 99, 
  className, 
  pulse = true 
}: NotificationBadgeProps) {
  const displayCount = count > max ? `${max}+` : count.toString();
  
  if (count === 0) return null;

  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "absolute -top-2 -right-2 min-w-[20px] h-5 px-1",
          "bg-destructive text-white text-xs font-bold",
          "rounded-full flex items-center justify-center",
          "animate-scale-in",
          pulse && "animate-pulse"
        )}
      >
        {displayCount}
      </div>
    </div>
  );
}
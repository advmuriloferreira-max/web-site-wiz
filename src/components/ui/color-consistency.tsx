import React from "react";
import { cn } from "@/lib/utils";

// Paleta de cores padronizada usando tokens do design system
export const colorSystem = {
  // Cores principais
  primary: {
    50: "hsl(var(--primary) / 0.05)",
    100: "hsl(var(--primary) / 0.1)", 
    200: "hsl(var(--primary) / 0.2)",
    500: "hsl(var(--primary))",
    600: "hsl(var(--primary-hover))",
    foreground: "hsl(var(--primary-foreground))",
  },
  
  // Cores de status
  success: {
    50: "hsl(var(--success) / 0.05)",
    100: "hsl(var(--success) / 0.1)",
    200: "hsl(var(--success) / 0.2)", 
    500: "hsl(var(--success))",
    foreground: "hsl(var(--success-foreground))",
  },
  
  warning: {
    50: "hsl(var(--warning) / 0.05)",
    100: "hsl(var(--warning) / 0.1)",
    200: "hsl(var(--warning) / 0.2)",
    500: "hsl(var(--warning))",
    foreground: "hsl(var(--warning-foreground))",
  },
  
  error: {
    50: "hsl(var(--destructive) / 0.05)",
    100: "hsl(var(--destructive) / 0.1)",
    200: "hsl(var(--destructive) / 0.2)",
    500: "hsl(var(--destructive))",
    foreground: "hsl(var(--destructive-foreground))",
  },
  
  info: {
    50: "hsl(var(--info) / 0.05)",
    100: "hsl(var(--info) / 0.1)",
    200: "hsl(var(--info) / 0.2)",
    500: "hsl(var(--info))",
    foreground: "hsl(var(--info-foreground))",
  },
} as const;

// Classes de cor padronizadas
export const colorClasses = {
  // Text colors
  textPrimary: "text-primary",
  textSuccess: "text-success", 
  textWarning: "text-warning",
  textError: "text-destructive",
  textInfo: "text-info",
  textMuted: "text-muted-foreground",
  
  // Background colors
  bgPrimary: "bg-primary text-primary-foreground",
  bgSuccess: "bg-success text-success-foreground",
  bgWarning: "bg-warning text-warning-foreground", 
  bgError: "bg-destructive text-destructive-foreground",
  bgInfo: "bg-info text-info-foreground",
  
  // Border colors
  borderPrimary: "border-primary",
  borderSuccess: "border-success",
  borderWarning: "border-warning",
  borderError: "border-destructive", 
  borderInfo: "border-info",
  
  // Hover states
  hoverPrimary: "hover:bg-primary/10 hover:text-primary",
  hoverSuccess: "hover:bg-success/10 hover:text-success",
  hoverWarning: "hover:bg-warning/10 hover:text-warning",
  hoverError: "hover:bg-destructive/10 hover:text-destructive",
  hoverInfo: "hover:bg-info/10 hover:text-info",
} as const;

// Componente para ícones com cores consistentes
interface ColoredIconProps {
  icon: React.ComponentType<{ className?: string }>;
  variant?: "primary" | "success" | "warning" | "error" | "info" | "muted";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ColoredIcon({ 
  icon: Icon, 
  variant = "primary", 
  size = "md",
  className 
}: ColoredIconProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5", 
    lg: "h-6 w-6",
  };
  
  const colorClasses = {
    primary: "text-primary",
    success: "text-success",
    warning: "text-warning", 
    error: "text-destructive",
    info: "text-info",
    muted: "text-muted-foreground",
  };

  return (
    <Icon className={cn(
      sizeClasses[size],
      colorClasses[variant],
      "transition-colors duration-200",
      className
    )} />
  );
}

// Componente para status badges com cores consistentes
interface StatusIndicatorProps {
  status: "active" | "inactive" | "pending" | "success" | "error";
  size?: "sm" | "md";
  showLabel?: boolean;
  className?: string;
}

export function StatusIndicator({ 
  status, 
  size = "md",
  showLabel = true,
  className 
}: StatusIndicatorProps) {
  const config = {
    active: { 
      color: "text-success", 
      bg: "bg-success/10", 
      border: "border-success/20",
      label: "Ativo",
      dot: "bg-success"
    },
    inactive: { 
      color: "text-muted-foreground", 
      bg: "bg-muted/50", 
      border: "border-muted",
      label: "Inativo",
      dot: "bg-muted-foreground"
    },
    pending: { 
      color: "text-warning", 
      bg: "bg-warning/10", 
      border: "border-warning/20",
      label: "Pendente",
      dot: "bg-warning animate-pulse"
    },
    success: { 
      color: "text-success", 
      bg: "bg-success/10", 
      border: "border-success/20",
      label: "Sucesso",
      dot: "bg-success"
    },
    error: { 
      color: "text-destructive", 
      bg: "bg-destructive/10", 
      border: "border-destructive/20",
      label: "Erro",
      dot: "bg-destructive"
    },
  };

  const statusConfig = config[status];
  const sizeClasses = size === "sm" ? "text-xs px-2 py-1" : "text-sm px-3 py-1.5";
  const dotSize = size === "sm" ? "h-2 w-2" : "h-2.5 w-2.5";

  return (
    <div className={cn(
      "inline-flex items-center gap-2 rounded-full border font-medium transition-all duration-200",
      statusConfig.color,
      statusConfig.bg,
      statusConfig.border,
      sizeClasses,
      className
    )}>
      <div className={cn("rounded-full", statusConfig.dot, dotSize)} />
      {showLabel && statusConfig.label}
    </div>
  );
}

// Utilitário para aplicar cores de forma consistente
export function getColorClasses(
  variant: "primary" | "success" | "warning" | "error" | "info" | "muted",
  type: "text" | "bg" | "border" | "hover" = "text"
) {
  const colorMap = {
    primary: {
      text: "text-primary",
      bg: "bg-primary text-primary-foreground",
      border: "border-primary",
      hover: "hover:bg-primary/10 hover:text-primary",
    },
    success: {
      text: "text-success",
      bg: "bg-success text-success-foreground", 
      border: "border-success",
      hover: "hover:bg-success/10 hover:text-success",
    },
    warning: {
      text: "text-warning",
      bg: "bg-warning text-warning-foreground",
      border: "border-warning", 
      hover: "hover:bg-warning/10 hover:text-warning",
    },
    error: {
      text: "text-destructive",
      bg: "bg-destructive text-destructive-foreground",
      border: "border-destructive",
      hover: "hover:bg-destructive/10 hover:text-destructive",
    },
    info: {
      text: "text-info", 
      bg: "bg-info text-info-foreground",
      border: "border-info",
      hover: "hover:bg-info/10 hover:text-info",
    },
    muted: {
      text: "text-muted-foreground",
      bg: "bg-muted text-muted-foreground",
      border: "border-muted",
      hover: "hover:bg-muted hover:text-muted-foreground",
    },
  };

  return colorMap[variant][type];
}
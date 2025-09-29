import React from "react";
import { cn } from "@/lib/utils";

// Premium color system with expanded palette
export const colorSystem = {
  // Primary with full range
  primary: {
    50: "hsl(var(--primary) / 0.05)",
    100: "hsl(var(--primary) / 0.1)", 
    200: "hsl(var(--primary) / 0.2)",
    300: "hsl(var(--primary) / 0.3)",
    400: "hsl(var(--primary) / 0.4)",
    500: "hsl(var(--primary))",
    600: "hsl(var(--primary-hover))",
    700: "hsl(var(--primary-dark))",
    light: "hsl(var(--primary-light))",
    glow: "hsl(var(--primary-glow))",
    foreground: "hsl(var(--primary-foreground))",
  },
  
  // Surface layers for better layering
  surface: {
    1: "hsl(var(--surface-1))",
    2: "hsl(var(--surface-2))",
    3: "hsl(var(--surface-3))",
  },
  
  // Enhanced status colors with variations
  success: {
    50: "hsl(var(--success) / 0.05)",
    100: "hsl(var(--success) / 0.1)",
    200: "hsl(var(--success) / 0.2)", 
    500: "hsl(var(--success))",
    light: "hsl(var(--success-light))",
    dark: "hsl(var(--success-dark))",
    subtle: "hsl(var(--success-subtle))",
    foreground: "hsl(var(--success-foreground))",
  },
  
  warning: {
    50: "hsl(var(--warning) / 0.05)",
    100: "hsl(var(--warning) / 0.1)",
    200: "hsl(var(--warning) / 0.2)",
    500: "hsl(var(--warning))",
    light: "hsl(var(--warning-light))",
    dark: "hsl(var(--warning-dark))",
    subtle: "hsl(var(--warning-subtle))",
    foreground: "hsl(var(--warning-foreground))",
  },
  
  error: {
    50: "hsl(var(--destructive) / 0.05)",
    100: "hsl(var(--destructive) / 0.1)",
    200: "hsl(var(--destructive) / 0.2)",
    500: "hsl(var(--destructive))",
    light: "hsl(var(--destructive-light))",
    dark: "hsl(var(--destructive-dark))",
    subtle: "hsl(var(--destructive-subtle))",
    foreground: "hsl(var(--destructive-foreground))",
  },
  
  info: {
    50: "hsl(var(--info) / 0.05)",
    100: "hsl(var(--info) / 0.1)",
    200: "hsl(var(--info) / 0.2)",
    500: "hsl(var(--info))",
    light: "hsl(var(--info-light))",
    dark: "hsl(var(--info-dark))",
    subtle: "hsl(var(--info-subtle))",
    foreground: "hsl(var(--info-foreground))",
  },
  
  // Contextual section colors
  contextual: {
    contratos: "hsl(var(--contratos-color))",
    clientes: "hsl(var(--clientes-color))",
    relatorios: "hsl(var(--relatorios-color))",
    configuracoes: "hsl(var(--configuracoes-color))",
  },
  
  // Status states
  status: {
    pending: "hsl(var(--pending))",
    processing: "hsl(var(--processing))",
    completed: "hsl(var(--completed))",
    cancelled: "hsl(var(--cancelled))",
  },
  
  // Severity levels
  severity: {
    low: "hsl(var(--severity-low))",
    medium: "hsl(var(--severity-medium))",
    high: "hsl(var(--severity-high))",
    critical: "hsl(var(--severity-critical))",
  },
  
  // Text hierarchy
  text: {
    primary: "hsl(var(--text-primary))",
    secondary: "hsl(var(--text-secondary))",
    tertiary: "hsl(var(--text-tertiary))",
    disabled: "hsl(var(--text-disabled))",
  },
} as const;

// Enhanced color classes with premium variations
export const colorClasses = {
  // Text colors with hierarchy
  textPrimary: "text-text-primary",
  textSecondary: "text-text-secondary",
  textTertiary: "text-text-tertiary",
  textDisabled: "text-text-disabled",
  textSuccess: "text-success", 
  textWarning: "text-warning",
  textError: "text-destructive",
  textInfo: "text-info",
  textMuted: "text-muted-foreground",
  
  // Background colors with subtle variations
  bgPrimary: "bg-primary text-primary-foreground",
  bgPrimarySubtle: "bg-primary/10 text-primary",
  bgSuccess: "bg-success text-success-foreground",
  bgSuccessSubtle: "bg-success-subtle text-success",
  bgWarning: "bg-warning text-warning-foreground",
  bgWarningSubtle: "bg-warning-subtle text-warning", 
  bgError: "bg-destructive text-destructive-foreground",
  bgErrorSubtle: "bg-destructive-subtle text-destructive",
  bgInfo: "bg-info text-info-foreground",
  bgInfoSubtle: "bg-info-subtle text-info",
  
  // Surface layers
  bgSurface1: "bg-surface-1",
  bgSurface2: "bg-surface-2",
  bgSurface3: "bg-surface-3",
  
  // Border colors
  borderPrimary: "border-primary",
  borderSuccess: "border-success",
  borderWarning: "border-warning",
  borderError: "border-destructive", 
  borderInfo: "border-info",
  borderSubtle: "border-border",
  
  // Contextual colors
  borderContratos: "border-contratos",
  borderClientes: "border-clientes", 
  borderRelatorios: "border-relatorios",
  borderConfiguracoes: "border-configuracoes",
  
  // Enhanced hover states with glow
  hoverPrimary: "hover:bg-primary/10 hover:text-primary hover:border-primary/30 hover:shadow-md",
  hoverPrimaryGlow: "hover:bg-primary/10 hover:text-primary hover:shadow-[0_0_20px_hsl(var(--primary-glow)/0.3)]",
  hoverSuccess: "hover:bg-success/10 hover:text-success hover:border-success/30",
  hoverWarning: "hover:bg-warning/10 hover:text-warning hover:border-warning/30",
  hoverError: "hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30",
  hoverInfo: "hover:bg-info/10 hover:text-info hover:border-info/30",
  
  // Status colors
  statusPending: "text-pending bg-pending/10 border-pending/20",
  statusProcessing: "text-processing bg-processing/10 border-processing/20",
  statusCompleted: "text-completed bg-completed/10 border-completed/20",
  statusCancelled: "text-cancelled bg-cancelled/10 border-cancelled/20",
  
  // Severity levels
  severityLow: "text-severity-low bg-severity-low/10 border-severity-low/20",
  severityMedium: "text-severity-medium bg-severity-medium/10 border-severity-medium/20",
  severityHigh: "text-severity-high bg-severity-high/10 border-severity-high/20",
  severityCritical: "text-severity-critical bg-severity-critical/10 border-severity-critical/20",
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

// Enhanced status indicator with severity levels
interface StatusIndicatorProps {
  status: "active" | "inactive" | "pending" | "success" | "error" | "processing" | "completed" | "cancelled";
  severity?: "low" | "medium" | "high" | "critical";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  showGlow?: boolean;
  className?: string;
}

export function StatusIndicator({ 
  status, 
  severity,
  size = "md",
  showLabel = true,
  showGlow = false,
  className 
}: StatusIndicatorProps) {
  const config = {
    active: { 
      color: "text-success", 
      bg: "bg-success-subtle", 
      border: "border-success/30",
      label: "Ativo",
      dot: "bg-success shadow-[0_0_6px_hsl(var(--success)/0.4)]"
    },
    inactive: { 
      color: "text-text-tertiary", 
      bg: "bg-surface-2", 
      border: "border-border",
      label: "Inativo",
      dot: "bg-text-tertiary"
    },
    pending: { 
      color: "text-pending", 
      bg: "bg-pending/10", 
      border: "border-pending/30",
      label: "Pendente",
      dot: "bg-pending animate-pulse shadow-[0_0_6px_hsl(var(--pending)/0.4)]"
    },
    processing: { 
      color: "text-processing", 
      bg: "bg-processing/10", 
      border: "border-processing/30",
      label: "Processando",
      dot: "bg-processing animate-pulse shadow-[0_0_6px_hsl(var(--processing)/0.4)]"
    },
    success: { 
      color: "text-success", 
      bg: "bg-success-subtle", 
      border: "border-success/30",
      label: "Sucesso",
      dot: "bg-success shadow-[0_0_6px_hsl(var(--success)/0.4)]"
    },
    completed: { 
      color: "text-completed", 
      bg: "bg-completed/10", 
      border: "border-completed/30",
      label: "Concluído",
      dot: "bg-completed shadow-[0_0_6px_hsl(var(--completed)/0.4)]"
    },
    error: { 
      color: "text-destructive", 
      bg: "bg-destructive-subtle", 
      border: "border-destructive/30",
      label: "Erro",
      dot: "bg-destructive shadow-[0_0_6px_hsl(var(--destructive)/0.4)]"
    },
    cancelled: { 
      color: "text-cancelled", 
      bg: "bg-cancelled/10", 
      border: "border-cancelled/30",
      label: "Cancelado",
      dot: "bg-cancelled"
    },
  };

  // Build the final config, starting with base status config
  let finalConfig = config[status];
  let finalLabel = finalConfig.label;
  
  // Override with severity if provided
  if (severity) {
    const severityConfig = {
      low: { 
        color: "text-severity-low", 
        bg: "bg-severity-low/10", 
        border: "border-severity-low/30",
        glow: "shadow-[0_0_8px_hsl(var(--severity-low)/0.3)]"
      },
      medium: { 
        color: "text-severity-medium", 
        bg: "bg-severity-medium/10", 
        border: "border-severity-medium/30",
        glow: "shadow-[0_0_8px_hsl(var(--severity-medium)/0.3)]"
      },
      high: { 
        color: "text-severity-high", 
        bg: "bg-severity-high/10", 
        border: "border-severity-high/30",
        glow: "shadow-[0_0_8px_hsl(var(--severity-high)/0.3)]"
      },
      critical: { 
        color: "text-severity-critical", 
        bg: "bg-severity-critical/10", 
        border: "border-severity-critical/30",
        glow: "shadow-[0_0_12px_hsl(var(--severity-critical)/0.4)] animate-pulse"
      },
    }[severity];

    finalConfig = {
      ...finalConfig,
      ...severityConfig,
    };
    finalLabel = severity.toUpperCase();
  }
  
  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2",
  };
  
  const dotSizes = {
    sm: "h-1.5 w-1.5",
    md: "h-2 w-2",
    lg: "h-2.5 w-2.5",
  };

  return (
    <div className={cn(
      "inline-flex items-center gap-2 rounded-full border font-medium transition-all duration-300",
      "hover:scale-105 hover:brightness-110",
      finalConfig.color,
      finalConfig.bg,
      finalConfig.border,
      sizeClasses[size],
      showGlow && severity && (finalConfig as any).glow,
      className
    )}>
      <div className={cn(
        "rounded-full transition-all duration-300", 
        finalConfig.dot, 
        dotSizes[size]
      )} />
      {showLabel && finalLabel}
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
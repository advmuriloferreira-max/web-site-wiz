import { cn } from "@/lib/utils";
import { Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

type StatusType = "pending" | "processing" | "completed" | "cancelled";

interface StatusBadgeProps {
  status: StatusType;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  variant?: "default" | "outline" | "subtle";
  className?: string;
}

const statusConfig = {
  pending: {
    label: "Em Análise",
    icon: Clock,
    color: "bg-status-pending text-white",
    outlineColor: "border-status-pending text-status-pending",
    subtleColor: "bg-status-pending/10 text-status-pending border-status-pending/20"
  },
  processing: {
    label: "Processando",
    icon: AlertCircle,
    color: "bg-status-processing text-white",
    outlineColor: "border-status-processing text-status-processing",
    subtleColor: "bg-status-processing/10 text-status-processing border-status-processing/20"
  },
  completed: {
    label: "Concluído",
    icon: CheckCircle,
    color: "bg-status-completed text-white",
    outlineColor: "border-status-completed text-status-completed",
    subtleColor: "bg-status-completed/10 text-status-completed border-status-completed/20"
  },
  cancelled: {
    label: "Cancelado",
    icon: XCircle,
    color: "bg-status-cancelled text-white",
    outlineColor: "border-status-cancelled text-status-cancelled",
    subtleColor: "bg-status-cancelled/10 text-status-cancelled border-status-cancelled/20"
  }
};

const sizeClasses = {
  sm: {
    container: "px-2 py-0.5 text-xs gap-1",
    icon: "h-3 w-3"
  },
  md: {
    container: "px-2.5 py-1 text-sm gap-1.5",
    icon: "h-4 w-4"
  },
  lg: {
    container: "px-3 py-1.5 text-base gap-2",
    icon: "h-5 w-5"
  }
};

export function StatusBadge({
  status,
  size = "md",
  showIcon = true,
  variant = "default",
  className
}: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  const sizeConfig = sizeClasses[size];
  
  const variantClasses = {
    default: config.color,
    outline: `border ${config.outlineColor} bg-transparent`,
    subtle: `border ${config.subtleColor}`
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full transition-all duration-200",
        sizeConfig.container,
        variantClasses[variant],
        className
      )}
    >
      {showIcon && <Icon className={sizeConfig.icon} />}
      {config.label}
    </span>
  );
}
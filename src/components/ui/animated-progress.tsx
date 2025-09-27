import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface AnimatedProgressProps {
  value: number;
  max?: number;
  className?: string;
  showValue?: boolean;
  variant?: "default" | "success" | "warning" | "error";
}

export function AnimatedProgress({
  value,
  max = 100,
  className,
  showValue = false,
  variant = "default",
}: AnimatedProgressProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const percentage = Math.min((value / max) * 100, 100);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayValue(percentage);
    }, 100);

    return () => clearTimeout(timer);
  }, [percentage]);

  const variantClasses = {
    default: "bg-gradient-button",
    success: "bg-success",
    warning: "bg-warning", 
    error: "bg-destructive",
  };

  return (
    <div className={cn("relative w-full", className)}>
      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
        <div
          className={cn(
            "h-full progress-fill rounded-full",
            variantClasses[variant]
          )}
          style={{ width: `${displayValue}%` }}
        />
      </div>
      {showValue && (
        <span className="absolute right-0 top-3 text-xs text-muted-foreground animate-fade-in">
          {Math.round(displayValue)}%
        </span>
      )}
    </div>
  );
}
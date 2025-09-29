import { useEffect, useState } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PremiumStatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  color?: "blue" | "emerald" | "amber" | "red";
}

const colorClasses = {
  blue: {
    icon: "text-primary",
    gradient: "from-primary/20 to-primary/10",
    border: "border-primary/20",
    bg: "bg-primary/5"
  },
  emerald: {
    icon: "text-success",
    gradient: "from-success/20 to-success/10", 
    border: "border-success/20",
    bg: "bg-success/5"
  },
  amber: {
    icon: "text-warning",
    gradient: "from-warning/20 to-warning/10",
    border: "border-warning/20",
    bg: "bg-warning/5"
  },
  red: {
    icon: "text-destructive", 
    gradient: "from-destructive/20 to-destructive/10",
    border: "border-destructive/20",
    bg: "bg-destructive/5"
  }
};

export function PremiumStatsCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend, 
  className,
  color = "blue"
}: PremiumStatsCardProps) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const numericValue = typeof value === 'number' ? value : parseFloat(value.toString().replace(/[^\d.-]/g, ''));
  const isNumeric = !isNaN(numericValue);

  useEffect(() => {
    if (isNumeric) {
      const increment = numericValue / 50;
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= numericValue) {
          current = numericValue;
          clearInterval(timer);
        }
        setAnimatedValue(current);
      }, 30);
      return () => clearInterval(timer);
    }
  }, [numericValue, isNumeric]);

  const colors = colorClasses[color];

  return (
    <div className={cn(
      "group relative overflow-hidden rounded-xl bg-card/50 backdrop-blur-md border padding-card transition-all duration-300 hover:scale-105 hover:shadow-premium-xl interactive-card animate-fade-in",
      colors.bg,
      colors.border,
      className
    )}>
      {/* Gradient overlay */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300",
        colors.gradient
      )} />
      
      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={cn(
            "p-3 rounded-lg bg-card/50 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110 animate-scale-in",
            colors.bg
          )}>
            <Icon className={cn("h-6 w-6", colors.icon)} />
          </div>
          {trend && (
            <div className={cn(
              "flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium animate-fade-in",
              trend.isPositive 
                ? "bg-success/20 text-success border border-success/20" 
                : "bg-destructive/20 text-destructive border border-destructive/20"
            )}>
              <span>{trend.isPositive ? "+" : ""}{trend.value}%</span>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <h3 className="text-label animate-fade-in">
            {title}
          </h3>
          <div className="title-section text-3xl animate-count-up">
            {isNumeric ? 
              (typeof value === 'string' && value.includes('R$') 
                ? `R$ ${Math.round(animatedValue).toLocaleString('pt-BR')}${value.includes('K') ? 'K' : value.includes('M') ? 'M' : ''}`
                : value.toString().includes('%')
                ? `${animatedValue.toFixed(1)}%`
                : Math.round(animatedValue).toLocaleString('pt-BR')
              ) : value
            }
          </div>
          {description && (
            <p className="text-body text-muted-foreground animate-fade-in">
              {description}
            </p>
          )}
        </div>
      </div>
      
      {/* Glow effect */}
      <div className={cn(
        "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl",
        colors.gradient
      )} />
    </div>
  );
}
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
    icon: "text-blue-500",
    gradient: "from-blue-500/20 to-blue-600/20",
    border: "border-blue-500/30",
    bg: "bg-blue-500/5"
  },
  emerald: {
    icon: "text-emerald-500",
    gradient: "from-emerald-500/20 to-emerald-600/20",
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/5"
  },
  amber: {
    icon: "text-amber-500",
    gradient: "from-amber-500/20 to-amber-600/20",
    border: "border-amber-500/30",
    bg: "bg-amber-500/5"
  },
  red: {
    icon: "text-red-500",
    gradient: "from-red-500/20 to-red-600/20",
    border: "border-red-500/30",
    bg: "bg-red-500/5"
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
      "group relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-md border border-white/20 p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-black/10",
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
            "p-3 rounded-lg bg-white/10 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110",
            colors.bg
          )}>
            <Icon className={cn("h-12 w-12", colors.icon)} />
          </div>
          {trend && (
            <div className={cn(
              "flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium",
              trend.isPositive 
                ? "bg-emerald-500/20 text-emerald-600" 
                : "bg-red-500/20 text-red-600"
            )}>
              <span>{trend.isPositive ? "+" : ""}{trend.value}%</span>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wide">
            {title}
          </h3>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">
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
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
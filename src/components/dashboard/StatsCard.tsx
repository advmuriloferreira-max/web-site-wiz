import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedCounter } from "@/components/ui/animated-counter";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  delay?: number;
}

export function StatsCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend, 
  className,
  delay = 0
}: StatsCardProps) {
  const numericValue = typeof value === 'number' ? value : parseFloat(value.toString().replace(/[^\d.-]/g, ''));
  const isNumeric = !isNaN(numericValue);

  return (
    <Card className={cn("hover:shadow-lg transition-all duration-200 border-border/50 animate-fade-in", className)} style={{ animationDelay: `${delay}ms` }}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground/80 animate-fade-in animate-stagger-1">
          {title}
        </CardTitle>
        <Icon className="h-5 w-5 text-muted-foreground/60 animate-scale-in animate-stagger-2" />
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-2xl font-bold text-foreground tracking-tight">
          {isNumeric ? (
            <AnimatedCounter 
              value={numericValue} 
              className="text-foreground"
            />
          ) : (
            <span className="animate-fade-in animate-stagger-2">{value}</span>
          )}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground/70 mt-2 animate-fade-in animate-stagger-3">
            {description}
          </p>
        )}
        {trend && (
          <div className="flex items-center mt-2 animate-slide-up animate-stagger-4">
            <span className={cn(
              "text-xs font-medium transition-colors duration-200",
              trend.isPositive ? "text-success" : "text-destructive"
            )}>
              {trend.isPositive ? "+" : ""}{trend.value}%
            </span>
            <span className="text-xs text-muted-foreground ml-1">
              vs mês anterior
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
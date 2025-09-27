import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { AnimatedProgress } from "@/components/ui/animated-progress";
import { AnimatedCounter } from "@/components/ui/animated-counter";

interface ChartDataItem {
  label: string;
  value: number;
  color?: string;
}

interface AnimatedBarChartProps {
  data: ChartDataItem[];
  className?: string;
  showValues?: boolean;
  maxValue?: number;
}

export function AnimatedBarChart({
  data,
  className,
  showValues = true,
  maxValue,
}: AnimatedBarChartProps) {
  const [isVisible, setIsVisible] = useState(false);
  const max = maxValue || Math.max(...data.map(item => item.value));

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={cn("space-y-4", className)}>
      {data.map((item, index) => (
        <div 
          key={item.label} 
          className="animate-fade-in space-y-2"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium text-foreground">{item.label}</span>
            {showValues && (
              <span className="text-muted-foreground">
                <AnimatedCounter 
                  value={isVisible ? item.value : 0} 
                  className="text-numeric"
                />
              </span>
            )}
          </div>
          <div className="relative">
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className={cn(
                  "h-full rounded-full progress-fill",
                  item.color || "bg-primary"
                )}
                style={{
                  width: isVisible ? `${(item.value / max) * 100}%` : "0%",
                  transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                  transitionDelay: `${index * 100}ms`,
                }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface AnimatedPieChartProps {
  data: ChartDataItem[];
  className?: string;
  size?: number;
}

export function AnimatedPieChart({
  data,
  className,
  size = 120,
}: AnimatedPieChartProps) {
  const [isVisible, setIsVisible] = useState(false);
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = size / 2 - 10;
  const center = size / 2;

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  let accumulatedPercentage = 0;

  return (
    <div className={cn("flex items-center gap-6", className)}>
      <div className="animate-scale-in">
        <svg width={size} height={size} className="transform -rotate-90">
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const strokeDasharray = 2 * Math.PI * radius;
            const strokeDashoffset = strokeDasharray - (strokeDasharray * percentage) / 100;
            const rotation = (accumulatedPercentage * 360) / 100;
            
            accumulatedPercentage += percentage;

            return (
              <circle
                key={item.label}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={item.color || `hsl(${index * 60}, 70%, 50%)`}
                strokeWidth="8"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={isVisible ? strokeDashoffset : strokeDasharray}
                strokeLinecap="round"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transformOrigin: `${center}px ${center}px`,
                  transition: "stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)",
                  transitionDelay: `${index * 200}ms`,
                }}
              />
            );
          })}
        </svg>
      </div>
      
      <div className="space-y-2">
        {data.map((item, index) => (
          <div 
            key={item.label}
            className="flex items-center gap-2 animate-fade-in"
            style={{ animationDelay: `${index * 100 + 300}ms` }}
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color || `hsl(${index * 60}, 70%, 50%)` }}
            />
            <span className="text-sm text-foreground">{item.label}</span>
            <span className="text-sm text-muted-foreground ml-auto">
              <AnimatedCounter 
                value={isVisible ? item.value : 0}
                className="text-numeric"
              />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
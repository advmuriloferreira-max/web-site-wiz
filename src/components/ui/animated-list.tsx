import React from "react";
import { cn } from "@/lib/utils";

interface AnimatedListProps {
  children: React.ReactNode[];
  className?: string;
  staggerDelay?: number;
}

export function AnimatedList({ 
  children, 
  className,
  staggerDelay = 100 
}: AnimatedListProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {React.Children.map(children, (child, index) => {
        const staggerClass = `animate-stagger-${Math.min(index + 1, 5)}`;
        
        return (
          <div 
            className={cn("animate-fade-in", staggerClass)}
            style={{ 
              animationDelay: `${index * staggerDelay}ms`,
              opacity: 0,
              animationFillMode: 'forwards'
            }}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
}
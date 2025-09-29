import React from "react";
import { cn } from "@/lib/utils";

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  className?: string;
}

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  padding?: "none" | "sm" | "md" | "lg" | "xl";
}

export function ResponsiveLayout({ children, className }: ResponsiveLayoutProps) {
  return (
    <div className={cn(
      "min-h-screen flex flex-col",
      "bg-gradient-to-br from-background via-muted/5 to-background",
      className
    )}>
      {children}
    </div>
  );
}

export function ResponsiveGrid({ children, className, cols = {} }: ResponsiveGridProps) {
  const {
    default: defaultCols = 1,
    sm = 1,
    md = 2,
    lg = 3,
    xl = 4
  } = cols;

  return (
    <div className={cn(
      "grid gap-6",
      `grid-cols-${defaultCols}`,
      `sm:grid-cols-${sm}`,
      `md:grid-cols-${md}`,
      `lg:grid-cols-${lg}`,
      `xl:grid-cols-${xl}`,
      className
    )}>
      {children}
    </div>
  );
}

export function ResponsiveContainer({ 
  children, 
  className, 
  maxWidth = "xl",
  padding = "md" 
}: ResponsiveContainerProps) {
  const maxWidthClasses = {
    sm: "max-w-screen-sm",
    md: "max-w-screen-md", 
    lg: "max-w-screen-lg",
    xl: "max-w-screen-xl",
    "2xl": "max-w-screen-2xl",
    full: "max-w-full"
  };

  const paddingClasses = {
    none: "",
    sm: "px-4 py-2",
    md: "px-6 py-4", 
    lg: "px-8 py-6",
    xl: "px-12 py-8"
  };

  return (
    <div className={cn(
      "mx-auto w-full",
      maxWidthClasses[maxWidth],
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  );
}

export function ResponsiveSection({ 
  children, 
  className,
  spacing = "lg"
}: {
  children: React.ReactNode;
  className?: string;
  spacing?: "sm" | "md" | "lg" | "xl";
}) {
  const spacingClasses = {
    sm: "space-y-4",
    md: "space-y-6", 
    lg: "space-y-8",
    xl: "space-y-12"
  };

  return (
    <section className={cn(
      spacingClasses[spacing],
      className
    )}>
      {children}
    </section>
  );
}

export function ResponsiveFlex({
  children,
  className,
  direction = "row",
  align = "center", 
  justify = "between",
  gap = "4",
  wrap = false
}: {
  children: React.ReactNode;
  className?: string;
  direction?: "row" | "col" | "row-reverse" | "col-reverse";
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly";
  gap?: "1" | "2" | "3" | "4" | "6" | "8";
  wrap?: boolean;
}) {
  const directionClasses = {
    row: "flex-row",
    col: "flex-col",
    "row-reverse": "flex-row-reverse", 
    "col-reverse": "flex-col-reverse"
  };

  const alignClasses = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    stretch: "items-stretch"
  };

  const justifyClasses = {
    start: "justify-start",
    center: "justify-center", 
    end: "justify-end",
    between: "justify-between",
    around: "justify-around",
    evenly: "justify-evenly"
  };

  return (
    <div className={cn(
      "flex",
      directionClasses[direction],
      alignClasses[align],
      justifyClasses[justify],
      `gap-${gap}`,
      wrap && "flex-wrap",
      className
    )}>
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  actions,
  className
}: {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(
      "flex flex-col lg:flex-row lg:items-center lg:justify-between",
      "gap-4 mb-8 pb-6 border-b border-border/50",
      className
    )}>
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          {Icon && <Icon className="h-8 w-8 text-primary" />}
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            {title}
          </h1>
        </div>
        {description && (
          <p className="text-muted-foreground text-lg max-w-2xl">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}

export function ResponsiveCard({
  children,
  className,
  hover = true,
  padding = "md"
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}) {
  const paddingClasses = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8"
  };

  return (
    <div className={cn(
      "bg-card border border-border rounded-lg shadow-sm",
      paddingClasses[padding],
      hover && "transition-all duration-200 hover:shadow-md hover:border-primary/20",
      className
    )}>
      {children}
    </div>
  );
}
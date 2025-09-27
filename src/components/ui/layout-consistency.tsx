import React from "react";
import { cn } from "@/lib/utils";

// Sistema de espaçamento consistente
export const spacing = {
  section: "space-y-8 md:space-y-12", // Entre seções principais
  content: "space-y-4 md:space-y-6",  // Entre conteúdos
  compact: "space-y-2 md:space-y-3",  // Espaçamento compacto
  
  // Padding interno
  paddingCard: "p-6 md:p-8",
  paddingContent: "p-4 md:p-6", 
  paddingCompact: "p-3 md:p-4",
  
  // Containers
  container: "container mx-auto px-4 md:px-6 lg:px-8",
  
  // Gaps para grids
  gridGap: "gap-4 md:gap-6",
  gridGapLg: "gap-6 md:gap-8",
} as const;

// Wrapper para seções com espaçamento consistente
interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
  spacing?: keyof typeof spacing;
}

export function SectionWrapper({ 
  children, 
  className, 
  spacing: spacingType = "section" 
}: SectionWrapperProps) {
  return (
    <div className={cn(spacing[spacingType], className)}>
      {children}
    </div>
  );
}

// Container responsivo padronizado
interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

export function ResponsiveContainer({ 
  children, 
  className, 
  size = "lg" 
}: ResponsiveContainerProps) {
  const sizeClasses = {
    sm: "max-w-3xl",
    md: "max-w-4xl", 
    lg: "max-w-6xl",
    xl: "max-w-7xl",
    full: "max-w-full",
  };

  return (
    <div className={cn(
      "mx-auto px-4 md:px-6 lg:px-8",
      sizeClasses[size],
      className
    )}>
      {children}
    </div>
  );
}

// Grid responsivo padronizado
interface ResponsiveGridProps {
  children: React.ReactNode;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: number;
  className?: string;
}

export function ResponsiveGrid({ 
  children, 
  cols = { default: 1, md: 2, lg: 3 },
  gap = 6,
  className 
}: ResponsiveGridProps) {
  const gridClasses = [
    `grid`,
    `gap-${gap}`,
    cols.default && `grid-cols-${cols.default}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
  ].filter(Boolean).join(" ");

  return (
    <div className={cn(gridClasses, className)}>
      {children}
    </div>
  );
}

// Componente para garantir simetria visual
interface SymmetricLayoutProps {
  left?: React.ReactNode;
  center: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}

export function SymmetricLayout({ 
  left, 
  center, 
  right, 
  className 
}: SymmetricLayoutProps) {
  return (
    <div className={cn(
      "flex items-center justify-between w-full",
      className
    )}>
      <div className="flex-1 flex justify-start">
        {left}
      </div>
      <div className="flex-1 flex justify-center">
        {center}
      </div>
      <div className="flex-1 flex justify-end">
        {right}
      </div>
    </div>
  );
}

// Utilitários para breakpoints consistentes
export const breakpoints = {
  sm: "640px",
  md: "768px", 
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

// Classes de espaçamento padronizadas
export const layoutClasses = {
  // Containers
  container: "container mx-auto px-4 md:px-6 lg:px-8",
  containerFluid: "w-full px-4 md:px-6 lg:px-8",
  
  // Seções
  section: "py-12 md:py-16 lg:py-20",
  sectionCompact: "py-8 md:py-12",
  
  // Cards
  card: "rounded-xl border bg-card text-card-foreground shadow-sm",
  cardHover: "transition-all duration-200 hover:shadow-lg hover:-translate-y-1",
  
  // Flexbox utilities
  flexCenter: "flex items-center justify-center",
  flexBetween: "flex items-center justify-between",
  flexStart: "flex items-center justify-start",
  flexEnd: "flex items-center justify-end",
  
  // Text alignment
  textCenter: "text-center",
  textLeft: "text-left",
  textRight: "text-right",
} as const;
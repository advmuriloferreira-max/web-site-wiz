import React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

// Container responsivo para formulários
interface ResponsiveFormContainerProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
}

export function ResponsiveFormContainer({ 
  children, 
  className, 
  title, 
  description 
}: ResponsiveFormContainerProps) {
  return (
    <Card className={cn("w-full max-w-2xl mx-auto", className)}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle className="text-xl font-semibold">{title}</CardTitle>}
          {description && <p className="text-muted-foreground">{description}</p>}
        </CardHeader>
      )}
      <CardContent className="space-y-6">
        {children}
      </CardContent>
    </Card>
  );
}

// Grid responsivo para dashboards
interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    default: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

export function ResponsiveGrid({ 
  children, 
  className, 
  cols = { default: 1, md: 2, lg: 3 } 
}: ResponsiveGridProps) {
  const gridClasses = cn(
    "grid gap-6",
    {
      [`grid-cols-${cols.default}`]: cols.default,
      [`sm:grid-cols-${cols.sm || cols.default}`]: cols.sm,
      [`md:grid-cols-${cols.md || cols.default}`]: cols.md,
      [`lg:grid-cols-${cols.lg || cols.md || cols.default}`]: cols.lg,
      [`xl:grid-cols-${cols.xl || cols.lg || cols.md || cols.default}`]: cols.xl,
    },
    className
  );

  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
}

// Modal responsivo otimizado
interface ResponsiveModalProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  maxHeight?: boolean;
}

export function ResponsiveModalContent({ 
  children, 
  className, 
  title,
  maxHeight = true 
}: ResponsiveModalProps) {
  return (
    <div className={cn(
      "w-full max-w-4xl mx-auto",
      maxHeight && "max-h-[90vh]",
      "flex flex-col",
      className
    )}>
      {title && (
        <div className="flex-shrink-0 p-6 border-b">
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>
      )}
      
      <ScrollArea className={cn(
        "flex-1 p-6",
        maxHeight && "max-h-[calc(90vh-120px)]"
      )}>
        {children}
      </ScrollArea>
    </div>
  );
}

// Sidebar responsiva
interface ResponsiveSidebarProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  className?: string;
}

export function ResponsiveSidebar({ 
  children, 
  isOpen, 
  onClose, 
  title,
  className 
}: ResponsiveSidebarProps) {
  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-80 bg-background border-r shadow-lg",
        "transform transition-transform duration-300 ease-in-out",
        "md:relative md:translate-x-0 md:shadow-none",
        isOpen ? "translate-x-0" : "-translate-x-full",
        className
      )}>
        {title && (
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">{title}</h2>
          </div>
        )}
        
        <ScrollArea className="flex-1 p-6">
          {children}
        </ScrollArea>
      </div>
    </>
  );
}

// Tabela com scroll horizontal em mobile
interface ResponsiveTableWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveTableWrapper({ children, className }: ResponsiveTableWrapperProps) {
  return (
    <div className={cn(
      "w-full overflow-hidden rounded-lg border",
      className
    )}>
      <ScrollArea className="w-full">
        <div className="min-w-[600px] md:min-w-full">
          {children}
        </div>
      </ScrollArea>
    </div>
  );
}

// Container para ações de formulário
interface FormActionsProps {
  children: React.ReactNode;
  className?: string;
  alignment?: 'left' | 'right' | 'center' | 'between';
}

export function FormActions({ 
  children, 
  className, 
  alignment = 'right' 
}: FormActionsProps) {
  const alignmentClasses = {
    left: 'justify-start',
    right: 'justify-end',
    center: 'justify-center',
    between: 'justify-between'
  };

  return (
    <div className={cn(
      "flex flex-col-reverse sm:flex-row gap-3 pt-6 border-t",
      alignmentClasses[alignment],
      className
    )}>
      {children}
    </div>
  );
}

// Estados vazios responsivos
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ 
  icon, 
  title, 
  description, 
  action, 
  className 
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center p-8 space-y-4",
      "min-h-[300px] max-w-md mx-auto",
      className
    )}>
      <div className="text-muted-foreground/50">
        {icon}
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
      
      {action && (
        <Button onClick={action.onClick} className="mt-4">
          {action.label}
        </Button>
      )}
    </div>
  );
}
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LegalIcons } from "@/components/ui/legal-icons";
import { SecurityIndicator, ComplianceBadge } from "@/components/ui/security-indicators";
import { cn } from "@/lib/utils";

interface CompactHeaderProps {
  className?: string;
}

export function CompactSecurityInfo({ className }: CompactHeaderProps) {
  return (
    <div className={cn(
      "flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full",
      className
    )}>
      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
      <span className="hidden sm:inline">Sistema Seguro</span>
      <Badge variant="outline" className="bg-primary/10 text-primary text-xs px-2 py-0">
        BCB
      </Badge>
    </div>
  );
}

export function QuickActionButton({ 
  icon: Icon, 
  label, 
  onClick, 
  className 
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={cn(
        "text-white/80 hover:text-white hover:bg-white/10 transition-all",
        className
      )}
      title={label}
    >
      <Icon className="h-4 w-4" />
      <span className="sr-only">{label}</span>
    </Button>
  );
}

export function CompactLogo({ className }: CompactHeaderProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <LegalIcons.justice className="h-6 w-6 text-accent flex-shrink-0" />
      <div className="hidden sm:block">
        <h1 className="text-base font-bold text-white tracking-wide">
          INTELLBANK
        </h1>
      </div>
    </div>
  );
}

export function HeaderDivider({ className }: CompactHeaderProps) {
  return (
    <div className={cn(
      "w-px h-6 bg-white/20 hidden lg:block",
      className
    )} />
  );
}

export function CompactBreadcrumbs({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  return (
    <div className={cn(
      "flex-1 hidden lg:flex justify-center max-w-md",
      className
    )}>
      {children}
    </div>
  );
}
import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyStateIllustration } from "@/components/ui/premium-illustrations";
import { GradientText } from "@/components/ui/gradient-elements";

interface PremiumEmptyStateProps {
  title: string;
  description?: string;
  illustration?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  className?: string;
}

export function PremiumEmptyState({
  title,
  description,
  illustration,
  action,
  className,
}: PremiumEmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-12 px-4 text-center",
      className
    )}>
      <div className="mb-6 animate-fade-in">
        {illustration || <EmptyStateIllustration size={160} />}
      </div>
      
      <div className="space-y-3 max-w-md animate-slide-up animate-stagger-1">
        <h3 className="text-lg font-semibold">
          <GradientText variant="primary">{title}</GradientText>
        </h3>
        
        {description && (
          <p className="text-muted-foreground text-sm leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {action && (
        <div className="mt-6 animate-scale-in animate-stagger-2">
          <Button 
            onClick={action.onClick}
            className="interactive-button"
            variant="default"
          >
            {action.icon && <action.icon className="mr-2 h-4 w-4" />}
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
}

// Export aliases for compatibility
interface EmptyDataProps {
  entityName: string;
  createAction: {
    label: string;
    onClick: () => void;
  };
}

interface EmptySearchProps {
  searchTerm: string;
  onClear: () => void;
}

export function EmptyData({ entityName, createAction }: EmptyDataProps) {
  return (
    <PremiumEmptyState
      title={`Nenhum ${entityName} encontrado`}
      description={`Você ainda não criou nenhum ${entityName}. Clique no botão abaixo para começar.`}
      action={createAction}
    />
  );
}

export function EmptySearch({ searchTerm, onClear }: EmptySearchProps) {
  return (
    <PremiumEmptyState
      title="Nenhum resultado encontrado"
      description={`Não encontramos resultados para "${searchTerm}". Tente outro termo de busca.`}
      action={{
        label: "Limpar busca",
        onClick: onClear,
      }}
    />
  );
}
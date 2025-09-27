import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PremiumEmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline";
  };
  illustration?: React.ReactNode;
}

export function PremiumEmptyState({
  icon: Icon,
  title,
  description,
  action,
  illustration,
  className,
  ...props
}: PremiumEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 py-12 space-y-4",
        className
      )}
      {...props}
    >
      {/* Illustration or Icon */}
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 mb-2">
        {illustration ? (
          illustration
        ) : Icon ? (
          <Icon className="h-8 w-8 text-slate-400" />
        ) : (
          <EmptyBoxIllustration />
        )}
      </div>

      {/* Content */}
      <div className="space-y-2 max-w-sm">
        <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
        {description && (
          <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
        )}
      </div>

      {/* Action */}
      {action && (
        <Button
          onClick={action.onClick}
          variant={action.variant || "default"}
          className="mt-4"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}

// Default empty box illustration
function EmptyBoxIllustration() {
  return (
    <svg
      className="h-8 w-8 text-slate-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
      />
    </svg>
  );
}

// Specialized empty states for common scenarios
interface EmptyDataProps extends Omit<PremiumEmptyStateProps, "icon" | "title"> {
  entityName: string;
  createAction?: PremiumEmptyStateProps["action"];
}

export function EmptyData({ entityName, createAction, ...props }: EmptyDataProps) {
  return (
    <PremiumEmptyState
      title={`Nenhum ${entityName.toLowerCase()} encontrado`}
      description={`Você ainda não possui ${entityName.toLowerCase()}s cadastrados. Comece criando seu primeiro ${entityName.toLowerCase()}.`}
      action={createAction}
      illustration={<EmptyDataIllustration />}
      {...props}
    />
  );
}

export function EmptySearch({ searchTerm, onClear }: { searchTerm: string; onClear: () => void }) {
  return (
    <PremiumEmptyState
      title="Nenhum resultado encontrado"
      description={`Não encontramos resultados para "${searchTerm}". Tente ajustar sua pesquisa.`}
      action={{
        label: "Limpar busca",
        onClick: onClear,
        variant: "outline"
      }}
      illustration={<SearchIllustration />}
    />
  );
}

export function EmptyFilter({ onClearFilters }: { onClearFilters: () => void }) {
  return (
    <PremiumEmptyState
      title="Nenhum item corresponde aos filtros"
      description="Tente ajustar ou remover alguns filtros para ver mais resultados."
      action={{
        label: "Limpar filtros",
        onClick: onClearFilters,
        variant: "outline"
      }}
      illustration={<FilterIllustration />}
    />
  );
}

// Custom illustrations
function EmptyDataIllustration() {
  return (
    <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-3.75 2.25L9 14.25l-2.25-2.25L3 16.5l3.75-3.75L9 14.25l2.25-2.25L15 10.5V7.5H9.75Z" />
    </svg>
  );
}

function SearchIllustration() {
  return (
    <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  );
}

function FilterIllustration() {
  return (
    <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
    </svg>
  );
}
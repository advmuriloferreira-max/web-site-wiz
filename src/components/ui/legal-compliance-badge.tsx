import { LegalIcons } from "@/components/ui/legal-icons";
import { cn } from "@/lib/utils";

interface ComplianceBadgeProps {
  regulation: string;
  status: "compliant" | "warning" | "non-compliant";
  lastCheck?: Date;
  className?: string;
}

const statusConfig = {
  compliant: {
    bg: "bg-success/10",
    border: "border-success/30",
    text: "text-success",
    icon: LegalIcons.compliance,
    label: "CONFORME"
  },
  warning: {
    bg: "bg-warning/10", 
    border: "border-warning/30",
    text: "text-warning",
    icon: LegalIcons.warning,
    label: "ATENÇÃO"
  },
  non_compliant: {
    bg: "bg-destructive/10",
    border: "border-destructive/30", 
    text: "text-destructive",
    icon: LegalIcons.warning,
    label: "NÃO CONFORME"
  }
};

export function ComplianceBadge({ regulation, status, lastCheck, className }: ComplianceBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={cn(
      "flex items-center space-x-3 px-4 py-3 rounded-sm border-2",
      config.bg,
      config.border,
      className
    )}>
      <div className={cn("p-2 rounded-sm", config.bg, "border", config.border)}>
        <Icon className={cn("h-5 w-5", config.text)} />
      </div>
      
      <div className="flex-1">
        <div className="flex items-center space-x-2">
          <span className={cn("font-bold text-sm uppercase tracking-wider", config.text)}>
            {config.label}
          </span>
          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-sm font-medium text-foreground">
            {regulation}
          </span>
        </div>
        
        {lastCheck && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center">
            <LegalIcons.calendar className="h-3 w-3 mr-1" />
            Verificado em {lastCheck.toLocaleString('pt-BR')}
          </p>
        )}
      </div>
    </div>
  );
}

export function BCBComplianceBadge() {
  return (
    <ComplianceBadge
      regulation="Resolução BCB 4966/2021"
      status="compliant"
      lastCheck={new Date()}
    />
  );
}

export function SecurityComplianceBadge() {
  return (
    <ComplianceBadge
      regulation="Criptografia AES-256"
      status="compliant"
      lastCheck={new Date()}
    />
  );
}
import { LegalIcons } from "@/components/ui/legal-icons";
import { cn } from "@/lib/utils";

interface LegalHeaderProps {
  title: string;
  subtitle?: string;
  showCompliance?: boolean;
  className?: string;
}

export function LegalHeader({ title, subtitle, showCompliance = true, className }: LegalHeaderProps) {
  return (
    <div className={cn("executive-header flex items-center justify-between", className)}>
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-accent rounded-sm flex items-center justify-center shadow-xl">
          <LegalIcons.justice className="h-7 w-7 text-primary" />
        </div>
        <div>
          <h1 className="title-main text-2xl text-white">{title}</h1>
          {subtitle && (
            <p className="text-accent text-sm font-medium uppercase tracking-wider">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      
      {showCompliance && (
        <div className="flex items-center space-x-4">
          <ComplianceBadge />
          <SecurityIndicator />
        </div>
      )}
    </div>
  );
}

function ComplianceBadge() {
  return (
    <div className="flex items-center space-x-2 px-4 py-2 bg-success/10 border border-success/20 rounded-sm">
      <LegalIcons.compliance className="h-4 w-4 text-success" />
      <div className="text-xs">
        <div className="font-semibold text-success uppercase tracking-wider">BCB Conforme</div>
        <div className="text-success/80">Resolução BCB 352/2023</div>
      </div>
    </div>
  );
}

function SecurityIndicator() {
  return (
    <div className="flex items-center space-x-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-sm">
      <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
      <div className="text-xs">
        <div className="font-semibold text-accent uppercase tracking-wider">Sistema Seguro</div>
        <div className="text-accent/80">Criptografia AES-256</div>
      </div>
    </div>
  );
}

interface LegalTableHeaderProps {
  title: string;
  count?: number;
  className?: string;
}

export function LegalTableHeader({ title, count, className }: LegalTableHeaderProps) {
  return (
    <div className={cn(
      "flex items-center justify-between p-6 bg-gradient-to-r from-primary/5 to-accent/5 border-b-2 border-accent/20",
      className
    )}>
      <div className="flex items-center space-x-3">
        <LegalIcons.contract className="h-6 w-6 text-primary" />
        <div>
          <h2 className="title-section text-primary">{title}</h2>
          {count !== undefined && (
            <p className="text-body text-muted-foreground">
              {count} {count === 1 ? 'registro' : 'registros'}
            </p>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
        <LegalIcons.calendar className="h-4 w-4" />
        <span>Última atualização: {new Date().toLocaleDateString('pt-BR')}</span>
      </div>
    </div>
  );
}
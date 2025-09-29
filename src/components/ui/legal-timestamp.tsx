import { LegalIcons } from "@/components/ui/legal-icons";
import { cn } from "@/lib/utils";

interface LegalTimestampProps {
  label?: string;
  timestamp: Date | string;
  format?: "full" | "date" | "time" | "relative";
  showIcon?: boolean;
  className?: string;
}

export function LegalTimestamp({ 
  label = "Última atualização",
  timestamp, 
  format = "full",
  showIcon = true,
  className 
}: LegalTimestampProps) {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;

  const formatDate = (date: Date, format: string) => {
    switch (format) {
      case "full":
        return date.toLocaleString('pt-BR', {
          day: '2-digit',
          month: '2-digit', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
      case "date":
        return date.toLocaleDateString('pt-BR');
      case "time":
        return date.toLocaleTimeString('pt-BR');
      case "relative":
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        if (minutes < 1) return "Agora mesmo";
        if (minutes < 60) return `${minutes} min atrás`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h atrás`;
        const days = Math.floor(hours / 24);
        return `${days} dias atrás`;
      default:
        return date.toLocaleString('pt-BR');
    }
  };

  return (
    <div className={cn(
      "flex items-center space-x-2 text-xs text-muted-foreground bg-surface-1 px-3 py-2 rounded-sm border",
      className
    )}>
      {showIcon && <LegalIcons.calendar className="h-3 w-3" />}
      <span className="font-medium uppercase tracking-wider">{label}:</span>
      <span className="font-mono">{formatDate(date, format)}</span>
    </div>
  );
}

interface LegalAuditTrailProps {
  actions: Array<{
    action: string;
    user: string;
    timestamp: Date | string;
    details?: string;
  }>;
  className?: string;
}

export function LegalAuditTrail({ actions, className }: LegalAuditTrailProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center space-x-2 pb-2 border-b border-accent/20">
        <LegalIcons.document className="h-4 w-4 text-primary" />
        <h3 className="title-card text-primary">Trilha de Auditoria</h3>
      </div>
      
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {actions.map((action, index) => (
          <div key={index} className="flex items-start space-x-3 p-3 bg-surface-1 rounded-sm border">
            <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-body font-medium">{action.action}</p>
                <LegalTimestamp 
                  label=""
                  timestamp={action.timestamp}
                  format="relative"
                  showIcon={false}
                  className="bg-transparent border-0 p-0"
                />
              </div>
              <p className="text-label text-muted-foreground">Por: {action.user}</p>
              {action.details && (
                <p className="text-xs text-muted-foreground mt-1">{action.details}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
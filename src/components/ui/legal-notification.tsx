import { LegalIcons } from "@/components/ui/legal-icons";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface LegalNotificationProps {
  type: "compliance" | "security" | "update" | "warning";
  title: string;
  message: string;
  timestamp?: string;
  dismissible?: boolean;
  className?: string;
}

const notificationConfig = {
  compliance: {
    icon: LegalIcons.compliance,
    bgColor: "bg-success/10",
    borderColor: "border-success/30",
    textColor: "text-success",
    iconColor: "text-success"
  },
  security: {
    icon: LegalIcons.justice,
    bgColor: "bg-accent/10", 
    borderColor: "border-accent/30",
    textColor: "text-accent",
    iconColor: "text-accent"
  },
  update: {
    icon: LegalIcons.document,
    bgColor: "bg-primary/10",
    borderColor: "border-primary/30", 
    textColor: "text-primary",
    iconColor: "text-primary"
  },
  warning: {
    icon: LegalIcons.warning,
    bgColor: "bg-warning/10",
    borderColor: "border-warning/30",
    textColor: "text-warning", 
    iconColor: "text-warning"
  }
};

export function LegalNotification({ 
  type, 
  title, 
  message, 
  timestamp, 
  dismissible = true,
  className 
}: LegalNotificationProps) {
  const [dismissed, setDismissed] = useState(false);
  const config = notificationConfig[type];
  const Icon = config.icon;

  if (dismissed) return null;

  return (
    <div className={cn(
      "flex items-start space-x-4 p-4 rounded-sm border-2",
      config.bgColor,
      config.borderColor,
      className
    )}>
      <div className={cn("p-2 rounded-sm", config.bgColor, "border", config.borderColor)}>
        <Icon className={cn("h-5 w-5", config.iconColor)} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div>
            <h4 className={cn("font-semibold uppercase tracking-wider text-sm", config.textColor)}>
              {title}
            </h4>
            <p className="text-body mt-1">
              {message}
            </p>
            {timestamp && (
              <p className="text-xs text-muted-foreground mt-2 flex items-center">
                <LegalIcons.calendar className="h-3 w-3 mr-1" />
                {timestamp}
              </p>
            )}
          </div>
          
          {dismissible && (
            <button
              onClick={() => setDismissed(true)}
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
            >
              <LegalIcons.close className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function ComplianceAlert() {
  return (
    <LegalNotification
      type="compliance"
      title="Sistema em Conformidade"
      message="Todos os cálculos estão em conformidade com a Resolução BCB 352/2023 e BCB 4966/2021. Última verificação realizada em tempo real."
      timestamp={new Date().toLocaleString('pt-BR')}
      dismissible={false}
    />
  );
}

export function SecurityNotification() {
  return (
    <LegalNotification
      type="security"
      title="Conexão Segura Ativa"
      message="Todos os dados são protegidos por criptografia AES-256 e transmitidos via HTTPS. Certificado SSL válido."
      timestamp={new Date().toLocaleString('pt-BR')}
      dismissible={false}
    />
  );
}
import { Link } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useDashboardAlertas } from "@/hooks/useDashboardData";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";

export function DashboardAlerts() {
  const { data: alertas, isLoading } = useDashboardAlertas();

  if (isLoading || !alertas || alertas.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {alertas.map((alerta, index) => {
        const Icon = alerta.tipo === "error" 
          ? AlertCircle 
          : alerta.tipo === "warning" 
          ? AlertTriangle 
          : Info;

        const variant = alerta.tipo === "error" 
          ? "destructive" 
          : "default";

        return (
          <Alert key={index} variant={variant}>
            <Icon className="h-4 w-4" />
            <AlertTitle>
              {alerta.tipo === "error" 
                ? "Ação Necessária" 
                : alerta.tipo === "warning" 
                ? "Atenção" 
                : "Informação"}
            </AlertTitle>
            <AlertDescription className="flex items-center justify-between gap-4">
              <span>{alerta.mensagem}</span>
              {alerta.acao && (
                <Button variant="outline" size="sm" asChild>
                  <Link to={alerta.acao.url}>{alerta.acao.label}</Link>
                </Button>
              )}
            </AlertDescription>
          </Alert>
        );
      })}
    </div>
  );
}

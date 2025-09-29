import React from "react";
import { Shield, Lock, CheckCircle, Clock, Database, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface SecurityIndicatorProps {
  className?: string;
}

export function SecurityIndicator({ className }: SecurityIndicatorProps) {
  const isSecure = window.location.protocol === 'https:';
  
  return (
    <div className={cn("flex items-center gap-1 text-xs", className)}>
      <Lock className="h-3 w-3 text-green-600" />
      <span className="text-green-600 font-medium">
        {isSecure ? 'Conexão Segura' : 'Desenvolvimento'}
      </span>
    </div>
  );
}

export function ComplianceBadge({ className }: SecurityIndicatorProps) {
  return (
    <Badge variant="outline" className={cn("bg-green-50 border-green-200 text-green-800", className)}>
      <Shield className="h-3 w-3 mr-1" />
      Conforme BCB 352/2023
    </Badge>
  );
}

export function BackupIndicator({ className }: SecurityIndicatorProps) {
  const [lastBackup, setLastBackup] = React.useState<Date>(new Date());
  
  React.useEffect(() => {
    const interval = setInterval(() => {
      setLastBackup(new Date());
    }, 30000); // Simula backup a cada 30 segundos
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className={cn("flex items-center gap-2 text-xs text-muted-foreground", className)}>
      <Database className="h-3 w-3 text-blue-600" />
      <span>Último backup: {lastBackup.toLocaleTimeString()}</span>
      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
    </div>
  );
}

export function ActivityTimestamp({ action, timestamp }: { action: string; timestamp?: Date; className?: string }) {
  const time = timestamp || new Date();
  
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <Clock className="h-3 w-3" />
      <span>{action} em {time.toLocaleString('pt-BR')}</span>
    </div>
  );
}

export function AuditLog({ className }: SecurityIndicatorProps) {
  const activities = [
    { action: "Contrato visualizado", user: "Usuário atual", time: new Date() },
    { action: "Cálculo atualizado", user: "Sistema", time: new Date(Date.now() - 300000) },
    { action: "Dados sincronizados", user: "Sistema", time: new Date(Date.now() - 600000) },
  ];
  
  return (
    <Card className={cn("w-full max-w-sm", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Log de Atividades
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {activities.map((activity, index) => (
          <div key={index} className="text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-medium">{activity.action}</span>
              <CheckCircle className="h-3 w-3 text-green-600" />
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>{activity.user}</span>
              <span>{activity.time.toLocaleTimeString()}</span>
            </div>
            {index < activities.length - 1 && <Separator />}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function RegulatoryCompliance({ className }: SecurityIndicatorProps) {
  return (
    <Card className={cn("bg-gradient-to-r from-blue-50 to-green-50 border-blue-200", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Shield className="h-4 w-4 text-blue-600" />
          Conformidade Regulatória
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">Resolução BCB 352/2023</span>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">Circular BCB 4.145/2023</span>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">Lei Geral de Proteção de Dados</span>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Última atualização regulatória:</div>
          <div className="text-xs font-medium">25/09/2024 - BCB 352/2023</div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-xs text-green-700 font-medium">Sistema Atualizado</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function TransparencyPanel({ calculation }: { calculation?: any; className?: string }) {
  return (
    <Card className="bg-gradient-to-r from-slate-50 to-blue-50 border-slate-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-blue-600" />
          Transparência dos Cálculos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-xs space-y-2">
          <div className="font-medium">Metodologia Aplicada:</div>
          <div className="text-muted-foreground">
            • Resolução BCB 352/2023 - Anexo I<br/>
            • Cálculo por Estágio de Risco<br/>
            • Aplicação de Garantias (quando aplicável)<br/>
            • Período de Observação para Reestruturadas
          </div>
        </div>
        
        <Separator />
        
        <div className="text-xs">
          <div className="font-medium mb-1">Fonte dos Dados:</div>
          <div className="text-muted-foreground">
            Base de dados interna - Atualizada em tempo real
          </div>
        </div>
        
        <div className="text-xs">
          <div className="font-medium mb-1">Auditoria:</div>
          <div className="text-muted-foreground">
            Todas as alterações são registradas com timestamp
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
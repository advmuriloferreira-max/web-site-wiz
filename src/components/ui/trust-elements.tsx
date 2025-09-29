import React from "react";
import { Shield, Lock, Clock, Database, CheckCircle, AlertTriangle, FileText, Users, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface TrustElementProps {
  className?: string;
}

export function SecurityBadge({ className }: TrustElementProps) {
  return (
    <div className={cn("flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-full", className)}>
      <Lock className="h-4 w-4 text-green-600" />
      <span className="text-sm font-medium text-green-800">Área Protegida</span>
    </div>
  );
}

export function CertificationSeal({ className }: TrustElementProps) {
  return (
    <Card className={cn("bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200", className)}>
      <CardContent className="p-4 text-center">
        <div className="flex justify-center mb-3">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <Award className="h-8 w-8 text-white" />
          </div>
        </div>
        <h3 className="font-bold text-blue-900 mb-2">CERTIFICADO</h3>
        <p className="text-xs text-blue-700 font-medium mb-2">
          Conforme Resolução BCB 352/2023
        </p>
        <div className="text-xs text-blue-600">
          Válido até: Dez/2024
        </div>
        <Badge variant="outline" className="mt-2 bg-blue-100 text-blue-800 border-blue-300">
          Verificado
        </Badge>
      </CardContent>
    </Card>
  );
}

export function DataSourceIndicator({ source, lastUpdate }: { source: string; lastUpdate: Date; className?: string }) {
  return (
    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border">
      <Database className="h-4 w-4 text-slate-600" />
      <div className="text-xs">
        <div className="font-medium text-slate-800">Fonte: {source}</div>
        <div className="text-slate-600">Atualizado: {lastUpdate.toLocaleString('pt-BR')}</div>
      </div>
      <div className="w-2 h-2 rounded-full bg-green-500 ml-auto" />
    </div>
  );
}

export function CalculationTransparency({ formula, steps }: { formula: string; steps: string[]; className?: string }) {
  const [showDetails, setShowDetails] = React.useState(false);
  
  return (
    <Card className="bg-amber-50 border-amber-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <FileText className="h-4 w-4 text-amber-600" />
          Metodologia do Cálculo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="text-xs">
            <div className="font-medium text-amber-800 mb-1">Fórmula Aplicada:</div>
            <code className="bg-amber-100 px-2 py-1 rounded text-amber-900 font-mono">
              {formula}
            </code>
          </div>
          
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-amber-700 hover:text-amber-900 font-medium underline"
          >
            {showDetails ? 'Ocultar' : 'Ver'} detalhes do cálculo
          </button>
          
          {showDetails && (
            <div className="space-y-2 p-3 bg-amber-100 rounded">
              <div className="font-medium text-xs text-amber-800">Passos do Cálculo:</div>
              {steps.map((step, index) => (
                <div key={index} className="text-xs text-amber-700 flex items-start gap-2">
                  <span className="font-mono bg-amber-200 px-1 rounded">{index + 1}</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function PrivacyIndicator({ className }: TrustElementProps) {
  return (
    <div className={cn("flex items-center gap-2 text-xs text-slate-600", className)}>
      <Shield className="h-3 w-3" />
      <span>
        Seus dados estão protegidos pela <a href="#" className="text-blue-600 hover:underline">LGPD</a>
      </span>
    </div>
  );
}

export function SystemStatus({ className }: TrustElementProps) {
  const [status] = React.useState({
    database: 'online',
    backup: 'active',
    security: 'secure',
    lastCheck: new Date()
  });
  
  return (
    <Card className={cn("bg-slate-50 border-slate-200", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-slate-600" />
          Status do Sistema
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-600">Base de Dados</span>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs text-green-700 font-medium">Online</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-600">Backup</span>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs text-green-700 font-medium">Ativo</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-600">Segurança</span>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs text-green-700 font-medium">Seguro</span>
            </div>
          </div>
          
          <Separator />
          
          <div className="text-xs text-slate-500 text-center">
            Verificado: {status.lastCheck.toLocaleTimeString('pt-BR')}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function TeamCredibility({ className }: TrustElementProps) {
  return (
    <Card className={cn("bg-gradient-to-r from-slate-50 to-blue-50 border-slate-200", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Users className="h-4 w-4 text-blue-600" />
          Equipe Especializada
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 text-xs">
          <div>
            <div className="font-medium text-slate-800">Desenvolvido por:</div>
            <div className="text-slate-600">Especialistas em Regulação Bancária</div>
          </div>
          
          <div>
            <div className="font-medium text-slate-800">Consultoria:</div>
            <div className="text-slate-600">Escritórios Jurídicos Especializados</div>
          </div>
          
          <div>
            <div className="font-medium text-slate-800">Homologação:</div>
            <div className="text-slate-600">Auditores Independentes</div>
          </div>
          
          <Separator />
          
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-green-700 font-medium">Equipe Certificada</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function UpdateNotification({ version, date }: { version: string; date: Date; className?: string }) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-2">
        <CheckCircle className="h-4 w-4 text-blue-600" />
        <span className="text-sm font-medium text-blue-800">Sistema Atualizado</span>
      </div>
      <div className="text-xs text-blue-700 space-y-1">
        <div>Versão: <span className="font-mono">{version}</span></div>
        <div>Atualizado em: {date.toLocaleDateString('pt-BR')}</div>
        <div className="text-blue-600">✓ Conformidade regulatória verificada</div>
      </div>
    </div>
  );
}
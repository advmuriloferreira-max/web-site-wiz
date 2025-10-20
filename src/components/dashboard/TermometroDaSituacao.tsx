import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, TrendingUp, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TermometroDaSituacaoProps {
  classificacao: string | null;
  diasAtraso: number;
  valorProvisao: number;
  valorDivida: number;
}

export function TermometroDaSituacao({
  classificacao,
  diasAtraso,
  valorProvisao,
  valorDivida,
}: TermometroDaSituacaoProps) {
  const [fillLevel, setFillLevel] = useState(0);

  // Determina o nível de risco baseado no TEMPO (estágio) e PROVISÃO
  // Classificação C1-C5 é o TIPO de operação, não o risco temporal
  const calcularNivelRisco = () => {
    const percentualProvisao = valorDivida > 0 ? (valorProvisao / valorDivida) * 100 : 0;
    
    // Estágio baseado em dias de atraso (tempo)
    let estagioRisco = 1;
    if (diasAtraso > 90) estagioRisco = 3;
    else if (diasAtraso > 30) estagioRisco = 2;
    
    // Peso base pelo estágio temporal (0-50)
    const pesoTempo = estagioRisco === 1 ? 15 : estagioRisco === 2 ? 35 : 50;
    
    // Peso adicional pelo percentual de provisão (0-50)
    const pesoProvisao = Math.min(percentualProvisao / 2, 50);
    
    // Risco total: combinação de tempo + provisão
    return Math.min(pesoTempo + pesoProvisao, 100);
  };

  const nivelRisco = calcularNivelRisco();
  const percentualProvisao = valorDivida > 0 ? (valorProvisao / valorDivida) * 100 : 0;
  
  // Determinar estágio baseado no tempo
  let estagioAtual = 1;
  if (diasAtraso > 90) estagioAtual = 3;
  else if (diasAtraso > 30) estagioAtual = 2;

  // Determina cor e mensagem baseado no nível
  const getStatusInfo = () => {
    if (nivelRisco <= 20) {
      return {
        cor: "from-green-500 to-green-600",
        bgCor: "bg-green-100",
        textCor: "text-green-700",
        icon: CheckCircle2,
        titulo: "Situação Controlada",
        descricao: "Baixo risco de perda"
      };
    } else if (nivelRisco <= 50) {
      return {
        cor: "from-yellow-500 to-yellow-600",
        bgCor: "bg-yellow-100",
        textCor: "text-yellow-700",
        icon: TrendingUp,
        titulo: "Atenção Necessária",
        descricao: "Risco moderado"
      };
    } else {
      return {
        cor: "from-red-500 to-red-600",
        bgCor: "bg-red-100",
        textCor: "text-red-700",
        icon: AlertTriangle,
        titulo: "Situação Crítica",
        descricao: "Alto risco de perda"
      };
    }
  };

  const status = getStatusInfo();
  const Icon = status.icon;

  useEffect(() => {
    const timer = setTimeout(() => {
      setFillLevel(nivelRisco);
    }, 100);
    return () => clearTimeout(timer);
  }, [nivelRisco]);

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800">
          <Icon className={cn("h-5 w-5", status.textCor)} />
          Termômetro da Situação
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Termômetro Visual */}
        <div className="relative">
          <div className="h-32 w-full bg-slate-100 rounded-lg overflow-hidden relative">
            <div
              className={cn(
                "absolute bottom-0 left-0 w-full bg-gradient-to-t transition-all duration-1000 ease-out",
                status.cor
              )}
              style={{ height: `${fillLevel}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
            
            {/* Marcadores */}
            <div className="absolute inset-0 flex flex-col justify-between py-2 px-4 pointer-events-none">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>100%</span>
                <span className="font-semibold">Crítico</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>50%</span>
                <span className="font-semibold">Moderado</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>0%</span>
                <span className="font-semibold">Seguro</span>
              </div>
            </div>
          </div>

          {/* Indicador de Nível */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className={cn("px-4 py-2 rounded-lg shadow-lg", status.bgCor)}>
              <div className={cn("text-2xl font-bold", status.textCor)}>
                {nivelRisco}%
              </div>
            </div>
          </div>
        </div>

        {/* Status Card */}
        <div className={cn("p-4 rounded-lg", status.bgCor)}>
          <h3 className={cn("font-semibold text-lg mb-1", status.textCor)}>
            {status.titulo}
          </h3>
          <p className={cn("text-sm mb-3", status.textCor)}>
            {status.descricao}
          </p>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className={cn("font-semibold", status.textCor)}>
                {classificacao || 'N/A'}
              </div>
              <div className={cn("text-xs", status.textCor)}>
                Tipo de Operação
              </div>
            </div>
            <div>
              <div className={cn("font-semibold", status.textCor)}>
                Estágio {estagioAtual}
              </div>
              <div className={cn("text-xs", status.textCor)}>
                ({diasAtraso} dias)
              </div>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-current/20">
            <div className="flex justify-between items-center">
              <span className={cn("text-xs", status.textCor)}>
                Provisão Bancária
              </span>
              <span className={cn("font-bold", status.textCor)}>
                {percentualProvisao.toFixed(1)}%
              </span>
            </div>
            <p className={cn("text-xs mt-1", status.textCor)}>
              {percentualProvisao > 70 
                ? "🎯 Excelente oportunidade de negociação! Banco tem alto interesse em resolver."
                : percentualProvisao > 40
                ? "👍 Boa janela para negociação com descontos interessantes."
                : "⏳ Banco ainda não provisionou muito. Aguarde momento melhor."}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

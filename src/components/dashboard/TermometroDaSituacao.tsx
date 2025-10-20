import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, TrendingUp, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TermometroDaSituacaoProps {
  classificacao: string | null; // Tipo de operação (C1-C5) - apenas informativo
  diasAtraso: number; // Define o estágio temporal
  valorProvisao: number; // Quanto maior, melhor para negociar
  valorDivida: number;
}

export function TermometroDaSituacao({
  classificacao,
  diasAtraso,
  valorProvisao,
  valorDivida,
}: TermometroDaSituacaoProps) {
  const [fillLevel, setFillLevel] = useState(0);

  // LÓGICA BCB 4.966/2021 e 352/2023:
  // - Estágio (1-3) baseado APENAS em dias de atraso
  // - Percentual de provisão indica OPORTUNIDADE de negociação
  // - Quanto MAIOR a provisão, MAIOR o interesse do banco em resolver
  
  const percentualProvisao = valorDivida > 0 ? (valorProvisao / valorDivida) * 100 : 0;
  
  // Estágio baseado APENAS em tempo de atraso (BCB 4.966/2021)
  let estagioAtual = 1;
  if (diasAtraso > 90) estagioAtual = 3;
  else if (diasAtraso > 30) estagioAtual = 2;
  
  // Nível do termômetro = percentual de provisão (0-100%)
  // Este percentual indica a OPORTUNIDADE de negociação
  const nivelTermometro = Math.min(percentualProvisao, 100);

  // Status baseado no percentual de PROVISÃO (oportunidade de negociação)
  const getStatusInfo = () => {
    if (percentualProvisao >= 70) {
      return {
        cor: "from-green-500 to-green-600",
        bgCor: "bg-green-100",
        textCor: "text-green-700",
        icon: TrendingUp,
        titulo: "Excelente Oportunidade",
        descricao: "Alta provisão = Banco quer negociar"
      };
    } else if (percentualProvisao >= 40) {
      return {
        cor: "from-yellow-500 to-yellow-600",
        bgCor: "bg-yellow-100",
        textCor: "text-yellow-700",
        icon: AlertTriangle,
        titulo: "Boa Janela",
        descricao: "Provisão moderada = Pode negociar"
      };
    } else {
      return {
        cor: "from-blue-500 to-blue-600",
        bgCor: "bg-blue-100",
        textCor: "text-blue-700",
        icon: CheckCircle2,
        titulo: "Aguardar Melhor Momento",
        descricao: "Baixa provisão = Banco não provisionou muito ainda"
      };
    }
  };

  const status = getStatusInfo();
  const Icon = status.icon;

  useEffect(() => {
    const timer = setTimeout(() => {
      setFillLevel(nivelTermometro);
    }, 100);
    return () => clearTimeout(timer);
  }, [nivelTermometro]);

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800">
          <Icon className={cn("h-5 w-5", status.textCor)} />
          Oportunidade de Negociação
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Baseado no percentual de provisão bancária
        </p>
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
                <span className="font-semibold">Ótimo</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>50%</span>
                <span className="font-semibold">Bom</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>0%</span>
                <span className="font-semibold">Aguardar</span>
              </div>
            </div>
          </div>

          {/* Indicador de Nível */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className={cn("px-4 py-2 rounded-lg shadow-lg", status.bgCor)}>
              <div className={cn("text-2xl font-bold", status.textCor)}>
                {percentualProvisao.toFixed(1)}%
              </div>
              <div className={cn("text-xs text-center", status.textCor)}>
                Provisão
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
          
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <div className={cn("font-semibold", status.textCor)}>
                {classificacao || 'N/A'}
              </div>
              <div className={cn("text-xs", status.textCor)}>
                Tipo Operação
              </div>
            </div>
            <div>
              <div className={cn("font-semibold", status.textCor)}>
                Estágio {estagioAtual}
              </div>
              <div className={cn("text-xs", status.textCor)}>
                {estagioAtual === 1 ? "0-30 dias" : estagioAtual === 2 ? "31-90 dias" : ">90 dias"}
              </div>
            </div>
            <div>
              <div className={cn("font-semibold", status.textCor)}>
                {diasAtraso} dias
              </div>
              <div className={cn("text-xs", status.textCor)}>
                em atraso
              </div>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-current/20">
            <p className={cn("text-xs font-medium mb-2", status.textCor)}>
              Interpretação:
            </p>
            <p className={cn("text-xs", status.textCor)}>
              {percentualProvisao >= 70 
                ? "🎯 Banco já provisionou mais de 70% da dívida. Este é o melhor momento para negociar grandes descontos!"
                : percentualProvisao >= 40
                ? "👍 Provisão entre 40-70%. Boa janela para conseguir descontos razoáveis."
                : percentualProvisao >= 20
                ? "⏳ Provisão entre 20-40%. Banco começa a ter interesse, mas pode melhorar."
                : "⌛ Provisão abaixo de 20%. Banco ainda não provisionou muito. Melhor aguardar mais tempo."}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, AlertCircle, XCircle, Skull, TrendingDown, Scale } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TimelineDoTerrorProps {
  valorDividaAtual: number;
  classificacaoAtual: string | null;
  diasAtrasoAtual: number;
}

export function TimelineDoTerror({
  valorDividaAtual,
  classificacaoAtual,
  diasAtrasoAtual,
}: TimelineDoTerrorProps) {

  // Calcula eventos futuros baseados em TEMPO e PROVISÃO
  // Classificação C1-C5 NÃO muda! É o tipo de operação.
  const calcularEventosFuturos = () => {
    const taxaMensal = 0.045; // 4.5% ao mês (juros + encargos)
    
    const eventos = [
      {
        mes: 1,
        diasAtraso: diasAtrasoAtual + 30,
        titulo: "1 Mês Depois",
        estagio: diasAtrasoAtual + 30 <= 30 ? 1 : diasAtrasoAtual + 30 <= 90 ? 2 : 3,
        valor: valorDividaAtual * (1 + taxaMensal),
        descricao: "Provisão aumenta. Estágio pode mudar conforme dias de atraso.",
        provisaoEstimada: "10-20%",
        analogia: "🏃 Corrida de 100m - Ainda dá pra recuperar",
        icon: AlertCircle,
        cor: "text-yellow-600",
        bgCor: "bg-yellow-100",
        bordaCor: "border-yellow-300"
      },
      {
        mes: 2,
        diasAtraso: diasAtrasoAtual + 60,
        titulo: "2 Meses Depois",
        estagio: diasAtrasoAtual + 60 <= 30 ? 1 : diasAtrasoAtual + 60 <= 90 ? 2 : 3,
        valor: valorDividaAtual * Math.pow(1 + taxaMensal, 2),
        descricao: "Banco aumenta provisão. Entra em alerta moderado.",
        provisaoEstimada: "20-35%",
        analogia: "🏃 Maratona iniciada - Precisa de estratégia",
        icon: AlertCircle,
        cor: "text-orange-600",
        bgCor: "bg-orange-100",
        bordaCor: "border-orange-300"
      },
      {
        mes: 3,
        diasAtraso: diasAtrasoAtual + 90,
        titulo: "3 Meses Depois (Marco 90 dias)",
        estagio: 3,
        valor: valorDividaAtual * Math.pow(1 + taxaMensal, 3),
        descricao: "ESTÁGIO 3 - Ativo problemático. Provisão aumenta significativamente.",
        provisaoEstimada: "40-70%",
        analogia: "⚠️ Ultramaratona - Situação crítica",
        icon: XCircle,
        cor: "text-red-600",
        bgCor: "bg-red-100",
        bordaCor: "border-red-300"
      },
      {
        mes: 6,
        diasAtraso: diasAtrasoAtual + 180,
        titulo: "6 Meses Depois",
        estagio: 3,
        valor: valorDividaAtual * Math.pow(1 + taxaMensal, 6),
        descricao: "Provisão elevada. Banco considera grande perda esperada.",
        provisaoEstimada: "70-100%",
        analogia: "💀 Ironman - Quase impossível recuperar",
        icon: Skull,
        cor: "text-red-800",
        bgCor: "bg-red-200",
        bordaCor: "border-red-500"
      },
      {
        mes: 12,
        diasAtraso: diasAtrasoAtual + 360,
        titulo: "1 Ano Depois",
        estagio: 3,
        valor: valorDividaAtual * Math.pow(1 + taxaMensal, 12),
        descricao: "Ação judicial provável. Bloqueio de bens e penhora.",
        provisaoEstimada: "100%",
        analogia: "⚖️ Tribunais - Seu nome na justiça",
        icon: Scale,
        cor: "text-red-900",
        bgCor: "bg-red-300",
        bordaCor: "border-red-600"
      }
    ];

    return eventos;
  };

  const eventos = calcularEventosFuturos();

  // Determina estágio atual
  const estagioAtual = diasAtrasoAtual <= 30 ? 1 : diasAtrasoAtual <= 90 ? 2 : 3;

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-4 bg-gradient-to-r from-red-50 to-orange-50">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800">
          <Calendar className="h-5 w-5 text-red-600" />
          Projeção Temporal: O Que Te Espera
        </CardTitle>
        <p className="text-sm text-slate-600 mt-1">
          Como a provisão e os estágios evoluem se você não negociar
        </p>
      </CardHeader>
      <CardContent className="pt-6">
        <TooltipProvider>
          <div className="space-y-6">
            {/* Ponto Atual */}
            <div className="relative pl-8 pb-6 border-l-4 border-green-400">
              <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-green-500 border-4 border-white shadow-lg"></div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-green-800">HOJE - Você Está Aqui</h3>
                  <div className="flex gap-2">
                    <span className="text-xs font-semibold text-green-700 bg-green-200 px-2 py-1 rounded">
                      Tipo: {classificacaoAtual || 'N/A'}
                    </span>
                    <span className="text-xs font-semibold text-green-700 bg-green-200 px-2 py-1 rounded">
                      Estágio {estagioAtual}
                    </span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-green-700 mb-1">
                  {valorDividaAtual.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
                <p className="text-sm text-green-800">
                  🎯 <span className="font-semibold">Esta é sua melhor chance de negociar!</span> Quanto mais cedo, melhor.
                </p>
              </div>
            </div>

            {/* Eventos Futuros */}
            {eventos.map((evento, index) => {
              const aumentoPercentual = ((evento.valor - valorDividaAtual) / valorDividaAtual) * 100;
              const aumentoAbsoluto = evento.valor - valorDividaAtual;

              return (
                <Tooltip key={evento.mes}>
                  <TooltipTrigger asChild>
                    <div 
                      className={cn(
                        "relative pl-8 pb-6 border-l-4 cursor-pointer transition-all hover:scale-[1.02]",
                        `border-${evento.cor.split('-')[1]}-400`
                      )}
                    >
                      <div className={cn(
                        "absolute -left-3 top-0 w-6 h-6 rounded-full border-4 border-white shadow-lg",
                        evento.bgCor.replace('bg-', 'bg-').replace('-100', '-500')
                      )}></div>
                      
                      <div className={cn("border rounded-lg p-4", evento.bgCor, evento.bordaCor)}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <evento.icon className={cn("h-5 w-5", evento.cor)} />
                            <h3 className={cn("font-bold", evento.cor)}>{evento.titulo}</h3>
                          </div>
                          <span className={cn(
                            "text-xs font-semibold px-2 py-1 rounded",
                            evento.bgCor.replace('-100', '-200'),
                            evento.cor
                          )}>
                            Estágio {evento.estagio}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div>
                            <div className="text-xs text-slate-600 mb-1">Valor da Dívida:</div>
                            <div className={cn("text-xl font-bold", evento.cor)}>
                              {evento.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-600 mb-1">Aumento:</div>
                            <div className="text-xl font-bold text-red-600">
                              +{aumentoPercentual.toFixed(0)}%
                            </div>
                            <div className="text-xs text-slate-600">
                              (+{aumentoAbsoluto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })})
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 text-sm">
                          <p className={cn("font-semibold", evento.cor)}>
                            {evento.descricao}
                          </p>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-600">Provisão estimada:</span>
                            <span className={cn("font-bold", evento.cor)}>{evento.provisaoEstimada}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-600">Dias em atraso:</span>
                            <span className="font-bold text-slate-800">{evento.diasAtraso} dias</span>
                          </div>
                        </div>

                        {/* Analogia */}
                        <div className={cn(
                          "mt-3 p-2 rounded text-sm font-medium",
                          evento.bgCor.replace('-100', '-50'),
                          evento.cor
                        )}>
                          {evento.analogia}
                        </div>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    <div className="space-y-2">
                      <p className="font-semibold">Dica para este momento:</p>
                      <p className="text-xs">
                        {evento.mes <= 2 
                          ? "Ainda há boa margem de negociação. Quanto mais provisão, melhor para você."
                          : evento.mes <= 3
                          ? "Provisão aumentando. Banco começa a ter mais interesse em negociar."
                          : "Alta provisão = alto interesse do banco em resolver. Use isso a seu favor!"
                        }
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>

        {/* Resumo Visual */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              <h4 className="font-semibold text-red-900">Quanto Você Perde:</h4>
            </div>
            <div className="text-3xl font-bold text-red-700 mb-1">
              {((eventos[4].valor - valorDividaAtual) / 1000).toFixed(0)}k
            </div>
            <p className="text-xs text-red-800">
              em 1 ano se não negociar
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-5 w-5 text-green-600" />
              <h4 className="font-semibold text-green-900">Quanto Você Ganha:</h4>
            </div>
            <div className="text-3xl font-bold text-green-700 mb-1">
              TEMPO
            </div>
            <p className="text-xs text-green-800">
              Agindo agora, você controla o futuro
            </p>
          </div>
        </div>

        {/* Aviso Importante */}
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-900">
            <span className="font-semibold">💡 Lembre-se:</span> A <strong>classificação C1-C5 não muda</strong> com o tempo - ela define o tipo de operação. 
            O que muda é o <strong>estágio (1, 2 ou 3)</strong> baseado em dias de atraso e o <strong>% de provisão</strong>. 
            Quanto MAIOR a provisão, MELHOR para você negociar descontos!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
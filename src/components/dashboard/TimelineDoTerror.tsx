import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Star, TrendingUp, CheckCircle, Gift } from "lucide-react";
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
  percentualProvisaoAtual: number; // Provisão atual REAL do banco
  valorProvisaoAtual: number; // Valor provisionado REAL
  estagioRiscoAtual: number; // Estágio BCB atual (1, 2 ou 3)
}

export function TimelineDoTerror({
  valorDividaAtual,
  classificacaoAtual,
  diasAtrasoAtual,
  percentualProvisaoAtual,
  valorProvisaoAtual,
  estagioRiscoAtual,
}: TimelineDoTerrorProps) {

  // Usa provisão REAL do banco como ponto de partida para projeções
  const provisaoAtual = percentualProvisaoAtual;
  const descontoAtual = valorProvisaoAtual;
  const valorPropostaAtual = valorDividaAtual - descontoAtual;

  // Calcula eventos futuros baseados na progressão REAL a partir do estado atual
  const calcularEventosFuturos = () => {
    // Taxa de crescimento mensal baseada no estágio atual BCB
    const taxaCrescimentoMensal = estagioRiscoAtual === 1 ? 1.5 : estagioRiscoAtual === 2 ? 3.5 : 4.5;
    
    const eventos = [
      {
        mes: 1,
        diasAtraso: diasAtrasoAtual + 30,
        titulo: "1 Mês Depois",
        estagio: diasAtrasoAtual + 30 <= 30 ? 1 : diasAtrasoAtual + 30 <= 90 ? 2 : 3,
        percentualProvisao: Math.min(provisaoAtual + (taxaCrescimentoMensal * 1), 90),
        descricao: "Provisão aumentando. Seu desconto começa a crescer!",
        analogia: "🌱 Semente plantada - Oportunidade nascendo",
        icon: Star,
        cor: "text-blue-600",
        bgCor: "bg-blue-100",
        bordaCor: "border-blue-300"
      },
      {
        mes: 2,
        diasAtraso: diasAtrasoAtual + 60,
        titulo: "2 Meses Depois",
        estagio: diasAtrasoAtual + 60 <= 30 ? 1 : diasAtrasoAtual + 60 <= 90 ? 2 : 3,
        percentualProvisao: Math.min(provisaoAtual + (taxaCrescimentoMensal * 2), 90),
        descricao: "Provisão crescendo. Banco começa a ter mais interesse em acordos.",
        analogia: "🌿 Brotando - Desconto ficando interessante",
        icon: TrendingUp,
        cor: "text-green-600",
        bgCor: "bg-green-100",
        bordaCor: "border-green-300"
      },
      {
        mes: 3,
        diasAtraso: diasAtrasoAtual + 90,
        titulo: "3 Meses Depois",
        estagio: 3,
        percentualProvisao: Math.min(provisaoAtual + (taxaCrescimentoMensal * 3), 90),
        descricao: diasAtrasoAtual <= 90 ? "ESTÁGIO 3 atingido! Provisão alta = ótimo momento." : "Provisão continua crescendo!",
        analogia: "🌳 Crescendo forte - Bom desconto disponível",
        icon: CheckCircle,
        cor: "text-emerald-600",
        bgCor: "bg-emerald-100",
        bordaCor: "border-emerald-300"
      },
      {
        mes: 6,
        diasAtraso: diasAtrasoAtual + 180,
        titulo: "6 Meses Depois",
        estagio: 3,
        percentualProvisao: Math.min(provisaoAtual + (taxaCrescimentoMensal * 6), 90),
        descricao: "Provisão elevada! Excelente desconto disponível - ótimo para negociar!",
        analogia: "🎁 Presente crescendo - Desconto grande!",
        icon: Gift,
        cor: "text-purple-600",
        bgCor: "bg-purple-100",
        bordaCor: "border-purple-300"
      },
      {
        mes: 12,
        diasAtraso: diasAtrasoAtual + 360,
        titulo: "1 Ano Depois - MELHOR MOMENTO!",
        estagio: 3,
        percentualProvisao: Math.min(provisaoAtual + (taxaCrescimentoMensal * 12), 90),
        descricao: "Provisão próxima de 90%! MELHOR desconto possível - momento ideal!",
        analogia: "⭐ Momento dourado - Máximo desconto!",
        icon: Star,
        cor: "text-amber-600",
        bgCor: "bg-amber-100",
        bordaCor: "border-amber-300"
      }
    ];

    return eventos;
  };

  const eventos = calcularEventosFuturos();

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-4 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800">
          <Calendar className="h-5 w-5 text-green-600" />
          Linha do Tempo: Seu Desconto Crescendo
        </CardTitle>
        <p className="text-sm text-slate-600 mt-1">
          Como a provisão (e seu desconto!) aumenta com o tempo
        </p>
      </CardHeader>
      <CardContent className="pt-6">
        <TooltipProvider>
          <div className="space-y-6">
            {/* Ponto Atual */}
            <div className="relative pl-8 pb-6 border-l-4 border-blue-400">
              <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-blue-500 border-4 border-white shadow-lg"></div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-blue-800">HOJE - Você Está Aqui</h3>
                  <div className="flex gap-2">
                    <span className="text-xs font-semibold text-blue-700 bg-blue-200 px-2 py-1 rounded">
                      Tipo: {classificacaoAtual || 'N/A'}
                    </span>
                    <span className="text-xs font-semibold text-blue-700 bg-blue-200 px-2 py-1 rounded">
                      Estágio {estagioRiscoAtual}
                    </span>
                    <span className="text-xs font-semibold text-blue-700 bg-blue-200 px-2 py-1 rounded">
                      Provisão: {provisaoAtual.toFixed(0)}%
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-2">
                  <div>
                    <div className="text-sm text-slate-600">Valor da dívida:</div>
                    <div className="text-lg font-bold text-blue-700">
                      {valorDividaAtual.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-600">Desconto disponível:</div>
                    <div className="text-lg font-bold text-green-600">
                      {descontoAtual.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </div>
                  </div>
                </div>
                <div className="bg-white p-2 rounded border border-blue-200">
                  <div className="text-xs text-slate-600">Valor proposta hoje:</div>
                  <div className="text-xl font-bold text-blue-800">
                    {valorPropostaAtual.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </div>
                </div>
              </div>
            </div>

            {/* Eventos Futuros - POSITIVOS! */}
            {eventos.map((evento, index) => {
              const descontoFuturo = valorDividaAtual * (evento.percentualProvisao / 100);
              const valorPropostaFuturo = valorDividaAtual - descontoFuturo;
              const descontoAdicional = descontoFuturo - descontoAtual;

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
                            {evento.percentualProvisao.toFixed(0)}% Provisão
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div>
                            <div className="text-xs text-slate-600 mb-1">Desconto disponível:</div>
                            <div className={cn("text-xl font-bold", evento.cor)}>
                              {descontoFuturo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                            </div>
                            <div className="text-xs text-green-600 font-semibold">
                              +{descontoAdicional.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })} a mais!
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-600 mb-1">Valor proposta:</div>
                            <div className="text-xl font-bold text-slate-800">
                              {valorPropostaFuturo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 text-sm">
                          <p className={cn("font-semibold", evento.cor)}>
                            {evento.descricao}
                          </p>
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
                      <p className="font-semibold">💡 Por que isso é bom para você:</p>
                      <p className="text-xs">
                        {evento.percentualProvisao < 30
                          ? "A provisão está começando a crescer. Quanto maior, melhor será seu desconto!"
                          : evento.percentualProvisao < 60
                          ? "Provisão em crescimento! O banco tem mais interesse em fazer acordo agora."
                          : evento.percentualProvisao < 80
                          ? "Provisão alta = ótimo desconto! Este é um excelente momento para negociar."
                          : "PROVISÃO MÁXIMA! Este é o MELHOR momento - você pode conseguir até 90% de desconto!"
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
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <h4 className="font-semibold text-green-900">Seu Desconto Crescendo:</h4>
            </div>
            <div className="text-3xl font-bold text-green-700 mb-1">
              +{((eventos[4].percentualProvisao - provisaoAtual) / provisaoAtual * 100).toFixed(0)}%
            </div>
            <p className="text-xs text-green-800">
              de aumento na provisão em 1 ano
            </p>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-lg border border-emerald-200">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="h-5 w-5 text-emerald-600" />
              <h4 className="font-semibold text-emerald-900">Economia Extra:</h4>
            </div>
            <div className="text-3xl font-bold text-emerald-700 mb-1">
              {(valorDividaAtual * (eventos[4].percentualProvisao / 100) - descontoAtual).toLocaleString('pt-BR', { 
                style: 'currency', 
                currency: 'BRL',
                maximumFractionDigits: 0 
              })}
            </div>
            <p className="text-xs text-emerald-800">
              de desconto adicional esperando você!
            </p>
          </div>
        </div>

        {/* Aviso Importante */}
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-900">
            <span className="font-semibold">💡 Entenda a Fórmula BCB:</span> <strong>Valor da Proposta = Valor da Dívida - Valor Provisionado</strong>
            <br/>
            Quanto MAIOR a provisão, MENOR o valor que você paga! A provisão de 90% é o momento ideal - você paga apenas 10% da dívida original.
            <br/>
            Estas projeções usam seu valor REAL atual ({provisaoAtual.toFixed(1)}%) como base, seguindo taxas de crescimento conforme BCB 4.966/2021.
            <br/>
            <strong>C1-C5 não muda</strong> (é o tipo de operação). O que muda é a <strong>provisão</strong> e os <strong>estágios (1-3)</strong> baseados em dias de atraso.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  GitBranch, 
  TrendingDown, 
  TrendingUp, 
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Calculator
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ComparadorDestinosProps {
  valorDividaAtual: number;
  valorProvisaoAtual: number;
  classificacaoAtual: string | null;
}

export function ComparadorDestinos({
  valorDividaAtual,
  valorProvisaoAtual,
  classificacaoAtual,
}: ComparadorDestinosProps) {
  const [showCalculator, setShowCalculator] = useState(false);

  // Cenário 1: Não fazer nada - Riscos e consequências
  const calcularCenarioInacao = () => {
    // Se esperar 12 meses, provisão aumentará para ~75-80%
    const provisaoFutura = valorDividaAtual * 0.75; // 75% em 12 meses
    const valorPropostaFutura = valorDividaAtual - provisaoFutura;
    
    // Mas os RISCOS são enormes
    return {
      titulo: "Não Fazer Nada",
      subtitulo: "Esperar a provisão chegar a 75%",
      custoTotal: valorPropostaFutura,
      provisaoFutura: provisaoFutura,
      percentualProvisaoFutura: 75,
      probabilidadeAcaoJudicial: 85,
      probabilidadeBloqueio: 70,
      tempoResolucao: "2-5 anos",
      estresseEmocional: "Altíssimo",
      impactoCredito: "Severo por anos",
      eventos: [
        { mes: 3, evento: "Provisão bancária aumenta", impacto: "neutro" },
        { mes: 6, evento: "Ação judicial iniciada", impacto: "crítico" },
        { mes: 9, evento: "Bloqueio de bens/contas", impacto: "crítico" },
        { mes: 12, evento: "Penhora de patrimônio", impacto: "crítico" }
      ]
    };
  };

  // Cenário 2: Negociar agora com a provisão atual
  const calcularCenarioNegociacao = () => {
    // Fórmula correta: Valor Proposta = Valor Dívida - Valor Provisionado
    const percentualProvisaoAtual = (valorProvisaoAtual / valorDividaAtual) * 100;
    const valorAcordo = valorDividaAtual - valorProvisaoAtual; // Fórmula BCB!
    const economia = valorProvisaoAtual; // O desconto É a provisão!

    return {
      titulo: "Negociar Agora",
      subtitulo: "Aproveitar provisão atual",
      custoTotal: valorAcordo,
      economia,
      percentualProvisao: percentualProvisaoAtual,
      probabilidadeAcaoJudicial: 5,
      probabilidadeBloqueio: 0,
      tempoResolucao: "1-3 meses",
      estresseEmocional: "Baixo",
      impactoCredito: "Mínimo",
      eventos: [
        { mes: 0, evento: "Contato com banco", impacto: "positivo" },
        { mes: 1, evento: "Proposta de acordo", impacto: "positivo" },
        { mes: 2, evento: "Acordo aprovado", impacto: "positivo" },
        { mes: 3, evento: "Nome limpo", impacto: "positivo" }
      ]
    };
  };

  const cenarioInacao = calcularCenarioInacao();
  const cenarioNegociacao = calcularCenarioNegociacao();
  
  // A diferença real é no RISCO, não necessariamente no valor final
  const diferencaProvisao = cenarioInacao.percentualProvisaoFutura - cenarioNegociacao.percentualProvisao;
  const descontoAdicionalFuturo = cenarioInacao.provisaoFutura - valorProvisaoAtual;

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-4 bg-gradient-to-r from-purple-50 to-blue-50">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800">
          <GitBranch className="h-5 w-5 text-purple-600" />
          Dois Caminhos, Duas Realidades
        </CardTitle>
        <p className="text-sm text-slate-600 mt-1">
          Compare os cenários: negociar AGORA vs esperar por mais provisão
        </p>
      </CardHeader>
      <CardContent className="pt-6">
        {/* Destaque da Comparação */}
        <div className="mb-8 p-6 bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-lg">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 mb-2">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
              <h3 className="text-lg font-bold text-amber-900">Importante Entender</h3>
            </div>
            <p className="text-sm text-amber-800 mb-3">
              Sim, esperando você consegue mais desconto (+{diferencaProvisao.toFixed(0)}% de provisão), 
              MAS os riscos são enormes: ação judicial, bloqueio de bens e anos de estresse!
            </p>
            <div className="text-2xl font-bold text-amber-700">
              Desconto adicional futuro: {descontoAdicionalFuturo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
            <p className="text-xs text-amber-700 mt-1">
              Vale a pena o risco por isso?
            </p>
          </div>
        </div>

        {/* Comparação Visual Lado a Lado */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Caminho 1: Inação - RISCOS */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border-2 border-red-300">
              <div className="flex items-center gap-2 mb-3">
                <XCircle className="h-6 w-6 text-red-600" />
                <div>
                  <h3 className="font-bold text-red-900">{cenarioInacao.titulo}</h3>
                  <p className="text-xs text-red-700">{cenarioInacao.subtitulo}</p>
                </div>
              </div>

              <Separator className="my-3 bg-red-300" />

              <div className="space-y-3">
                <div>
                  <div className="text-xs text-red-700 mb-1">Valor do Acordo em 12 meses:</div>
                  <div className="text-2xl font-bold text-red-900">
                    {cenarioInacao.custoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </div>
                  <div className="text-xs text-green-700">
                    Com provisão de {cenarioInacao.percentualProvisaoFutura}% = desconto de {cenarioInacao.provisaoFutura.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </div>
                </div>

                <div className="bg-red-200 p-3 rounded border border-red-400">
                  <div className="text-xs font-semibold text-red-900 mb-2">⚠️ MAS OS RISCOS SÃO:</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-red-800">Ação Judicial:</span>
                      <Badge variant="destructive">{cenarioInacao.probabilidadeAcaoJudicial}%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-red-800">Bloqueio de Bens:</span>
                      <Badge variant="destructive">{cenarioInacao.probabilidadeBloqueio}%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-red-800">Tempo de Resolução:</span>
                      <span className="font-semibold text-red-900">{cenarioInacao.tempoResolucao}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-red-800">Estresse:</span>
                      <span className="font-semibold text-red-900">{cenarioInacao.estresseEmocional}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-red-800">Impacto no Crédito:</span>
                      <span className="font-semibold text-red-900">{cenarioInacao.impactoCredito}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline Inação */}
            <div className="bg-white border border-red-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-slate-700 mb-3">O que vai acontecer:</h4>
              <div className="space-y-2">
                {cenarioInacao.eventos.map((evento, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs">
                    <div className="w-12 text-red-600 font-semibold">{evento.mes}m</div>
                    <AlertTriangle className={cn(
                      "h-4 w-4 flex-shrink-0",
                      evento.impacto === "crítico" ? "text-red-600" : "text-amber-500"
                    )} />
                    <span className="text-slate-700">{evento.evento}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Caminho 2: Negociação AGORA */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border-2 border-green-300">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
                <div>
                  <h3 className="font-bold text-green-900">{cenarioNegociacao.titulo}</h3>
                  <p className="text-xs text-green-700">{cenarioNegociacao.subtitulo}</p>
                </div>
              </div>

              <Separator className="my-3 bg-green-300" />

              <div className="space-y-3">
                <div>
                  <div className="text-xs text-green-700 mb-1">Valor do Acordo AGORA:</div>
                  <div className="text-2xl font-bold text-green-900">
                    {cenarioNegociacao.custoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </div>
                  <div className="text-xs text-green-700">
                    Com provisão de {cenarioNegociacao.percentualProvisao.toFixed(0)}% = desconto de {cenarioNegociacao.economia.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </div>
                </div>

                <div className="bg-green-200 p-3 rounded border border-green-400">
                  <div className="text-xs font-semibold text-green-900 mb-2">✅ BENEFÍCIOS:</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-green-800">Ação Judicial:</span>
                      <Badge className="bg-green-600 text-white">{cenarioNegociacao.probabilidadeAcaoJudicial}%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-green-800">Bloqueio de Bens:</span>
                      <Badge className="bg-green-600 text-white">{cenarioNegociacao.probabilidadeBloqueio}%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-green-800">Tempo de Resolução:</span>
                      <span className="font-semibold text-green-900">{cenarioNegociacao.tempoResolucao}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-green-800">Estresse:</span>
                      <span className="font-semibold text-green-900">{cenarioNegociacao.estresseEmocional}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-green-800">Impacto no Crédito:</span>
                      <span className="font-semibold text-green-900">{cenarioNegociacao.impactoCredito}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline Negociação */}
            <div className="bg-white border border-green-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-slate-700 mb-3">O que vai acontecer:</h4>
              <div className="space-y-2">
                {cenarioNegociacao.eventos.map((evento, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs">
                    <div className="w-12 text-green-600 font-semibold">{evento.mes}m</div>
                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-slate-700">{evento.evento}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Calculadora Interativa */}
        <div className="mt-8">
          <button
            onClick={() => setShowCalculator(!showCalculator)}
            className="w-full flex items-center justify-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
          >
            <Calculator className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-blue-900">
              {showCalculator ? "Esconder" : "Mostrar"} Comparação Detalhada
            </span>
          </button>

          {showCalculator && (
            <div className="mt-4 p-6 bg-slate-50 border border-slate-200 rounded-lg space-y-4">
              <h4 className="font-semibold text-slate-800 mb-4">Análise Financeira:</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded border border-red-200">
                  <div className="text-xs text-slate-600 mb-1">Se esperar 12 meses:</div>
                  <div className="text-xl font-bold text-slate-800">
                    {cenarioInacao.custoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </div>
                  <div className="text-xs text-green-600 mt-1">
                    Provisão: {cenarioInacao.percentualProvisaoFutura}%
                  </div>
                  <div className="text-xs text-red-600 font-semibold mt-2">
                    ⚠️ Alto risco jurídico!
                  </div>
                </div>
                <div className="p-4 bg-white rounded border border-green-200">
                  <div className="text-xs text-slate-600 mb-1">Se negociar AGORA:</div>
                  <div className="text-xl font-bold text-slate-800">
                    {cenarioNegociacao.custoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </div>
                  <div className="text-xs text-green-600 mt-1">
                    Provisão: {cenarioNegociacao.percentualProvisao.toFixed(0)}%
                  </div>
                  <div className="text-xs text-green-600 font-semibold mt-2">
                    ✅ Sem riscos jurídicos!
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-lg border border-amber-300">
                <div className="text-sm text-amber-900 mb-2">
                  <span className="font-semibold">Diferença no desconto:</span>
                </div>
                <div className="text-2xl font-bold text-amber-700">
                  +{descontoAdicionalFuturo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
                <p className="text-xs text-amber-800 mt-2">
                  Você ganharia este desconto adicional esperando, MAS corre risco de:
                  processo judicial ({cenarioInacao.probabilidadeAcaoJudicial}%), 
                  bloqueio de bens ({cenarioInacao.probabilidadeBloqueio}%) e 
                  anos de estresse.
                </p>
              </div>

              <div className="text-center text-sm text-slate-600 pt-4">
                💡 <span className="font-semibold">Fórmula:</span> Valor da Proposta = Valor da Dívida - Valor Provisionado. 
                Quanto maior a provisão de {cenarioNegociacao.percentualProvisao.toFixed(0)}%, 
                menor você paga!
              </div>
            </div>
          )}
        </div>

        {/* Call to Action Final */}
        <div className="mt-8 p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2">A Escolha é Sua</h3>
            <p className="text-sm mb-4 opacity-90">
              Você pode esperar por mais desconto, mas os riscos são reais: processos, bloqueios e anos de problemas. 
              Ou pode negociar AGORA com segurança e paz de espírito.
            </p>
            <div className="flex items-center justify-center gap-2 text-lg font-bold">
              <CheckCircle2 className="h-6 w-6" />
              Negociar agora = Resolver rápido sem riscos
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
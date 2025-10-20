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

  // Cenário 1: Não fazer nada
  const calcularCenarioInacao = () => {
    const taxaMensal = 0.045; // 4.5% ao mês
    const valorEm12Meses = valorDividaAtual * Math.pow(1 + taxaMensal, 12);
    const custoTotal = valorEm12Meses;
    const aumentoAbsoluto = valorEm12Meses - valorDividaAtual;

    return {
      titulo: "Não Fazer Nada",
      subtitulo: "Deixar o tempo passar",
      custoTotal,
      aumentoAbsoluto,
      probabilidadeAcaoJudicial: 85,
      probabilidadeBloqueio: 70,
      tempoResolucao: "2-5 anos",
      estresseEmocional: "Altíssimo",
      impactoCredito: "Severo por anos",
      eventos: [
        { mes: 3, evento: "Provisão bancária aumenta", impacto: "negativo" },
        { mes: 6, evento: "Ação judicial iniciada", impacto: "crítico" },
        { mes: 9, evento: "Bloqueio de bens/contas", impacto: "crítico" },
        { mes: 12, evento: "Penhora de patrimônio", impacto: "crítico" }
      ]
    };
  };

  // Cenário 2: Negociar agora
  const calcularCenarioNegociacao = () => {
    // Banco geralmente aceita 50-70% do valor provisionado
    const descontoProvavel = 0.4; // 40% de desconto
    const valorAcordo = valorDividaAtual * (1 - descontoProvavel);
    const economia = valorDividaAtual - valorAcordo;

    return {
      titulo: "Negociar Agora",
      subtitulo: "Fazer um acordo hoje",
      custoTotal: valorAcordo,
      economia,
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
  const economiaPotencial = cenarioInacao.custoTotal - cenarioNegociacao.custoTotal;
  const economiaPercentual = (economiaPotencial / cenarioInacao.custoTotal) * 100;

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-4 bg-gradient-to-r from-purple-50 to-blue-50">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800">
          <GitBranch className="h-5 w-5 text-purple-600" />
          Dois Caminhos, Dois Destinos
        </CardTitle>
        <p className="text-sm text-slate-600 mt-1">
          Compare os cenários e veja quanto você pode economizar
        </p>
      </CardHeader>
      <CardContent className="pt-6">
        {/* Destaque da Economia */}
        <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 mb-2">
              <DollarSign className="h-6 w-6 text-green-600" />
              <h3 className="text-lg font-bold text-green-900">Economia Potencial</h3>
            </div>
            <div className="text-4xl font-bold text-green-700 mb-2">
              {economiaPotencial.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
            <p className="text-sm text-green-800">
              Você pode economizar <span className="font-bold">{economiaPercentual.toFixed(0)}%</span> negociando agora
            </p>
          </div>
        </div>

        {/* Comparação Visual Lado a Lado */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Caminho 1: Inação */}
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
                  <div className="text-xs text-red-700 mb-1">Custo Total em 12 meses:</div>
                  <div className="text-2xl font-bold text-red-900">
                    {cenarioInacao.custoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </div>
                  <div className="text-xs text-red-700">
                    +{cenarioInacao.aumentoAbsoluto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} a mais
                  </div>
                </div>

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

            {/* Timeline Inação */}
            <div className="bg-white border border-red-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-slate-700 mb-3">O que vai acontecer:</h4>
              <div className="space-y-2">
                {cenarioInacao.eventos.map((evento, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs">
                    <div className="w-12 text-red-600 font-semibold">{evento.mes}m</div>
                    <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                    <span className="text-slate-700">{evento.evento}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Caminho 2: Negociação */}
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
                  <div className="text-xs text-green-700 mb-1">Custo Estimado do Acordo:</div>
                  <div className="text-2xl font-bold text-green-900">
                    {cenarioNegociacao.custoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </div>
                  <div className="text-xs text-green-700">
                    Economia: {cenarioNegociacao.economia.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-green-800">Ação Judicial:</span>
                    <Badge className="bg-green-200 text-green-800">{cenarioNegociacao.probabilidadeAcaoJudicial}%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-green-800">Bloqueio de Bens:</span>
                    <Badge className="bg-green-200 text-green-800">{cenarioNegociacao.probabilidadeBloqueio}%</Badge>
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
              {showCalculator ? "Esconder" : "Mostrar"} Calculadora de Economia
            </span>
          </button>

          {showCalculator && (
            <div className="mt-4 p-6 bg-slate-50 border border-slate-200 rounded-lg space-y-4">
              <h4 className="font-semibold text-slate-800 mb-4">Resumo Financeiro:</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded border border-slate-200">
                  <div className="text-xs text-slate-600 mb-1">Se NÃO negociar:</div>
                  <div className="text-xl font-bold text-red-600">
                    {cenarioInacao.custoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </div>
                </div>
                <div className="p-4 bg-white rounded border border-slate-200">
                  <div className="text-xs text-slate-600 mb-1">Se negociar AGORA:</div>
                  <div className="text-xl font-bold text-green-600">
                    {cenarioNegociacao.custoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border border-green-300">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-green-800 mb-1">Você Economiza:</div>
                    <div className="text-3xl font-bold text-green-700">
                      {economiaPotencial.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-green-800 mb-1">Economia:</div>
                    <div className="text-3xl font-bold text-green-700">
                      {economiaPercentual.toFixed(0)}%
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center text-sm text-slate-600 pt-4">
                💡 <span className="font-semibold">Dica:</span> Estes valores são estimativas baseadas em acordos típicos. 
                O valor real do acordo dependerá da sua negociação com o banco.
              </div>
            </div>
          )}
        </div>

        {/* Call to Action Final */}
        <div className="mt-8 p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2">A Escolha é Sua</h3>
            <p className="text-sm mb-4 opacity-90">
              Cada dia que passa, você perde dinheiro e oportunidades. Negociar agora é a decisão mais inteligente.
            </p>
            <div className="flex items-center justify-center gap-2 text-lg font-bold">
              <TrendingUp className="h-6 w-6" />
              Quanto antes você agir, mais você economiza
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

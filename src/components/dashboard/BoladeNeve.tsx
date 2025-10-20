import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Snowflake, TrendingUp, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface BoladeNeveProps {
  valorDividaAtual: number;
  diasAtraso: number;
  classificacaoAtual: string | null;
}

export function BoladeNeve({
  valorDividaAtual,
  diasAtraso,
  classificacaoAtual,
}: BoladeNeveProps) {
  const [animateGrowth, setAnimateGrowth] = useState(false);

  // Calcula projeção de PROVISÃO de 12 meses (quanto MAIOR, MELHOR para cliente!)
  const calcularProjecao = () => {
    const projecoes = [];

    for (let mes = 0; mes <= 12; mes++) {
      const diasAtrasoProjetado = diasAtraso + (mes * 30);
      
      // Calcula provisão baseada em dias de atraso
      // 0-30 dias = 10-20%, 31-90 = 20-50%, 91-180 = 50-70%, 181+ = 70-100%
      let percentualProvisao = 0;
      if (diasAtrasoProjetado <= 30) {
        percentualProvisao = 10 + (diasAtrasoProjetado / 30) * 10; // 10-20%
      } else if (diasAtrasoProjetado <= 90) {
        percentualProvisao = 20 + ((diasAtrasoProjetado - 30) / 60) * 30; // 20-50%
      } else if (diasAtrasoProjetado <= 180) {
        percentualProvisao = 50 + ((diasAtrasoProjetado - 90) / 90) * 20; // 50-70%
      } else {
        percentualProvisao = 70 + (Math.min((diasAtrasoProjetado - 180) / 180, 1)) * 30; // 70-100%
      }

      const valorProvisao = valorDividaAtual * (percentualProvisao / 100);
      const descontoDisponivel = valorProvisao;
      const valorProposta = valorDividaAtual - descontoDisponivel;

      projecoes.push({
        mes,
        diasAtraso: diasAtrasoProjetado,
        percentualProvisao: Math.min(percentualProvisao, 100),
        valorProvisao,
        descontoDisponivel,
        valorProposta
      });
    }

    return projecoes;
  };

  const projecoes = calcularProjecao();
  const provisaoAtual = projecoes[0];
  const provisaoEm12Meses = projecoes[12];
  const crescimentoProvisao = provisaoEm12Meses.percentualProvisao - provisaoAtual.percentualProvisao;
  const descontoAdicional = provisaoEm12Meses.descontoDisponivel - provisaoAtual.descontoDisponivel;

  useEffect(() => {
    const timer = setTimeout(() => setAnimateGrowth(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Analogias visuais baseadas no DESCONTO ADICIONAL
  const getAnalogia = () => {
    if (descontoAdicional < 10000) {
      return {
        icone: "💰",
        texto: "Equivale a alguns meses de salário economizados",
        impacto: "bom"
      };
    } else if (descontoAdicional < 30000) {
      return {
        icone: "🚗",
        texto: "Equivale a entrada de um carro novo",
        impacto: "muito-bom"
      };
    } else if (descontoAdicional < 100000) {
      return {
        icone: "🏡",
        texto: "Equivale a entrada de um imóvel",
        impacto: "excelente"
      };
    } else {
      return {
        icone: "🏢",
        texto: "Equivale a um imóvel de médio porte",
        impacto: "extraordinário"
      };
    }
  };

  const analogia = getAnalogia();

  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden">
      <CardHeader className="pb-4 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800">
          <Snowflake className="h-5 w-5 text-green-600" />
          Efeito Bola de Neve: Seu Desconto Crescendo
        </CardTitle>
        <p className="text-sm text-slate-600 mt-1">
          Como a PROVISÃO aumenta com o tempo - quanto maior, melhor para você!
        </p>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Visualização da Provisão Crescendo (POSITIVO!) */}
        <div className="relative h-64 flex items-end justify-center bg-gradient-to-b from-green-50 to-white rounded-lg p-6">
          {/* Provisão Inicial */}
          <div className="absolute left-8 bottom-8 flex flex-col items-center">
            <div 
              className="relative w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg flex items-center justify-center"
            >
              <div className="text-white text-xs font-bold text-center">
                HOJE<br/>
                {provisaoAtual.percentualProvisao.toFixed(0)}%
              </div>
            </div>
            <div className="text-xs text-slate-600 mt-2 font-semibold">Provisão Atual</div>
          </div>

          {/* Linha de Crescimento */}
          <div className="absolute left-28 bottom-16 w-32 h-0.5 bg-gradient-to-r from-orange-400 to-green-400"></div>

          {/* Provisão Final (Animada) - MAIOR É MELHOR! */}
          <div className="absolute right-8 bottom-8 flex flex-col items-center">
            <div 
              className={cn(
                "relative rounded-full bg-gradient-to-br from-green-500 to-green-700 shadow-2xl flex items-center justify-center transition-all duration-1000 ease-out",
                animateGrowth ? "w-32 h-32 opacity-100" : "w-20 h-20 opacity-0"
              )}
            >
              <div className="absolute inset-0 rounded-full bg-green-400 opacity-50 animate-pulse"></div>
              <div className="text-white text-xs font-bold text-center relative z-10">
                12 MESES<br/>
                {provisaoEm12Meses.percentualProvisao.toFixed(0)}%
              </div>
            </div>
            <div className="text-xs text-green-600 mt-2 font-semibold">Provisão Futura</div>
          </div>

          {/* Alerta Flutuante POSITIVO */}
          <div className="absolute top-4 right-4 animate-bounce">
            <div className="bg-green-100 text-green-700 px-3 py-2 rounded-lg text-xs font-semibold shadow-lg">
              +{crescimentoProvisao.toFixed(0)}% ✓
            </div>
          </div>
        </div>

        {/* Números da Oportunidade */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {provisaoAtual.percentualProvisao.toFixed(0)}%
            </div>
            <div className="text-xs text-slate-600 mt-1">Provisão Hoje</div>
            <div className="text-xs text-slate-500 mt-1">
              {provisaoAtual.descontoDisponivel.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
            </div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 flex items-center justify-center gap-1">
              <TrendingUp className="h-5 w-5" />
              +{crescimentoProvisao.toFixed(0)}%
            </div>
            <div className="text-xs text-slate-600 mt-1">Aumento Provisão</div>
            <div className="text-xs text-slate-500 mt-1">
              +{descontoAdicional.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
            </div>
          </div>
          
          <div className="text-center p-4 bg-emerald-50 rounded-lg">
            <div className="text-2xl font-bold text-emerald-600">
              {provisaoEm12Meses.percentualProvisao.toFixed(0)}%
            </div>
            <div className="text-xs text-slate-600 mt-1">Provisão em 12m</div>
            <div className="text-xs text-slate-500 mt-1">
              {provisaoEm12Meses.descontoDisponivel.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
            </div>
          </div>
        </div>

        {/* Projeção Mensal de DESCONTOS */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-slate-700">Evolução do Seu Desconto:</h4>
          <div className="grid grid-cols-4 gap-2">
            {[3, 6, 9, 12].map(mes => {
              const projecao = projecoes[mes];
              return (
                <div key={mes} className="text-center p-3 bg-green-50 rounded border border-green-200">
                  <div className="text-xs text-slate-600 mb-1">{mes} meses</div>
                  <div className="text-sm font-bold text-green-700">
                    {projecao.percentualProvisao.toFixed(0)}%
                  </div>
                  <div className="text-xs text-green-600">
                    {projecao.descontoDisponivel.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Analogia Visual - POSITIVA */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-start gap-3">
            <div className="text-4xl">{analogia.icone}</div>
            <div className="flex-1">
              <h4 className="font-semibold text-green-900 mb-1">
                Quanto Você Pode Economizar:
              </h4>
              <p className="text-sm text-green-800 mb-2">
                Com mais <span className="font-bold">
                  {descontoAdicional.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span> de desconto em 12 meses, {analogia.texto}.
              </p>
              <div className="flex items-center gap-2">
                <TrendingUp className={cn(
                  "h-4 w-4",
                  analogia.impacto === "extraordinário" && "text-green-700",
                  analogia.impacto === "excelente" && "text-green-600",
                  analogia.impacto === "muito-bom" && "text-emerald-600",
                  analogia.impacto === "bom" && "text-teal-600"
                )} />
                <span className="text-xs font-semibold text-green-900 uppercase">
                  Oportunidade: {analogia.impacto}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Alerta Final POSITIVO */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <span className="font-semibold">💡 Entenda:</span> Quanto MAIOR a provisão bancária, MAIOR o desconto que você consegue! 
              A provisão ideal é de 90%, que representa o melhor momento para negociar. <span className="font-bold">
              Fórmula: Valor da Proposta = Valor da Dívida - Valor Provisionado.</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

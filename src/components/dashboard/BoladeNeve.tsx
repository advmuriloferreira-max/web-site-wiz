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

  // Calcula projeção de 12 meses
  const calcularProjecao = () => {
    const taxaJurosMensal = 0.025; // 2.5% ao mês
    const multasMensais = 0.02; // 2% ao mês de multas/encargos
    const taxaTotal = taxaJurosMensal + multasMensais;

    const projecoes = [];
    let valorAtual = valorDividaAtual;

    for (let mes = 0; mes <= 12; mes++) {
      const valorProjetado = valorAtual * Math.pow(1 + taxaTotal, mes);
      projecoes.push({
        mes,
        valor: valorProjetado,
        crescimento: ((valorProjetado - valorDividaAtual) / valorDividaAtual) * 100
      });
    }

    return projecoes;
  };

  const projecoes = calcularProjecao();
  const valorEm12Meses = projecoes[12].valor;
  const crescimentoTotal = projecoes[12].crescimento;
  const aumentoAbsoluto = valorEm12Meses - valorDividaAtual;

  useEffect(() => {
    const timer = setTimeout(() => setAnimateGrowth(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Analogias visuais
  const getAnalogia = () => {
    if (crescimentoTotal < 20) {
      return {
        icone: "🏠",
        texto: "Equivale a um carro popular usado",
        impacto: "baixo"
      };
    } else if (crescimentoTotal < 40) {
      return {
        icone: "🚗",
        texto: "Equivale a um carro novo de entrada",
        impacto: "moderado"
      };
    } else if (crescimentoTotal < 60) {
      return {
        icone: "🏡",
        texto: "Equivale a um terreno pequeno",
        impacto: "alto"
      };
    } else {
      return {
        icone: "🏢",
        texto: "Equivale a um imóvel de médio porte",
        impacto: "crítico"
      };
    }
  };

  const analogia = getAnalogia();

  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden">
      <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800">
          <Snowflake className="h-5 w-5 text-blue-600" />
          Efeito Bola de Neve
        </CardTitle>
        <p className="text-sm text-slate-600 mt-1">
          Como sua dívida cresce se você não agir
        </p>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Visualização da Bola Crescendo */}
        <div className="relative h-64 flex items-end justify-center bg-gradient-to-b from-blue-50 to-white rounded-lg p-6">
          {/* Bola Inicial */}
          <div className="absolute left-8 bottom-8 flex flex-col items-center">
            <div 
              className="relative w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg flex items-center justify-center"
            >
              <div className="text-white text-xs font-bold text-center">
                HOJE<br/>
                R$ {(valorDividaAtual / 1000).toFixed(0)}k
              </div>
            </div>
            <div className="text-xs text-slate-600 mt-2 font-semibold">Agora</div>
          </div>

          {/* Linha de Crescimento */}
          <div className="absolute left-28 bottom-16 w-32 h-0.5 bg-gradient-to-r from-blue-400 to-red-400"></div>

          {/* Bola Final (Animada) */}
          <div className="absolute right-8 bottom-8 flex flex-col items-center">
            <div 
              className={cn(
                "relative rounded-full bg-gradient-to-br from-red-500 to-red-700 shadow-2xl flex items-center justify-center transition-all duration-1000 ease-out",
                animateGrowth ? "w-32 h-32 opacity-100" : "w-20 h-20 opacity-0"
              )}
            >
              <div className="absolute inset-0 rounded-full bg-red-400 opacity-50 animate-pulse"></div>
              <div className="text-white text-xs font-bold text-center relative z-10">
                12 MESES<br/>
                R$ {(valorEm12Meses / 1000).toFixed(0)}k
              </div>
            </div>
            <div className="text-xs text-red-600 mt-2 font-semibold">Daqui 1 ano</div>
          </div>

          {/* Alerta Flutuante */}
          <div className="absolute top-4 right-4 animate-bounce">
            <div className="bg-red-100 text-red-700 px-3 py-2 rounded-lg text-xs font-semibold shadow-lg">
              +{crescimentoTotal.toFixed(0)}%
            </div>
          </div>
        </div>

        {/* Números do Crescimento */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {valorDividaAtual.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
            </div>
            <div className="text-xs text-slate-600 mt-1">Hoje</div>
          </div>
          
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600 flex items-center justify-center gap-1">
              <TrendingUp className="h-5 w-5" />
              +{aumentoAbsoluto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
            </div>
            <div className="text-xs text-slate-600 mt-1">Aumento</div>
          </div>
          
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {valorEm12Meses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
            </div>
            <div className="text-xs text-slate-600 mt-1">Em 12 meses</div>
          </div>
        </div>

        {/* Projeção Mensal Compacta */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-slate-700">Crescimento Mês a Mês:</h4>
          <div className="grid grid-cols-4 gap-2">
            {[3, 6, 9, 12].map(mes => {
              const projecao = projecoes[mes];
              return (
                <div key={mes} className="text-center p-3 bg-slate-50 rounded border border-slate-200">
                  <div className="text-xs text-slate-600 mb-1">{mes} meses</div>
                  <div className="text-sm font-bold text-slate-800">
                    R$ {(projecao.valor / 1000).toFixed(0)}k
                  </div>
                  <div className="text-xs text-red-600">
                    +{projecao.crescimento.toFixed(0)}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Analogia Visual */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
          <div className="flex items-start gap-3">
            <div className="text-4xl">{analogia.icone}</div>
            <div className="flex-1">
              <h4 className="font-semibold text-purple-900 mb-1">
                Para Você Entender Melhor:
              </h4>
              <p className="text-sm text-purple-800 mb-2">
                O aumento de <span className="font-bold">
                  {aumentoAbsoluto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span> em 12 meses {analogia.texto}.
              </p>
              <div className="flex items-center gap-2">
                <AlertTriangle className={cn(
                  "h-4 w-4",
                  analogia.impacto === "crítico" && "text-red-600",
                  analogia.impacto === "alto" && "text-orange-600",
                  analogia.impacto === "moderado" && "text-yellow-600",
                  analogia.impacto === "baixo" && "text-blue-600"
                )} />
                <span className="text-xs font-semibold text-purple-900 uppercase">
                  Impacto: {analogia.impacto}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Alerta Final */}
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-900">
              <span className="font-semibold">Atenção:</span> Estes cálculos consideram juros de 2,5% ao mês + 2% de multas e encargos. 
              Na prática, os valores podem ser ainda maiores. <span className="font-bold">Quanto antes você agir, menor será o prejuízo.</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

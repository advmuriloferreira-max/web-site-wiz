import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TermometroDaSituacao } from "./TermometroDaSituacao";
import { CardsAnalogias } from "./CardsAnalogias";
import { GraficoEvolucao } from "./GraficoEvolucao";
import { Target } from "lucide-react";
import { Contrato } from "@/hooks/useContratos";

interface AnalisePresenteProps {
  contratos: Contrato[];
}

export function AnalisePresente({ contratos }: AnalisePresenteProps) {
  if (!contratos || contratos.length === 0) {
    return null;
  }

  // Pega o contrato mais crítico (maior classificação)
  const contratoMaisCritico = contratos.reduce((prev, current) => {
    const getPeso = (classificacao: string | null) => {
      const pesos = { 'C5': 5, 'C4': 4, 'C3': 3, 'C2': 2, 'C1': 1 };
      return pesos[classificacao as keyof typeof pesos] || 0;
    };
    return getPeso(current.classificacao) > getPeso(prev.classificacao) ? current : prev;
  }, contratos[0]);

  // Calcula totais agregados
  const valorDividaTotal = contratos.reduce((sum, c) => {
    return sum + (c.saldo_contabil || c.valor_divida || 0);
  }, 0);

  const valorProvisaoTotal = contratos.reduce((sum, c) => {
    return sum + (c.valor_provisao || 0);
  }, 0);

  // Usa dados do contrato mais crítico para os gráficos
  const {
    classificacao,
    dias_atraso,
    meses_atraso,
    valor_divida,
    saldo_contabil,
    valor_provisao
  } = contratoMaisCritico;

  const valorBase = saldo_contabil || valor_divida || 0;

  return (
    <div className="space-y-6">
      {/* Header da Seção */}
      <Card className="border-slate-200 shadow-sm bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-800">
            <Target className="h-6 w-6 text-blue-600" />
            Análise da Situação Presente
          </CardTitle>
          <p className="text-sm text-slate-600 mt-2">
            Entenda onde você está agora e o que isso significa na prática
          </p>
        </CardHeader>
      </Card>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna 1: Termômetro */}
        <div className="lg:col-span-1">
          <TermometroDaSituacao
            classificacao={classificacao}
            diasAtraso={dias_atraso}
            valorProvisao={valorProvisaoTotal}
            valorDivida={valorDividaTotal}
          />
        </div>

        {/* Coluna 2-3: Cards de Analogias */}
        <div className="lg:col-span-2">
          <CardsAnalogias
            valorDivida={valorBase}
            valorProvisao={valor_provisao || 0}
            classificacao={classificacao}
            diasAtraso={dias_atraso}
            mesesAtraso={meses_atraso}
          />
        </div>
      </div>

      {/* Gráfico de Evolução - Largura Total */}
      <GraficoEvolucao
        classificacao={classificacao}
        diasAtraso={dias_atraso}
        mesesAtraso={meses_atraso}
      />

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="text-3xl">💡</div>
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-1">
                Por que isso é importante?
              </h4>
              <p className="text-sm text-blue-800">
                Entender sua situação atual é o primeiro passo para uma negociação eficaz. 
                O banco já sabe exatamente onde você está nessa linha do tempo e quanto ele espera perder. 
                Use esse conhecimento a seu favor nas negociações.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

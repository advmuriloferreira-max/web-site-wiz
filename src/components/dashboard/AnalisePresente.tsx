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

  // Pega o contrato com maior risco TEMPORAL (estágio + provisão)
  const contratoMaisCritico = contratos.reduce((prev, current) => {
    const calcularRisco = (contrato: Contrato) => {
      const diasAtraso = contrato.dias_atraso || 0;
      const percentualProvisao = contrato.valor_divida > 0 
        ? ((contrato.valor_provisao || 0) / contrato.valor_divida) * 100 
        : 0;
      
      // Estágio baseado em tempo
      let estagioRisco = 1;
      if (diasAtraso > 90) estagioRisco = 3;
      else if (diasAtraso > 30) estagioRisco = 2;
      
      // Risco = estágio + provisão (classificação C1-C5 é apenas tipo de operação)
      return (estagioRisco * 30) + percentualProvisao;
    };
    
    return calcularRisco(current) > calcularRisco(prev) ? current : prev;
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

      {/* Info Card Explicativo */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="text-3xl">💡</div>
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-1">
                Conceitos Regulatórios BCB 4.966/2021 e 352/2023
              </h4>
              <div className="space-y-2 text-sm text-blue-800">
                <p>
                  <strong>Classificação (C1-C5):</strong> Define o TIPO de operação baseado em garantias. 
                  C1 = garantias sólidas (imóveis, União), C2 = garantias médias (bancos, penhor), 
                  C3 = sem garantias fortes (quirografárias). Não é baseado em tempo!
                </p>
                <p>
                  <strong>Estágio (1, 2 ou 3):</strong> Baseado no TEMPO de atraso. 
                  Estágio 1 (até 30 dias), Estágio 2 (31-90 dias), Estágio 3 (acima de 90 dias). 
                  Define o período de perda esperada.
                </p>
                <p>
                  <strong>Provisão Bancária:</strong> Quanto MAIOR a provisão (quanto mais próximo de 100%), 
                  MAIOR o interesse do banco em renegociar, pois eles não querem recursos parados em provisão. 
                  Esta é a sua principal arma de negociação!
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

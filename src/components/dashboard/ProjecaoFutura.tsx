import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BoladeNeve } from "./BoladeNeve";
import { TimelineDoTerror } from "./TimelineDoTerror";
import { ComparadorDestinos } from "./ComparadorDestinos";
import { TrendingUp } from "lucide-react";
import { Contrato } from "@/hooks/useContratos";

interface ProjecaoFuturaProps {
  contrato: Contrato;
}

export function ProjecaoFutura({ contrato }: ProjecaoFuturaProps) {
  if (!contrato) {
    return null;
  }

  // Dados REAIS do contrato individual
  const {
    classificacao,
    dias_atraso,
    valor_divida,
    saldo_contabil,
    valor_provisao,
    percentual_provisao
  } = contrato;

  const valorBase = saldo_contabil || valor_divida || 0;
  const percentualProvisaoAtual = percentual_provisao || 0;

  return (
    <div className="space-y-6">
      {/* Header da Seção */}
      <Card className="border-slate-200 shadow-sm bg-gradient-to-r from-orange-50 to-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-800">
            <TrendingUp className="h-6 w-6 text-orange-600" />
            Projeção para o Futuro
          </CardTitle>
          <p className="text-sm text-slate-600 mt-2">
            Entenda o que te espera se você não agir agora
          </p>
        </CardHeader>
      </Card>

      {/* Bola de Neve */}
      <BoladeNeve
        valorDividaAtual={valorBase}
        diasAtraso={dias_atraso || 0}
        classificacaoAtual={classificacao}
        percentualProvisaoAtual={percentualProvisaoAtual}
        valorProvisaoAtual={valor_provisao || 0}
      />

      {/* Timeline do Terror */}
      <TimelineDoTerror
        valorDividaAtual={valorBase}
        classificacaoAtual={classificacao}
        diasAtrasoAtual={dias_atraso || 0}
      />

      {/* Comparador de Destinos */}
      <ComparadorDestinos
        valorDividaAtual={valorBase}
        valorProvisaoAtual={valor_provisao || 0}
        classificacaoAtual={classificacao}
      />

      {/* Info Card Final */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="text-3xl">⚠️</div>
            <div className="flex-1">
              <h4 className="font-semibold text-orange-900 mb-1">
                Importante: Estas são projeções realistas
              </h4>
              <p className="text-sm text-orange-800">
                Os valores e prazos apresentados são baseados em médias de mercado e práticas bancárias comuns. 
                Na realidade, cada caso é único e pode haver variações. Porém, uma coisa é certa: 
                <span className="font-bold"> quanto mais tempo você esperar, mais caro ficará.</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
